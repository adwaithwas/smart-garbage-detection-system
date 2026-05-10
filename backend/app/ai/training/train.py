"""
CleanSight AI — GPU-Accelerated Training Script (v4 — 8-Class FULL DATASET)
===========================================================================
- YOLOv8s on RTX 3060 (12GB VRAM)
- ORIGINAL 8-class taxonomy:
    0: plastic_bottle  1: plastic       2: metal    3: paper_cardboard
    4: glass           5: garbage_bag   6: cigarette  7: mixed_trash
- 100 epochs, mixed precision (AMP), resume-safe checkpointing
- Windows-stable (workers=0)
- Full TACO dataset: ~1500 images / ~4784 annotations
"""
import sys
import torch
from pathlib import Path
from ultralytics import YOLO

# ─── Paths ────────────────────────────────────────────────────────────────────
AI_DIR       = Path(__file__).resolve().parent.parent
DATASETS_DIR = AI_DIR / "datasets"
WEIGHTS_DIR  = AI_DIR / "weights"
CONFIG_PATH  = DATASETS_DIR / "processed" / "garbage_dataset.yaml"
RUN_NAME     = "cleansight_v4"          # v4 = 8-class full TACO, GPU-trained
RUN_DIR      = WEIGHTS_DIR / RUN_NAME


def gpu_report():
    """Print a clear GPU status banner at startup."""
    print("=" * 60)
    print("  CleanSight AI — Training System")
    print("=" * 60)
    if torch.cuda.is_available():
        dev = torch.cuda.get_device_properties(0)
        vram = dev.total_memory / 1e9
        print(f"  Compute Device : CUDA (GPU)")
        print(f"  GPU            : {dev.name}")
        print(f"  VRAM           : {vram:.1f} GB")
        print(f"  CUDA Version   : {torch.version.cuda}")
        print(f"  PyTorch        : {torch.__version__}")
    else:
        print("  [WARNING] CUDA not available — training on CPU (slow!)")
    print("=" * 60)


def find_resume_checkpoint():
    """Return path to last.pt if a previous run exists, else None."""
    last_pt = RUN_DIR / "weights" / "last.pt"
    if last_pt.exists():
        print(f"[RESUME] Found checkpoint: {last_pt}")
        return str(last_pt)
    return None


def print_dataset_stats():
    """Print image counts from the processed dataset to confirm full dataset is in use."""
    proc = DATASETS_DIR / "processed"
    print("\n[DATASET VALIDATION]")
    total = 0
    for split in ("train", "val"):
        path = proc / "images" / split
        if path.exists():
            count = sum(1 for _ in path.iterdir())
            total += count
            print(f"  {split:5s}: {count} images")
        else:
            print(f"  {split:5s}: PATH MISSING — {path}")
    print(f"  TOTAL: {total} images")
    if total < 100:
        print("  [CRITICAL] Dataset too small! Run remap_taco.py to regenerate.")
        import sys; sys.exit(1)
    print()

def train():
    gpu_report()

    if not CONFIG_PATH.exists():
        print(f"[ERROR] Dataset config not found: {CONFIG_PATH}")
        print("        Run remap_taco.py first.")
        sys.exit(1)

    print_dataset_stats()

    device = "0" if torch.cuda.is_available() else "cpu"
    resume_ckpt = find_resume_checkpoint()

    if resume_ckpt:
        print(f"[MODE] Resuming from checkpoint...")
        model = YOLO(resume_ckpt)
    else:
        print(f"[MODE] Fresh training from yolov8s pretrained weights...")
        model = YOLO("yolov8s.pt")

    print(f"[CONFIG] Dataset : {CONFIG_PATH}")
    print(f"[CONFIG] Device  : {device}")
    print(f"[CONFIG] Run dir : {RUN_DIR}")
    print("=" * 60)

    results = model.train(
        data        = str(CONFIG_PATH),
        epochs      = 100,
        resume      = bool(resume_ckpt),

        # ── Image & Batch ────────────────────────────────────────────────────
        imgsz       = 640,
        batch       = 10,              # Lowered to 10 to prevent RAM OOM crashes

        # ── Device ───────────────────────────────────────────────────────────
        device      = device,
        half        = True,            # AMP mixed precision

        # ── Output ───────────────────────────────────────────────────────────
        project     = str(WEIGHTS_DIR),
        name        = RUN_NAME,
        exist_ok    = True,

        # ── Stability (Windows) ──────────────────────────────────────────────
        cache       = False,           # prevent RAM OOM on large dataset
        workers     = 0,               # single-process — avoids WinError 1455

        # ── Training Quality ─────────────────────────────────────────────────
        patience    = 25,              # early stopping (25 epochs no improve)
        save        = True,
        save_period = 10,
        val         = True,
        cos_lr      = True,            # cosine LR warmup/decay

        # ── Loss Weights (tuned for detection clarity) ───────────────────────
        box         = 7.5,             # strong bounding box regression
        cls         = 1.0,             # moderate classification loss
        dfl         = 1.5,

        # ── Augmentations (street/urban garbage scenes) ──────────────────────
        hsv_h       = 0.015,           # colour hue shift
        hsv_s       = 0.7,             # saturation — handles bright/dull lighting
        hsv_v       = 0.4,             # brightness — low-light street adaptation
        degrees     = 10.0,            # slight rotation (dropped bin litter)
        translate   = 0.1,
        scale       = 0.5,             # objects at various distances
        shear       = 2.0,
        perspective = 0.0001,
        flipud      = 0.0,
        fliplr      = 0.5,
        mosaic      = 1.0,             # mosaic — critical for small dataset gen
        mixup       = 0.0,             # Disabled to prevent memory crashes
        copy_paste  = 0.0,             # Disabled to prevent memory crashes
    )

    # ─── Export best weights ────────────────────────────────────────────────
    best_src = RUN_DIR / "weights" / "best.pt"
    best_dst = WEIGHTS_DIR / "garbage_best_v4.pt"

    if best_src.exists():
        import shutil
        shutil.copy(best_src, best_dst)
        print(f"\n[SUCCESS] Best model saved -> {best_dst}")
        # Also update the primary best.pt for backward compat
        shutil.copy(best_src, WEIGHTS_DIR / "garbage_best.pt")
        print(f"[SUCCESS] Also updated -> {WEIGHTS_DIR / 'garbage_best.pt'}")
    else:
        print("[WARN] best.pt not found after training.")

    print("[DONE] Training complete.")


if __name__ == "__main__":
    train()
