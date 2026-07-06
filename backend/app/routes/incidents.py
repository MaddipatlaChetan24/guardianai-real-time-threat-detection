# File: backend/app/routes/incidents.py
"""
Incident management routes for GuardianAI Backend.
Handles CRUD operations on security incidents.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..database.connection import db_manager
from ..models.database_models import Incident
from ..schemas.incident_schemas import IncidentCreate, IncidentUpdate, IncidentResponse

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("/", response_model=list[IncidentResponse])
async def get_incidents(
    skip: int = 0,
    limit: int = 100,
    threat_level: str = Query(None),
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    db: Session = Depends(db_manager.get_db_dependency)
):
    """Get all incidents with optional filtering."""
    query = db.query(Incident)
    
    # Apply filters
    if threat_level:
        query = query.filter(Incident.threat_level == threat_level)
        
    if start_date:
        query = query.filter(Incident.timestamp >= start_date)
        
    if end_date:
        query = query.filter(Incident.timestamp <= end_date)
    
    incidents = query.offset(skip).limit(limit).all()
    return incidents

@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Get a specific incident by ID."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
        
    return incident

@router.post("/", response_model=IncidentResponse)
async def create_incident(incident: IncidentCreate, db: Session = Depends(db_manager.get_db_dependency)):
    """Create a new incident."""
    # Create and save new incident
    db_incident = Incident(**incident.model_dump())
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    
    return db_incident

@router.put("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: int, 
    incident_update: IncidentUpdate, 
    db: Session = Depends(db_manager.get_db_dependency)
):
    """Update an incident."""
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not db_incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    # Update fields
    update_data = incident_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_incident, key, value)
        
    db.commit()
    db.refresh(db_incident)
    
    return db_incident

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_incident(incident_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Delete an incident."""
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    
    if not db_incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )
    
    # Delete the incident
    db.delete(db_incident)
    db.commit()

@router.get("/stats")
async def get_incident_stats(db: Session = Depends(db_manager.get_db_dependency)):
    """Get statistics about incidents."""
    total_count = db.query(Incident).count()
    
    threat_levels = db.query(
        Incident.threat_level, 
        func.count(Incident.id)
    ).group_by(Incident.threat_level).all()
    
    return {
        "total_incidents": total_count,
        "threat_level_breakdown": dict(threat_levels),
        "last_updated": datetime.utcnow().isoformat()
    }
