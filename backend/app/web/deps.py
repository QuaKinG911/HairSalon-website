from datetime import datetime
from typing import Any

from fastapi import Request
from jose import JWTError, jwt
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.models.models import Message, User


def get_session_cart(request: Request) -> list[dict[str, Any]]:
    raw = request.session.get("cart")
    if not raw:
        return []
    if isinstance(raw, list):
        return raw
    return []


def set_session_cart(request: Request, cart: list[dict[str, Any]]) -> None:
    request.session["cart"] = cart


def get_user_from_session(request: Request, db: Session) -> User | None:
    token = request.session.get("token")
    if not token:
        return None
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        uid = payload.get("user_id")
        if uid is None:
            return None
        return db.query(User).filter(User.id == int(uid)).first()
    except JWTError:
        return None


def template_globals(
    request: Request, db: Session, user: User | None, **extra: Any
) -> dict[str, Any]:
    cart = get_session_cart(request)
    unread = 0
    if user:
        unread = (
            db.query(func.count(Message.id))
            .filter(Message.recipient_id == user.id, Message.read.is_(False))
            .scalar()
            or 0
        )
    flash = request.session.pop("flash", None)
    ctx = {
        "request": request,
        "user": user,
        "cart": cart,
        "cart_count": len(cart),
        "unread_messages": unread,
        "flash": flash,
        "year": datetime.now().year,
    }
    ctx.update(extra)
    ctx.setdefault("hide_nav", False)
    return ctx


def flash(request: Request, message: str, kind: str = "info") -> None:
    request.session["flash"] = {"message": message, "kind": kind}
