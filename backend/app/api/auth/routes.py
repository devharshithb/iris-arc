from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import (
    AuthTokensOut,
    AuthSignupIn,
    AuthLoginIn,
    RefreshIn,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    hash_password,
    decode_token,
)
from app.db.session import get_db
import os

# ✅ unified router (no duplicate /refresh)
router = APIRouter(prefix="/api/auth", tags=["auth"])

# --------------------------------------------------------------------------
# 🔁 Refresh Access Token
# --------------------------------------------------------------------------
@router.post("/refresh", response_model=AuthTokensOut)
def refresh_token(payload: RefreshIn, db: Session = Depends(get_db)):
    try:
        decoded = decode_token(payload.refresh_token)
        if decoded.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )

        user_id = int(decoded.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        new_access = create_access_token(str(user.id))
        new_refresh = create_refresh_token(str(user.id))

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
            "user": user,
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

# --------------------------------------------------------------------------
# 🧩 Google Sync (OAuth)
# --------------------------------------------------------------------------
@router.post("/google-sync", response_model=AuthTokensOut)
def google_sync(payload: AuthSignupIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        user = User(
            email=payload.email,
            name=payload.name or payload.email.split("@")[0],
            password_hash=hash_password(os.urandom(16).hex()),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return AuthTokensOut(access_token=access, refresh_token=refresh, user=user)

# --------------------------------------------------------------------------
# 🔐 Credential Login
# --------------------------------------------------------------------------
@router.post("/login", response_model=AuthTokensOut)
def login(payload: AuthLoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": user,
    }

# --------------------------------------------------------------------------
# 🆕 Credential Signup
# --------------------------------------------------------------------------
@router.post("/signup", response_model=AuthTokensOut)
def signup(payload: AuthSignupIn, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    if not payload.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password required for signup",
        )
    
    # Use provided name or derive from email
    user_name = payload.name.strip() if payload.name else payload.email.split("@")[0]
    
    if not user_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name is required",
        )

    user = User(
        email=payload.email,
        name=user_name,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return AuthTokensOut(access_token=access, refresh_token=refresh, user=user)
