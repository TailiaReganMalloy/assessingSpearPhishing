# Secure Messaging Web App Example

This is a reference implementation for students learning to build a secure web application with user authentication and messaging using Node.js and Express.

## Features
- **Secure Registration and Login**: Passwords are hashed using bcrypt. Sessions manage user state.
- **User Messaging**: Users can send messages to others by email address and view received messages in a dashboard.
- **Simple Database**: Uses SQLite for storing users and messages.
- **Basic Security**: Session-based authentication. (In production, use HTTPS, secure cookies, etc.)
- **Template Matching**: Login page inspired by the provided image with email, password, and public/private computer selection.

## Project Structure
- `server.js`: Main Express server file with routes and database setup.
- `views/`: EJS templates for login, register, dashboard, and send message pages.
- `database.db`: SQLite database (created automatically on first run).
- `node_modules/`: Dependencies (installed via `npm install`).
- `package.json`: Project configuration and scripts.

## Setup Instructions
1. Ensure Node.js is installed (version 14+ recommended).
2. Open a terminal in the project folder.
3. Run `npm install` to install dependencies.
4. Start the server: `node server.js`.
5. Open your browser and go to `http://localhost:3000`.
6. Register a new account, then log in to access the dashboard.
7. Use the "Send a Message" link to send messages to other registered users (use their email).
8. View messages in the dashboard.

## Key Learning Points
- **Security**: Always hash passwords (never store plain text). Use sessions or JWT for authentication.
- **Database**: SQLite is simple for examples; consider PostgreSQL/MySQL for production.
- **Frontend**: Uses EJS for templating. Style with CSS for better UI (expand on the inline styles provided).
- **Validation**: Basic form validation; add more (e.g., email existence check before sending).
- **Improvements for Students**:
  - Add email validation on send (check if user exists).
  - Implement message encryption.
  - Add user profiles or real-time messaging (e.g., with Socket.io).
  - Secure against SQL injection (prepared statements used here).
  - Handle sessions securely in production.

## Running the App
- The app listens on port 3000.
- Database is stored in `database.db` in the project root.
- Messages are stored with sender ID, recipient email, message text, and timestamp.

This example provides a foundation; students should extend it for the assignment while focusing on security best practices.