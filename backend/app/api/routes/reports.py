from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import json
from app.db.database import get_db
from app.db.models import Report, Detection
from app.schemas.report import ReportCreate, ReportResponse, ReportStatusUpdate
from app.services.storage_service import StorageService

router = APIRouter()

@router.post("/upload", response_model=dict)
async def upload_image(file: UploadFile = File(...)):
    url = await StorageService.upload_image(file)
    return {"image_url": url}

@router.post("/", response_model=ReportResponse)
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    db_report = Report(
        image_url=report.image_url,
        latitude=report.latitude,
        longitude=report.longitude,
        address=report.address,
        severity=report.severity,
        coverage_percentage=report.coverage_percentage,
        total_objects=report.total_objects,
        vehicle_recommended=report.vehicle_recommended
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
