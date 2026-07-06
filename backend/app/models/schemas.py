from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Enums ---
class ThreatLevel(str):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IncidentStatus(str):
    PENDING = "pending"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    IGNORED = "ignored"

# --- Models ---
class CameraBase(BaseModel):
    name: str
    location: Optional[str] = None
    stream_url: Optional[str] = None
    is_active: bool = True

class CameraResponse(CameraBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class IncidentBase(BaseModel):
    camera_id: int
    threat_level: str
    status: str
    summary: Optional[str] = None
    detected_objects: Optional[Dict[str, Any]] = None
    severity_score: Optional[float] = None
    confidence_score: Optional[float] = None

class IncidentResponse(IncidentBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    activeCameras: int
    totalCameras: int
    activeAlerts: int
    totalIncidentsToday: int
    threatScore: float
    systemStatus: str
