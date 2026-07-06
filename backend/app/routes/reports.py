# File: backend/app/routes/reports.py
"""
Report generation routes for GuardianAI Backend.
Handles incident report creation and retrieval.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from ..database.connection import db_manager
from ..models.database_models import Report, Incident
from ..schemas.report_schemas import (
    ReportCreate,
    ReportUpdate,
    ReportResponse,
    ReportGenerateRequest
)

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/", response_model=list[ReportResponse])
async def get_reports(skip: int = 0, limit: int = 100, db: Session = Depends(db_manager.get_db_dependency)):
    """Get all reports with pagination."""
    reports = db.query(Report).offset(skip).limit(limit).all()
    return reports

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Get a specific report by ID."""
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
        
    return report

@router.post("/", response_model=ReportResponse)
async def create_report(report: ReportCreate, db: Session = Depends(db_manager.get_db_dependency)):
    """Create a new report."""
    # Create and save new report
    db_report = Report(**report.model_dump())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return db_report

@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int, 
    report_update: ReportUpdate, 
    db: Session = Depends(db_manager.get_db_dependency)
):
    """Update a report."""
    db_report = db.query(Report).filter(Report.id == report_id).first()
    
    if not db_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Update fields
    update_data = report_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_report, key, value)
        
    db.commit()
    db.refresh(db_report)
    
    return db_report

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(report_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Delete a report."""
    db_report = db.query(Report).filter(Report.id == report_id).first()
    
    if not db_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    # Delete the report
    db.delete(db_report)
    db.commit()

@router.post("/generate", response_model=ReportResponse)
async def generate_report(request: ReportGenerateRequest, db: Session = Depends(db_manager.get_db_dependency)):
    """Generate a new incident report."""
    # In a real implementation, this would involve complex logic to create reports
    # including PDF generation and incident analysis
    
    report_data = {
        "incident_id": request.incident_id,
        "generated_by": request.generated_by,
        "report_content": f"Automated report for incident #{request.incident_id}",
        "timestamp": datetime.utcnow(),
        "pdf_url": "/reports/incident_report.pdf"
    }
    
    db_report = Report(**report_data)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return db_report

@router.get("/{report_id}/download")
async def download_report(report_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Download a specific report (stub)."""
    # In a real implementation this would return PDF file
    return {"message": "Report download started"}
