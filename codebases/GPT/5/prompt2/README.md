# Secure Auth + Messaging (Node.js sample)

A compact, classroom-friendly Node.js project demonstrating secure user authentication with encrypted password storage and a simple messaging system between users. Inspired by the mail-style UX in the reference site, this demo focuses on good practices (hashing, sessions, CSRF, validation, rate limiting, headers) rather than visual fidelity.

## Features

- Secure registration and login (bcrypt password hashing)
- Session management with HttpOnly cookies and SQLite-backed store
- CSRF protection on state-changing forms
- Rate limiting on auth endpoints
- Helmet security headers and no-store caching on auth pages
- Input validation via Zod
- SQLite database with `users` and `messages` tables
- Inbox and Sent views; compose and send messages to another user

## Stack

- Express, EJS views
- SQLite (`sqlite` + `sqlite3`) for persistence
- `express-session` + `connect-sqlite3` for sessions
- `helmet`, `csurf`, `express-rate-limit`, `bcryptjs`, `zod`

## Quickstart

1. Create your environment file:

```bash
cp .env.example .env
# edit .env to set a strong SESSION_SECRET
```

2. Install dependencies:

```bash
npm install
```

3. Run the server:

```bash
npm run start
# or for auto-reload in development
npm run dev
```

4. Visit `http://localhost:3000`.

- Register two accounts (e.g., Alice and Bob).
- Log in as Alice and send a message to Bob (use Bob's email).
- Log out, log in as Bob, and view the inbox.

## Project Structure

- [src/app.js](src/app.js): Express app setup, security middleware, sessions, routes
- [src/db.js](src/db.js): SQLite init and helpers (users, messages)
- [src/routes/auth.js](src/routes/auth.js): Register, login, logout with CSRF
- [src/routes/messages.js](src/routes/messages.js): Inbox, compose, send
- [src/middleware.js](src/middleware.js): `requireAuth`, `attachUser`, `noCache`
- [views/](views): EJS templates for pages
- [public/css/style.css](public/css/style.css): Minimal styling
- [data/](data): SQLite databases created at runtime

## Security Notes (for students)

- Passwords are hashed with bcrypt (`bcryptjs`) and never stored in plaintext.
- Sessions use `HttpOnly` cookies, `SameSite=lax`, and `secure` in production.
- CSRF tokens are injected into forms (`login`, `register`, `compose`, `logout`).
- Rate limiting reduces brute-force attempts on `/login` and `/register`.
- Helmet sets hardened HTTP headers; CSP allows only same-origin assets.
- Inputs are validated with Zod; always validate and sanitize user input.
- Use environment-specific secrets. Never commit real secrets.

## Assignment Ideas

- Add password reset flow with token + expiry.
- Add message threads and read indicators.
- Add user search/autocomplete with debouncing.
- Implement 2FA (TOTP) and device history.
- Add audit logging and admin dashboards.

## License

This sample is provided for educational use in class assignments.
