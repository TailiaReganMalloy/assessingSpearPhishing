# BlueMind Mailer Demo (Instructor Reference)

This is a small **Node.js/Express** example that demonstrates:

- Secure login + registration (passwords hashed with **bcrypt**)
- Server-side sessions (stored in SQLite)
- CSRF protection on all forms
- A simple internal message system (compose/inbox/view)

## Quickstart

From this folder:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set `SESSION_SECRET` to a long random string.

3. (Optional) Seed demo users and a message:

   ```bash
   npm run seed
   ```

4. Run the server:

   ```bash
   npm start
   ```

Open `http://localhost:3000`.

## Demo Accounts (after seeding)

- `alice@bluemind.net` / `Password123!`
- `bob@bluemind.net` / `Password123!`

## Security Notes (what students should learn)

- **Never store plaintext passwords** — store a salted hash (bcrypt).
- **Use server-side sessions** with `httpOnly` cookies.
- **Use CSRF tokens** for any state-changing POST form.
- **Authorize every message read** (only recipient can view it).
- In real deployment you must run behind **HTTPS** and set session cookies `secure: true`.

## Project Structure

- `server.js` — Express app, security middleware, route wiring
- `db.js` — SQLite helpers + migrations
- `src/routes/auth.js` — login/register/logout
- `src/routes/messages.js` — inbox/message/compose
- `views/` — EJS templates
- `public/styles.css` — simple theme similar to the assignment screenshot
