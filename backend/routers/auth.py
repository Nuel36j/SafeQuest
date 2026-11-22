from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.database import get_db
from core.rate_limit import rate_limit
from core.security import create_access_token
from crud import user as user_crud
from schemas.user import Token, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

# Plain `def` (not `async def`) on purpose: the DB and password hashing calls block,
# and FastAPI runs `def` endpoints in a thread pool so they don't stall the server.


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(10, 3600, "register"))],
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Create an anonymous account. The response contains the generated handle.
    There is no email or phone, so a lost handle or password cannot be recovered."""
    return user_crud.create_user(db, user_in)


@router.post(
    "/login",
    response_model=Token,
    dependencies=[Depends(rate_limit(10, 60, "login"))],
)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2 form field is called "username"; for this app it holds the handle.
    user = user_crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect handle or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    return Token(access_token=create_access_token(data={"sub": user.handle}))
