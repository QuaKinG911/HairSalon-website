import random
import string
from datetime import datetime


def generate_booking_number() -> str:
    """Generate a unique booking number in format BK + 8 digits"""
    return f"BK{''.join(random.choices(string.digits, k=8))}"


def format_datetime(dt: datetime) -> str:
    """Format datetime to ISO string"""
    return dt.isoformat() if dt else None


def parse_date(date_str: str) -> datetime:
    """Parse date string to datetime object"""
    return datetime.fromisoformat(date_str) if date_str else None
