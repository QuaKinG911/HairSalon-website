from fastapi import APIRouter
from app.api.v1 import users, services, barbers, bookings, contact, messages

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(barbers.router, prefix="/barbers", tags=["barbers"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
