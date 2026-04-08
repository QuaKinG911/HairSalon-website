from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Service
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class ServiceBase(BaseModel):
    id: str
    name: str
    description: str
    price: float
    category: str
    image: str
    duration: Optional[str] = None
    note: Optional[str] = None


@router.get("/")
def get_services(db: Session = Depends(get_db)):
    return db.query(Service).filter(Service.is_active == True).all()


@router.get("/{service_id}")
def get_service(service_id: str, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.post("/")
def create_service(service: ServiceBase, db: Session = Depends(get_db)):
    db_service = Service(**service.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


@router.put("/{service_id}")
def update_service(
    service_id: str, service: ServiceBase, db: Session = Depends(get_db)
):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    for key, value in service.model_dump().items():
        setattr(db_service, key, value)

    db.commit()
    db.refresh(db_service)
    return db_service


@router.delete("/{service_id}")
def delete_service(service_id: str, db: Session = Depends(get_db)):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    db_service.is_active = False
    db.commit()
    return {"message": "Service deleted"}
