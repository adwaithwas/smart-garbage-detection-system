from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    image_url = Column(String, nullable=False)
    annotated_image_url = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    severity = Column(String, nullable=False)
    coverage_percentage = Column(Float, nullable=False)
    total_objects = Column(Integer, nullable=False)
    vehicle_recommended = Column(String, nullable=False)
    # 8-Class Statistics
    bottle_count    = Column(Integer, default=0)
    plastic_count   = Column(Integer, default=0)
    metal_count     = Column(Integer, default=0)
    paper_count     = Column(Integer, default=0)
    glass_count     = Column(Integer, default=0)
    bag_count       = Column(Integer, default=0)
    cigarette_count = Column(Integer, default=0)
    mixed_count     = Column(Integer, default=0)
    hazardous_count  = Column(Integer, default=0)
    recyclable_count = Column(Integer, default=0)
    garbage_count    = Column(Integer, default=0)
    status = Column(String, default="Pending")
    timestamp = Column(DateTime, default=datetime.utcnow)

    detections = relationship("Detection", back_populates="report", cascade="all, delete-orphan")

class Detection(Base):
    __tablename__ = "detections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String, ForeignKey("reports.id"), nullable=False)
    category = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    
    # Store JSON string for box
    box_json = Column(Text, nullable=True)

    report = relationship("Report", back_populates="detections")
