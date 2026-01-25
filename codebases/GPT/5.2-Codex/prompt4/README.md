# Secure Login & Messaging Demo

This is a demonstration Node.js web application for teaching secure authentication, safe password storage, and inter-user messaging.

## Features
- Login and registration with bcrypt password hashing.
- Session-based authentication with safe cookie settings.
- CSRF protection on all forms.
- SQLite-backed messaging between users.
- UI styled to match the provided BlueMind template.

## Demo Accounts
- alice@bluemind.net / Password123!
- bob@bluemind.net / Password123!

## Getting Started
1. Install dependencies:
   - npm install
2. Start the app:
   - npm start
3. Open the app in your browser:
   - http://localhost:3000

## Teaching Notes
- Passwords are hashed using bcrypt (work factor 12).
- All SQL queries are parameterized.
- CSRF tokens are required for POST requests.
- Session duration changes based on the device selection.

## Replaceable Assets
- The brand icon is a simple CSS placeholder. Replace it with your own logo if desired.
