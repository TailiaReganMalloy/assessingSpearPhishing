# Secure Messages Demo (Node.js + SQLite)

A compact reference app for students: register/login with hashed passwords, sessions, CSRF protection, and encrypted-at-rest messages between users.

## Features
- Passwords hashed with bcrypt (cost 12)
- Session auth with secure cookies (SQLite-backed store)
- Helmet for security headers, CSRF protection, and basic rate limiting
- SQLite database auto-initialized on startup
- Messages are encrypted at rest (AES‑256‑GCM). Decryption happens only when the recipient views the inbox.

## Quick start

1. Requirements: Node.js 18+.
2. From this folder, install dependencies and start:

```bash
npm install
npm start
```

Open http://localhost:3000

## Environment variables
Copy `.env.example` to `.env` and customize for better security:

- `SESSION_SECRET`: random string for session cookies
- `ENCRYPTION_KEY`: 32‑byte key (base64 or hex) for message encryption
- `PORT`: optional, default 3000

Example generate values on macOS:
```bash
# 32 bytes base64
openssl rand -base64 32
# 64 hex chars
openssl rand -hex 32
```

## How it works
- On registration, the app stores `username` and a bcrypt `password_hash` in SQLite.
- On login, credentials are verified and a session is established.
- Sending a message uses AES‑256‑GCM to encrypt the text before writing to the DB. The IV and tag are stored alongside the ciphertext.
- The inbox decrypts each message for the logged-in user.

## Project Structure
- `src/app.js` – Express app setup, middleware, routes
- `src/db.js` – SQLite init and helpers
- `src/crypto.js` – AES‑GCM encrypt/decrypt helpers
- `src/routes/auth.js` – register/login/logout routes
- `src/routes/messages.js` – inbox and send message
- `views/` – EJS templates
- `public/` – CSS

## Teaching Ideas
- Ask students to add features: delete messages, per‑message read receipts, or password reset flows.
- Discuss session fixation and CSRF; locate where the app mitigates these.
- Extend with input validation errors surfaced in the UI.

## Notes
This is a learning example, not production-ready. For production, enforce HTTPS, set `secure` cookies, rotate keys, and add auditing, logging, and account lockouts.
