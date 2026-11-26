from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from core.normalizer import normalize_identifier
from core.permissions import require_user
from core.rate_limit import rate_limit
from crud import identifier as identifier_crud
from crud import report as report_crud
from models.user import User
from schemas.report import ReportCreate, ReportResponse, ReportListItem, ReportReview, AdminReportResponse
from models.report import ReportStatus
from models.identifier import IdentifierType

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get(
    "",
    response_model=List[ReportListItem],
    dependencies=[Depends(rate_limit(60, 60, "feed"))],
)
def read_reports(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    identifier_type: Optional[IdentifierType] = Query(None),
    newest_first: bool = True,
):
    """Public list of approved reports for the Home feed."""
    reports = report_crud.list_reports(db, status=ReportStatus.approved, skip=skip, limit=limit, newest_first=newest_first, identifier_type=identifier_type,)
    return [
        ReportListItem(
            id=r.id,
            identifier_type=r.identifier.type,
            identifier_value=r.identifier.value_normalized,
            scam_type=r.scam_type,
            reporter=r.user.handle,
            created_at=r.created_at,
            risk_level=r.identifier.risk_level
        )
        for r in reports
    ]

@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(20, 3600, "report"))],
)
def create_report(
    report_in: ReportCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """Report a phone number, bank account or URL. Counts toward the score once approved
    (immediately for trusted users, after admin review for everyone else)."""
    try:
        normalized = normalize_identifier(
            report_in.identifier_type, report_in.identifier_value, report_in.bank
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    identifier = identifier_crud.get_or_create_identifier(db, report_in.identifier_type, normalized)

    if report_crud.get_user_report(db, current_user.id, identifier.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already reported this")

    try:
        return report_crud.create_report(db, current_user, identifier, report_in)
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You already reported this")
