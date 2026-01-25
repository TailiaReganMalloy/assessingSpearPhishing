# Secure Authentication & Messaging Reference Implementation

This project is a Node.js reference implementation for a secure authentication and user-to-user messaging system, inspired by the BlueMind v5 interface. It demonstrates best practices for password storage and session management.

## Features

- **Secure Password Hashing**: Uses `bcryptjs` with a cost factor of 10 to securely hash passwords before storing them in the database.
- **Session Management**: Uses `express-session` for secure user sessions.
- **Relational Database**: Uses `sqlite3` to store users and their respective messages.
- **Responsive UI**: A CSS implementation that mimics the BlueMind login screen.

## Prerequisites

- Node.js installed on your system.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Server**:
   ```bash
   node server.js
   ```

3. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Credentials

The database is pre-seeded with the following users:

| Email | Password |
|-------|----------|
| `admin@bluemind.net` | `password123` |
| `user1@bluemind.net` | `user1pass` |
| `user2@bluemind.net` | `user2pass` |

## Educational Objectives

- **Bcrypt Hashing**: Observe how `bcrypt.hash()` and `bcrypt.compare()` are used to handle credentials without storing plain-text passwords.
- **SQL Joins**: The messaging system demonstrates a `JOIN` operation to retrieve sender information along with message content.
- **Middleware**: The `isAuthenticated` middleware shows how to protect private routes.
