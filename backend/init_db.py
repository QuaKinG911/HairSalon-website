import os
from sqlalchemy import create_engine
from app.database.database import Base
from app.models import models


def init_database():
    """Initialize database tables"""
    from app.config.settings import settings

    engine = create_engine(settings.DATABASE_URL, echo=True)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_database()
