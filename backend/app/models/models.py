from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    ForeignKey,
    DateTime,
    Enum as SQLEnum,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base
import enum


class UserRole(enum.Enum):
    customer = "customer"
    barber = "barber"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.customer)
    phone = Column(String(20))
    image = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    bookings = relationship("Booking", back_populates="customer")
    sent_messages = relationship(
        "Message", foreign_keys="Message.sender_id", back_populates="sender"
    )
    received_messages = relationship(
        "Message", foreign_keys="Message.recipient_id", back_populates="recipient"
    )


class Stylist(Base):
    __tablename__ = "stylists"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True)
    role = Column(String(100), nullable=False)
    bio = Column(Text)
    image = Column(String(500))
    specialties = Column(JSON, default=list)
    schedule = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bookings = relationship("Booking", back_populates="stylist")


class Service(Base):
    __tablename__ = "services"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, default="Haircuts")
    image = Column(String(500))
    duration = Column(String(50))
    note = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_number = Column(String(50), unique=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stylist_id = Column(String(50), ForeignKey("stylists.id"))
    service_id = Column(String(50), ForeignKey("services.id"))
    date = Column(DateTime(timezone=True), nullable=False)
    time = Column(String(20), nullable=False)
    status = Column(String(50), default="pending")
    notes = Column(Text)
    total_price = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("User", back_populates="bookings")
    stylist = relationship("Stylist", back_populates="bookings")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(50), primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship(
        "User", foreign_keys=[sender_id], back_populates="sent_messages"
    )
    recipient = relationship(
        "User", foreign_keys=[recipient_id], back_populates="received_messages"
    )


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    responded = Column(Boolean, default=False)


class Hairstyle(Base):
    __tablename__ = "hairstyles"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(50))
    face_shape_compatibility = Column(JSON, default=dict)
    hair_type_compatibility = Column(JSON, default=dict)
    maintenance = Column(String(20))
    occasions = Column(JSON, default=list)
    image = Column(String(500))
    scale = Column(Float, default=1.0)
    y_offset = Column(Integer, default=0)
    tags = Column(JSON, default=list)


class Beard(Base):
    __tablename__ = "beards"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    face_shape_compatibility = Column(JSON, default=dict)
    maintenance = Column(String(20))
    image = Column(String(500))
    tags = Column(JSON, default=list)
