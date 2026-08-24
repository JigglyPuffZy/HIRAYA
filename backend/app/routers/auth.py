from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import AuthenticatedUser, ensure_profile, get_current_user, serialize_profile

router = APIRouter()


@router.get("/profile")
def profile(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    record = ensure_profile(db, current_user)
    return serialize_profile(record)
