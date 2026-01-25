#!/bin/bash

# Start the BlueMind v5 application
echo "Starting BlueMind v5 application..."
echo "Make sure MongoDB is running before starting this application."

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "Warning: MongoDB is not running. Please start MongoDB before proceeding."
fi

# Start the application
node app.js