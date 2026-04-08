# 🚀 How to Run Luxe Barber

## Quick Start (Recommended)

Simply run this command from the project root:

```bash
./run.sh
```

This single command starts both the backend and frontend servers simultaneously.

## What Gets Started

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 **Frontend** | http://localhost:3000 | React application with Vite dev server |
| ⚙️ **Backend** | http://localhost:8000 | FastAPI server with auto-reload |
| 📚 **API Docs** | http://localhost:8000/docs | Interactive Swagger documentation |
| 💚 **Health** | http://localhost:8000/health | Backend health check endpoint |

## Demo Accounts

Use these to log in after the servers are running:

- **Admin**: `admin@hairsalon.com` / `password`
- **Barber**: `barber@hairsalon.com` / `password`  
- **Customer**: `customer@example.com` / `password`

## Alternative Methods

### Method 2: Using npm

```bash
# From project root
npm run dev:full
```

### Method 3: Manual (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Prerequisites

Before running, ensure you have:

1. **Node.js 18+** installed
2. **Python 3.10+** installed
3. **PostgreSQL** running (for database features)
4. Dependencies installed:
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Backend
   pip install -r backend/requirements.txt
   ```

## Stopping the Servers

Press `Ctrl+C` in the terminal where you ran `./run.sh`. This will gracefully stop both servers.

## Troubleshooting

### Port Already in Use

If you see "Address already in use", kill existing processes:

```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed

The backend will still run, but API endpoints requiring database will show errors. To fix:

1. Ensure PostgreSQL is running: `sudo systemctl status postgresql`
2. Check your `.env` file in the `backend/` directory
3. Update `DATABASE_URL` with correct credentials

### Missing Dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
pip install -r backend/requirements.txt
```

## File Locations After Reorganization

```
hairsalon/
├── backend/          # FastAPI backend
│   ├── app/         # Application modules
│   ├── main.py      # Server entry point
│   ├── .env         # Database config
│   └── requirements.txt
├── frontend/         # React frontend  
│   ├── src/         # Source files
│   ├── components/  # React components
│   ├── pages/       # Page components
│   └── package.json
├── run.sh           # ⭐ Start both servers
└── README.md        # Full documentation
```
