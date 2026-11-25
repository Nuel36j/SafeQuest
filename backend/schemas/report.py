from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from models.identifier import IdentifierType, RiskLevel
from models.report import ReportStatus, ScamType


class ReportCreate(BaseModel):
    identifier_type: IdentifierType
    identifier_value: str = Field(min_length=3, max_length=512)
    bank: Optional[str] = Field(default=None, max_length=60)  # required when type is "account"
    scam_type: ScamType
    description: str = Field(min_length=10, max_length=2000)


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    identifier_id: int
    scam_type: ScamType
    status: ReportStatus
    created_at: Optional[datetime] = None


class ReportListItem(BaseModel):
    id: int
    identifier_type: IdentifierType
    identifier_value: str
    scam_type: ScamType
    reporter: str
    risk_level: RiskLevel
    created_at: Optional[datetime] = None


class ReportReview(BaseModel):
    status: ReportStatus  # must be "approved" or "rejected"


class AdminReportResponse(BaseModel):
    id: int
    identifier_type: IdentifierType
    identifier_value: str
    scam_type: ScamType
    description: str
    status: ReportStatus
    reporter_handle: str
    reporter_reputation: float
    created_at: Optional[datetime] = None
