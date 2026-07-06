# File: backend/app/schemas/notification_schemas.py
"""
Pydantic models for notification schema in GuardianAI Backend.
"""

from pydantic import BaseModel, Field
from typing import Optional

class NotificationBase(BaseModel):
    user_id: int
    email_enabled: bool = True
    sms_enabled: bool = False
    telegram_enabled: bool = False
    webhook_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(NotificationBase):
    user_id: Optional[int] = None
    email_enabled: Optional[bool] = None
    sms_enabled: Optional[bool] = None
    telegram_enabled: Optional[bool] = None
    webhook_url: Optional[str] = None

class NotificationResponse(NotificationBase):
    id: int
    
    class Config:
        from_attributes = True

__all__ = ["NotificationBase", "NotificationCreate", "NotificationUpdate", "NotificationResponse"]
