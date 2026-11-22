import secrets
from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import HTTPException

from schemas.user import HandleUpdate, UserCreate, UserUpdate
from core.security import hash_password, verify_password
from crud import audit_log as audit_crud
from crud import identifier as identifier_crud
from models.user import User
from schemas.user import UserCreate, UserUpdate


# Verified when the handle does not exist, so a missing handle and a wrong password take
# about the same time to reject.
_DUMMY_HASH = hash_password("not-a-real-password")

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_handle(db: Session, handle: str) -> Optional[User]:
    return db.query(User).filter(User.handle == handle).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user_in: UserCreate) -> User:
    db_user = User(handle=user_in.handle, hashed_password=hash_password(user_in.password))
    db.add(db_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Handle already taken")
    db.refresh(db_user)
    return db_user


def update_handle(db: Session, db_user: User, user_in: HandleUpdate) -> User:
    db_user.handle = user_in.handle
    db.add(db_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Handle already taken")
    db.refresh(db_user)
    return db_user


def set_user_active(db: Session, target: User, is_active: bool, admin: User) -> User:
    target.is_active = is_active
    audit_crud.add_log(
        db,
        actor_id=admin.id,
        action="user.unbanned" if is_active else "user.banned",
        target_type="user",
        target_id=target.id,
    )
    db.add(target)
    db.commit()
    db.refresh(target)
    # Banned users' reports stop counting (and start again if unbanned).
    identifier_crud.recalculate_for_user(db, target.id)
    return target


def delete_user(db: Session, db_user: User) -> None:
    db.delete(db_user)
    db.commit()


def authenticate_user(db: Session, handle: str, password: str) -> Optional[User]:
    user = get_user_by_handle(db, handle)
    if not user:
        verify_password(password, _DUMMY_HASH)
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
