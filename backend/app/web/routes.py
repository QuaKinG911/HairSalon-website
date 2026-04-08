import json
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, Form, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1.bookings import generate_booking_number
from app.api.v1.users import create_access_token, get_password_hash, verify_password
from app.database.database import get_db
from app.models.models import (
    Booking,
    Contact,
    Hairstyle,
    Message,
    Service,
    Stylist,
    User,
    UserRole,
)
from app.web.deps import (
    flash,
    get_session_cart,
    get_user_from_session,
    set_session_cart,
    template_globals,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

router = APIRouter()


def _render(request: Request, name: str, db: Session, **ctx):
    user = get_user_from_session(request, db)
    return templates.TemplateResponse(
        request, name, template_globals(request, db, user, **ctx)
    )


def _require_user(request: Request, db: Session) -> User | RedirectResponse:
    user = get_user_from_session(request, db)
    if not user:
        return RedirectResponse(url="/login", status_code=302)
    return user


def _require_role(
    user: User | RedirectResponse, *roles: UserRole
) -> User | RedirectResponse:
    if isinstance(user, RedirectResponse):
        return user
    if roles and user.role not in roles:
        return RedirectResponse(url="/", status_code=302)
    return user


@router.get("/", response_class=HTMLResponse)
def home(request: Request, db: Session = Depends(get_db)):
    return _render(request, "home.html", db)


@router.get("/login", response_class=HTMLResponse)
def login_get(request: Request, db: Session = Depends(get_db)):
    if get_user_from_session(request, db):
        return RedirectResponse(url="/", status_code=302)
    return _render(request, "login.html", db, hide_nav=True)


@router.post("/login", response_class=HTMLResponse)
def login_post(
    request: Request,
    db: Session = Depends(get_db),
    email: str = Form(...),
    password: str = Form(...),
):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        flash(request, "Invalid email or password", "error")
        return _render(request, "login.html", db, hide_nav=True)
    request.session["token"] = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value}
    )
    if user.role == UserRole.admin:
        return RedirectResponse(url="/admin/dashboard", status_code=302)
    if user.role == UserRole.barber:
        return RedirectResponse(url="/barber/dashboard", status_code=302)
    return RedirectResponse(url="/", status_code=302)


@router.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/", status_code=302)


@router.get("/signup", response_class=HTMLResponse)
def signup_get(request: Request, db: Session = Depends(get_db)):
    if get_user_from_session(request, db):
        return RedirectResponse(url="/", status_code=302)
    return _render(request, "signup.html", db, hide_nav=True)


@router.post("/signup", response_class=HTMLResponse)
def signup_post(
    request: Request,
    db: Session = Depends(get_db),
    email: str = Form(...),
    password: str = Form(...),
    name: str = Form(...),
    phone: str = Form(""),
):
    if db.query(User).filter(User.email == email).first():
        flash(request, "Email already registered", "error")
        return _render(request, "signup.html", db, hide_nav=True)
    db_user = User(
        email=email,
        password_hash=get_password_hash(password),
        name=name,
        role=UserRole.customer,
        phone=phone or None,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    request.session["token"] = create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id, "role": db_user.role.value}
    )
    return RedirectResponse(url="/", status_code=302)


@router.get("/services", response_class=HTMLResponse)
def services_page(
    request: Request,
    db: Session = Depends(get_db),
    category: str = Query("All"),
):
    all_svcs = db.query(Service).filter(Service.is_active.is_(True)).all()
    cats = ["All", "Haircuts", "Beard & Shave", "Grooming", "Packages"]
    if category != "All":
        services = [s for s in all_svcs if s.category == category]
    else:
        services = all_svcs
    return _render(
        request, "services.html", db, services=services, categories=cats, filter_cat=category
    )


@router.post("/cart/add")
def cart_add(
    request: Request,
    db: Session = Depends(get_db),
    service_id: str = Form(...),
):
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        flash(request, "Service not found", "error")
        return RedirectResponse(url="/services", status_code=302)
    cart = get_session_cart(request)
    cart = [c for c in cart if c.get("id") != service_id]
    cart.append(
        {
            "id": svc.id,
            "name": svc.name,
            "price": float(svc.price),
            "category": svc.category,
            "image": svc.image or "",
            "note": "",
        }
    )
    set_session_cart(request, cart)
    return RedirectResponse(url="/services", status_code=302)


