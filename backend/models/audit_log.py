from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from core.database import Base


class AuditLog(Base):
    """Append-only record of sensitive admin actions."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(60), nullable=False)          # e.g. "report.approved", "user.banned"
    target_type = Column(String(30), nullable=False)     # "report" | "user"
    target_id = Column(Integer, nullable=False)
    detail = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
