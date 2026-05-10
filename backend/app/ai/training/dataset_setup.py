import os
import yaml
import shutil
from pathlib import Path

def setup_dataset_structure(base_dir: str):
    """
    Creates the directory structure for dataset management
    """
    dirs = [
        "raw",
        "processed",
        "train/images",
        "train/labels",
        "valid/images",
        "valid/labels",
        "test/images",
        "test/labels",
        "configs"
    ]
    
    base_path = Path(base_dir)
    for d in dirs:
        (base_path / d).mkdir(parents=True, exist_ok=True)
        
    print(f"Dataset structure created at {base_path}")

def generate_yaml_config(base_dir: str):
    """
    Generates the YOLO dataset YAML configuration file.
    """
    classes = [
        "plastic_bottle",
        "plastic_bag",
        "food_wrapper",
        "cardboard",
        "metal_can",
        "glass_bottle",
        "organic_waste",
        "garbage_bag",
        "e_waste",
        "mixed_trash"
    ]
    
    config = {
        "path": os.path.abspath(base_dir),
        "train": "train/images",
        "val": "valid/images",
        "test": "test/images",
        "nc": len(classes),
        "names": classes
    }
    
    config_path = Path(base_dir) / "configs" / "garbage_dataset.yaml"
    with open(config_path, "w") as f:
        yaml.dump(config, f, sort_keys=False)
        
    print(f"Generated YAML configuration at {config_path}")

def clean_and_normalize_labels(dataset_path: str):
    """
    Placeholder for label standardization, class balancing, and image normalization.
    """
    print("Dataset cleaning and normalization placeholder executed.")

if __name__ == "__main__":
    # Base directory for datasets
    AI_DIR = Path(__file__).parent.parent
    DATASETS_DIR = AI_DIR / "datasets"
    
    setup_dataset_structure(str(DATASETS_DIR))
    generate_yaml_config(str(DATASETS_DIR))
    clean_and_normalize_labels(str(DATASETS_DIR))
    
    print("Phase 1: Dataset setup complete.")
