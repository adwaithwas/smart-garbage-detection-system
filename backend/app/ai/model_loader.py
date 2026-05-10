import torch
from ultralytics import YOLO
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class ModelLoader:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            # Check for GPU
            device = "cuda" if torch.cuda.is_available() else "cpu"
            
            # Try loading custom garbage model first
            weights_dir = Path(__file__).parent / "weights"
            custom_model_path = weights_dir / "garbage_best.pt"
            
            if custom_model_path.exists():
                logger.info(f"Loading custom garbage model from {custom_model_path} on device: {device}")
                model_path = str(custom_model_path)
            else:
                logger.info(f"Custom model not found. Falling back to YOLOv8n on device: {device}")
                model_path = 'yolov8n.pt'
            
            # Load the model
            try:
                cls._model = YOLO(model_path)
                cls._model.to(device)
            except Exception as e:
                logger.error(f"Failed to load YOLO model: {str(e)}")
                raise e
                
        return cls._model

# Pre-load on import
try:
    ModelLoader.get_model()
except Exception:
    pass
