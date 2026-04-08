import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func, cast, Date
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone

from app.database.database import get_db
from app.models.models import Booking
from app.models.schemas import BookingSchema

router = APIRouter()


class BookingCreateFromClient(BaseModel):
    """Accepts JSON from the React app (camelCase) or snake_case."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    customer_id: int = Field(
        validation_alias=AliasChoices("customer_id", "customerId")
    )
    stylist_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("stylist_id", "barberId"),
    )
    service_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("service_id", "serviceId"),
    )
    date: str
    time: str
    notes: Optional[str] = None
    booking_number: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("booking_number", "bookingNumber"),
    )
    services: Optional[list] = None
    customer_name: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("customer_name", "customerName"),
    )
    customer_email: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("customer_email", "customerEmail"),
    )
    customer_phone: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("customer_phone", "customerPhone"),
    )
    payment_method: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("payment_method", "paymentMethod"),
    )
    payment_status: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("payment_status", "paymentStatus"),
    )
    total: Optional[str] = None

    @field_validator("stylist_id", mode="before")
    @classmethod
    def stylist_as_string(cls, v):
        if v is None or v == "":
            return None
        return str(v)


class BookingUpdate(BaseModel):
    stylist_id: Optional[str] = None
    service_id: Optional[str] = None
    date: Optional[datetime] = None
    time: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


def generate_booking_number() -> str:
    import random
    import string

    return f"BK{''.join(random.choices(string.digits, k=8))}"


@router.get("/", response_model=list[BookingSchema])
def get_bookings(db: Session = Depends(get_db)):
    return db.query(Booking).all()


@router.get("/customer/{customer_id}", response_model=list[BookingSchema])
def get_customer_bookings(customer_id: int, db: Session = Depends(get_db)):
    return db.query(Booking).filter(Booking.customer_id == customer_id).all()


@router.get("/{booking_id}", response_model=BookingSchema)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.post("/", response_model=BookingSchema)
def create_booking(body: BookingCreateFromClient, db: Session = Depends(get_db)):
    try:
        day = datetime.strptime(body.date[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400, detail="Invalid date format, expected YYYY-MM-DD"
        )

    extra = {
        "services": body.services,
        "customerName": body.customer_name,
        "customerEmail": body.customer_email,
        "customerPhone": body.customer_phone,
        "paymentMethod": body.payment_method,
        "paymentStatus": body.payment_status,
    }
    merged_notes = json.dumps(extra)
    if body.notes:
        merged_notes = f"{body.notes}\n\n{merged_notes}"

    bn = body.booking_number or generate_booking_number()
    total_price = None
    if body.total is not None:
        try:
            total_price = float(body.total)
        except (TypeError, ValueError):
            pass

    status_val = "confirmed" if body.payment_status == "paid" else "pending"

    db_booking = Booking(
        booking_number=bn,
        customer_id=body.customer_id,
        stylist_id=body.stylist_id,
        service_id=body.service_id,
        date=day,
        time=body.time,
        notes=merged_notes,
        total_price=total_price,
        status=status_val,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


@router.put("/{booking_id}", response_model=BookingSchema)
def update_booking(
    booking_id: int, booking: BookingUpdate, db: Session = Depends(get_db)
):
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    update_data = booking.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_booking, key, value)

    db.commit()
    db.refresh(db_booking)
    return db_booking


@router.delete("/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    db.delete(db_booking)
    db.commit()
    return {"message": "Booking deleted"}


class StatusUpdate(BaseModel):
    status: str


@router.put("/{booking_id}/status")
def update_booking_status(
    booking_id: int, body: StatusUpdate, db: Session = Depends(get_db)
):
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db_booking.status = body.status
    db.commit()
    db.refresh(db_booking)
    return db_booking


@router.get("/check-availability")
def check_availability(
    date: str, time: str, barberId: Optional[str] = None, db: Session = Depends(get_db)
):
    from app.models.models import Stylist

    try:
        day = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    stylists = db.query(Stylist).all()
    bookings_at = (
        db.query(Booking)
        .filter(cast(Booking.date, Date) == day, Booking.time == time)
        .all()
    )
    busy_stylists = {b.stylist_id for b in bookings_at if b.stylist_id}

    if barberId:
        if barberId in busy_stylists:
            free = [s for s in stylists if s.id not in busy_stylists]
            return {
                "available": False,
                "message": "Sorry, this time slot is not available for that barber.",
                "availableBarbers": [{"id": s.id, "name": s.name} for s in free],
            }
        return {
            "available": True,
            "message": "Time slot available",
            "availableBarbers": [],
        }

    free = [s for s in stylists if s.id not in busy_stylists]
    if not free:
        return {
            "available": False,
            "message": "Sorry, that time is fully booked for all barbers.",
            "availableBarbers": [],
        }
    return {
        "available": True,
        "message": "Time slot available",
        "availableBarbers": [],
    }
