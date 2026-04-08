# Luxe Barber

A premium men's grooming platform that combines traditional barbering excellence with modern technology. The application features an AI-powered style consultation tool, intelligent booking system, and dedicated dashboards for customers, barbers, and administrators to manage appointments and services.

## Architecture

This project is organized into separate backend and frontend directories:

```
hairsalon/
├── backend/          # FastAPI + PostgreSQL
│   ├── app/          # Application code
│   ├── main.py       # Entry point
│   ├── init_db.py    # Database initialization
│   ├── seed_data.py  # Demo data seeding
│   ├── .env          # Environment variables
│   └── requirements.txt
├── frontend/         # React + TailwindCSS
│   ├── src/          # Source files
│   ├── components/   # React components
│   ├── pages/        # Page components
│   ├── context/      # Context providers
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL database running

## Quick Start

### Option 1: Using Root Package Scripts (Recommended)

```bash
# Install all dependencies
npm install-all

# Initialize database and seed demo data
npm run init-db
npm run seed

# Build frontend
npm run build

# Run everything (starts backend on :8000, frontend on :3000)
npm run dev:full
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up database (ensure PostgreSQL is running)
python init_db.py

# Seed demo data
python seed_data.py

# Start backend server (runs on http://localhost:8000)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# OR build for production
npm run build
```

## Available Scripts

### Root Directory

| Script | Description |
|--------|-------------|
| `npm install-all` | Install dependencies for both frontend and backend |
| `npm run build` | Build the React frontend |
| `npm run dev` | Start frontend dev server only |
| `npm run server` | Start backend server only |
| `npm run server:dev` | Start backend with hot reload |
| `npm run dev:full` | Start both backend and frontend concurrently |
| `npm run init-db` | Initialize PostgreSQL database |
| `npm run seed` | Seed database with demo data |
| `npm run setup` | Complete setup (install → init-db → seed → build) |

### Backend Directory

```bash
cd backend

# Initialize database tables
python init_db.py

# Seed demo users and data
python seed_data.py

# Run server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Directory

```bash
cd frontend

# Development server
npm run dev

# Production build (outputs to frontend/static/frontend)
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
APP_NAME=Hair Salon API
DEBUG=true
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/hairsalon
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60
SESSION_SECRET_KEY=change-me-session-secret
HOST=0.0.0.0
PORT=8000
```

## Demo Accounts

After seeding the database, use these credentials to log in:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hairsalon.com | password |
| Barber | barber@hairsalon.com | password |
| Customer | customer@example.com | password |

## API Documentation

Once the backend is running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend Dev | http://localhost:3000 | React development server |
| Backend API | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/docs | Swagger/OpenAPI docs |

## Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Primary database
- **Pydantic** - Data validation
- **JWT** - Authentication tokens
- **Passlib** - Password hashing

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

## Development Workflow

1. **Backend changes**: Edit files in `backend/`, server auto-reloads
2. **Frontend changes**: Edit files in `frontend/`, Vite hot-reloads
3. **Database changes**: Update `backend/app/models/models.py`, then run `npm run init-db`

## Production Deployment

```bash
# Build frontend for production
cd frontend && npm run build

# Start backend (serves static frontend from frontend/static/frontend)
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `backend/.env`
- Ensure database `hairsalon` exists

### Frontend Not Building
- Delete `frontend/node_modules` and run `npm install` again
- Check for syntax errors in components

### CORS Errors
- Backend CORS is configured to allow all origins in development
- For production, update `allow_origins` in `backend/main.py`

## License

This project is proprietary and confidential.
