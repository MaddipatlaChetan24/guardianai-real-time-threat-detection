# File: backend/app/schemas/incident_schemas.py
"""
Pydantic models for incident schema in GuardianAI Backend.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class IncidentBase(BaseModel):
    threat_level: str = Field(..., max_length=20)
    timestamp: datetime
    description: str
    location: Optional[str] = None
    camera_id: int
    detected_objects: Optional[list[str]] = []
    
    class Config:
        from_attributes = True

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(IncidentBase):
    threat_level: Optional[str] = None
    timestamp: Optional[datetime] = None
    description: Optional[str] = None
    location: Optional[str] = None
    camera_id: Optional[int] = None
    detected_objects: Optional[list[str]] = []

class IncidentResponse(IncidentBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

__all__ = ["IncidentBase", "IncidentCreate", "IncidentUpdate", "IncidentResponse"]
