# BlueMind v5 - Secure Authentication and Messaging Demo

This is a reference implementation for a web programming course demonstrating secure user authentication with password hashing and user-to-user messaging capabilities.

## Features

- Secure login with bcrypt password hashing
- Session-based authentication
- User-to-user messaging system
- Clean, corporate-style UI

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and navigate to `http://localhost:8080`

## Sample Users

The application comes pre-loaded with sample users:
- Username: `alice`, Password: `password`
- Username: `bob`, Password: `password`
- Username: `charlie`, Password: `password`

## Usage

1. Visit the login page and enter credentials for one of the sample users.
2. After logging in, you'll see messages sent to that user from others.
3. Click "Logout" to end the session.

## Security Features

- Passwords are hashed using bcrypt with salt rounds.
- Sessions are used for authentication state.
- SQL injection prevention with parameterized queries.

## Technologies Used

- Node.js
- Express.js
- SQLite3
- bcrypt
- express-session
- EJS templating
- CSS for styling

## Educational Notes

This implementation demonstrates:
- Proper password hashing and verification
- Session management
- Database interactions with SQLite
- Basic web application structure
- Frontend-backend separation