import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.security import bearer_user_id
from app.database.database import get_db
from app.models.models import Message

router = APIRouter()


class MessageCreate(BaseModel):
    sender_id: int
    recipient_id: int
    subject: str
    content: str


class MessageUpdate(BaseModel):
    read: Optional[bool] = None


def _message_dict(m: Message) -> dict:
    return {
        "id": m.id,
        "sender_id": m.sender_id,
        "recipient_id": m.recipient_id,
        "subject": m.subject,
        "content": m.content,
        "read": m.read,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }


@router.get("/my-messages", response_model=list[dict])
def my_messages(
    user_id: int = Depends(bearer_user_id), db: Session = Depends(get_db)
):
    messages = (
        db.query(Message)
        .filter((Message.sender_id == user_id) | (Message.recipient_id == user_id))
        .order_by(Message.created_at.desc())
        .all()
    )
    return [_message_dict(m) for m in messages]


@router.get("/conversation/{other_user_id}", response_model=list[dict])
def conversation(
    other_user_id: int,
    user_id: int = Depends(bearer_user_id),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(Message)
        .filter(
            ((Message.sender_id == user_id) & (Message.recipient_id == other_user_id))
            | (
                (Message.sender_id == other_user_id)
                & (Message.recipient_id == user_id)
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )
    return [_message_dict(m) for m in messages]


@router.put("/{message_id}/read", response_model=dict)
def mark_message_read(
    message_id: str,
    user_id: int = Depends(bearer_user_id),
    db: Session = Depends(get_db),
):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    if message.recipient_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    message.read = True
    db.commit()
    db.refresh(message)
    return {"message": "ok"}


@router.get("/", response_model=list[dict])
def get_messages(db: Session = Depends(get_db)):
    messages = db.query(Message).all()
    return [_message_dict(m) for m in messages]


@router.get("/user/{user_id}", response_model=list[dict])
def get_user_messages(user_id: int, db: Session = Depends(get_db)):
    messages = (
        db.query(Message)
        .filter((Message.sender_id == user_id) | (Message.recipient_id == user_id))
        .all()
    )
    return [_message_dict(m) for m in messages]


@router.get("/{message_id}", response_model=dict)
def get_message(message_id: str, db: Session = Depends(get_db)):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return _message_dict(message)


@router.post("/", response_model=dict)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    message_id = f"msg{uuid.uuid4().hex[:8]}"
    db_message = Message(
        id=message_id,
        sender_id=message.sender_id,
        recipient_id=message.recipient_id,
        subject=message.subject,
        content=message.content,
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return {"message": "Message sent successfully", "id": db_message.id}


@router.put("/{message_id}", response_model=dict)
def update_message(
    message_id: str, update: MessageUpdate, db: Session = Depends(get_db)
):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if update.read is not None:
        message.read = update.read

    db.commit()
    db.refresh(message)
    return {"message": "Message updated"}
