# BlueMind Secure Messaging Demo

This Node.js project mirrors the BlueMind v5 aesthetic to help students explore secure authentication patterns, safe password storage, and inter-user messaging.

## Features

- **Password hygiene**: users are stored with bcrypt hashes (12 rounds) and seeded via `npm run seed`.
- **Session security**: signed cookies, SQLite-backed sessions, device trust toggle, CSRF tokens, and Helmet hardening.
- **Messaging sandbox**: authenticated participants can exchange short inbox messages with role-play prompts.
- **Instructional UI**: login and dashboard reproduce the template from mailer.gov.bf to make lessons visually familiar.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` → `.env` and set a strong `SESSION_SECRET`.
3. Initialize demo users and sample data:
   ```bash
   npm run seed
   ```
4. Launch the dev server:
   ```bash
   npm run dev
   ```
5. Visit http://localhost:3000 and sign in with one of the seeded accounts.

| Email | Password |
| --- | --- |
| alex@bluemind.net | ChangeMe!123 |
| casey@bluemind.net | ChangeMe!123 |
| sam@bluemind.net | ChangeMe!123 |

## Teaching Notes

- Demonstrate how password hashes appear in `data/app.db` and why plaintext passwords never persist.
- Toggle the "Public computer" option to discuss session lifetime and cookie policies.
- Review the CSRF middleware and explain double-submit token defenses.
- Extend the project by adding MFA hooks, password rotation policies, or message encryption labs.

## Scripts

- `npm run dev` – nodemon with hot reload
- `npm start` – production start
- `npm run seed` – create demo users + sample messages
