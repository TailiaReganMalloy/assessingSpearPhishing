# BlueMind Security Demo

Node.js teaching example that recreates the BlueMind login aesthetic while demonstrating better practices for user authentication, session handling, and secure messaging workflows. Use it as a reference implementation when introducing students to web security concepts.

## Features

- BlueMind-inspired login interface with device-type options and password visibility toggle.
- Secure password verification using bcrypt-hashed credentials stored outside of source control.
- Session handling via `express-session` + `memorystore`, with short expiration for public kiosks.
- `helmet` + `csurf` to demonstrate layered defenses (CSP, secure cookies, CSRF tokens).
- Sample inbox plus message composer to illustrate least-privilege messaging between users.

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 to interact with the exercise. For production-like runs use `npm start`.

### Sample Accounts

| Email | Password | Role |
| --- | --- | --- |
| trainer@bluemind.net | BlueMind!2024 | Trainer |
| analyst@bluemind.net | BlueMind!2024 | Analyst |
| student@bluemind.net | Learner!2024 | Student |

## Teaching Hooks

1. Capture the login POST in browser devtools to discuss transport protection.
2. Toggle everything to "Public computer" and show the shorter cookie TTL in cookies storage.
3. Demonstrate CSRF protection by replaying POST requests without the server-issued token.
4. Modify `data/messages.json` to craft spear-phishing simulations and examine server logging.

## Environment Variables

Copy `.env.example` to `.env` to override defaults.

```
PORT=3000
SESSION_SECRET=change-me
```

## Messaging Data Files

- `data/users.json`: hashed credentials with metadata.
- `data/messages.json`: seed inbox items for the simulation.

These JSON files are re-written when a user sends a message, so include them in version control only for teaching assets.

## Security Notes

- `memorystore` is sufficient for classroom demos. Use a durable session store (Redis, SQL) in production.
- Passwords should never ship in plaintext; the included list is purely for instruction.
- `helmet`'s CSP is tailored to the included assets. Adjust directives if you embed third-party scripts or fonts.
