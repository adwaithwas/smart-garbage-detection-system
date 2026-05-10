"""
CleanSight AI — Inference Service
===================================
Runs YOLOv8 detection on an image and returns clean, filtered detections.

Post-processing:
  - Confidence threshold: 0.35 (removes weak/noisy detections)
  - Minimum box area:     0.2% of image (removes microscopic noise boxes)
  - NMS handled by YOLO internally (iou=0.45 — tighter than default)
"""
import time
import logging
from app.ai.model_loader import ModelLoader

logger = logging.getLogger(__name__)

# ─── Thresholds ───────────────────────────────────────────────────────────────
CONF_THRESHOLD  = 0.35      # minimum confidence to accept a detection
IOU_THRESHOLD   = 0.45      # NMS IoU overlap threshold (tighter = fewer duplicates)
MIN_BOX_AREA_FRAC = 0.002   # reject boxes smaller than 0.2% of image area


class InferenceService:

    @staticmethod
    def run_inference(image_path: str) -> list[dict]:
        """
        Returns a list of detection dicts:
          {
            "category":   str,   e.g. "garbage"
            "confidence": float, e.g. 0.82
            "box": {"x": float, "y": float, "width": float, "height": float}
          }
        """
        t0    = time.perf_counter()
        model = ModelLoader.get_model()

        results = model.predict(
            source  = image_path,
            conf    = CONF_THRESHOLD,
            iou     = IOU_THRESHOLD,
            save    = False,
            verbose = False,
        )

        detections = []

        for r in results:
            img_h, img_w = r.orig_shape
            img_area     = img_h * img_w

            for box in r.boxes:
                cls_id = int(box.cls[0].item())
                conf   = float(box.conf[0].item())
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                w = x2 - x1
                h = y2 - y1

                # Filter microscopic / out-of-range boxes
                if (w * h) / img_area < MIN_BOX_AREA_FRAC:
                    continue
                if w <= 0 or h <= 0:
                    continue

                category = model.names.get(cls_id, "garbage")

                detections.append({
                    "category":   category,
                    "confidence": round(conf, 4),
                    "box": {
                        "x":      round(x1, 2),
                        "y":      round(y1, 2),
                        "width":  round(w, 2),
                        "height": round(h, 2),
                    },
                })

        elapsed = (time.perf_counter() - t0) * 1000
        logger.info(
            f"Inference: {len(detections)} detections | "
            f"{elapsed:.1f} ms | conf>={CONF_THRESHOLD}"
        )
        return detections
