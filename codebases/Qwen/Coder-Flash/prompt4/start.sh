#!/bin/bash

# BlueMind v5 - Secure Authentication & Messaging System
# Run this script to start the application

echo "Starting BlueMind v5..."
echo "=================================="

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "Warning: MongoDB is not running. Please start MongoDB before proceeding."
    echo "You can start MongoDB with: brew services start mongodb-community"
    echo ""
fi

# Start the application
echo "Starting Node.js server..."
npm start