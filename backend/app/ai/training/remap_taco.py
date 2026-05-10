import json
import os
import shutil
import random
from pathlib import Path

# Config
BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "datasets" / "raw" / "TACO"
PROCESSED_DIR = BASE_DIR / "datasets" / "processed"
ANNOTATIONS_FILE = RAW_DIR / "data" / "annotations.json"

if not ANNOTATIONS_FILE.exists():
    # Provide a fallback if user placed it differently
    ANNOTATIONS_FILE = RAW_DIR / "annotations.json"

TARGET_CLASSES = {
    "plastic_bottle": 0,
    "plastic": 1,
    "metal": 2,
    "paper_cardboard": 3,
    "glass": 4,
    "garbage_bag": 5,
    "cigarette": 6,
    "mixed_trash": 7
}

CLASS_MAPPING = {
    # plastic_bottle
    "Clear plastic bottle": "plastic_bottle",
    "Other plastic bottle": "plastic_bottle",

    # plastic
    "Other plastic": "plastic",
    "Plastic film": "plastic",
    "Plastic lid": "plastic",
    "Plastic straw": "plastic",
    "Plastic utensils": "plastic",
    "Other plastic wrapper": "plastic",
    "Other plastic container": "plastic",
    "Plastic glooves": "plastic",
    "Six pack rings": "plastic",
    "Crisp packet": "plastic",
    "Disposable plastic cup": "plastic",
    "Foam cup": "plastic",
    "Foam food container": "plastic",
    "Disposable food container": "plastic",
    "Tupperware": "plastic",
    "Spread tub": "plastic",
    "Polypropylene bag": "plastic",

    # metal
    "Drink can": "metal",
    "Food Can": "metal",
    "Scrap metal": "metal",
    "Aluminium foil": "metal",
    "Metal bottle cap": "metal",
    "Metal lid": "metal",
    "Pop tab": "metal",
    "Aerosol": "metal",
    "Aluminium blister pack": "metal",

    # paper_cardboard
    "Corrugated carton": "paper_cardboard",
    "Other carton": "paper_cardboard",
    "Meal carton": "paper_cardboard",
    "Drink carton": "paper_cardboard",
    "Egg carton": "paper_cardboard",
    "Pizza box": "paper_cardboard",
    "Magazine paper": "paper_cardboard",
    "Wrapping paper": "paper_cardboard",
    "Normal paper": "paper_cardboard",
    "Tissues": "paper_cardboard",
    "Paper cup": "paper_cardboard",
    "Paper bag": "paper_cardboard",
    "Plastified paper bag": "paper_cardboard",
    "Toilet tube": "paper_cardboard",
    "Paper straw": "paper_cardboard",

    # glass
    "Broken glass": "glass",
    "Glass bottle": "glass",
    "Glass cup": "glass",
    "Glass jar": "glass",

    # garbage_bag
    "Garbage bag": "garbage_bag",
    "Single-use carrier bag": "garbage_bag",

    # cigarette
    "Cigarette": "cigarette",

    # mixed_trash
    "Unlabeled litter": "mixed_trash",
    "Food waste": "mixed_trash",
    "Rope & strings": "mixed_trash",
    "Shoe": "mixed_trash",
    "Squeezable tube": "mixed_trash",
    "Battery": "mixed_trash",
    "Carded blister pack": "mixed_trash"
}

def setup_directories():
    if PROCESSED_DIR.exists():
        shutil.rmtree(PROCESSED_DIR)
    
    for split in ["train", "val"]:
        os.makedirs(PROCESSED_DIR / "images" / split, exist_ok=True)
        os.makedirs(PROCESSED_DIR / "labels" / split, exist_ok=True)

def convert_coco_to_yolo_bbox(bbox, img_width, img_height):
    # COCO bbox format: [x_min, y_min, width, height]
    # YOLO bbox format: [x_center, y_center, width, height] (normalized 0-1)
    x_min, y_min, w, h = bbox
    
    x_center = x_min + w / 2.0
    y_center = y_min + h / 2.0
    
    x_center /= img_width
    y_center /= img_height
    w /= img_width
    h /= img_height
    
    return [x_center, y_center, w, h]

