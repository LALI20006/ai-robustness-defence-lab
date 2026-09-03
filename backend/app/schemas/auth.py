import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class PasswordReset(BaseModel):
    email_or_username: str
    new_password: str = Field(..., min_length=8)

class UserOut(BaseModel):
    id: int
    full_name: str
    username: str
    email: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut
