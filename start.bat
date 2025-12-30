@echo off
echo Starting Bole Media Coverage Application...

REM Start backend server in background
start cmd /k "cd backend && npm start"

REM Wait a moment for backend to initialize
timeout /t 5 /nobreak > nul

REM Start frontend server
cd frontend
npm start
