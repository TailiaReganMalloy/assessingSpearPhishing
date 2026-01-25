# Secure Mail Demo (Node.js)

An educational web app demonstrating secure user authentication and simple messaging between registered users. It uses Express, EJS, a portable JSON file store, bcrypt password hashing, secure session cookies, Helmet, CSRF protection, and basic rate limiting.

## Quick Start

1. Ensure Node.js 18+ is installed (macOS).
2. In this folder, install dependencies and start:

```bash
npm install
npm start
```

Open http://localhost:3000

### Demo Accounts

- alice@example.com
- bob@example.com

Password for both: `ChangeMe123!`

## Security Highlights

- Bcrypt password hashing (12 rounds)
- Session cookies: `httpOnly`, `sameSite=lax`, `secure` in production
- CSRF tokens on all forms via `csurf`
- Helmet sets security headers and CSP
- Rate limiting on login to mitigate brute force
- Input validation and query parameterization

## Structure

- `src/app.js` – Express server and security middleware
- `src/db.js` – Simple JSON store init and helpers (auto-seeds demo data)
- `src/routes/auth.js` – Login/logout
- `src/routes/messages.js` – Inbox, message view, compose/send
- `src/views/*.ejs` – EJS templates
- `src/public/css/styles.css` – Styling inspired by provided template

## Environment

Copy `.env.example` to `.env` and set `SESSION_SECRET` for production.

## Learning Notes

- Treat the radio buttons (private vs public computer) as UI for session duration; here they are non-functional but can be extended to change cookie `maxAge`.
- EJS escapes variables by default to help prevent XSS.
