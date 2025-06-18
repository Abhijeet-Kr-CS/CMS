#!/bin/bash
# Script to run both frontend (Next.js) and backend (Django) concurrently

# Start backend (Django)
echo "Starting Django backend..."
cd backend
source ../venv/Scripts/activate 2>/dev/null || source ../venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!
cd ..

# Start frontend (Next.js)
echo "Starting Next.js frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for both to exit
wait $BACKEND_PID $FRONTEND_PID 