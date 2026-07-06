# File: backend/app/schemas/report_schemas.py
"""
Pydantic models for report schema in GuardianAI Backend.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReportBase(BaseModel):
    incident_id: int
    generated_by: str = Field(..., max_length=100)
    report_content: str
    pdf_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class ReportCreate(ReportBase):
    pass

class ReportUpdate(ReportBase):
    incident_id: Optional[int] = None
    generated_by: Optional[str] = None
    report_content: Optional[str] = None
    pdf_url: Optional[str] = None

class ReportResponse(ReportBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ReportGenerateRequest(BaseModel):
    incident_id: int
    generated_by: str = Field(..., max_length=100)
    
    class Config:
        from_attributes = True

__all__ = [
    "ReportBase", 
    "ReportCreate", 
    "ReportUpdate", 
    "ReportResponse",
    "ReportGenerateRequest"
]
