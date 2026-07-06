# File: backend/app/schemas/user_schemas.py
"""
Pydantic models for user schema in GuardianAI Backend.
"""

from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class UserUpdate(UserBase):
    is_active: Optional[bool] = None
    role: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    role: str
    
    class Config:
        from_attributes = True

__all__ = ["UserBase", "UserCreate", "UserUpdate", "UserResponse"]
