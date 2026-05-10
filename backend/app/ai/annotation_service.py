"""
CleanSight AI — Annotation Service
=====================================
Draws clean, professional bounding boxes on images for demo output.

Visual design:
  - Per-class colour coding:
      garbage    -> amber/orange
      recyclable -> emerald green
      hazardous  -> red/crimson
  - Corner-bracket style boxes (modern HUD aesthetic)
  - Clean confidence badge with pill background
  - Drop shadow on labels for readability over any background
"""
import cv2
import numpy as np

# ─── Per-class colour palette (BGR) ──────────────────────────────────────────
CLASS_COLOURS = {
    "garbage":    (32,  165, 218),   # amber-ish  #DAA520 -> BGR (32,165,218)
    "recyclable": (80,  200, 100),   # emerald    #64C850
    "hazardous":  (60,   60, 220),   # red        #DC3C3C
    "unknown":    (180, 180, 180),   # grey fallback
}

CORNER_LEN  = 18   # length of corner bracket line in pixels
CORNER_THICK = 3   # thickness


def _get_colour(category: str):
    return CLASS_COLOURS.get(category.lower(), CLASS_COLOURS["unknown"])


def _draw_corner_box(img, x1, y1, x2, y2, colour, thickness=CORNER_THICK, length=CORNER_LEN):
    """Draw a corner-bracket style bounding box instead of a full rectangle."""
    # Main thin dim box
    overlay = img.copy()
    cv2.rectangle(overlay, (x1, y1), (x2, y2), colour, 1)
    cv2.addWeighted(overlay, 0.25, img, 0.75, 0, img)

    # Corners
    # Top-left
    cv2.line(img, (x1, y1), (x1 + length, y1), colour, thickness)
    cv2.line(img, (x1, y1), (x1, y1 + length), colour, thickness)
    # Top-right
    cv2.line(img, (x2, y1), (x2 - length, y1), colour, thickness)
    cv2.line(img, (x2, y1), (x2, y1 + length), colour, thickness)
    # Bottom-left
    cv2.line(img, (x1, y2), (x1 + length, y2), colour, thickness)
    cv2.line(img, (x1, y2), (x1, y2 - length), colour, thickness)
    # Bottom-right
    cv2.line(img, (x2, y2), (x2 - length, y2), colour, thickness)
    cv2.line(img, (x2, y2), (x2, y2 - length), colour, thickness)


def _draw_label(img, x1, y1, label: str, colour):
    """Draw a pill-shaped label badge above the box."""
    font       = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.52
    thickness  = 1

    (text_w, text_h), baseline = cv2.getTextSize(label, font, font_scale, thickness)
    pad_x, pad_y = 8, 5

    badge_x1 = x1
    badge_y1 = max(y1 - text_h - pad_y * 2 - baseline, 0)
    badge_x2 = x1 + text_w + pad_x * 2
    badge_y2 = y1

    # Semi-transparent dark background
    overlay = img.copy()
    cv2.rectangle(overlay, (badge_x1, badge_y1), (badge_x2, badge_y2), (15, 15, 25), -1)
    cv2.addWeighted(overlay, 0.78, img, 0.22, 0, img)

    # Coloured top border on badge
    cv2.rectangle(img, (badge_x1, badge_y1), (badge_x2, badge_y1 + 2), colour, -1)

    # White text
    text_x = badge_x1 + pad_x
    text_y = badge_y2 - pad_y - baseline
    cv2.putText(img, label, (text_x, text_y), font, font_scale, (240, 240, 240), thickness, cv2.LINE_AA)


class AnnotationService:

    @staticmethod
    def annotate_image(image_path: str, detections: list, output_path: str) -> str:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image: {image_path}")

        for det in detections:
            box      = det["box"]
            category = det.get("category", "unknown").lower()
            conf     = det.get("confidence", 0.0)
            colour   = _get_colour(category)

            x1 = max(int(box["x"]), 0)
            y1 = max(int(box["y"]), 0)
            x2 = min(int(box["x"] + box["width"]),  img.shape[1] - 1)
            y2 = min(int(box["y"] + box["height"]), img.shape[0] - 1)

            if x2 <= x1 or y2 <= y1:
                continue

            _draw_corner_box(img, x1, y1, x2, y2, colour)

            label = f"{category.upper()}  {int(conf * 100)}%"
            _draw_label(img, x1, y1, label, colour)

        cv2.imwrite(output_path, img)
        return output_path
