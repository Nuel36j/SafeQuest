from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Optional

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, contains_eager

from core.scoring import ReportEvidence, compute_risk
from models.identifier import Identifier, IdentifierType, RiskLevel
from models.report import Report, ReportStatus
from models.user import User


@dataclass(frozen=True)
class Evaluation:
    score: float
    level: RiskLevel
    report_count: int
    last_reported_at: Optional[datetime]


def get_identifier(db: Session, id_type: IdentifierType, value_normalized: str) -> Optional[Identifier]:
    return (
        db.query(Identifier)
        .filter(Identifier.type == id_type, Identifier.value_normalized == value_normalized)
        .first()
    )


def get_or_create_identifier(db: Session, id_type: IdentifierType, value_normalized: str) -> Identifier:
    identifier = get_identifier(db, id_type, value_normalized)
    if identifier:
        return identifier

    identifier = Identifier(type=id_type, value_normalized=value_normalized)
    db.add(identifier)
    try:
        db.commit()
    except IntegrityError:
        # Another request created it first. Use theirs.
        db.rollback()
        return get_identifier(db, id_type, value_normalized)
    db.refresh(identifier)
    return identifier


def _counted_reports(db: Session, identifier_id: int):
    """Approved reports from accounts that are not banned. Banned users stop counting."""
    return (
        db.query(Report)
        .join(Report.user)
        .options(contains_eager(Report.user))
        .filter(
            Report.identifier_id == identifier_id,
            Report.status == ReportStatus.approved,
            User.is_active.is_(True),
        )
    )


def evaluate(db: Session, identifier: Identifier) -> Evaluation:
    """Compute the current score from scratch. Read-only: nothing is saved."""
    reports = _counted_reports(db, identifier.id).all()
    evidence = [ReportEvidence(r.user_id, r.user.reputation_score, r.created_at) for r in reports]
    score, level = compute_risk(identifier.type.value, evidence)
    last = max((r.created_at for r in reports), default=None)
    return Evaluation(score=score, level=RiskLevel(level), report_count=len(reports), last_reported_at=last)


def recalculate(db: Session, identifier: Identifier) -> Identifier:
    """Recompute and save the cached score. Call whenever a report's status or a reporter changes."""
    result = evaluate(db, identifier)
    identifier.risk_score = result.score
    identifier.risk_level = result.level
    identifier.report_count = result.report_count
    identifier.last_reported_at = result.last_reported_at
    db.add(identifier)
    db.commit()
    db.refresh(identifier)
    return identifier


def recalculate_for_user(db: Session, user_id: int) -> None:
    """After banning or unbanning a user, refresh every identifier they reported."""
    rows = db.query(Report.identifier_id).filter(Report.user_id == user_id).distinct().all()
    for (identifier_id,) in rows:
        identifier = db.query(Identifier).filter(Identifier.id == identifier_id).first()
        if identifier:
            recalculate(db, identifier)


def scam_type_breakdown(db: Session, identifier_id: int) -> Dict[str, int]:
    rows = (
        db.query(Report.scam_type, func.count(Report.id))
        .join(User, Report.user_id == User.id)
        .filter(
            Report.identifier_id == identifier_id,
            Report.status == ReportStatus.approved,
            User.is_active.is_(True),
        )
        .group_by(Report.scam_type)
        .all()
    )
    return {scam_type.value: count for scam_type, count in rows}
