"""
CleanSight AI — TACO Dataset Remapper (8-Class ORIGINAL Taxonomy)
================================================================
Restores the original project vision:
0: plastic_bottle
1: plastic
2: metal
3: paper_cardboard
4: glass
5: garbage_bag
6: cigarette
7: mixed_trash

Strategy:
  - Process FULL TACO dataset (1500 images)
  - Strict 8-class mapping
  - PIL resizing (max 1280px) to prevent OOM
  - Filter microscopic noise boxes
"""
import json
import os
import shutil
import random
from pathlib import Path
from collections import defaultdict
from PIL import Image

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR  = BASE_DIR / "datasets" / "raw" / "TACO"
PROC_DIR = BASE_DIR / "datasets" / "processed"

ANNOTATIONS_FILE = RAW_DIR / "data" / "annotations.json"
if not ANNOTATIONS_FILE.exists():
    ANNOTATIONS_FILE = RAW_DIR / "annotations.json"

# ─── 8-Class ORIGINAL Taxonomy ───────────────────────────────────────────────
CLASS_NAMES = {
    0: "plastic_bottle",
    1: "plastic",
    2: "metal",
    3: "paper_cardboard",
    4: "glass",
    5: "garbage_bag",
    6: "cigarette",
    7: "mixed_trash"
}
NC = 8

CATEGORY_MAP = {
    # 0: plastic_bottle
    "Clear plastic bottle":         0,
    "Other plastic bottle":         0,
    
    # 1: plastic
    "Other plastic container":      1,
    "Disposable plastic cup":       1,
    "Plastic lid":                  1,
    "Plastic straw":                1,
    "Plastic utensils":             1,
    "Plastic film":                 1,
    "Crisp packet":                 1,
    "Other plastic wrapper":        1,
    "Squeezable tube":              1,
    "Polypropylene bag":            1,
    "Tupperware":                   1,
    "Spread tub":                   1,
    "Foam food container":          1,
    "Foam cup":                     1,
    "Other plastic cup":            1,
    "Six pack rings":               1,
    "Plastic glooves":              1,
    "Plastic bottle cap":           1,
    
    # 2: metal
    "Drink can":                    2,
    "Food Can":                     2,
    "Scrap metal":                  2,
    "Aluminium foil":               2,
    "Metal bottle cap":             2,
    "Metal lid":                    2,
    "Pop tab":                      2,
    "Aluminium blister pack":       2,
    
    # 3: paper_cardboard
    "Corrugated carton":            3,
    "Other carton":                 3,
    "Meal carton":                  3,
    "Drink carton":                 3,
    "Egg carton":                   3,
    "Pizza box":                    3,
    "Magazine paper":               3,
    "Wrapping paper":               3,
    "Normal paper":                 3,
    "Tissues":                      3,
    "Paper cup":                    3,
    "Paper bag":                    3,
    "Plastified paper bag":         3,
    "Toilet tube":                  3,
    "Paper straw":                  3,
    "Carded blister pack":          3,
    
    # 4: glass
    "Glass bottle":                 4,
    "Glass cup":                    4,
    "Glass jar":                    4,
    "Broken glass":                 4,
    
    # 5: garbage_bag
    "Garbage bag":                  5,
    "Single-use carrier bag":       5,
    
    # 6: cigarette
    "Cigarette":                    6,
    
    # 7: mixed_trash
    "Unlabeled litter":             7,
    "Food waste":                   7,
    "Rope & strings":               7,
    "Shoe":                         7,
    "Styrofoam piece":              7,
    "Disposable food container":    7,
    "Other plastic":                7,
    "Battery":                      7,
    "Aerosol":                      7,
    "Other plastic cup":            7,   # fallback if not already mapped above
}

def coco_to_yolo(bbox, img_w, img_h):
    x, y, w, h = bbox
    xc = (x + w / 2.0) / img_w
    yc = (y + h / 2.0) / img_h
    wn =  w / img_w
    hn =  h / img_h
    return xc, yc, wn, hn

def is_valid_bbox(xc, yc, w, h, min_area=0.0003):
    if not (0 < xc < 1 and 0 < yc < 1 and 0 < w <= 1 and 0 < h <= 1):
        return False
    if w * h < min_area:
        return False
    return True

def setup_dirs():
    if PROC_DIR.exists():
        shutil.rmtree(PROC_DIR)
    for split in ("train", "val"):
        (PROC_DIR / "images" / split).mkdir(parents=True, exist_ok=True)
        (PROC_DIR / "labels" / split).mkdir(parents=True, exist_ok=True)