@router.post("/cart/remove")
def cart_remove(
    request: Request,
    service_id: str = Form(...),
):
    cart = [c for c in get_session_cart(request) if c.get("id") != service_id]
    set_session_cart(request, cart)
    return RedirectResponse(url=request.headers.get("referer") or "/booking", status_code=302)


@router.get("/stylists", response_class=HTMLResponse)
def stylists_page(request: Request, db: Session = Depends(get_db)):
    stylists = db.query(Stylist).all()
    return _render(request, "stylists.html", db, stylists=stylists)


@router.get("/contact", response_class=HTMLResponse)
def contact_get(
    request: Request,
    db: Session = Depends(get_db),
    with_user: int | None = Query(None, alias="with"),
):
    user = get_user_from_session(request, db)
    contacts: list[User] = []
    conversation: list[Message] = []
    selected: User | None = None
    if user:
        q = db.query(User).filter(User.id != user.id)
        if user.role == UserRole.customer:
            q = q.filter(
                (User.role == UserRole.admin) | (User.role == UserRole.barber)
            )
        contacts = q.order_by(User.name).all()
        if with_user:
            selected = db.query(User).filter(User.id == with_user).first()
        elif contacts:
            selected = contacts[0]
        if selected:
            conversation = (
                db.query(Message)
                .filter(
                    ((Message.sender_id == user.id) & (Message.recipient_id == selected.id))
                    | (
                        (Message.sender_id == selected.id)
                        & (Message.recipient_id == user.id)
                    )
                )
                .order_by(Message.created_at.asc())
                .all()
            )
            for m in conversation:
                if m.recipient_id == user.id and not m.read:
                    m.read = True
            db.commit()
    return _render(
        request,
        "contact.html",
        db,
        messenger_contacts=contacts,
        messenger_selected=selected,
        messenger_thread=conversation,
        compose_with=with_user,
    )


@router.post("/contact/inquiry")
def contact_inquiry(
    request: Request,
    db: Session = Depends(get_db),
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...),
    phone: str = Form(""),
):
    db.add(
        Contact(
            name=name,
            email=email,
            phone=phone or None,
            message=message,
        )
    )
    db.commit()
    flash(request, "Thank you — we will get back to you soon.", "success")
    return RedirectResponse(url="/contact", status_code=302)


