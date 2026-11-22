from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from core.config import settings
from crud import audit_log as audit_crud
from crud import identifier as identifier_crud
from models.identifier import Identifier
from models.report import Report, ReportStatus
from models.user import ROLE_ADMIN, User
from schemas.report import ReportCreate

# Reputation moves only when an admin changes a report's status. Auto-approved reports
# earn nothing, otherwise a trusted user could farm reputation without anyone checking.
_REPUTATION_DELTA = {
    (ReportStatus.pending, ReportStatus.approved): 1.0,
    (ReportStatus.pending, ReportStatus.rejected): -2.0,
    (ReportStatus.approved, ReportStatus.rejected): -2.0,
    (ReportStatus.rejected, ReportStatus.approved): 2.0,
}


def get_report(db: Session, report_id: int) -> Optional[Report]:
    return db.query(Report).filter(Report.id == report_id).first()


def get_user_report(db: Session, user_id: int, identifier_id: int) -> Optional[Report]:
    return (
        db.query(Report)
        .filter(Report.user_id == user_id, Report.identifier_id == identifier_id)
        .first()
    )


def create_report(db: Session, user: User, identifier: Identifier, report_in: ReportCreate) -> Report:
    trusted = user.role == ROLE_ADMIN or user.reputation_score >= settings.AUTO_APPROVE_MIN_REPUTATION
    report = Report(
        identifier_id=identifier.id,
        user_id=user.id,
        scam_type=report_in.scam_type,
        description=report_in.description.strip(),
        status=ReportStatus.approved if trusted else ReportStatus.pending,
    )
    db.add(report)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()  # duplicate (user, identifier). The router turns this into a 409.
        raise
    db.refresh(report)

    if report.status == ReportStatus.approved:
        identifier_crud.recalculate(db, identifier)
    return report


def list_reports(
    db: Session, status: Optional[ReportStatus] = None, skip: int = 0, limit: int = 50
) -> List[Report]:
    query = db.query(Report).options(joinedload(Report.identifier), joinedload(Report.user))
    if status is not None:
        query = query.filter(Report.status == status)
    return query.order_by(Report.created_at.asc(), Report.id.asc()).offset(skip).limit(limit).all()


def review_report(db: Session, report: Report, new_status: ReportStatus, admin: User) -> Report:
    old_status = report.status
    report.status = new_status
    report.reviewed_at = datetime.now(timezone.utc)

    delta = _REPUTATION_DELTA.get((old_status, new_status), 0.0)
    if delta:
        report.user.reputation_score += delta

    audit_crud.add_log(
        db,
        actor_id=admin.id,
        action=f"report.{new_status.value}",
        target_type="report",
        target_id=report.id,
        detail=f"was {old_status.value}; identifier_id={report.identifier_id}",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    identifier_crud.recalculate(db, report.identifier)
    return report
