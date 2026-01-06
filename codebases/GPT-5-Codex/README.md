# BlueMind Secure Messaging Reference

This project is a compact Node.js example that mirrors the BlueMind v5 login styling while showing students how to build a secure login workflow with a simple inbox. It uses Express, SQLite, and server-side rendered EJS templates so the full stack fits into one codebase for easy review in class.

## Features Highlighted

- Passwords stored with unique `bcrypt` hashes (12 rounds by default).
- Session cookies backed by SQLite and protected with `httpOnly`, `sameSite`, and (in production) `secure` flags.
- CSRF protection applied to every form via `csurf` middleware.
- Helmet adds a helpful baseline of secure HTTP headers.
- Input validation, graceful auth errors, and database seeding for quick demos.

## Getting Started

```bash
npm install
npm run dev
```

The server listens on `http://localhost:3000` by default. Nodemon reloads automatically in dev mode.

## Demo Accounts

The database seeds itself the first time the server runs. Each sample user shares the password `Pa55word!`:

- `alice@example.com`
- `ben@example.com`
- `chloe@example.com`

Log in as Alice to see messages waiting in the inbox, then switch to another account to test the compose flow.

## Teaching Tips

- Walk through `server.js` top-to-bottom to spotlight how authentication ties together.
- Ask learners to extend the project with password resets, message search, or file attachments after reviewing security implications.
- Emphasize that production deployments must run behind HTTPS proxies and use long random secrets provided through environment variables.

## Folder Layout

```
.
├── data/              # SQLite databases (created automatically)
├── public/styles.css  # Login and app styling inspired by BlueMind
├── views/             # EJS templates for login, inbox, compose, error
├── server.js          # Express app, DB bootstrapper, routes
└── package.json
```

Feel free to adapt and extend this reference to suit your classroom exercises.
