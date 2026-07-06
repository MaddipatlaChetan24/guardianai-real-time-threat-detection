# File: backend/app/schemas/auth_schemas.py
"""
Pydantic models for authentication schema in GuardianAI Backend.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserLogin(UserBase):
    pass

class UserRegister(UserBase):
    password: str
    role: str = "viewer"  # Default role for new users
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

__all__ = ["Token", "TokenData", "UserBase", "UserLogin", "UserRegister", "LoginRequest"]
