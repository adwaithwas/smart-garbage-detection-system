from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import json
import os
import cv2
from app.db.database import get_db
from app.db.models import Report, Detection
from app.schemas.report import ReportCreate, ReportResponse, ReportStatusUpdate
from app.services.storage_service import StorageService
from app.ai.inference_service import InferenceService
from app.ai.annotation_service import AnnotationService
from app.ai.severity_service import SeverityService

router = APIRouter()

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    # 1. Save uploaded image
    image_url, local_path = await StorageService.upload_image(file)
    
    # 2. Get image dimensions
    img = cv2.imread(local_path)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
    height, width, _ = img.shape
    
    # 3. Run Inference
    detections = InferenceService.run_inference(local_path)
    
    # 4. Analyze Severity
    analysis = SeverityService.analyze(width, height, detections)
    
    # 5. Annotate Image
    annotated_filename = f"annotated_{os.path.basename(local_path)}"
    annotated_local_path = os.path.join("uploads", annotated_filename)
    AnnotationService.annotate_image(local_path, detections, annotated_local_path)
    annotated_url = f"http://localhost:8000/uploads/{annotated_filename}"
    
    return {
        "image_url": image_url,
        "annotated_image_url": annotated_url,
        "detections": detections,
        **analysis
    }

@router.post("/upload", response_model=dict)
async def upload_image(file: UploadFile = File(...)):
    url, _ = await StorageService.upload_image(file)
    return {"image_url": url}

@router.post("/", response_model=ReportResponse)
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    db_report = Report(
        image_url=report.image_url,
        annotated_image_url=report.annotated_image_url,
        latitude=report.latitude,
        longitude=report.longitude,
        address=report.address,
        severity=report.severity,
        coverage_percentage=report.coverage_percentage,
        total_objects=report.total_objects,
        vehicle_recommended=report.vehicle_recommended,
        bottle_count=report.bottle_count,
        plastic_count=report.plastic_count,
        metal_count=report.metal_count,
        paper_count=report.paper_count,
        glass_count=report.glass_count,
        bag_count=report.bag_count,
        cigarette_count=report.cigarette_count,
        mixed_count=report.mixed_count,
        hazardous_count=report.hazardous_count,
        recyclable_count=report.recyclable_count,
        garbage_count=report.garbage_count,
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    for det in report.detections:
        db_det = Detection(
            report_id=db_report.id,
            category=det.category,
            confidence=det.confidence,
            box_json=json.dumps(det.box.model_dump()) if det.box else None
        )
        db.add(db_det)
    
    db.commit()
    db.refresh(db_report)
    
    # Map box_json back to dict for Pydantic response
    for det in db_report.detections:
        det.box = json.loads(det.box_json) if det.box_json else None

    return db_report

@router.get("/", response_model=List[ReportResponse])
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.timestamp.desc()).all()
    for report in reports:
        for det in report.detections:
            det.box = json.loads(det.box_json) if det.box_json else None
    return reports

@router.patch("/{report_id}/status", response_model=ReportResponse)
def update_status(report_id: str, status_update: ReportStatusUpdate, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.status = status_update.status
    db.commit()
    db.refresh(report)
    
    for det in report.detections:
        det.box = json.loads(det.box_json) if det.box_json else None
        
    return report

@router.delete("/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db.delete(report)
    db.commit()
    return {"status": "success", "message": "Report deleted successfully"}
