import cv2
import numpy as np

class AnnotationService:
    @staticmethod
    def annotate_image(image_path: str, detections: list, output_path: str):
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image at {image_path}")

        # Colors for futuristic aesthetic
        box_color = (250, 165, 96) # BGR for #60a5fa (blue-400)
        text_color = (250, 165, 96)
        bg_color = (42, 23, 15) # BGR for #0f172a (slate-950)

        for det in detections:
            box = det['box']
            x1 = int(box['x'])
            y1 = int(box['y'])
            x2 = int(box['x'] + box['width'])
            y2 = int(box['y'] + box['height'])
            
            # Draw box
            cv2.rectangle(img, (x1, y1), (x2, y2), box_color, 2)
            
            # Label
            label = f"{det['category']} {int(det['confidence']*100)}%"
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            
            # Draw label background
            cv2.rectangle(img, (x1, y1 - 20), (x1 + w, y1), bg_color, -1)
            
            # Draw text
            cv2.putText(img, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, text_color, 1)

        # Save annotated image
        cv2.imwrite(output_path, img)
        return output_path