def generate_yaml():
    yaml_content = f"""path: {PROCESSED_DIR.absolute()}
train: images/train
val: images/val

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
    yaml_path = PROCESSED_DIR / "garbage_dataset.yaml"
    with open(yaml_path, "w") as f:
        f.write(yaml_content)
    print(f"Generated YAML at {yaml_path}")

def main():
    print(f"Loading annotations from {ANNOTATIONS_FILE}...")
    if not ANNOTATIONS_FILE.exists():
        print(f"Error: Annotations file not found at {ANNOTATIONS_FILE}")
        return

    with open(ANNOTATIONS_FILE, "r") as f:
        data = json.load(f)

    # Create mapping from category id to new class id
    category_id_to_new_id = {}
    original_categories = {cat["id"]: cat["name"] for cat in data.get("categories", [])}
    
    for cat_id, cat_name in original_categories.items():
        if cat_name in CLASS_MAPPING:
            target_name = CLASS_MAPPING[cat_name]
            category_id_to_new_id[cat_id] = TARGET_CLASSES[target_name]
        else:
            print(f"Warning: Category '{cat_name}' not found in mapping, mapping to mixed_trash.")
            category_id_to_new_id[cat_id] = TARGET_CLASSES["mixed_trash"]

    # Map images by image ID
    images_info = {img["id"]: img for img in data.get("images", [])}
    
    # Map annotations to image IDs
    img_to_anns = {}
    for ann in data.get("annotations", []):
        img_id = ann["image_id"]
        if img_id not in img_to_anns:
            img_to_anns[img_id] = []
        img_to_anns[img_id].append(ann)

    # Validation & Extraction
    valid_images = []
    missing_images = 0
    empty_labels = 0
    invalid_annotations = 0
    class_counts = {v: 0 for v in TARGET_CLASSES.values()}

    for img_id, img_info in images_info.items():
        file_name = img_info["file_name"]
        img_path = RAW_DIR / file_name
        
        if not img_path.exists():
            missing_images += 1
            continue
        
        anns = img_to_anns.get(img_id, [])
        if not anns:
            empty_labels += 1
            continue

        valid_anns = []
        for ann in anns:
            bbox = ann.get("bbox")
            cat_id = ann.get("category_id")
            
            if bbox is None or cat_id not in category_id_to_new_id:
                invalid_annotations += 1
                continue
                
            new_id = category_id_to_new_id[cat_id]
            
            w, h = img_info["width"], img_info["height"]
            yolo_bbox = convert_coco_to_yolo_bbox(bbox, w, h)
            
            # Simple boundary checks
            if not all(0 <= x <= 1 for x in yolo_bbox):
                invalid_annotations += 1
                continue
                
            valid_anns.append((new_id, yolo_bbox))
            class_counts[new_id] += 1
        
        if valid_anns:
            valid_images.append({
                "path": img_path,
                "anns": valid_anns
            })
        else:
            empty_labels += 1

    # Train/Val Split (80/20)
    random.seed(42)
    random.shuffle(valid_images)
    
    # Limit dataset size to fix system memory exhaustion
    valid_images = valid_images[:25]
    split_idx = int(len(valid_images) * 0.8)
    train_images = valid_images[:split_idx]
    val_images = valid_images[split_idx:]

    print(f"Total valid images: {len(valid_images)}")
    print(f"Train images: {len(train_images)}")
    print(f"Validation images: {len(val_images)}")
    print(f"Missing images: {missing_images}")
    print(f"Images with empty labels: {empty_labels}")
    print(f"Invalid annotations filtered: {invalid_annotations}")
    
    print("\nClass Distribution:")
    inv_target = {v: k for k, v in TARGET_CLASSES.items()}
    for class_id, count in class_counts.items():
        print(f"  {inv_target[class_id]}: {count}")

    setup_directories()

    # Process and copy files
    def process_split(split_images, split_name):
        for img_dict in split_images:
            src_path = img_dict["path"]
            # To handle TACO's batch_1/000001.jpg etc, we can flatten or keep structure.
            # Flattening and making names unique: batch_1_000001.jpg
            flat_name = str(src_path.relative_to(RAW_DIR)).replace(os.sep, "_")
            
            dst_img_path = PROCESSED_DIR / "images" / split_name / flat_name
            dst_lbl_path = PROCESSED_DIR / "labels" / split_name / flat_name.replace(src_path.suffix, ".txt")
            
            shutil.copy(src_path, dst_img_path)
            
            with open(dst_lbl_path, "w") as f:
                for new_id, bbox in img_dict["anns"]:
                    row = f"{new_id} {' '.join(map(str, bbox))}\n"
                    f.write(row)

    print("\nCopying files and converting annotations...")
    process_split(train_images, "train")
    process_split(val_images, "val")

    generate_yaml()
    print("Dataset conversion complete!")

if __name__ == "__main__":
    main()
