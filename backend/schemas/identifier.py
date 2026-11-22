from datetime import datetime
from typing import Dict, Optional

from pydantic import BaseModel

from models.identifier import IdentifierType, RiskLevel


class SearchResult(BaseModel):
    found: bool
    identifier_type: IdentifierType
    risk_level: RiskLevel
    approved_report_count: int
    scam_types: Dict[str, int]
    last_reported_at: Optional[datetime] = None
