from datetime import datetime, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import Profile, get_db
from app.supabase_auth import SupabaseAuthError, decode_supabase_token

security = HTTPBearer(auto_error=False)


class AuthenticatedUser:
    def __init__(self, user_id: str, email: str, full_name: str) -> None:
        self.user_id = user_id
        self.email = email
        self.full_name = full_name


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def ensure_profile(db: Session, user: AuthenticatedUser) -> Profile:
    profile = db.query(Profile).filter(Profile.id == user.user_id).first()

    if profile:
        if user.full_name and profile.full_name != user.full_name:
            profile.full_name = user.full_name
            db.commit()
            db.refresh(profile)
        return profile

    profile = Profile(
        id=user.user_id,
        email=user.email,
        full_name=user.full_name,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def serialize_profile(profile: Profile) -> dict[str, Any]:
    return {
        "id": profile.id,
        "email": profile.email,
        "fullName": profile.full_name,
        "createdAt": profile.created_at.isoformat() + "Z",
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> AuthenticatedUser:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    try:
        payload = decode_supabase_token(credentials.credentials)
    except SupabaseAuthError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
        ) from error

    user_id = payload.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject.",
        )

    metadata = payload.get("user_metadata") or {}
    full_name = ""
    if isinstance(metadata, dict):
        full_name = str(metadata.get("full_name") or metadata.get("fullName") or "")

    email = str(payload.get("email") or "")

    user = AuthenticatedUser(user_id=user_id, email=email, full_name=full_name)
    ensure_profile(db, user)
    return user
