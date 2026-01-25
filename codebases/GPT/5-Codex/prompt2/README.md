# Secure Messaging Sample (Node.js)

This project accompanies a web security lesson. It demonstrates how to combine hashed password storage, session-based authentication, CSRF protection, and a simple messaging workflow using Express and SQLite.

## Features

- **Hashed credentials** powered by bcryptjs with a cost factor of 12.
- **Session hardening** with `express-session`, `connect-sqlite3`, HTTP-only cookies, and optional secure flag in production.
- **CSRF tokens** added to every form via `csurf` middleware.
- **Helmet hardening** to apply a baseline of HTTP security headers.
- **SQLite persistence** that seeds demo users and messages on first launch.
- **Accessible UI** that imitates the BlueMind login experience while remaining original.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and set a strong session secret:
   ```bash
   cp .env.example .env
   # Edit .env and replace the placeholder value
   ```
3. Launch the server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) and sign in with one of the seeded accounts shown on the login screen.

## Demo Accounts

| Email | Password |
| --- | --- |
| csinstructor@example.edu | TeachSecurely!1 |
| student.alex@example.edu | LearningR0cks! |
| student.river@example.edu | BlueMindDemo#5 |

## Messaging Workflow

- After authentication, users are redirected to the inbox view where they can review messages addressed to them.
- A compose form lets the authenticated user send a message to any existing email in the system.
- Messages persist in `data/secure-messaging.db`. Remove this file to reset the demo.

## Teaching Notes

- Point out how passwords are never stored in plaintext—the hashing happens inside `db.js` during seeding and any future account creation.
- Highlight the session regeneration step after login, which mitigates fixation attacks.
- Ask students to inspect the rendered HTML and notice the `csrfToken` hidden inputs that protect POST endpoints.
- Demonstrate how changing `NODE_ENV=production` and providing `SESSION_SECRET` toggles secure cookies.

## Project Structure

```
.
├── server.js             # Express app wiring middleware, routes, and security layers
├── db.js                 # SQLite helpers and seed data definition
├── views/                # EJS templates for login, inbox, compose, and error states
├── public/css/styles.css # Styling inspired by the reference screenshot
├── data/                 # Created automatically to store SQLite files
├── .env.example          # Template for environment configuration
└── README.md             # Project overview and teaching guidance
```

Feel free to extend this codebase with user registration, password reset flows, or multi-factor authentication examples as class exercises.
