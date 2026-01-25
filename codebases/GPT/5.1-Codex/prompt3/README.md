# BlueMind Secure Inbox Reference

A Node.js + Express reference implementation used in the web programming course to demonstrate secure authentication workflows, hashed passwords, and a protected inbox where users can review messages sent by their peers.

## Features

- Express 5 server with helmet hardening and secure session cookies
- bcrypt password verification backed by hashed sample credentials
- Session-based authentication guard for inbox and message views
- Simple messaging dataset showing sender → recipient flows
- Responsive UI that mirrors the BlueMind portal aesthetic provided in the course material

## Getting Started

1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Create a `.env` file**
   ```sh
   cp .env.example .env
   # Edit SESSION_SECRET to a long random string
   ```
3. **Run the development server**
   ```sh
   npm run dev
   ```
   The app defaults to http://localhost:3000.

Use one of the seeded accounts to sign in:

| Email | Password |
| --- | --- |
| `amelia@bluemind.net` | `AdminPass!23` |
| `david@bluemind.net` | `DevPass!23` |
| `sara@bluemind.net` | `BlueMind!23` |

## Project Structure

```
├─ data/             # Seeded users + messages
├─ public/           # Static assets (CSS)
├─ src/
│  ├─ services/      # Authentication + data helpers
│  └─ server.js      # Express entry point
└─ views/            # EJS templates for login and inbox
```

## Security Talking Points

- Passwords are hashed with bcrypt using a cost factor of 12.
- `express-session` issues httpOnly, same-site cookies so client-side scripts cannot read them and CSRF risk is reduced.
- Helmet adds sane security headers (HSTS, frameguard, etc.).
- Authentication middleware isolates the inbox and message detail routes.
- Error handlers avoid leaking stack traces to learners while logging on the server.

These patterns can be extended in class to cover CSRF tokens, multi-factor challenges, or database-backed persistence.