@router.post("/contact/send")
def contact_send(
    request: Request,
    db: Session = Depends(get_db),
    recipient_id: int = Form(...),
    subject: str = Form(...),
    content: str = Form(...),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    mid = f"msg{uuid.uuid4().hex[:8]}"
    db.add(
        Message(
            id=mid,
            sender_id=user.id,
            recipient_id=recipient_id,
            subject=subject,
            content=content,
        )
    )
    db.commit()
    return RedirectResponse(url=f"/contact?with={recipient_id}", status_code=302)


@router.get("/ai-try-on", response_class=HTMLResponse)
def ai_tryon(request: Request, db: Session = Depends(get_db)):
    rows = db.query(Hairstyle).limit(24).all()
    hairstyles = [
        {
            "id": h.id,
            "name": h.name,
            "description": (h.description or "")[:500],
            "image": h.image or "",
        }
        for h in rows
    ]
    return _render(request, "ai_tryon.html", db, hairstyles=hairstyles)


@router.get("/booking", response_class=HTMLResponse)
def booking_step1(request: Request, db: Session = Depends(get_db)):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    r = _require_role(user, UserRole.customer)
    if isinstance(r, RedirectResponse):
        flash(request, "Customer accounts can book appointments from the cart.", "error")
        return r
    cart = get_session_cart(request)
    if not cart:
        return _render(request, "booking_empty.html", db)
    stylists = db.query(Stylist).all()
    return _render(
        request,
        "booking_step1.html",
        db,
        stylists=stylists,
        cart=cart,
        subtotal=sum(float(x["price"]) for x in cart),
    )


@router.post("/booking/continue")
def booking_continue(
    request: Request,
    db: Session = Depends(get_db),
    date: str = Form(...),
    time: str = Form(...),
    stylist_id: str = Form(""),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    chk = _require_role(user, UserRole.customer)
    if isinstance(chk, RedirectResponse):
        return chk
    cart = get_session_cart(request)
    if not cart:
        return RedirectResponse(url="/booking", status_code=302)
    try:
        day = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        flash(request, "Invalid date", "error")
        return RedirectResponse(url="/booking", status_code=302)
    stylists = db.query(Stylist).all()
    bookings_at = (
        db.query(Booking)
        .filter(func.date(Booking.date) == day, Booking.time == time)
        .all()
    )
    busy = {b.stylist_id for b in bookings_at if b.stylist_id}
    if stylist_id:
        if stylist_id in busy:
            flash(request, "That barber is busy at this time. Pick another barber or slot.", "error")
            return RedirectResponse(url="/booking", status_code=302)
    else:
        free = [s for s in stylists if s.id not in busy]
        if not free:
            flash(request, "No barbers available at this time.", "error")
            return RedirectResponse(url="/booking", status_code=302)
    request.session["booking_draft"] = {
        "date": date,
        "time": time,
        "stylist_id": stylist_id or "",
    }
    return RedirectResponse(url="/booking/checkout", status_code=302)


@router.get("/booking/checkout", response_class=HTMLResponse)
def booking_checkout(request: Request, db: Session = Depends(get_db)):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    chk = _require_role(user, UserRole.customer)
    if isinstance(chk, RedirectResponse):
        return chk
    draft = request.session.get("booking_draft")
    if not draft:
        return RedirectResponse(url="/booking", status_code=302)
    cart = get_session_cart(request)
    if not cart:
        return RedirectResponse(url="/booking", status_code=302)
    subtotal = sum(float(x["price"]) for x in cart)
    return _render(
        request,
        "booking_checkout.html",
        db,
        cart=cart,
        subtotal=subtotal,
        tax=subtotal * 0.08,
        total=subtotal * 1.08,
        draft=draft,
    )


@router.post("/booking/complete")
def booking_complete(
    request: Request,
    db: Session = Depends(get_db),
    payment_method: str = Form(...),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    chk = _require_role(user, UserRole.customer)
    if isinstance(chk, RedirectResponse):
        return chk
    draft = request.session.get("booking_draft")
    if not draft:
        return RedirectResponse(url="/booking", status_code=302)
    cart = get_session_cart(request)
    if not cart:
        return RedirectResponse(url="/booking", status_code=302)
    subtotal = sum(float(x["price"]) for x in cart)
    total = subtotal * 1.08
    day = datetime.strptime(draft["date"], "%Y-%m-%d")
    stylist_id = draft.get("stylist_id") or None
    if stylist_id == "":
        stylist_id = None
    notes = json.dumps(
        {
            "services": [
                {"id": c["id"], "name": c["name"], "price": c["price"]} for c in cart
            ],
            "payment_method": payment_method,
        }
    )
    first = cart[0]
    bn = generate_booking_number()
    booking = Booking(
        booking_number=bn,
        customer_id=user.id,
        stylist_id=stylist_id,
        service_id=first["id"],
        date=day,
        time=draft["time"],
        notes=notes,
        total_price=total,
        status="confirmed" if payment_method == "online" else "pending",
    )
    db.add(booking)
    db.commit()
    request.session.pop("booking_draft", None)
    set_session_cart(request, [])
    request.session["booking_success"] = {
        "number": bn,
        "date": draft["date"],
        "time": draft["time"],
        "payment_method": payment_method,
        "total": f"{total:.2f}",
    }
    return RedirectResponse(url="/booking/done", status_code=302)


@router.get("/booking/done", response_class=HTMLResponse)
def booking_done(request: Request, db: Session = Depends(get_db)):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    info = request.session.pop("booking_success", None)
    if not info:
        return RedirectResponse(url="/booking", status_code=302)
    return _render(request, "booking_done.html", db, booking_info=info)


@router.get("/my-bookings", response_class=HTMLResponse)
def my_bookings(request: Request, db: Session = Depends(get_db)):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    chk = _require_role(user, UserRole.customer)
    if isinstance(chk, RedirectResponse):
        return chk
    bookings = (
        db.query(Booking)
        .filter(Booking.customer_id == user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return _render(request, "my_bookings.html", db, bookings=bookings)


@router.get("/admin/dashboard", response_class=HTMLResponse)
def admin_dashboard(
    request: Request,
    db: Session = Depends(get_db),
    tab: str = Query("overview"),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    chk = _require_role(user, UserRole.admin)
    if isinstance(chk, RedirectResponse):
        return chk
    customers = db.query(User).filter(User.role == UserRole.customer).count()
    stats = {
        "bookings": db.query(func.count(Booking.id)).scalar() or 0,
        "services": db.query(func.count(Service.id)).scalar() or 0,
        "customers": customers,
        "unread_messages": db.query(func.count(Message.id))
        .filter(Message.read.is_(False))
        .scalar()
        or 0,
    }
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    services = db.query(Service).all()
    stylists = db.query(Stylist).all()
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).all()
    messages = db.query(Message).order_by(Message.created_at.desc()).limit(200).all()
    users_list = db.query(User).order_by(User.name).all()
    return _render(
        request,
        "admin_dashboard.html",
        db,
        tab=tab,
        stats=stats,
        bookings=bookings,
        services=services,
        stylists=stylists,
        contacts=contacts,
        messages=messages,
        users_list=users_list,
    )


@router.post("/admin/bookings/{booking_id}/status")
def admin_booking_status(
    request: Request,
    booking_id: int,
    db: Session = Depends(get_db),
    status: str = Form(...),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    role_check = _require_role(user, UserRole.admin)
    if isinstance(role_check, RedirectResponse):
        return role_check
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if b:
        b.status = status
        db.commit()
    return RedirectResponse(url="/admin/dashboard?tab=bookings", status_code=302)


@router.post("/admin/services/add")
def admin_service_add(
    request: Request,
    db: Session = Depends(get_db),
    id: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    image: str = Form(...),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    role_check = _require_role(user, UserRole.admin)
    if isinstance(role_check, RedirectResponse):
        return role_check
    if db.query(Service).filter(Service.id == id).first():
        flash(request, "Service ID already exists", "error")
    else:
        db.add(
            Service(
                id=id,
                name=name,
                description=description,
                price=price,
                category=category,
                image=image,
                is_active=True,
            )
        )
        db.commit()
    return RedirectResponse(url="/admin/dashboard?tab=services", status_code=302)


@router.post("/admin/services/{service_id}/delete")
def admin_service_delete(
    request: Request,
    service_id: str,
    db: Session = Depends(get_db),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    role_check = _require_role(user, UserRole.admin)
    if isinstance(role_check, RedirectResponse):
        return role_check
    s = db.query(Service).filter(Service.id == service_id).first()
    if s:
        s.is_active = False
        db.commit()
    return RedirectResponse(url="/admin/dashboard?tab=services", status_code=302)


@router.post("/admin/stylists/add")
def admin_stylist_add(
    request: Request,
    db: Session = Depends(get_db),
    id: str = Form(...),
    name: str = Form(...),
    role: str = Form(...),
    bio: str = Form(...),
    image: str = Form(...),
    specialties: str = Form(""),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    role_check = _require_role(user, UserRole.admin)
    if isinstance(role_check, RedirectResponse):
        return role_check
    specs = [x.strip() for x in specialties.split(",") if x.strip()]
    if db.query(Stylist).filter(Stylist.id == id).first():
        flash(request, "Stylist ID already exists", "error")
    else:
        db.add(
            Stylist(
                id=id,
                name=name,
                role=role,
                bio=bio,
                image=image,
                specialties=specs,
            )
        )
        db.commit()
    return RedirectResponse(url="/admin/dashboard?tab=barbers", status_code=302)


@router.post("/admin/stylists/{stylist_id}/delete")
def admin_stylist_delete(
    request: Request,
    stylist_id: str,
    db: Session = Depends(get_db),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    role_check = _require_role(user, UserRole.admin)
    if isinstance(role_check, RedirectResponse):
        return role_check
    st = db.query(Stylist).filter(Stylist.id == stylist_id).first()
    if st:
        try:
            db.delete(st)
            db.commit()
        except Exception:
            db.rollback()
            flash(request, "Cannot remove a barber who still has bookings.", "error")
    return RedirectResponse(url="/admin/dashboard?tab=barbers", status_code=302)


@router.get("/barber/dashboard", response_class=HTMLResponse)
def barber_dashboard(
    request: Request,
    db: Session = Depends(get_db),
    tab: str = Query("overview"),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    chk = _require_role(user, UserRole.barber)
    if isinstance(chk, RedirectResponse):
        return chk
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    contacts = db.query(User).filter(User.role == UserRole.customer).all()
    return _render(
        request,
        "barber_dashboard.html",
        db,
        tab=tab,
        bookings=bookings,
        customer_contacts=contacts,
    )


@router.post("/barber/bookings/{booking_id}/status")
def barber_booking_status(
    request: Request,
    booking_id: int,
    db: Session = Depends(get_db),
    status: str = Form(...),
):
    user = _require_user(request, db)
    if isinstance(user, RedirectResponse):
        return user
    role_check = _require_role(user, UserRole.barber)
    if isinstance(role_check, RedirectResponse):
        return role_check
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if b:
        b.status = status
        db.commit()
    return RedirectResponse(url="/barber/dashboard?tab=bookings", status_code=302)
