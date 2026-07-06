# File: backend/app/routes/cameras.py
"""
Camera management routes for GuardianAI Backend.
Handles CRUD operations on camera devices.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.connection import db_manager
from ..models.database_models import Camera
from ..schemas.camera_schemas import CameraCreate, CameraUpdate, CameraResponse

router = APIRouter(prefix="/cameras", tags=["Cameras"])

@router.get("/", response_model=list[CameraResponse])
async def get_cameras(skip: int = 0, limit: int = 100, db: Session = Depends(db_manager.get_db_dependency)):
    """Get all cameras with pagination."""
    cameras = db.query(Camera).offset(skip).limit(limit).all()
    return cameras

@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(camera_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Get a specific camera by ID."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
    return camera

@router.post("/", response_model=CameraResponse)
async def create_camera(camera: CameraCreate, db: Session = Depends(db_manager.get_db_dependency)):
    """Create a new camera."""
    # Check if camera with same name or stream URL already exists
    existing = db.query(Camera).filter(
        (Camera.name == camera.name) | 
        (Camera.stream_url == camera.stream_url)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Camera with this name or stream URL already exists"
        )
    
    # Create and save new camera
    db_camera = Camera(**camera.model_dump())
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)
    
    return db_camera

@router.put("/{camera_id}", response_model=CameraResponse)
async def update_camera(
    camera_id: int, 
    camera_update: CameraUpdate, 
    db: Session = Depends(db_manager.get_db_dependency)
):
    """Update a camera."""
    db_camera = db.query(Camera).filter(Camera.id == camera_id).first()
    
    if not db_camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
    
    # Update fields
    update_data = camera_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_camera, key, value)
        
    db.commit()
    db.refresh(db_camera)
    
    return db_camera

@router.delete("/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_camera(camera_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Delete a camera."""
    db_camera = db.query(Camera).filter(Camera.id == camera_id).first()
    
    if not db_camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
    
    # Delete the camera
    db.delete(db_camera)
    db.commit()

@router.get("/{camera_id}/status")
async def get_camera_status(camera_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Get status of a specific camera."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
        
    # In a real implementation, this would check the actual camera connection
    return {
        "camera_id": camera.id,
        "name": camera.name,
        "is_connected": True if camera.stream_url else False,
        "status": "active" if camera.is_active else "inactive"
    }
