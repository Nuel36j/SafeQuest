import enum

from sqlalchemy import Column, DateTime, Enum, Float, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import relationship

from core.database import Base


class IdentifierType(str, enum.Enum):
    phone = "phone"
    account = "account"
    url = "url"


class RiskLevel(str, enum.Enum):
    unknown = "unknown"      # no evidence yet. NOT the same as "safe".
    caution = "caution"
    high_risk = "high_risk"


class Identifier(Base):
    """One phone number, bank account or URL, stored in its normalized form."""

    __tablename__ = "identifiers"

    id = Column(Integer, primary_key=True, index=True)

    type = Column(Enum(IdentifierType, native_enum=False, length=20), nullable=False)
    value_normalized = Column(String(512), nullable=False)

    # Cached by identifier crud whenever a report changes. Search recomputes on read,
    # because scores fade with time.
    risk_level = Column(Enum(RiskLevel, native_enum=False, length=20), default=RiskLevel.unknown, nullable=False)
    risk_score = Column(Float, default=0.0, nullable=False)
    report_count = Column(Integer, default=0, nullable=False)  # approved reports only

    first_seen_at = Column(DateTime(timezone=True), server_default=func.now())
    last_reported_at = Column(DateTime(timezone=True), nullable=True)

    reports = relationship("Report", back_populates="identifier")

    __table_args__ = (UniqueConstraint("type", "value_normalized", name="uq_identifier_type_value"),)

    def __repr__(self) -> str:
        return f"<Identifier id={self.id} {self.type} {self.value_normalized!r}>"
