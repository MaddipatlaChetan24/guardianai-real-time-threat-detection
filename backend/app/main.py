# backend/app/main.py
"""
GuardianAI Backend — FastAPI Application Entry Point.

This module configures the FastAPI application, registers routers,
sets up CORS, and provides the core API endpoints including
WebSocket support for real-time dashboard updates.
"""

from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn
import logging
from datetime import datetime
from typing import List, Dict
import asyncio
import json

from .database.connection import db_manager
from .models.database_models import User, Camera, Incident, Alert, IncidentReport, create_tables, ThreatLevel, IncidentStatus

from pydantic import BaseModel
class IncidentPayload(BaseModel):
    camera_id: int
    threat_level: str
    summary: str
    detected_objects: List[str]

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="GuardianAI",
    description="Multi-Agent Intelligent Surveillance and Event Detection System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Dependency ────────────────────────────────────────────────────────────────

def get_db():
    """FastAPI dependency that provides a SQLAlchemy session."""
    session = db_manager.get_db_session()
    try:
        yield session
    finally:
        session.close()


# ── WebSocket Connection Manager ─────────────────────────────────────────────

class ConnectionManager:
    """Manages active WebSocket connections for live dashboard updates."""

    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict) -> None:
        """Broadcast a JSON message to all connected clients."""
        payload = json.dumps(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                self.active_connections.remove(connection)


manager = ConnectionManager()


# ── Lifecycle Events ──────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """Initialize the database and create tables on startup."""
    try:
        db_manager.verify_connection()
        create_tables(db_manager.engine)
        
        # Seed an initial camera if none exist
        with db_manager.SessionLocal() as db:
            if db.query(Camera).count() == 0:
                cam = Camera(name="Main Web Camera", location="Local User Desk", is_active=True)
                db.add(cam)
                db.commit()
                
        logger.info("✅ Database connection verified and seeded")
    except Exception as e:
        logger.warning(f"⚠️  Database connection could not be verified (dev mode): {e}")
    logger.info("🚀 GuardianAI backend started successfully")


# ── Root & Health ─────────────────────────────────────────────────────────────

@app.get("/", tags=["System"])
async def root():
    return {
        "message": "Welcome to GuardianAI Multi-Agent Surveillance System",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/dashboard/threat-levels", tags=["Dashboard"])
async def get_threat_levels():
    """Get threat level distribution."""
    return {"critical": 2, "high": 5, "medium": 8, "low": 15, "total": 30}


@app.get("/dashboard/recent-incidents", tags=["Dashboard"])
async def get_recent_incidents(db: Session = Depends(get_db)):
    """Get recent incidents for dashboard."""
    incidents = db.query(Incident).order_by(Incident.timestamp.desc()).limit(5).all()
    
    res = []
    for inc in incidents:
        cam = db.query(Camera).filter(Camera.id == inc.camera_id).first()
        res.append({
            "id": inc.id,
            "title": "Threat Detected",
            "threatLevel": inc.threat_level.value if hasattr(inc.threat_level, 'value') else inc.threat_level,
            "timestamp": inc.timestamp.isoformat() + "Z",
            "location": cam.name if cam else "Unknown",
            "summary": inc.summary,
        })
    return res


@app.get("/dashboard/stats", tags=["Dashboard"])
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    total_cams = db.query(Camera).count()
    active_cams = db.query(Camera).filter(Camera.is_active == True).count()
    active_alerts = db.query(Incident).filter(Incident.status == IncidentStatus.PENDING).count()
    
    # Calculate incidents today (simplified)
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    incidents_today = db.query(Incident).filter(Incident.timestamp >= today).count()
    
    return {
        "activeCameras": active_cams,
        "totalCameras": total_cams,
        "activeAlerts": active_alerts,
        "totalIncidentsToday": incidents_today,
        "totalIncidentsWeek": incidents_today, # simplified
        "threatScore": min(100, active_alerts * 10),
        "systemStatus": "operational",
    }


# ── Cameras ───────────────────────────────────────────────────────────────────

@app.get("/cameras", tags=["Cameras"])
async def get_cameras(db: Session = Depends(get_db)):
    """Get all cameras and their status."""
    cameras = db.query(Camera).all()
    res = []
    for c in cameras:
        res.append({
            "id": c.id,
            "name": c.name,
            "location": c.location,
            "status": "online" if c.is_active else "offline",
            "threatLevel": "normal",
            "fps": 30 if c.is_active else 0,
            "resolution": "1080p"
        })
    return res


@app.get("/cameras/{camera_id}", tags=["Cameras"])
async def get_camera(camera_id: int, db: Session = Depends(get_db)):
    """Get a specific camera by ID."""
    c = db.query(Camera).filter(Camera.id == camera_id).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Camera {camera_id} not found")
    return {
        "id": c.id,
        "name": c.name,
        "location": c.location,
        "status": "online" if c.is_active else "offline",
        "threatLevel": "normal",
        "fps": 30 if c.is_active else 0,
        "resolution": "1080p"
    }


# ── Incidents ─────────────────────────────────────────────────────────────────

@app.get("/incidents", tags=["Incidents"])
async def get_incidents(db: Session = Depends(get_db)):
    """Get all incidents."""
    incidents = db.query(Incident).order_by(Incident.timestamp.desc()).all()
    res = []
    for i in incidents:
        cam = db.query(Camera).filter(Camera.id == i.camera_id).first()
        res.append({
            "id": i.id,
            "title": "Security Alert",
            "threatLevel": i.threat_level.value if hasattr(i.threat_level, 'value') else i.threat_level,
            "timestamp": i.timestamp.isoformat() + "Z",
            "location": cam.name if cam else "Unknown",
            "summary": i.summary,
            "objectsDetected": i.detected_objects or [],
            "suggestedAction": "Review footage and take appropriate action",
            "status": i.status.value if hasattr(i.status, 'value') else i.status,
            "cameraId": i.camera_id,
        })
    return res

@app.post("/incidents", tags=["Incidents"])
async def create_incident(payload: IncidentPayload, db: Session = Depends(get_db)):
    """Create a new incident from the frontend AI."""
    new_inc = Incident(
        camera_id=payload.camera_id,
        threat_level=payload.threat_level,
        status=IncidentStatus.PENDING,
        summary=payload.summary,
        detected_objects=payload.detected_objects,
        severity_score=0.8,
        confidence_score=0.9,
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)
    
    # Broadcast to dashboard
    await manager.broadcast({
        "type": "NEW_INCIDENT",
        "incident": {
            "id": new_inc.id,
            "title": "Live Threat Detected",
            "threatLevel": new_inc.threat_level.value if hasattr(new_inc.threat_level, 'value') else new_inc.threat_level,
            "summary": new_inc.summary,
        }
    })
    
    return {"status": "success", "incident_id": new_inc.id}


@app.get("/incidents/{incident_id}", tags=["Incidents"])
async def get_incident(incident_id: int, db: Session = Depends(get_db)):
    """Get a specific incident by ID."""
    i = db.query(Incident).filter(Incident.id == incident_id).first()
    if not i:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    cam = db.query(Camera).filter(Camera.id == i.camera_id).first()
    return {
        "id": i.id,
        "title": "Security Alert",
        "threatLevel": i.threat_level.value if hasattr(i.threat_level, 'value') else i.threat_level,
        "timestamp": i.timestamp.isoformat() + "Z",
        "location": cam.name if cam else "Unknown",
        "summary": i.summary,
        "objectsDetected": i.detected_objects or [],
        "suggestedAction": "Review footage and take appropriate action",
        "status": i.status.value if hasattr(i.status, 'value') else i.status,
        "cameraId": i.camera_id,
    }


# ── Notifications ─────────────────────────────────────────────────────────────

@app.get("/notifications", tags=["Notifications"])
async def get_notifications():
    """Get all notifications (empty for now without DB)."""
    return []


# ── Reports ───────────────────────────────────────────────────────────────────

@app.get("/reports", tags=["Reports"])
async def get_reports():
    """Get generated reports (empty for now)."""
    return []


# ── MCP Status ────────────────────────────────────────────────────────────────

@app.get("/mcp/status", tags=["MCP"])
async def get_mcp_status():
    """Get MCP agent status."""
    return {
        "agents": [
            {"name": "VideoAnalysisAgent", "status": "active", "processedFrames": 14520},
            {"name": "ThreatDetectionAgent", "status": "active", "detections": 23},
            {"name": "DecisionAgent", "status": "active", "decisions": 8},
            {"name": "NotificationAgent", "status": "active", "sent": 12},
            {"name": "IncidentReportAgent", "status": "active", "reports": 5},
        ],
        "tools": ["filesystem", "camera", "notification", "report_generator"],
        "timestamp": datetime.utcnow().isoformat(),
    }


# ── WebSocket ─────────────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time dashboard updates."""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back or process commands from the frontend
            await websocket.send_text(json.dumps({"ack": True, "received": data}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
