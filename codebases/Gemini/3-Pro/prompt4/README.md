# Secure Messaging App Demo

This is a demonstration Node.js application for a software engineering curriculum. It features secure login, password hashing, and inter-user messaging.

## Features
- **Secure Authentication**: Uses `bcrypt` for password hashing.
- **Session Management**: Uses `express-session` for maintaining user state.
- **SQL Injection Protection**: Uses parameterized queries with `sqlite3`.
- **Messaging**: Users can send and receive messages.

## Prerequisites
- Node.js installed.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser to `http://localhost:3000`.

## Default Credentials
For demonstration, a user is automatically seeded into the database:
- **Email**: `email@bluemind.net`
- **Password**: `password123`

You can also register new users via the registration link on the login page.
