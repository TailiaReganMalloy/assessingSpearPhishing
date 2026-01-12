# BlueMind v5

A secure web application for user login and messaging, built with Node.js, Express.js, and MongoDB.

## Overview

BlueMind v5 is designed as a reference project for students learning to build secure web applications. It features user authentication with session management and secure password storage, as well as a messaging system for users to communicate with each other.

## Features

- **User Authentication**: Secure registration and login with password hashing using bcrypt.
- **Session Management**: Uses JSON Web Tokens (JWT) for secure session handling.
- **Messaging System**: Allows users to send and receive messages, with read/unread status.
- **Responsive Design**: Clean, corporate UI with a dark blue theme and centered login panel.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   - Create a `.env` file with necessary environment variables (MongoDB URI, JWT secret, session secret).

3. **Run the Application**:
   ```bash
   node app.js
   ```
   - The server will start on port 3000 by default.

4. **Access the Application**:
   - Open a browser and navigate to `http://localhost:3000`.

## Usage

- **Register**: Create a new account with a unique username and password.
- **Login**: Access your account using your credentials. Choose between private or public computer for session duration.
- **Dashboard**: View received messages and send new messages to other users.
- **Logout**: End your session securely.

## Security Considerations

- Passwords are hashed using bcrypt before storage.
- Sessions are managed with JWT, ensuring secure user authentication.
- For production, ensure HTTPS is enabled by setting `cookie.secure` to `true` in the session configuration.

## Project Structure

- `models/`: Database schemas for users and messages.
- `routes/`: API endpoints for authentication and messaging.
- `controllers/`: Logic for handling requests.
- `middleware/`: Authentication checks for protected routes.
- `views/`: EJS templates for rendering UI.
- `public/`: Static files like CSS for styling.

## License

This project is for educational purposes and not licensed for commercial use.
