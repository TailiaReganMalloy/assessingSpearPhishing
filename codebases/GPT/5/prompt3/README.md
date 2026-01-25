# Secure Mailer Reference (Node.js)

This is a small, self-contained Node.js reference implementation for teaching secure authentication and basic user-to-user messaging.

Highlights:
- Password hashing with `bcrypt` (12 rounds)
- Session auth with `express-session` and SQLite-backed store
- CSRF protection via `csurf` for all forms
- HTTP security headers with `helmet`
- Input validation with `zod`
- SQLite database via `better-sqlite3`

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment (optional; defaults are fine for local):

```bash
cp .env.example .env
```

3. Run the server:

```bash
npm run dev
```

Visit http://localhost:3000

## Features

- Register and login using email + password (hashed)
- View inbox and sent messages
- Compose a message to another user
- Mark messages as read

## Endpoints

- GET `/login`, POST `/login`
- GET `/register`, POST `/register`
- POST `/logout`
- GET `/inbox`, GET `/sent`, GET `/compose`, POST `/messages`, POST `/messages/:id/read`
- GET `/me` (JSON), GET `/csrf-token` (JSON)

## Security Notes

- Sessions use `httpOnly` + `sameSite=lax` cookies. Set `NODE_ENV=production` to enforce `secure` cookies behind HTTPS.
- CSRF tokens are automatically injected into EJS forms. API clients should first GET `/csrf-token` and include the token as `_csrf` in POST bodies.
- Never store plaintext passwords. This app uses `bcrypt.hash(password, 12)`.
- Rate limiting is applied to the login route.

## Folder Structure

```
src/
  server.js         # Express app configuration
  db.js             # SQLite init + helpers
  middleware/       # Auth guard
  routes/           # auth.js, messages.js
views/              # EJS templates
public/             # static assets (CSS)
data/               # SQLite DB files
```

## Seeding Users (optional)

Register a couple of users via the UI and send messages between them.

## License

For educational use in coursework; no warranty.
