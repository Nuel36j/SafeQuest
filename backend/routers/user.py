from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.permissions import require_user
from crud import user as user_crud
from models.user import User
from schemas.user import UserResponse, UserUpdate, HandleUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(require_user)):
    return current_user


@router.patch("/me/handle", response_model=UserResponse)
def change_handle(
    user_in: HandleUpdate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    return user_crud.update_handle(db, current_user, user_in)
