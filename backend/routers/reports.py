from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.database import get_db
from core.normalizer import normalize_identifier
from core.permissions import require_user
from core.rate_limit import rate_limit
from crud import identifier as identifier_crud
from crud import report as report_crud
from models.user import User
from schemas.report import ReportCreate, ReportResponse

router = APIRouter(prefix="/reports", tags=["reports"])


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
