from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, func
from sqlalchemy.orm import relationship
from fastapi import HTTPException

from schemas.user import HandleUpdate, UserCreate, UserUpdate
from core.database import Base

ROLE_USER = "user"
ROLE_ADMIN = "admin"


class User(Base):
    """An anonymous account: a generated handle and a password. No email, phone or name."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    handle = Column(String(40), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String(20), default=ROLE_USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)  # False = banned

    # Earned through admin-approved reports. Drives how much the user's reports weigh.
    reputation_score = Column(Float, default=0.0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    reports = relationship("Report", back_populates="user")

    def __repr__(self) -> str:
        return f"<User id={self.id} handle={self.handle!r}>"
