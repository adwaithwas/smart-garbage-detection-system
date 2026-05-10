import os
from pathlib import Path
from ultralytics import YOLO

def evaluate_model():
    """
    Evaluate the trained custom garbage detection model.
    Generates evaluation reports (mAP, precision, recall, confusion matrix).
    """
    # Define paths
    AI_DIR = Path(__file__).parent.parent
    WEIGHTS_DIR = AI_DIR / "weights"
    DATASETS_DIR = AI_DIR / "datasets"
    
    model_path = WEIGHTS_DIR / "garbage_best.pt"
    config_path = DATASETS_DIR / "configs" / "garbage_dataset.yaml"
    
    if not model_path.exists():
        print(f"Model weights not found at {model_path}. Please train the model first.")
        return
        
    print(f"Evaluating model: {model_path}")
    model = YOLO(str(model_path))
    
    # Run validation
    metrics = model.val(
        data=str(config_path),
        imgsz=640,
        batch=16,
        conf=0.25,      # Confidence threshold
        iou=0.45,       # NMS threshold
        device="0",
        save_json=True,
        project=str(WEIGHTS_DIR),
        name="evaluation"
    )
    
    print("Evaluation completed. Results saved in weights/evaluation directory.")
    print(f"mAP50-95: {metrics.box.map}")
    print(f"mAP50: {metrics.box.map50}")

if __name__ == "__main__":
    evaluate_model()
