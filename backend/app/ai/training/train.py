import os
from pathlib import Path
from ultralytics import YOLO

def train_model():
    """
    Professional training script for YOLOv8 optimized for RTX 3060 (12GB VRAM).
    """
    # Define paths
    AI_DIR = Path(__file__).parent.parent
    DATASETS_DIR = AI_DIR / "datasets"
    WEIGHTS_DIR = AI_DIR / "weights"
    
    config_path = DATASETS_DIR / "configs" / "garbage_dataset.yaml"
    
    if not config_path.exists():
        print(f"Config file not found at {config_path}. Please run dataset_setup.py first.")
        return
        
    print(f"Starting training using config: {config_path}")
    
    # Initialize YOLOv8 small model as recommended
    model = YOLO("yolov8s.pt")
    
    # Training configuration optimized for RTX 3060 12GB VRAM
    results = model.train(
        data=str(config_path),
        epochs=50,                  # Configurable epochs (30-50 recommended for starter)
        imgsz=640,                  # Image size configuration
        batch=16,                   # Optimize batch size (16 fits well on 12GB VRAM with imgsz 640)
        device="0",                 # Use CUDA acceleration (GPU 0)
        project=str(WEIGHTS_DIR),   # Checkpoint saving directory
        name="experiments",         # Save to experiments
        exist_ok=True,              # Automatic experiment naming fallback
        patience=10,                # Early stopping
        save=True,                  # Save checkpoints
        save_period=10,             # Checkpoint saving frequency
        val=True,                   # Validation metrics
        half=True,                  # Mixed precision training
        workers=4,                  # Optimized dataloaders
        
        # Advanced Augmentation (Real-world street augmentation)
        hsv_h=0.015,                # Color hue augmentation
        hsv_s=0.7,                  # Color saturation augmentation
        hsv_v=0.4,                  # Brightness variation (low-light, etc)
        degrees=10.0,               # Rotation
        translate=0.1,              # Translation
        scale=0.5,                  # Scale variation
        shear=2.0,                  # Shear
        perspective=0.0001,         # Perspective transforms
        flipud=0.0,                 # Flip up-down
        fliplr=0.5,                 # Flip left-right
        mosaic=1.0,                 # Mosaic augmentation
        mixup=0.1,                  # Mixup augmentation
        copy_paste=0.1              # Copy paste augmentation
    )
    
    # Move best weights to main weights dir
    best_weights = WEIGHTS_DIR / "experiments" / "weights" / "best.pt"
    if best_weights.exists():
        target_path = WEIGHTS_DIR / "garbage_best.pt"
        best_weights.rename(target_path)
        print(f"Moved best model to {target_path}")
        
    print("Training finished.")

if __name__ == "__main__":
    train_model()
