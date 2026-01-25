# Secure Messaging Reference

This project demonstrates a compact Node.js implementation of password-based authentication with per-user messaging. It pairs Express, SQLite, secure session cookies, and bcrypt-based hashing so that students can explore a complete stack that matches the visual style of the provided BlueMind template while enforcing modern security practices.

## Features

- Bcrypt hashing (12 rounds) for all stored passwords.
- Session handling backed by SQLite to survive restarts and mitigate fixation attacks using `req.session.regenerate`.
- Helmet middleware and HTTP-only cookies configured for production-ready defaults.
- REST endpoints to register, sign in, sign out, and exchange messages between users.
- Lightweight front-end in `public/` with login, registration, compose, and inbox views to mirror a webmail workflow.
- SQLite migration script that seeds two sample users (`alice@example.org`, `bob@example.org`) with the password `Passw0rd!`.

## Getting Started

1. Install dependencies.
   ```bash
   npm install
   ```
2. Initialize the database (creates `data/app.db`, seeds users, and adds starter messages).
   ```bash
   npm run db:init
   ```
3. Start the server (default port 3000).
   ```bash
   npm start
   ```
4. Visit [http://localhost:3000](http://localhost:3000) to reach the login screen. Sign in with one of the seeded accounts or register a new account via the "Create an account" panel.

## Configuration

- Set `SESSION_SECRET` in your environment before starting the server to replace the development secret.
- Set `NODE_ENV=production` in deployments to enable the `secure` cookie flag.
- To reset the database, delete `data/app.db` and rerun `npm run db:init`.

## API Overview

| Method | Path            | Description                              |
|--------|-----------------|------------------------------------------|
| POST   | `/auth/register`| Register a new user and start a session. |
| POST   | `/auth/login`   | Authenticate a user and start a session. |
| POST   | `/auth/logout`  | Destroy the current session.             |
| GET    | `/auth/me`      | Retrieve the authenticated user profile. |
| GET    | `/messages`     | Inbox messages for the authenticated user.|
| GET    | `/messages/sent`| Messages the user has sent.              |
| POST   | `/messages`     | Send a message to another user.          |

All endpoints return JSON and expect `Content-Type: application/json` when sending request bodies.

## Security Notes

- Passwords are never stored or logged in plaintext. Use strong passphrases and consider enforcing password policies inside `routes/auth.js` if required.
- Sessions are stored server-side and expire after four hours of inactivity. Increase or decrease `cookie.maxAge` in `src/server.js` to suit your course exercises.
- The SQLite migration demonstrates proper foreign key constraints to keep messages tied to valid users. Additional cascading behavior can be enabled via the schema if you extend the exercise.

## Extending the Exercise

Ideas for class assignments:

- Add multi-factor authentication using one-time codes.
- Implement password reset flows with signed tokens.
- Add message search, read receipts, or per-message encryption demonstrations.
- Integrate an audit log that tracks sessions and message sends.
