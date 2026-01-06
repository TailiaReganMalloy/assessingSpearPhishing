# Mailer Sample (Teaching Example)

This is a minimal, **teaching** example that demonstrates secure patterns for:
- password hashing with bcrypt ✅
- session-based authentication with secure cookie settings ✅
- CSRF protection via `csurf` ✅
- rate limiting for auth endpoints ✅
- input validation with `express-validator` ✅
- storing messages and users in SQLite ✅

## Quick start

1. Copy `.env.example` to `.env` and set `SESSION_SECRET` to a long random value.
2. Install dependencies:

   npm install

3. Seed example users:

   npm run seed

4. Start the server:

   npm start

5. Open http://localhost:3000

Example accounts from seed:
- alice@example.com / password1
- bob@example.com / password2

## Security notes for students

- Never store plaintext passwords; always hash with a strong algorithm (bcrypt/argon2).
- Set `NODE_ENV=production` and run behind HTTPS in production so session cookies with `secure: true` are sent.
- Use proper session stores and rotate `SESSION_SECRET`.
- Validate and sanitize all input, protect against CSRF and brute-force attacks.

This repo is intentionally minimal so students can experiment and extend it (e.g., add email verification, 2FA, encrypted message storage).
