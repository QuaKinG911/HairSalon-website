from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Stylist
from app.models.schemas import Stylist as StylistSchema, StylistBase

router = APIRouter()


@router.get("/", response_model=list[StylistSchema])
def get_stylists(db: Session = Depends(get_db)):
    return db.query(Stylist).all()


@router.get("/{stylist_id}", response_model=StylistSchema)
def get_stylist(stylist_id: str, db: Session = Depends(get_db)):
    stylist = db.query(Stylist).filter(Stylist.id == stylist_id).first()
    if not stylist:
        raise HTTPException(status_code=404, detail="Stylist not found")
    return stylist


@router.post("/", response_model=StylistSchema)
def create_stylist(stylist: StylistBase, db: Session = Depends(get_db)):
    db_stylist = Stylist(**stylist.model_dump())
    db.add(db_stylist)
    db.commit()
    db.refresh(db_stylist)
    return db_stylist


@router.put("/{stylist_id}", response_model=StylistSchema)
def update_stylist(
    stylist_id: str, stylist: StylistBase, db: Session = Depends(get_db)
):
    db_stylist = db.query(Stylist).filter(Stylist.id == stylist_id).first()
    if not db_stylist:
        raise HTTPException(status_code=404, detail="Stylist not found")

    for key, value in stylist.model_dump().items():
        setattr(db_stylist, key, value)

    db.commit()
    db.refresh(db_stylist)
    return db_stylist


@router.delete("/{stylist_id}")
def delete_stylist(stylist_id: str, db: Session = Depends(get_db)):
    db_stylist = db.query(Stylist).filter(Stylist.id == stylist_id).first()
    if not db_stylist:
        raise HTTPException(status_code=404, detail="Stylist not found")

    db.delete(db_stylist)
    db.commit()
    return {"message": "Stylist deleted"}
