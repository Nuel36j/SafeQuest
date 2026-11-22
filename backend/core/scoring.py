"""Risk scoring for an identifier, from its approved reports.

Rules this encodes:
  - Newer accounts count for less; reputation (earned through admin-approved reports) raises weight.
  - Old reports fade (phone numbers get recycled, scam domains get abandoned).
  - A single report, or reports from a handful of fresh accounts, can never reach "high_risk".
    High risk needs enough independent reporters AND enough combined weight.

All thresholds are plain constants so they are easy to tune once real data exists.
Standard library only, so it can be tested without the rest of the app.
"""
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Iterable, Optional, Tuple

# Days for a report's weight to halve.
HALF_LIFE_DAYS = {"phone": 180, "account": 365, "url": 90}
DEFAULT_HALF_LIFE_DAYS = 180

MIN_REPORTER_WEIGHT = 0.25     # a brand-new account
FULL_WEIGHT_REPUTATION = 10.0  # reputation at which a reporter counts fully

CAUTION_THRESHOLD = 0.5
HIGH_RISK_THRESHOLD = 2.0
HIGH_RISK_MIN_REPORTERS = 3


@dataclass(frozen=True)
class ReportEvidence:
    reporter_id: int
    reporter_reputation: float
    created_at: datetime


def reporter_weight(reputation: float) -> float:
    r = min(max(reputation, 0.0), FULL_WEIGHT_REPUTATION)
    return MIN_REPORTER_WEIGHT + (1.0 - MIN_REPORTER_WEIGHT) * r / FULL_WEIGHT_REPUTATION


def recency_factor(created_at: datetime, half_life_days: float, now: datetime) -> float:
    if created_at.tzinfo is None:  # SQLite returns naive datetimes; they are stored as UTC
        created_at = created_at.replace(tzinfo=timezone.utc)
    age_days = max((now - created_at).total_seconds() / 86400.0, 0.0)
    return 0.5 ** (age_days / half_life_days)


def compute_risk(
    id_type: str,
    reports: Iterable[ReportEvidence],
    now: Optional[datetime] = None,
) -> Tuple[float, str]:
    """Return (score, level) where level is 'unknown', 'caution' or 'high_risk'."""
    now = now or datetime.now(timezone.utc)
    half_life = HALF_LIFE_DAYS.get(str(getattr(id_type, "value", id_type)), DEFAULT_HALF_LIFE_DAYS)

    score = 0.0
    reporters = set()
    for report in reports:
        score += reporter_weight(report.reporter_reputation) * recency_factor(
            report.created_at, half_life, now
        )
        reporters.add(report.reporter_id)

    if len(reporters) >= HIGH_RISK_MIN_REPORTERS and score >= HIGH_RISK_THRESHOLD:
        level = "high_risk"
    elif score >= CAUTION_THRESHOLD:
        level = "caution"
    else:
        level = "unknown"
    return round(score, 4), level
