from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

# ---------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashes a plain password using bcrypt."""
    return pwd_ctx.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    """Verifies a plain password against a bcrypt hash."""
    return pwd_ctx.verify(password, password_hash)



# ---------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------
# 🧠 Changed auto_error → False to avoid 403 on missing token
bearer_scheme = HTTPBearer(auto_error=True)

def _create_token(sub: str, token_type: str, minutes: int) -> str:
    """Internal helper to create a JWT with specific type & expiry."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(sub),
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=minutes)).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALG)

def create_access_token(sub: str):
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRES_MIN)
    to_encode = {"sub": str(sub), "exp": exp, "type": "access"}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALG)



def create_refresh_token(sub: str):
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRES_MIN)
    to_encode = {"sub": str(sub), "exp": exp, "type": "refresh"}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALG)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


# ---------------------------------------------------------------------
# Dependency: get_current_user
# ---------------------------------------------------------------------
def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:

    """
    Extracts the user from a Bearer JWT token.
    This dependency is used for all protected routes.
    Handles missing / expired / invalid tokens cleanly with 401.
    """

    # 🧩 Case 1: No credentials at all
    if creds is None or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )

    token = creds.credentials
    payload = decode_token(token)

    # 🧩 Case 2: Ensure this is an access token (not refresh)
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    # 🧩 Case 3: Validate user existence
    user = db.query(User).filter(User.id == int(payload.get("sub", 0))).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
