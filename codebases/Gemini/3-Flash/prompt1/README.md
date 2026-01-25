# BlueMind v5 Reference Project

This is a reference project for students to understand how to build a secure web application with Node.js, Express, and SQLite.

## Features
- **Secure Authentication**: Passwords are hashed using `bcrypt` before being stored in the database.
- **Session Management**: Uses `express-session` to keep users logged in.
- **Messaging System**: Users can send and receive private messages.
- **Responsive UI**: Designed to match the BlueMind v5 login template.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Server**:
   ```bash
   node app.js
   ```

3. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `app.js`: Main application logic and routing.
- `database.js`: Database initialization and schema.
- `public/`: Static files (CSS).
- `views/`: EJS templates for the UI.

## Security Concepts Covered
- Password hashing (OWASP standard).
- Session-based authentication.
- SQL protection (via parameterized queries).
- Protected routes (Dashboard).
