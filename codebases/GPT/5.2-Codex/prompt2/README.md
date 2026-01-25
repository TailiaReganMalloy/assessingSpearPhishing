# Secure Mailer Sample

This sample Node.js project demonstrates secure user authentication and encrypted password storage alongside a simple user-to-user messaging inbox. It is designed for classroom study and mirrors the style of the provided login reference.

## Features

- Secure login with bcrypt password hashing
- Session-based authentication with secure cookies
- CSRF protection and rate limiting
- SQLite storage for users and messages
- Inbox view and message detail page
- Seeded demo users and messages

## Demo Users

All seeded users share the password `Password!123`.

- alice@bluemind.net
- bob@bluemind.net
- claire@bluemind.net

## Setup

1. Install dependencies:
   - `npm install`
2. Start the server:
   - `npm start`
3. Visit `http://localhost:3000`

## Notes for Students

- Passwords are stored as bcrypt hashes in `data.sqlite`.
- Review `server.js` and `src/db.js` for the authentication and messaging logic.
- Replace the session secret via environment variable `SESSION_SECRET` for production.
