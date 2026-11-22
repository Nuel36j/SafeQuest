from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.permissions import require_admin
from crud import audit_log as audit_crud
from crud import report as report_crud
from crud import user as user_crud
from models.report import Report, ReportStatus
from models.user import ROLE_ADMIN, User
from schemas.audit_log import AuditLogResponse
from schemas.report import AdminReportResponse, ReportReview
from schemas.user import UserAdminUpdate, UserResponse

# Every route here needs an admin. The router-level dependency makes that impossible to forget.
router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def _to_admin_response(report: Report) -> AdminReportResponse:
    return AdminReportResponse(
        id=report.id,
        identifier_type=report.identifier.type,
        identifier_value=report.identifier.value_normalized,
        scam_type=report.scam_type,
        description=report.description,
        status=report.status,
        reporter_handle=report.user.handle,
        reporter_reputation=report.user.reputation_score,
        created_at=report.created_at,
    )


@router.get("/reports", response_model=List[AdminReportResponse])
def list_reports(
    status_filter: Optional[ReportStatus] = Query(default=ReportStatus.pending, alias="status"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """The review queue. Oldest first. Pass ?status=approved or ?status=rejected for the rest."""
    reports = report_crud.list_reports(db, status_filter, skip, limit)
    return [_to_admin_response(r) for r in reports]


@router.patch("/reports/{report_id}", response_model=AdminReportResponse)
def review_report(
    report_id: int,
    review: ReportReview,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if review.status == ReportStatus.pending:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Use 'approved' or 'rejected'")

    report = report_crud.get_report(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    if report.status == review.status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Report is already {review.status.value}")

    return _to_admin_response(report_crud.review_report(db, report, review.status, admin))


@router.patch("/users/{user_id}", response_model=UserResponse)
def set_user_status(
    user_id: int,
    body: UserAdminUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Ban (is_active=false) or unban a user. Banned users' reports stop counting."""
    target = user_crud.get_user(db, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if target.role == ROLE_ADMIN:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change an admin account")
    return user_crud.set_user_active(db, target, body.is_active, admin)


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def list_audit_logs(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return audit_crud.list_logs(db, skip, limit)
