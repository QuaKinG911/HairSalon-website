from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from starlette.requests import Request

from app.api.exceptions import sqlalchemy_exception_handler
from app.api.v1 import barbers, bookings, contact, messages, services, users
from app.config.settings import settings
from app.database.database import engine

app = FastAPI(
    title="Hair Salon",
    description="Luxe Barber — React + FastAPI + PostgreSQL",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)


@app.middleware("http")
async def api_collection_trailing_slash(request: Request, call_next):
    """Starlette registers /api/foo/ with a trailing slash; avoid SPA 404 on /api/foo."""
    path = request.url.path
    parts = [p for p in path.split("/") if p]
    if (
        len(parts) == 2
        and parts[0] == "api"
        and parts[1] not in ("docs", "openapi.json", "redoc")
        and not path.endswith("/")
    ):
        qs = request.url.query
        dest = f"{path}/"
        if qs:
            dest = f"{dest}?{qs}"
        return RedirectResponse(url=dest, status_code=307)
    return await call_next(request)


@app.on_event("startup")
def verify_database_connection():
    from sqlalchemy import text

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except OperationalError as e:
        import logging

        logging.getLogger("uvicorn.error").warning(
            "Database not reachable: %s — check DATABASE_URL in .env.",
            e,
        )


BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend" / "static" / "frontend"

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(services.router, prefix="/api/services", tags=["services"])
app.include_router(barbers.router, prefix="/api/barbers", tags=["barbers"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])

assets_dir = FRONTEND_DIR / "assets"
if assets_dir.is_dir():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Server is running"}


def _safe_file(base: Path, *parts: str) -> Path | None:
    try:
        target = (base / Path(*parts)).resolve()
        base_r = base.resolve()
        if target.is_file() and str(target).startswith(str(base_r)):
            return target
    except (OSError, ValueError):
        pass
    return None


@app.get("/")
async def spa_root():
    index = FRONTEND_DIR / "index.html"
    if not index.is_file():
        return HTMLResponse(
            "<h1>Frontend not built</h1><p>From repo root run: <code>npm install && npm run build</code></p>"
            "<p>Vite outputs to <code>static/frontend</code>.</p>",
            status_code=503,
        )
    return FileResponse(index)


@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    if (
        full_path.startswith("api")
        or full_path.startswith("docs")
        or full_path in ("openapi.json", "redoc")
    ):
        raise HTTPException(status_code=404)

    index = FRONTEND_DIR / "index.html"
    if not index.is_file():
        raise HTTPException(status_code=503, detail="Frontend not built")

    static_file = _safe_file(FRONTEND_DIR, *full_path.split("/"))
    if static_file:
        return FileResponse(static_file)
    return FileResponse(index)


if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
