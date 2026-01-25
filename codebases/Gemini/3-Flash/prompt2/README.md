# Secure Authentication & Messaging System (BlueMind Clone)

This sample project is designed for computer science students to study secure authentication, encrypted password storage, and basic user-to-user messaging.

## Key Features
- **Secure Authentication**: Uses `express-session` for session management.
- **Password Hashing**: Passwords are never stored in plain text. We use `bcryptjs` with a salt round of 10 to hash passwords before storing them in the SQLite database.
- **Session Management**: Securely tracks log-in status.
- **Database Architecture**: Uses `better-sqlite3` for an efficient, file-based relational database.
- **Styling**: UI is inspired by the BlueMind login system.

## Setup Instructions
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run the Server**:
   ```bash
   node server.js
   ```
3. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `server.js`: The main application logic and Express routes.
- `db.js`: Database initialization and connection logic.
- `views/`: EJS templates for the frontend.
- `public/`: Static CSS and assets.
- `data/`: Location of the SQLite database file.

## Learning Objectives
- Understand how `bcrypt` helps prevent password data leaks.
- Learn how to implement protected routes using middleware.
- Practice basic SQL queries for a messaging system.
