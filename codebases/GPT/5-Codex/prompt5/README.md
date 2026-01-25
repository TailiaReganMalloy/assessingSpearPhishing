# BlueMind Secure Messaging Demo

This Node.js reference project demonstrates foundational web security practices for a login and messaging workflow inspired by the BlueMind interface. Use it to support lessons on authentication, password management, and secure message delivery.

## Features

- Email and password login backed by bcrypt hashing and salted secrets
- Session management with signed cookies stored in SQLite for persistence
- CSRF protection and HTTP headers hardening via csurf and helmet
- Inbox view restricted to authenticated users with parameterized SQL queries
- Seed script that provisions demo accounts and example spear-phishing messages

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create an environment file:
   ```bash
   cp .env.example .env
   # Edit SESSION_SECRET with a unique random value
   ```
3. Seed the database with demo users and messages:
   ```bash
   npm run db:seed
   ```
4. Launch the development server:
   ```bash
   npm run dev
   ```
5. Visit http://localhost:3000 and sign in with:
   - Email: alex.martin@bluemind.net
   - Password: BlueMindPass!2024

## Pedagogical Notes

- **Password storage**: Review src/db/userRepository.js and src/scripts/seed.js to analyze bcrypt hashing and why plaintext passwords never enter the database.
- **Session security**: Inspect src/config/session.js for cookie flags (httpOnly, sameSite, secure) and discuss mitigation against fixation and theft.
- **CSRF defenses**: Point students to src/app.js and src/views to understand token issuance and form embedding.
- **Least privilege SQL**: Highlight the use of positional parameters in database queries to avoid injection vulnerabilities.
- **Interface cues**: Compare src/views/login.ejs and src/public/css/style.css with the original BlueMind layout to discuss trustworthy branding versus phishing lookalikes.

## Folder Overview

- src/app.js – Express bootstrap, security middleware, and route wiring
- src/controllers – Authentication and messaging request handlers
- src/db – SQLite connection plus repositories for users and messages
- src/public – Static assets (CSS and SVG logo) recreating the BlueMind sign-in aesthetic
- src/scripts/seed.js – Generates demo data for classroom walkthroughs

## Suggested Exercises

1. Extend the interface to allow composing and sending new messages, enforcing input validation.
2. Add rate limiting and account lockout rules, then analyze usability versus security trade-offs.
3. Integrate a second-factor challenge after password verification to demonstrate MFA concepts.
