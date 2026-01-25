# Secure Mailer Demo (Node.js)

Educational example showing secure login, hashed passwords, and a simple inbox UI inspired by the BlueMind template.

## Features
- Express + EJS views
- Password hashing with bcrypt
- Session-based authentication
- SQLite storage for users and messages
- Helmet security headers + login rate limiting
- Input validation with express-validator

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open http://localhost:3000

## Demo Accounts
- alice@bluemind.test / BlueMind123!
- ben@bluemind.test / Mailbox456!

## Notes
- This is for classroom use only.
- Replace `SESSION_SECRET` with a secure value in production.
- Add CSRF protection and a persistent session store before deploying for real use.
