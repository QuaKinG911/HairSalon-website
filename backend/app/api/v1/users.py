from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User, UserRole
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.config.settings import settings
from pydantic import BaseModel, field_validator
from typing import Optional

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "customer"
    phone: Optional[str] = None

    @field_validator("phone", mode="before")
    @classmethod
    def empty_phone_as_none(cls, v):
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def _user_public(u: User) -> dict:
    return {
        "id": u.id,
        "email": u.email,
        "name": u.name,
        "role": u.role.value,
        "phone": u.phone,
    }


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    # Public signup is always customer (ignore role in request)
    role = UserRole.customer
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        name=user.name,
        role=role,
        phone=user.phone,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    access_token = create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id, "role": db_user.role.value}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _user_public(db_user),
    }


@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _user_public(user),
    }


@router.get("/")
def get_users(db: Session = Depends(get_db)):
    from app.models.schemas import User as UserOut

    return [UserOut.model_validate(_user_public(u)) for u in db.query(User).all()]


@router.get("/validate")
def validate_token(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")

    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        uid = payload.get("user_id")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.id == int(uid)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"valid": True, "user": _user_public(user)}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    from app.models.schemas import User as UserOut

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut.model_validate(_user_public(user))
