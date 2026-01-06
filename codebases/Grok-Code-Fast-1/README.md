# Secure Mailer Example

This is a Node.js example application demonstrating secure user authentication and messaging functionality. It's designed as a teaching tool for students learning web development with a focus on security best practices.

## Features

- **Secure User Registration**: Passwords are hashed using bcrypt before storage
- **User Authentication**: Session-based login system
- **Message Exchange**: Users can send and receive messages
- **SQLite Database**: Lightweight database for storing users and messages

## Security Features

- Password hashing with bcrypt
- Session management for authentication
- Protection against SQL injection through parameterized queries
- Input validation

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Register a new account or login with existing credentials
2. View your inbox to see received messages
3. Compose and send messages to other users

## Project Structure

- `server.js`: Main application file with routes and database setup
- `views/`: EJS templates for the web interface
- `public/`: Static files (CSS)
- `mailer.db`: SQLite database (created automatically)

## Educational Notes

This example demonstrates:
- Setting up a Node.js web server with Express
- Implementing user authentication securely
- Using sessions for state management
- Database operations with SQLite
- Templating with EJS
- Basic security practices for web applications

Remember: This is a basic example for educational purposes. In production, additional security measures like HTTPS, rate limiting, and input sanitization would be necessary.