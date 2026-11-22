"""Promote an existing account to admin.

Run from the project root (the folder containing "backend"):
    python -m backend.make_admin <handle>

Register the account through the API first, then promote it here.
"""
import sys

import models  # noqa: F401
from core.database import Base, SessionLocal, engine
from crud import user as user_crud
from models.user import ROLE_ADMIN


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("Usage: python -m backend.make_admin <handle>")

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = user_crud.get_user_by_handle(db, sys.argv[1])
        if not user:
            sys.exit(f"No account with handle {sys.argv[1]!r}")
        user.role = ROLE_ADMIN
        db.add(user)
        db.commit()
        print(f"{user.handle} is now an admin.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
