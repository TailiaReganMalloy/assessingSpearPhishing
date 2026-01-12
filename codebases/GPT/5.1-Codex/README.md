# BlueShell Vault demo

An instructional Node.js + Express application that demonstrates secure login practices, password hashing, JWT-based sessions, and a simple messaging inbox so students can study end-to-end flows. The UI mirrors a clean mail client login similar to the reference screenshot.

## Features

- Passwords hashed with bcrypt before storage in SQLite
- Login rate limiting, input validation, and opinionated cookie settings
- JWT authentication stored in httpOnly cookies with expiry
- Inbox view that lists messages for the signed-in user only
- Seed script to populate demo accounts and instructor talking points

## Getting started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Copy environment template and adjust secrets:
   ```sh
   cp .env.example .env
   # Update JWT_SECRET with a long random string
   ```
3. Seed the local SQLite database with demo data:
   ```sh
   npm run seed
   ```
4. Launch the dev server:
   ```sh
   npm run dev
   ```
5. Visit http://localhost:4000 and sign in with any seeded account:
   - `ava@blueshell.local` / `BlueShell!123`
   - `milo@blueshell.local` / `BlueShell!123`
   - `noor@blueshell.local` / `BlueShell!123`

## Project structure

```
src/
  config.js         // environment + app constants
  db.js             // SQLite helpers and schema bootstrap
  server.js         // Express app setup
  middleware/
    authGuard.js    // JWT verification for protected routes
  routes/
    authRoutes.js   // login/logout endpoints and validation
    messageRoutes.js// inbox rendering + API
  scripts/
    seed.js         // populate demo users/messages
  views/
    login.ejs       // BlueMind-inspired login screen
    inbox.ejs       // secure messaging dashboard
public/
  css/styles.css    // shared styles
```

## Teaching prompts

- Challenge students to replace JWT cookies with server-side sessions.
- Extend the inbox with message composition and delivery confirmation.
- Add audit logging and an admin view to inspect login attempts.

## License

MIT
