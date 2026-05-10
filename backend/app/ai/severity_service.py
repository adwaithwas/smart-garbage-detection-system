class SeverityService:
    @staticmethod
    def analyze(image_width: float, image_height: float, detections: list):
        if not detections:
            return {
                "coverage_percentage": 0.0,
                "severity": "Low",
                "total_objects": 0,
                "vehicle_recommended": "Small Utility Vehicle"
            }

        total_area = 0.0
        for det in detections:
            total_area += (det['box']['width'] * det['box']['height'])
            
        image_area = image_width * image_height
        
        if image_area > 0:
            coverage_percentage = (total_area / image_area) * 100.0
        else:
            coverage_percentage = 0.0
            
        # Cap at 100% just in case of overlapping boxes (real implementation would use union of boxes)
        coverage_percentage = min(coverage_percentage, 100.0)

        severity = 'Low'
        vehicle = 'Small Utility Vehicle'
        
        if coverage_percentage > 30:
            severity = 'High'
            vehicle = 'Heavy Garbage Truck'
        elif coverage_percentage > 10:
            severity = 'Medium'
            vehicle = 'Medium Garbage Van'

        return {
            "coverage_percentage": round(coverage_percentage, 2),
            "severity": severity,
            "total_objects": len(detections),
            "vehicle_recommended": vehicle
        }
