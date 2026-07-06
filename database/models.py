# File: GuardianAI/database/models.py
"""
Database models for GuardianAI system.
This file contains all SQLAlchemy models for the application.
"""

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, Enum, 
    ForeignKey, LargeBinary, Float, ARRAY, JSON
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from typing import List

Base = declarative_base()

class UserRole(str, enum.Enum):
    """User role enumeration"""
    ADMIN = "admin"
    OPERATOR = "operator"
    VIEWER = "viewer"

class IncidentStatus(str, enum.Enum):
    """Incident status enumeration"""
    PENDING = "pending"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    IGNORED = "ignored"

class ThreatLevel(str, enum.Enum):
    """Threat level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class NotificationType(str, enum.Enum):
    """Notification type enumeration"""
    EMAIL = "email"
    SMS = "sms"
    TELEGRAM = "telegram"
    WEBHOOK = "webhook"
    DASHBOARD = "dashboard"

class User(Base):
    """User model for authentication and access control"""
    
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    incidents = relationship("Incident", back_populates="user")
    alerts = relationship("Alert", back_populates="user")

class Camera(Base):
    """Camera model for surveillance system"""
    
    __tablename__ = 'cameras'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    location = Column(String(255))
    ip_address = Column(String(50))
    port = Column(Integer)
    username = Column(String(50))
    password = Column(String(255))  # In production: encrypted
    stream_url = Column(Text)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    incidents = relationship("Incident", back_populates="camera")
    alerts = relationship("Alert", back_populates="camera")

class Incident(Base):
    """Incident model to store detected events"""
    
    __tablename__ = 'incidents'
    
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey('cameras.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    threat_level = Column(Enum(ThreatLevel), nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.PENDING, nullable=False)
    summary = Column(Text)
    detected_objects = Column(JSON)  # Store as JSON for flexibility
    severity_score = Column(Float)
    confidence_score = Column(Float)
    screenshot_path = Column(String(255))
    video_clip_path = Column(String(255))
    resolution = Column(String(20))  # e.g., "1920x1080"
    duration_seconds = Column(Integer)  # Video clip duration
    
    # Relationships
    camera = relationship("Camera", back_populates="incidents")
    user = relationship("User", back_populates="incidents")
    alerts = relationship("Alert", back_populates="incident")
    reports = relationship("IncidentReport", back_populates="incident")

class Alert(Base):
    """Alert model for notifications"""
    
    __tablename__ = 'alerts'
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    camera_id = Column(Integer, ForeignKey('cameras.id'))
    alert_type = Column(Enum(NotificationType), nullable=False)
    message = Column(Text, nullable=False)
    is_sent = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime)
    priority = Column(String(20))  # "low", "medium", "high"
    
    # Relationships
    incident = relationship("Incident", back_populates="alerts")
    user = relationship("User", back_populates="alerts")
    camera = relationship("Camera", back_populates="alerts")

class IncidentReport(Base):
    """Incident report model for generated reports"""
    
    __tablename__ = 'incident_reports'
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'), nullable=False, index=True)
    generator_agent = Column(String(50), nullable=False)  # Which agent created report
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    report_type = Column(String(50))  # PDF, JSON, etc.
    file_path = Column(String(255))
    content_summary = Column(Text)  # Summary of report contents
    
    # Relationships
    incident = relationship("Incident", back_populates="reports")

class SystemLog(Base):
    """System log model for audit trails"""
    
    __tablename__ = 'system_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    level = Column(String(20), nullable=False)  # DEBUG, INFO, WARNING, ERROR
    source = Column(String(50))  # Which component generated log
    message = Column(Text, nullable=False)
    details = Column(JSON)  # Additional structured data

class ConfigSetting(Base):
    """Configuration settings for the system"""
    
    __tablename__ = 'config_settings'
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text)
    description = Column(Text)
    is_sensitive = Column(Boolean, default=False)  # For secrets that shouldn't be logged

# Helper functions for common operations
def create_tables(engine):
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

def drop_tables(engine):
    """Drop all database tables (use with caution!)"""
    Base.metadata.drop_all(bind=engine)

# Indexes for performance optimization
def create_indexes(engine):
    """Create additional indexes for better query performance"""
    from sqlalchemy import text
    
    # Create indexes on frequently queried fields
    with engine.connect() as conn:
        # Incident timestamp index (already created via Column)
        # Camera location index (already created via Column)
        
        # Additional composite indices
        conn.execute(text(
            "CREATE INDEX IF NOT EXISTS idx_incidents_camera_time ON incidents(camera_id, timestamp DESC)"
        ))
        conn.execute(text(
            "CREATE INDEX IF NOT EXISTS idx_incidents_status_time ON incidents(status, timestamp DESC)"
        ))
        conn.execute(text(
            "CREATE INDEX IF NOT EXISTS idx_alerts_sent_time ON alerts(is_sent, sent_at DESC)"
        ))

# Example usage of models:
"""
Example queries using SQLAlchemy ORM:

# Get all active cameras
active_cameras = session.query(Camera).filter_by(is_active=True).all()

# Find incidents with high threat level in last hour
one_hour_ago = datetime.utcnow() - timedelta(hours=1)
high_threat_incidents = session.query(Incident)\
    .filter(Incident.threat_level == ThreatLevel.HIGH)\
    .filter(Incident.timestamp >= one_hour_ago)\
    .all()

# Get latest incidents for a camera
latest_incidents = session.query(Incident)\
    .filter_by(camera_id=123)\
    .order_by(Incident.timestamp.desc())\
    .limit(10)\
    .all()
"""

__all__ = [
    'Base',
    'User', 
    'Camera',
    'Incident',
    'Alert',
    'IncidentReport',
    'SystemLog',
    'ConfigSetting',
    'UserRole',
    'IncidentStatus',
    'ThreatLevel',
    'NotificationType',
    'create_tables',
    'drop_tables',
    'create_indexes'
]