def write_yaml():
    content = f"""# CleanSight AI — 8-Class ORIGINAL Dataset
path: {PROC_DIR.as_posix()}
train: images/train
val:   images/val
nc: {NC}

names:
  0: plastic_bottle
  1: plastic
  2: metal
  3: paper_cardboard
  4: glass
  5: garbage_bag
  6: cigarette
  7: mixed_trash
"""
    yaml_path = PROC_DIR / "garbage_dataset.yaml"
    yaml_path.write_text(content)
    print(f"[YAML] Written -> {yaml_path}")

def main():
    print("=" * 60)
    print("  CleanSight AI — TACO Dataset Remapper (8-Class ORIGINAL)")
    print("=" * 60)

    if not ANNOTATIONS_FILE.exists():
        print(f"[ERROR] Annotations not found at {ANNOTATIONS_FILE}")
        return

    with open(ANNOTATIONS_FILE, "r") as f:
        data = json.load(f)

    original_cats = {c["id"]: c["name"] for c in data.get("categories", [])}
    cat_id_to_new = {}
    unmapped = []
    for cid, cname in original_cats.items():
        if cname in CATEGORY_MAP:
            cat_id_to_new[cid] = CATEGORY_MAP[cname]
        else:
            cat_id_to_new[cid] = 7     # default → mixed_trash
            unmapped.append(cname)

    if unmapped:
        print(f"[WARN] {len(unmapped)} unmapped categories -> defaulted to 'mixed_trash'")

    images_info = {img["id"]: img for img in data.get("images", [])}
    img_to_anns = defaultdict(list)
    for ann in data.get("annotations", []):
        img_to_anns[ann["image_id"]].append(ann)

    valid_images   = []
    stats = {"missing": 0, "no_anns": 0, "bad_boxes": 0, "accepted": 0}
    class_counts   = defaultdict(int)

    for img_id, img_info in images_info.items():
        img_path = RAW_DIR / img_info["file_name"]
        if not img_path.exists():
            stats["missing"] += 1
            continue

        anns = img_to_anns.get(img_id, [])
        if not anns:
            stats["no_anns"] += 1
            continue

        iw, ih = img_info["width"], img_info["height"]
        good_anns = []

        for ann in anns:
            bbox = ann.get("bbox")
            cid  = ann.get("category_id")
            if bbox is None or cid not in cat_id_to_new:
                stats["bad_boxes"] += 1
                continue

            xc, yc, wn, hn = coco_to_yolo(bbox, iw, ih)
            if not is_valid_bbox(xc, yc, wn, hn):
                stats["bad_boxes"] += 1
                continue

            new_id = cat_id_to_new[cid]
            good_anns.append((new_id, xc, yc, wn, hn))
            class_counts[new_id] += 1

        if good_anns:
            valid_images.append({"path": img_path, "anns": good_anns})
            stats["accepted"] += 1

    print(f"\n[DATASET] Accepted: {stats['accepted']} images")
    print(f"\n[CLASS DISTRIBUTION]")
    for cid, name in CLASS_NAMES.items():
        print(f"  [{cid}] {name:16s}: {class_counts[cid]:5d} annotations")

    random.seed(42)
    random.shuffle(valid_images)

    split_idx   = int(len(valid_images) * 0.8)
    train_imgs  = valid_images[:split_idx]
    val_imgs    = valid_images[split_idx:]

    print(f"\n[SPLIT]  Train: {len(train_imgs)}  |  Val: {len(val_imgs)}")

    setup_dirs()

    def write_split(imgs, split):
        MAX_SIDE = 1280
        for item in imgs:
            src = item["path"]
            flat = src.relative_to(RAW_DIR).as_posix().replace("/", "_")
            stem = Path(flat).stem
            dst_img = PROC_DIR / "images" / split / (stem + ".jpg")
            dst_lbl = PROC_DIR / "labels" / split / (stem + ".txt")

            try:
                with Image.open(src) as im:
                    im = im.convert("RGB")
                    w, h = im.size
                    if max(w, h) > MAX_SIDE:
                        scale = MAX_SIDE / max(w, h)
                        im = im.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
                    im.save(dst_img, "JPEG", quality=90)
            except Exception as e:
                print(f"[SKIP] Could not process {src}: {e}")
                continue

            with open(dst_lbl, "w") as f:
                for cid, xc, yc, wn, hn in item["anns"]:
                    f.write(f"{cid} {xc:.6f} {yc:.6f} {wn:.6f} {hn:.6f}\n")

    print("\n[COPY] Writing train split...")
    write_split(train_imgs, "train")
    print("[COPY] Writing val split...")
    write_split(val_imgs, "val")

    write_yaml()
    print("\n[DONE] Dataset restored to 8 classes.")
    print("=" * 60)

if __name__ == "__main__":
    main()
