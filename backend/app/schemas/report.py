from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BoxSchema(BaseModel):
    x: float
    y: float
    width: float
    height: float

class DetectionSchema(BaseModel):
    category: str
    confidence: float
    box: Optional[BoxSchema] = None

class DetectionResponse(DetectionSchema):
    id: str

class ReportCreate(BaseModel):
    image_url: str
    annotated_image_url: Optional[str] = None
    latitude: float
    longitude: float
    address: str
    severity: str
    coverage_percentage: float
    total_objects: int
    vehicle_recommended: str
    hazardous_count: int = 0
    recyclable_count: int = 0
    garbage_count: int = 0
    detections: List[DetectionSchema]

class ReportResponse(ReportCreate):
    id: str
    status: str
    timestamp: datetime
    detections: List[DetectionResponse]

    class Config:
        from_attributes = True

class ReportStatusUpdate(BaseModel):
    status: str
