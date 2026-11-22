# Import every model so Base.metadata knows about all tables before create_all runs.
from models.audit_log import AuditLog  # noqa: F401
from models.identifier import Identifier, IdentifierType, RiskLevel  # noqa: F401
from models.report import Report, ReportStatus, ScamType  # noqa: F401
from models.user import ROLE_ADMIN, ROLE_USER, User  # noqa: F401
