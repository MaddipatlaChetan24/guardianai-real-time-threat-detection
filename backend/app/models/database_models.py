# File: backend/app/models/database_models.py
"""
Database models for GuardianAI Backend.
This file mirrors the database schema defined in the previous implementation.
"""

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, 
    Enum, ForeignKey, JSON, Float
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

# Create base class for all models
Base = declarative_base()

class UserRole(str, enum.Enum):
    """User roles for role-based access control."""
    ADMIN = "admin"
    OPERATOR = "operator" 
    VIEWER = "viewer"

class IncidentStatus(str, enum.Enum):
    """Incident statuses."""
    PENDING = "pending"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    IGNORED = "ignored"

class ThreatLevel(str, enum.Enum):
    """Threat levels for incidents."""
    LOW = "low"
    MEDIUM = "medium" 
    HIGH = "high"
    CRITICAL = "critical"

class NotificationType(str, enum.Enum):
    """Types of notifications that can be sent."""
    EMAIL = "email"
    SMS = "sms"
    TELEGRAM = "telegram"
    WEBHOOK = "webhook"
    DASHBOARD = "dashboard"

# User Model
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Camera Model
class Camera(Base):
    __tablename__ = 'cameras'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(Text)
    ip_address = Column(String(50))
    port = Column(Integer)
    username = Column(String(50))
    password = Column(String(255))  # Should be encrypted in production
    stream_url = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Incident Model  
class Incident(Base):
    __tablename__ = 'incidents'
    
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey('cameras.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    timestamp = Column(DateTime, default=datetime.utcnow)
    threat_level = Column(Enum(ThreatLevel))
    status = Column(Enum(IncidentStatus), default=IncidentStatus.PENDING)
    summary = Column(Text)
    detected_objects = Column(JSON)  # Stores JSON of detected objects
    severity_score = Column(Float)
    confidence_score = Column(Float)
    screenshot_path = Column(String(255))
    video_clip_path = Column(String(255))
    resolution = Column(String(20))
    duration_seconds = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    camera = relationship("Camera")
    user = relationship("User")
    alerts = relationship("Alert", back_populates="incident", cascade="all, delete-orphan")
    reports = relationship("IncidentReport", back_populates="incident", cascade="all, delete-orphan")

# Alert Model
class Alert(Base):
    __tablename__ = 'alerts'
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))
    camera_id = Column(Integer, ForeignKey('cameras.id'))
    alert_type = Column(Enum(NotificationType), nullable=False)
    message = Column(Text, nullable=False)
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime)
    priority = Column(String(20))  # "low", "medium", "high"
    
    # Relationships
    incident = relationship("Incident", back_populates="alerts")
    user = relationship("User")
    camera = relationship("Camera")

# Incident Report Model
class IncidentReport(Base):
    __tablename__ = 'incident_reports'
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'), nullable=False)
    generator_agent = Column(String(50), nullable=False)  # Which agent created report
    generated_at = Column(DateTime, default=datetime.utcnow)
    report_type = Column(String(50))  # PDF, JSON, etc.
    file_path = Column(String(255))
    content_summary = Column(Text)  # Summary of report contents
    
    # Relationships
    incident = relationship("Incident", back_populates="reports")

# System Log Model
class SystemLog(Base):
    __tablename__ = 'system_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    level = Column(String(20))  # DEBUG, INFO, WARNING, ERROR
    source = Column(String(50))  # Which component generated log  
    message = Column(Text, nullable=False)
    details = Column(JSON)  # Additional structured data

# Config Setting Model
class ConfigSetting(Base):
    __tablename__ = 'config_settings'
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text)
    description = Column(Text)
    is_sensitive = Column(Boolean, default=False)  # For secrets that shouldn't be logged

# Helper functions for database operations
def create_tables(engine):
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)

def drop_tables(engine):
    """Drop all database tables (use with caution!)"""
    Base.metadata.drop_all(bind=engine)

def create_indexes(engine):
    """Create additional indexes for performance optimization."""
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
