@echo off
title BlueMind v5 Server

echo Starting BlueMind v5 Server...
echo Ensure MongoDB is running before starting the application
echo.

REM Check if node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js before running this application.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo npm is not installed. Please install Node.js (which includes npm) before running this application.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found. Please create a .env file with your configuration.
    echo Using default configuration...
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the application
echo Starting BlueMind v5 server on port 3000...
node server.js

pause