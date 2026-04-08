from datetime import datetime

from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class ServiceCategory(str, Enum):
    haircuts = "Haircuts"
    beard_shave = "Beard & Shave"
    grooming = "Grooming"
    packages = "Packages"


class FaceShape(str, Enum):
    OVAL = "oval"
    ROUND = "round"
    SQUARE = "square"
    HEART = "heart"
    DIAMOND = "diamond"


class HairType(str, Enum):
    STRAIGHT = "straight"
    WAVY = "wavy"
    CURLY = "curly"
    COILY = "coily"


class HairLength(str, Enum):
    SHORT = "short"
    MEDIUM = "medium"
    LONG = "long"


class SkinTone(str, Enum):
    FAIR = "fair"
    MEDIUM = "medium"
    TAN = "tan"
    DARK = "dark"


class MaintenanceLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Occasion(str, Enum):
    CASUAL = "casual"
    BUSINESS = "business"
    FORMAL = "formal"
    SPECIAL = "special"


class HairstyleCategory(str, Enum):
    CLASSIC = "Classic"
    MODERN = "Modern"
    PROFESSIONAL = "Professional"
    EDGY = "Edgy"
    RETRO = "Retro"


class UserRole(str, Enum):
    CUSTOMER = "customer"
    BARBER = "barber"
    ADMIN = "admin"


# Service Model
class ServiceBase(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: ServiceCategory
    image: str
    duration: Optional[str] = None
    note: Optional[str] = None


class Service(ServiceBase):
    class Config:
        from_attributes = True


# Booking Models
class BookingBase(BaseModel):
    booking_number: str
    customer_id: int
    stylist_id: Optional[str] = None
    service_id: Optional[str] = None
    date: Optional[datetime] = None
    time: Optional[str] = None
    status: str = "pending"
    notes: Optional[str] = None
    total_price: Optional[float] = None


class BookingSchema(BookingBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Stylist Model
class StylistBase(BaseModel):
    id: str
    name: str
    role: str
    bio: str
    image: str
    specialties: List[str]
    email: Optional[str] = None


class StylistScheduleSlot(BaseModel):
    day: str
    startTime: str
    endTime: str
    isActive: bool


class Stylist(StylistBase):
    schedule: Optional[dict] = None

    class Config:
        from_attributes = True


# Hairstyle Data
class HairstyleData(BaseModel):
    id: str
    name: str
    description: str
    category: HairstyleCategory
    faceShapeCompatibility: dict
    hairTypeCompatibility: dict
    maintenance: MaintenanceLevel
    occasions: List[str]
    image: str
    scale: float
    yOffset: int
    tags: List[str]


# Beard Data
class BeardData(BaseModel):
    id: str
    name: str
    description: str
    faceShapeCompatibility: dict
    maintenance: MaintenanceLevel
    image: str
    tags: List[str]


# User Model
class User(BaseModel):
    id: int
    email: str
    role: str
    name: str
    phone: Optional[str] = None
    image: Optional[str] = None

    class Config:
        from_attributes = True


# Message Model
class Message(BaseModel):
    id: str
    sender_id: int
    recipient_id: int
    subject: str
    content: str
    read: bool
    created_at: str

    class Config:
        from_attributes = True


# Hairstyle Recommendation
class HairstyleRecommendation(BaseModel):
    id: str
    name: str
    description: str
    faceShapeMatch: float
    hairTypeMatch: float
    overallScore: float
    maintenance: MaintenanceLevel
    occasion: Occasion
    image: str
    beardImage: Optional[str] = None
    scale: float
    yOffset: int
    tags: List[str]
    type: Optional[str] = "hair"


# Face Analysis
class FaceAnalysis(BaseModel):
    faceShape: FaceShape
    hairType: HairType
    hairLength: HairLength
    skinTone: SkinTone
    confidence: float
    faceCoordinates: Optional[dict] = None


# AI Result
class AIResult(BaseModel):
    originalImage: str
    processedImage: str
    faceShape: str
    hairType: str
    recommendations: List[str]


# User Preferences
class UserPreferences(BaseModel):
    occasion: Optional[Occasion] = None
    maintenance: Optional[MaintenanceLevel] = None
    style: Optional[str] = None
