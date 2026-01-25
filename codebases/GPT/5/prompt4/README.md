# Secure Mail Demo (Node.js)

A reference web application demonstrating secure login, safe password storage, and inter-user messaging. UI is inspired by a simple card-centered layout similar to the provided screenshot while omitting any third-party branding.

## Features
- Secure registration & login (bcrypt with strong policies)
- Session-based auth with `HttpOnly`, `SameSite` cookies and SQLite-backed store
- CSRF protection on all forms and Helmet for security headers + CSP
- Rate limiting and input validation (`express-validator`)
- Direct messages between users (inbox + compose)
- SQLite for easy local development

## Quick Start

```bash
# macOS: from the project folder
npm install
npm run seed
SESSION_SECRET="change-me" npm run start
# then open http://localhost:3000
```

Demo users (password: `Passw0rd!`):
- alice@example.com
- bob@example.com
- carol@example.com

## Project Structure
- src/app.js — Express app and security middleware
- src/db.js — SQLite access layer and schema init
- src/routes/auth.js — register, login, logout
- src/routes/messages.js — inbox and compose
- src/views — EJS templates with `express-ejs-layouts`
- public/css/style.css — UI styles (no external fonts)
- scripts/seed.js — demo users/messages

## Security Notes
- Password hashing: `bcrypt` with 12 rounds; adjust per environment.
- Sessions: Use a strong `SESSION_SECRET` via environment variable; set `NODE_ENV=production` behind HTTPS for `secure` cookies.
- CSRF: `csurf` middleware; all forms include a hidden token.
- Headers: `helmet` with a restrictive CSP (no inline JS/CSS).
- Validation: Login and messaging inputs validated and length-limited.
- Rate limiting: Global limiter; consider per-route limits for production.

## Teaching Points
- Why storing plain-text passwords is unsafe; hashing with salt
- Session management best practices and cookie flags
- CSRF risks and token verification
- Content Security Policy basics
- Input validation to prevent misuse and reduce attack surface

## License
For educational use as part of the curriculum; no external branding included. 