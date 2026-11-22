from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    # No email, phone or name. The user chooses their handle.
    handle: str = Field(min_length=3, max_length=30, pattern=r"^[A-Za-z0-9-]+$")
    password: str = Field(min_length=8, max_length=128)


class HandleUpdate(BaseModel):
    handle: str = Field(min_length=3, max_length=30, pattern=r"^[A-Za-z0-9-]+$")

class UserUpdate(BaseModel):
    password: str = Field(min_length=8, max_length=128)


class UserAdminUpdate(BaseModel):
    is_active: bool


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    handle: str
    role: str
    reputation_score: float
    is_active: bool


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    handle: Optional[str] = None
