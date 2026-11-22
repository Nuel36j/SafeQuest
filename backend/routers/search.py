from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.normalizer import normalize_identifier
from core.rate_limit import rate_limit
from crud import identifier as identifier_crud
from models.identifier import IdentifierType, RiskLevel
from schemas.identifier import SearchResult

router = APIRouter(tags=["search"])


@router.get(
    "/search",
    response_model=SearchResult,
    dependencies=[Depends(rate_limit(30, 60, "search"))],
)
def search(
    identifier_type: IdentifierType = Query(alias="type"),
    q: str = Query(min_length=3, max_length=512),
    bank: Optional[str] = Query(default=None, max_length=60),
    db: Session = Depends(get_db),
):
    """Public lookup. Returns only a risk level, a count and scam types: never report text,
    reporters or dates beyond the most recent report."""
    try:
        normalized = normalize_identifier(identifier_type, q, bank)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    identifier = identifier_crud.get_identifier(db, identifier_type, normalized)
    if identifier is None:
        return SearchResult(
            found=False,
            identifier_type=identifier_type,
            risk_level=RiskLevel.unknown,
            approved_report_count=0,
            scam_types={},
        )

    result = identifier_crud.evaluate(db, identifier)  # fresh, so old reports have faded
    return SearchResult(
        found=result.report_count > 0,
        identifier_type=identifier_type,
        risk_level=result.level,
        approved_report_count=result.report_count,
        scam_types=identifier_crud.scam_type_breakdown(db, identifier.id),
        last_reported_at=result.last_reported_at,
    )
