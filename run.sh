#!/bin/bash

# Luxe Barber - Full Stack Run Script
# This script starts both backend and frontend servers

set -e

cd "$(dirname "$0")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 Luxe Barber - Full Stack Application${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup INT TERM EXIT

# Check if ports are available
echo -e "${BLUE}🔍 Checking ports...${NC}"
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use${NC}"
    echo "   Run: lsof -ti:8000 | xargs kill -9"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
    echo "   Run: lsof -ti:3000 | xargs kill -9"
fi

echo ""

# Start Backend
echo -e "${BLUE}🗄️  Starting Backend Server...${NC}"
cd backend
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found in backend/${NC}"
    exit 1
fi

python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -n "   Waiting for backend to start"
for i in {1..30}; do
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo ""
        echo -e "   ${GREEN}✅ Backend running on http://localhost:8000${NC}"
        break
    fi
    echo -n "."
    sleep 0.5
done

echo ""

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
    npm install
fi

npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -n "   Waiting for frontend to start"
for i in {1..30}; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo ""
        echo -e "   ${GREEN}✅ Frontend running on http://localhost:3000${NC}"
        break
    fi
    echo -n "."
    sleep 0.5
done

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Both servers are running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "   ${BLUE}Frontend:${NC}  http://localhost:3000"
echo -e "   ${BLUE}Backend:${NC}   http://localhost:8000"
echo -e "   ${BLUE}API Docs:${NC}  http://localhost:8000/docs"
echo -e "   ${BLUE}Health:${NC}    http://localhost:8000/health"
echo ""
echo -e "   ${YELLOW}Demo Accounts:${NC}"
echo -e "     • Admin:    admin@hairsalon.com / password"
echo -e "     • Barber:   barber@hairsalon.com / password"
echo -e "     • Customer: customer@example.com / password"
echo ""
echo -e "   ${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Keep script running
wait
