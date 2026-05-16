"""Authentication endpoints."""

from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, verify_password, get_password_hash, decode_token

router = APIRouter()
security = HTTPBearer()

# Mock user store - replace with DB in production
users_db = {}


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister):
    """Register a new user."""
    if data.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = len(users_db) + 1
    user = {
        "id": user_id,
        "username": data.username,
        "email": data.email,
        "hashed_password": get_password_hash(data.password),
        "full_name": data.full_name or data.username,
        "role": "user",
        "is_active": True,
    }
    users_db[data.email] = user
    
    access_token = create_access_token({"sub": str(user_id), "email": data.email, "role": "user"})
    refresh_token = create_refresh_token({"sub": str(user_id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    """Login user."""
    # Demo account
    if data.email == "admin@kubegenius.ai" and data.password == "admin":
        access_token = create_access_token({"sub": "1", "email": data.email, "role": "admin"})
        refresh_token = create_refresh_token({"sub": "1"})
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
    
    user = users_db.get(data.email)
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": str(user["id"]), "email": data.email, "role": user["role"]})
    refresh_token = create_refresh_token({"sub": str(user["id"])})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Refresh access token."""
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user."""
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return UserResponse(
        id=1,
        username="admin",
        email=payload.get("email", "admin@kubegenius.ai"),
        full_name="Administrator",
        role=payload.get("role", "admin"),
    )
