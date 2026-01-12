#!/bin/bash

# BlueMind v5 Startup Script
echo "Starting BlueMind v5 Server..."
echo "Ensure MongoDB is running before starting the application"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js before running this application."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js (which includes npm) before running this application."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please create a .env file with your configuration."
    echo "Using default configuration..."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the application
echo "Starting BlueMind v5 server on port 3000..."
node server.js