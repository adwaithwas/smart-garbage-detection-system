import os
import argparse
import logging
import torch
from ultralytics import YOLO

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def train_model(data_yaml: str, epochs: int, batch_size: int, imgsz: int, output_name: str):
    logger.info(f"Starting YOLOv8 training for {epochs} epochs...")
    
    # Ensure CUDA is available if possible
    device = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info(f"Using device: {device}")
    
    if device == "cuda":
        logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
        logger.info(f"VRAM Available: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")

    # Load base model. Use YOLOv8n for fast iteration MVP, or yolov8s/m/l/x for accuracy
    model = YOLO('yolov8n.pt')

    # Start training
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch_size,
        imgsz=imgsz,
        device=device,
        project='app/ai/weights',
        name=output_name,
        exist_ok=True,
        plots=True, # Saves training plots
        save=True,  # Save weights
    )
    
    logger.info(f"Training completed! Weights saved to app/ai/weights/{output_name}")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train custom YOLOv8 model for CleanSight AI")
    parser.add_argument('--data', type=str, default='app/ai/training/configs/garbage_dataset.yaml', help='Path to dataset YAML')
    parser.add_argument('--epochs', type=int, default=100, help='Number of epochs')
    parser.add_argument('--batch', type=int, default=16, help='Batch size')
    parser.add_argument('--imgsz', type=int, default=640, help='Image size')
    parser.add_argument('--name', type=str, default='cleansight_yolov8_custom', help='Name of the training run')

    args = parser.parse_args()

    if not os.path.exists(args.data):
        logger.warning(f"Dataset config {args.data} not found. Ensure dataset is downloaded and YAML exists before running.")
    else:
        train_model(args.data, args.epochs, args.batch, args.imgsz, args.name)
