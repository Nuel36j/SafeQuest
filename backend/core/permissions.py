"""Who is allowed to do what.

  get_current_user -> valid token, user exists
  require_user     -> get_current_user + account not banned
  require_admin    -> require_user + role is admin

Protect a route by adding the dependency to it:
    def my_route(user: User = Depends(require_user)): ...
    def my_admin_route(admin: User = Depends(require_admin)): ...
"""
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from core.config import settings
from core.database import get_db
from core.security import decode_access_token
from crud import user as user_crud
from models.user import ROLE_ADMIN, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    handle: Optional[str] = payload.get("sub")
    if handle is None:
        raise credentials_exception

    user = user_crud.get_user_by_handle(db, handle)
    if user is None:
        raise credentials_exception
    return user


def require_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    return current_user


def require_admin(current_user: User = Depends(require_user)) -> User:
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
