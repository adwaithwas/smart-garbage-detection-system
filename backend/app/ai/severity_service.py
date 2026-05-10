"""
CleanSight AI — Severity Service
==================================
Converts raw detections into a smart-city severity report.

3-class aware:
  - hazardous items increase severity weight significantly
  - recyclable items trigger different vehicle recommendations
  - severity calculated from area coverage + weighted count
"""
from collections import Counter


# Severity weight per class (hazardous counts more)
CLASS_WEIGHTS = {
    "garbage":    1.0,
    "recyclable": 0.8,
    "hazardous":  2.5,
}


class SeverityService:

    @staticmethod
    def analyze(image_width: float, image_height: float, detections: list) -> dict:
        if not detections:
            return {
                "coverage_percentage":  0.0,
                "severity":             "Low",
                "total_objects":        0,
                "vehicle_recommended":  "Small Utility Vehicle",
                "hazardous_count":      0,
                "recyclable_count":     0,
                "garbage_count":        0,
            }

        image_area = image_width * image_height
        if image_area <= 0:
            image_area = 1.0

        # ── Area coverage ────────────────────────────────────────────────────
        total_box_area = sum(
            d["box"]["width"] * d["box"]["height"] for d in detections
        )
        raw_coverage = min((total_box_area / image_area) * 100.0, 100.0)

        # ── Weighted score (factors in hazardous weight) ─────────────────────
        weighted_sum = sum(
            CLASS_WEIGHTS.get(d["category"], 1.0)
            for d in detections
        )

        # ── Category counts ──────────────────────────────────────────────────
        cat_counts = Counter(d["category"] for d in detections)
        n_hazardous   = cat_counts.get("hazardous",   0)
        n_recyclable  = cat_counts.get("recyclable",  0)
        n_garbage     = cat_counts.get("garbage",     0)

        # ── Severity decision ────────────────────────────────────────────────
        # Escalate to High immediately if ANY hazardous items are found
        if n_hazardous >= 3 or raw_coverage > 30 or weighted_sum > 15:
            severity = "High"
        elif n_hazardous >= 1 or raw_coverage > 10 or weighted_sum > 6:
            severity = "Medium"
        else:
            severity = "Low"

        # ── Vehicle recommendation ───────────────────────────────────────────
        if severity == "High":
            if n_hazardous > 0:
                vehicle = "Hazardous Waste Disposal Unit"
            else:
                vehicle = "Heavy Garbage Truck"
        elif severity == "Medium":
            vehicle = "Medium Garbage Van"
        else:
            vehicle = "Small Utility Vehicle"

        return {
            "coverage_percentage": round(raw_coverage, 2),
            "severity":            severity,
            "total_objects":       len(detections),
            "vehicle_recommended": vehicle,
            "hazardous_count":     n_hazardous,
            "recyclable_count":    n_recyclable,
            "garbage_count":       n_garbage,
        }
