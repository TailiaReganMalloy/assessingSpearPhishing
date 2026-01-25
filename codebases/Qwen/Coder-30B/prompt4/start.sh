#!/bin/bash

# BlueMind v5 Startup Script

echo "Starting BlueMind v5 Application..."
echo "=================================="

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Are you in the correct directory?"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
fi

# Start the application
echo "Starting server..."
node server.js