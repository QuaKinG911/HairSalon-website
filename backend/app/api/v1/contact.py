from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Contact
from pydantic import BaseModel

router = APIRouter()


class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str = None
    message: str


@router.get("/", response_model=list[dict])
def get_contacts(db: Session = Depends(get_db)):
    contacts = db.query(Contact).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "message": c.message,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "responded": c.responded,
        }
        for c in contacts
    ]


@router.post("/", response_model=dict)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    db_contact = Contact(
        name=contact.name,
        email=contact.email,
        phone=contact.phone,
        message=contact.message,
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return {"message": "Contact form submitted successfully", "id": db_contact.id}


@router.put("/{contact_id}")
def mark_responded(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact.responded = True
    db.commit()
    return {"message": "Contact marked as responded"}
