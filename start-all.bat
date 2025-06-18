@echo off
REM Start Django backend in a new terminal window
start cmd /k "cd backend && ..\venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000"
REM Start Next.js frontend in a new terminal window
start cmd /k "cd frontend && npm run dev" 