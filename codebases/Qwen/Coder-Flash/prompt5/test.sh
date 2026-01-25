#!/bin/bash

# Simple test script to verify the application works
echo "Starting BlueMind v5 application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Check if dependencies are installed
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found"
    exit 1
fi

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "Error: server.js not found"
    exit 1
fi

# Check if public directory exists
if [ ! -d "public" ]; then
    echo "Error: public directory not found"
    exit 1
fi

# Check if views directory exists
if [ ! -d "views" ]; then
    echo "Error: views directory not found"
    exit 1
fi

echo "All required files and directories are present!"
echo "To run the application, execute: node server.js"