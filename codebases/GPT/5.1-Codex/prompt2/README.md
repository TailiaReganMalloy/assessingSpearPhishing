# BlueMind Secure Messaging Sample

A Node.js + Express reference project for demonstrating secure login, encrypted password storage, and a mailbox UI inspired by the BlueMind portal. Students can inspect how authentication, session handling, and data storage work end-to-end while extending the messaging feature set.

## Features
- Passwords hashed with bcrypt (12 rounds) before being stored in SQLite.
- Session-backed authentication with `express-session` and a SQLite session store.
- CSRF protection on all forms plus hardened HTTP headers via `helmet`.
- Seed script that provisions demo users and sample inter-office messages.
- Responsive UI that mirrors the BlueMind v5 login aesthetic and lists received messages after sign-in.

## Quick Start
1. Ensure Node.js 18+ is installed.
2. Install dependencies: `npm install`.
3. Populate the database: `npm run seed`.
4. Launch the server:
   - Development (with reload): `npm run dev`
   - Production-style: `npm start`
5. Visit http://localhost:3000 and sign in with any seeded account:
   - `nadia@bluemind.net / NadiaSecure!24`
   - `clara@bluemind.net / ClaraSecure!24`
   - `malik@bluemind.net / MalikSecure!24`

## Project Structure
```
.
├── data/                # SQLite databases (app + session store)
├── public/css/          # Shared styles for login + inbox
├── scripts/seed.js      # Resets DB and inserts demo data
├── src/db.js            # Database helper + migrations
├── src/server.js        # Express setup, routes, security middleware
└── views/               # EJS templates for login and inbox
```

## Teaching Ideas
- Extend `scripts/seed.js` to create outbound messages from the UI.
- Add registration or password-reset flows to practice bcrypt hashing and validation.
- Implement authorization rules (e.g., mark messages as read) using helpers exposed in `src/db.js`.
- Discuss how to swap SQLite for PostgreSQL/MySQL while keeping the repository pattern intact.

## Environment Notes
- Customize `SESSION_SECRET` or `PORT` through a `.env` file; defaults are safe for local demos.
- Delete `data/app.db` and rerun `npm run seed` whenever you want a clean slate.
