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


# Severity weight per class (Original 8-class taxonomy)
CLASS_WEIGHTS = {
    "plastic_bottle":  1.0,
    "plastic":         1.0,
    "metal":           1.0,
    "paper_cardboard": 1.0,
    "glass":           1.2,  # broken glass is higher risk
    "garbage_bag":     1.8,  # high volume
    "cigarette":       0.5,  # small litter
    "mixed_trash":     1.5,
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
                "bottle_count":    0,
                "plastic_count":   0,
                "metal_count":     0,
                "paper_count":     0,
                "glass_count":     0,
                "bag_count":       0,
                "cigarette_count": 0,
                "mixed_count":     0,
            }

        image_area = image_width * image_height
        if image_area <= 0:
            image_area = 1.0

        # ── Area coverage ────────────────────────────────────────────────────
        total_box_area = sum(
            d["box"]["width"] * d["box"]["height"] for d in detections
        )
        raw_coverage = min((total_box_area / image_area) * 100.0, 100.0)

        # ── Weighted score ─────────────────────
        weighted_sum = sum(
            CLASS_WEIGHTS.get(d["category"], 1.0)
            for d in detections
        )

        # ── Category counts ──────────────────────────────────────────────────
        cat_counts = Counter(d["category"] for d in detections)
        n_bottles   = cat_counts.get("plastic_bottle",  0)
        n_plastic   = cat_counts.get("plastic",         0)
        n_metal     = cat_counts.get("metal",           0)
        n_paper     = cat_counts.get("paper_cardboard", 0)
        n_glass     = cat_counts.get("glass",           0)
        n_bags      = cat_counts.get("garbage_bag",     0)
        n_cigarettes = cat_counts.get("cigarette",      0)
        n_mixed     = cat_counts.get("mixed_trash",     0)

        # ── Aggregated categories (Frontend compat) ──────────────────────────
        # Hazardous: glass (due to risk of injury)
        # Recyclable: plastic_bottle, plastic, metal, paper_cardboard
        # Garbage: garbage_bag, cigarette, mixed_trash
        hazardous_count = n_glass
        recyclable_count = n_bottles + n_plastic + n_metal + n_paper
        garbage_count = n_bags + n_cigarettes + n_mixed

        # ── Severity decision ────────────────────────────────────────────────
        if n_bags >= 2 or raw_coverage > 25 or weighted_sum > 12:
            severity = "High"
        elif n_bags >= 1 or n_mixed >= 5 or raw_coverage > 8 or weighted_sum > 5:
            severity = "Medium"
        else:
            severity = "Low"

        # ── Vehicle recommendation ───────────────────────────────────────────
        if severity == "High":
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
            "hazardous_count":     hazardous_count,
            "recyclable_count":    recyclable_count,
            "garbage_count":       garbage_count,
            "bottle_count":    n_bottles,
            "plastic_count":   n_plastic,
            "metal_count":     n_metal,
            "paper_count":     n_paper,
            "glass_count":     n_glass,
            "bag_count":       n_bags,
            "cigarette_count": n_cigarettes,
            "mixed_count":     n_mixed,
        }
