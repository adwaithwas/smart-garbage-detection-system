from app.ai.model_loader import ModelLoader
import time
import logging

logger = logging.getLogger(__name__)

class InferenceService:
    @staticmethod
    def run_inference(image_path: str):
        start_time = time.time()
        model = ModelLoader.get_model()
        
        # Run inference
        results = model.predict(source=image_path, conf=0.25, save=False)
        
        detections = []
        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                
                # Bounding box coords (x1, y1, x2, y2)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                width = x2 - x1
                height = y2 - y1
                
                # Get category directly from model names
                category = model.names[cls_id] if cls_id in model.names else "unknown"
                
                detections.append({
                    "category": category,
                    "confidence": conf,
                    "box": {
                        "x": x1,
                        "y": y1,
                        "width": width,
                        "height": height
                    }
                })

        inference_time = time.time() - start_time
        logger.info(f"Inference completed in {inference_time:.3f}s. Found {len(detections)} objects.")
        
        return detections
