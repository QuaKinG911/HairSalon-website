from passlib.context import CryptContext

from app.database.database import SessionLocal
from app.models.models import Service, Stylist, Hairstyle, Beard, User, UserRole
from app.utils.constants import SERVICES, STYLISTS, HAIRSTYLES, BEARDS

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEMO_USERS = [
    {
        "email": "admin@hairsalon.com",
        "password": "password",
        "name": "Admin User",
        "role": UserRole.admin,
    },
    {
        "email": "barber@hairsalon.com",
        "password": "password",
        "name": "John Barber",
        "role": UserRole.barber,
        "phone": "+1234567890",
    },
    {
        "email": "customer@example.com",
        "password": "password",
        "name": "Jane Customer",
        "role": UserRole.customer,
        "phone": "+0987654321",
    },
]


def seed_data():
    db = SessionLocal()

    # Seed services
    for service_data in SERVICES:
        existing = db.query(Service).filter(Service.id == service_data["id"]).first()
        if not existing:
            service = Service(**service_data)
            db.add(service)

    # Seed stylists
    for stylist_data in STYLISTS:
        existing = db.query(Stylist).filter(Stylist.id == stylist_data["id"]).first()
        if not existing:
            stylist = Stylist(**stylist_data)
            db.add(stylist)

    # Seed hairstyles
    for hair_data in HAIRSTYLES:
        existing = db.query(Hairstyle).filter(Hairstyle.id == hair_data["id"]).first()
        if not existing:
            hair_data["face_shape_compatibility"] = hair_data.pop(
                "faceShapeCompatibility"
            )
            hair_data["hair_type_compatibility"] = hair_data.pop(
                "hairTypeCompatibility"
            )
            hair_data["y_offset"] = hair_data.pop("yOffset")
            hairstyle = Hairstyle(**hair_data)
            db.add(hairstyle)

    # Seed beards
    for beard_data in BEARDS:
        existing = db.query(Beard).filter(Beard.id == beard_data["id"]).first()
        if not existing:
            beard_data["face_shape_compatibility"] = beard_data.pop(
                "faceShapeCompatibility"
            )
            beard = Beard(**beard_data)
            db.add(beard)

    for u in DEMO_USERS:
        if db.query(User).filter(User.email == u["email"]).first():
            continue
        db.add(
            User(
                email=u["email"],
                password_hash=_pwd.hash(u["password"]),
                name=u["name"],
                role=u["role"],
                phone=u.get("phone"),
            )
        )

    db.commit()
    print("Seed data added successfully!")
    db.close()


if __name__ == "__main__":
    seed_data()
