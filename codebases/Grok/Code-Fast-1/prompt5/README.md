# BlueMind v5 - Web Security Example Application

This is a Node.js example application demonstrating secure user authentication and message viewing functionality for teaching web security concepts.

## Features

- Secure user login with password hashing (bcrypt)
- Session-based authentication
- Message viewing for registered users
- Clean, corporate-style UI

## Installation

1. Clone or download the project.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the server.
4. Open `http://localhost:8080` in your browser.

## Usage

- Login with username `alice` or `bob`, password `password123`.
- View messages sent to the logged-in user.
- Logout to return to login page.

## Security Concepts Demonstrated

- Password hashing with bcrypt
- Session management
- Input validation
- Secure authentication flow

## Note

This is a demo application using in-memory storage. In production, use a proper database and follow security best practices.