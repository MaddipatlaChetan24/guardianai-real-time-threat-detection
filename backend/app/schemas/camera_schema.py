# File: backend/app/schemas/camera_schemas.py
"""
Pydantic models for camera schema in GuardianAI Backend.
"""

from pydantic import BaseModel, Field
from typing import Optional

class CameraBase(BaseModel):
    name: str = Field(..., max_length=100)
    location: Optional[str] = None
    stream_url: Optional[str] = None
    is_active: bool = True

class CameraCreate(CameraBase):
    pass

class CameraUpdate(CameraBase):
    name: Optional[str] = None
    location: Optional[str] = None
    stream_url: Optional[str] = None
    is_active: Optional[bool] = None

class CameraResponse(CameraBase):
    id: int
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

__all__ = ["CameraBase", "CameraCreate", "CameraUpdate", "CameraResponse"]
