import time

import httpx
from jose import JWTError, jwk, jwt

from app.config import settings

JWKS_TTL_SECONDS = 3600

_jwks_cache: dict | None = None
_jwks_cached_at: float = 0.0


class SupabaseAuthError(Exception):
    pass


def _get_jwks() -> dict:
    global _jwks_cache, _jwks_cached_at

    if not settings.supabase_url:
        raise SupabaseAuthError(
            "Supabase URL is not configured. Set SUPABASE_URL in backend/.env."
        )

    now = time.time()
    if _jwks_cache is not None and (now - _jwks_cached_at) < JWKS_TTL_SECONDS:
        return _jwks_cache

    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"

    try:
        response = httpx.get(url, timeout=10.0)
        response.raise_for_status()
    except httpx.HTTPError as error:
        raise SupabaseAuthError("Unable to load Supabase signing keys.") from error

    payload = response.json()
    if not isinstance(payload, dict) or not payload.get("keys"):
        raise SupabaseAuthError("Supabase JWKS response was invalid.")

    _jwks_cache = payload
    _jwks_cached_at = now
    return payload


def _decode_with_jwks(token: str) -> dict:
    header = jwt.get_unverified_header(token)
    algorithm = header.get("alg")
    key_id = header.get("kid")

    if not algorithm or not key_id:
        raise SupabaseAuthError("Token header missing alg or kid.")

    jwks = _get_jwks()
    keys = jwks.get("keys", [])
    matching_key = next(
        (entry for entry in keys if entry.get("kid") == key_id),
        None,
    )

    if matching_key is None:
        raise SupabaseAuthError("Unable to find matching Supabase signing key.")

    signing_key = jwk.construct(matching_key)
    return jwt.decode(
        token,
        signing_key,
        algorithms=[algorithm],
        audience="authenticated",
    )


def _decode_with_legacy_secret(token: str) -> dict:
    if not settings.supabase_jwt_secret:
        raise SupabaseAuthError("Legacy JWT secret is not configured.")

    return jwt.decode(
        token,
        settings.supabase_jwt_secret,
        algorithms=["HS256"],
        audience="authenticated",
    )


def decode_supabase_token(token: str) -> dict:
    if not settings.supabase_url and not settings.supabase_jwt_secret:
        raise SupabaseAuthError(
            "Supabase auth is not configured. Set SUPABASE_URL and/or "
            "SUPABASE_JWT_SECRET in backend/.env."
        )

    errors: list[Exception] = []

    if settings.supabase_url:
        try:
            return _decode_with_jwks(token)
        except (JWTError, SupabaseAuthError) as error:
            errors.append(error)

    if settings.supabase_jwt_secret:
        try:
            return _decode_with_legacy_secret(token)
        except JWTError as error:
            errors.append(error)

    if errors:
        raise SupabaseAuthError("Invalid or expired Supabase token.") from errors[-1]

    raise SupabaseAuthError("Supabase auth is not configured.")
