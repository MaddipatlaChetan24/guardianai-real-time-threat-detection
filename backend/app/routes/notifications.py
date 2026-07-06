# File: backend/app/routes/notifications.py
"""
Notification management routes for GuardianAI Backend.
Handles notification settings and delivery.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.connection import db_manager
from ..models.database_models import NotificationSettings
from ..schemas.notification_schemas import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=list[NotificationResponse])
async def get_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(db_manager.get_db_dependency)):
    """Get all notification settings with pagination."""
    notifications = db.query(NotificationSettings).offset(skip).limit(limit).all()
    return notifications

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(notification_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Get a specific notification setting by ID."""
    notification = db.query(NotificationSettings).filter(NotificationSettings.id == notification_id).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification settings not found"
        )
        
    return notification

@router.post("/", response_model=NotificationResponse)
async def create_notification(notification: NotificationCreate, db: Session = Depends(db_manager.get_db_dependency)):
    """Create a new notification setting."""
    # Check if already exists for this user
    existing = db.query(NotificationSettings).filter(
        NotificationSettings.user_id == notification.user_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Notification settings already exist for this user"
        )
    
    # Create and save new notification setting
    db_notification = NotificationSettings(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    return db_notification

@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: int, 
    notification_update: NotificationUpdate, 
    db: Session = Depends(db_manager.get_db_dependency)
):
    """Update notification settings."""
    db_notification = db.query(NotificationSettings).filter(NotificationSettings.id == notification_id).first()
    
    if not db_notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification settings not found"
        )
    
    # Update fields
    update_data = notification_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_notification, key, value)
        
    db.commit()
    db.refresh(db_notification)
    
    return db_notification

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(notification_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Delete notification settings."""
    db_notification = db.query(NotificationSettings).filter(NotificationSettings.id == notification_id).first()
    
    if not db_notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification settings not found"
        )
    
    # Delete the settings
    db.delete(db_notification)
    db.commit()

@router.post("/send-test")
async def send_test_notification(notification_id: int, db: Session = Depends(db_manager.get_db_dependency)):
    """Send a test notification."""
    # In a real implementation, this would actually send a notification
    return {"message": "Test notification sent successfully"}
