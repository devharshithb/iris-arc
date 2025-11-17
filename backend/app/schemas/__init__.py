from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --------------------------------------------------------------------------
# Core User Schemas
# --------------------------------------------------------------------------
class UserPublic(BaseModel):
    """Public-facing user info (no password hash)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    name: str
    created_at: datetime


# --------------------------------------------------------------------------
# Auth Schemas
# --------------------------------------------------------------------------
class AuthSignupIn(BaseModel):
    """Used for both credential signup and Google sync."""
    email: EmailStr
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class AuthLoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthTokensOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserPublic


class RefreshIn(BaseModel):
    refresh_token: str


# --------------------------------------------------------------------------
# Chat Schemas
# --------------------------------------------------------------------------
class ChatCreateIn(BaseModel):
    title: Optional[str] = None


class ChatUpdateIn(BaseModel):
    title: str


class ChatOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime
    updated_at: datetime


class PaginatedChats(BaseModel):
    items: List[ChatOut]
    total: int


# --------------------------------------------------------------------------
# Message Schemas
# --------------------------------------------------------------------------
class MessageCreateIn(BaseModel):
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    content: str
    created_at: datetime


class PaginatedMessages(BaseModel):
    items: List[MessageOut]
    total: int
