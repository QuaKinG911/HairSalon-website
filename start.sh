#!/bin/bash

# Luxe Barber - Full Stack Startup Script

echo "🚀 Starting Luxe Barber Full Stack Application..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not found. Running npm install...${NC}"
    cd frontend && npm install && cd ..
fi

# Check if Python dependencies are available
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Python dependencies not found. Installing from requirements.txt...${NC}"
    pip install -r backend/requirements.txt
fi

# Initialize database if needed
echo -e "${BLUE}🗄️  Checking database...${NC}"
cd backend
if ! python3 -c "from app.database.database import engine; from app.models.models import Base; Base.metadata.create_all(bind=engine)" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Database initialization needed. Running init_db.py...${NC}"
    python3 init_db.py
fi

# Seed data if needed
echo -e "${BLUE}🌱 Checking demo data...${NC}"
python3 -c "
from app.database.database import SessionLocal
from app.models.models import User
db = SessionLocal()
if not db.query(User).first():
    print('Seeding demo data...')
    import seed_data
    seed_data.seed_data()
else:
    print('Demo data already exists.')
db.close()
"
cd ..

echo ""
echo -e "${GREEN}✅ Starting servers...${NC}"
echo -e "${GREEN}   Backend: http://localhost:8000${NC}"
echo -e "${GREEN}   Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}   API Docs: http://localhost:8000/docs${NC}"
echo ""

# Use npm to run both concurrently
npm run dev:full
