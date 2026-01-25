#!/bin/bash

echo "Starting BlueMind v5 Authentication System..."
echo "============================================="

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB before running this application."
    echo "   On macOS, you can start MongoDB with: brew services start mongodb/brew/mongodb-community"
    echo ""
fi

# Start the application
echo "Starting the application on http://localhost:3000"
echo ""

node server.js