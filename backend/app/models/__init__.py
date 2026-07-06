# File: backend/app/models/__init__.py
"""
Model initialization for GuardianAI Backend.
Imports all database models and provides access to them.
"""

from .database_models import (
    Base,
    User,
    Camera,
    Incident,
    Alert,
    IncidentReport,
    SystemLog,
    ConfigSetting,
    UserRole,
    IncidentStatus,
    ThreatLevel,
    NotificationType
)

# Import helper functions
from .database_models import create_tables, drop_tables, create_indexes

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
