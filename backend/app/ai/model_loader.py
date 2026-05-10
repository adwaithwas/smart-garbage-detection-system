"""
CleanSight AI — Model Loader
============================
Singleton loader for the YOLOv8 garbage detection model.
Priority: garbage_best_v3.pt > garbage_best_v2.pt > garbage_best.pt > yolov8n.pt

Prints a clear GPU/device banner on first load.
"""
import torch
import logging
from ultralytics import YOLO
from pathlib import Path

logger = logging.getLogger(__name__)

WEIGHTS_DIR = Path(__file__).resolve().parent / "weights"

# Priority list — newest custom model first
CANDIDATE_WEIGHTS = [
    WEIGHTS_DIR / "garbage_best_v4.pt",
    WEIGHTS_DIR / "garbage_best_v3.pt",
    WEIGHTS_DIR / "garbage_best_v2.pt",
    WEIGHTS_DIR / "garbage_best.pt",
]


def _resolve_model_path() -> str:
    for candidate in CANDIDATE_WEIGHTS:
        if candidate.exists():
            return str(candidate)
    return "yolov8n.pt"   # absolute fallback


def _print_device_banner(device: str, model_path: str):
    sep = "=" * 56
    logger.info(sep)
    logger.info("  CleanSight AI — Inference Engine")
    logger.info(sep)
    if torch.cuda.is_available():
        dev = torch.cuda.get_device_properties(0)
        logger.info(f"  System Compute Device : CUDA (GPU)")
        logger.info(f"  GPU                   : {dev.name}")
        logger.info(f"  VRAM                  : {dev.total_memory / 1e9:.1f} GB")
    else:
        logger.info("  System Compute Device : CPU")
    logger.info(f"  Model weights         : {Path(model_path).name}")
    logger.info(sep)


class ModelLoader:
    _model: YOLO | None = None
    _device: str = "cpu"

    @classmethod
    def get_model(cls) -> YOLO:
        if cls._model is None:
            cls._device = "cuda:0" if torch.cuda.is_available() else "cpu"
            model_path  = _resolve_model_path()

            _print_device_banner(cls._device, model_path)
            logger.info(f"Loading model: {model_path}")

            cls._model = YOLO(model_path)
            cls._model.to(cls._device)

            logger.info("Model loaded and ready.")
        return cls._model

    @classmethod
    def get_device(cls) -> str:
        return cls._device


# Eagerly pre-load on import so the first API request is fast
try:
    ModelLoader.get_model()
except Exception as exc:
    logger.error(f"Failed to pre-load model: {exc}")
