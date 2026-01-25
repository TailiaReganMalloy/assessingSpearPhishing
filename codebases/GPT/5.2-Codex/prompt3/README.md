# Secure Auth + Messaging Demo

Reference Node.js implementation that demonstrates secure authentication with password hashing, session handling, CSRF protection, and viewing user-to-user messages.

## Features
- Password hashing with bcrypt
- Session-based authentication
- CSRF protection on forms
- SQLite-backed users and messages
- Sample inbox for authenticated users

## Default Users
All seeded users share the same password: `Password!123`

- alex@example.com
- jordan@example.com
- sam@example.com

## Setup
1. Install dependencies:
   - `npm install`
2. Start the server:
   - `npm start`
3. Visit the app in your browser and sign in with one of the default users.

## Notes
- The database is stored in the `data` directory and is created automatically on first run.
- Replace the session secret in `server.js` before using this code outside the classroom.
