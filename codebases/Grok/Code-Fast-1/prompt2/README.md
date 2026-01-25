# BlueMind v5

A sample web application demonstrating secure user authentication and encrypted password storage along with a messaging system between users.

## Features

- User registration and login with bcrypt password hashing
- Session-based authentication
- Private messaging between users
- Clean, corporate UI styled as BlueMind v5

## Installation

1. Clone or download the project.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the server.
4. Open `http://localhost:3001` in your browser.

## Usage

- Register a new account or login with existing credentials.
- After login, view received messages and send messages to other users.

## Security Notes

- Passwords are hashed using bcrypt.
- Sessions are managed securely.
- This is a sample application; in production, use HTTPS, stronger secrets, and database persistence.

## Technologies

- Node.js
- Express
- EJS
- bcrypt
- express-session