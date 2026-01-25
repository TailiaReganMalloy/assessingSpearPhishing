# Secure Authentication & Messaging Demo

A Node.js/Express reference implementation demonstrating:
- Secure user registration/login with bcrypt password hashing
- Session-based authentication with configurable cookie lifetime (private/public computer)
- SQLite database for users and messages
- User-to-user messaging system

Styled to resemble the provided login template.

## Quick Start

1. Open terminal in this folder
2. `npm install`
3. `npm start`
4. Visit `http://localhost:3000`

## Demo Accounts
- `admin@email.com` / `admin`
- `user2@email.com` / `pass`

Register new users via `/register`.

## Features
- **Security**: Passwords hashed with bcrypt (10 salt rounds). Sessions use secret key.
- **Auth**: Login form with "Private computer" (session cookie) vs "Public computer" (30-day cookie).
- **Messaging**: Send messages by recipient email. View inbox ordered by newest.
- **DB**: Auto-creates `db.sqlite` with tables and demo users on first run.

## Educational Notes
- Use `bcrypt.hashSync(password, 10)` for hashing.
- `better-sqlite3` for synchronous DB ops (simple for learning).
- Sessions prevent CSRF by default; add CSRF middleware for prod.
- No input sanitization/JS execution shown; add in prod.
- Run in prod with HTTPS (`cookie.secure: true`), strong secret, env vars.

Enjoy teaching secure web auth!