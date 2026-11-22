import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Text, UniqueConstraint, func
from sqlalchemy.orm import relationship

from core.database import Base


class ScamType(str, enum.Enum):
    fake_alert = "fake_alert"          # forged transfer alert / receipt
    ponzi = "ponzi"                    # investment / doubling schemes
    phishing = "phishing"
    romance = "romance"
    job_scam = "job_scam"
    impersonation = "impersonation"    # pretending to be a bank, agency, relative
    advance_fee = "advance_fee"        # pay first, get nothing
    non_delivery = "non_delivery"      # paid for goods that never arrived
    other = "other"


class ReportStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    identifier_id = Column(Integer, ForeignKey("identifiers.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    scam_type = Column(Enum(ScamType, native_enum=False, length=30), nullable=False)
    # Free text is only ever shown to admins, never in public search results.
    description = Column(Text, nullable=False)
    status = Column(
        Enum(ReportStatus, native_enum=False, length=20),
        default=ReportStatus.pending,
        nullable=False,
        index=True,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="reports")
    identifier = relationship("Identifier", back_populates="reports")

    # One report per user per identifier: repeats cannot inflate the score.
    __table_args__ = (UniqueConstraint("user_id", "identifier_id", name="uq_report_user_identifier"),)

    def __repr__(self) -> str:
        return f"<Report id={self.id} identifier_id={self.identifier_id} status={self.status}>"
