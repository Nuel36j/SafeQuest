from typing import List, Optional

from sqlalchemy.orm import Session

from models.audit_log import AuditLog


def add_log(
    db: Session,
    actor_id: int,
    action: str,
    target_type: str,
    target_id: int,
    detail: Optional[str] = None,
) -> AuditLog:
    """Stage a log entry. The caller commits, so the log lands in the same transaction as the action."""
    entry = AuditLog(
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        detail=detail,
    )
    db.add(entry)
    return entry


def list_logs(db: Session, skip: int = 0, limit: int = 100) -> List[AuditLog]:
    return db.query(AuditLog).order_by(AuditLog.id.desc()).offset(skip).limit(limit).all()
