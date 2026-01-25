# Secure Login and Messaging Demo

This is a demonstration web application for teaching secure login mechanisms, safe password storage, and inter-user messaging.

## Features
- Secure user registration and login using bcrypt for password hashing.
- JWT-based authentication.
- Inter-user messaging stored in SQLite database.
- Styled like a government mailer login page with blue theme.

## Setup
1. Install dependencies: `npm install`
2. Update `.env` with your JWT_SECRET.
3. Run the app: `npm start`
4. Access at `http://localhost:3000`

## Security Notes
- Passwords are hashed with bcrypt (salt rounds: 12).
- JWT tokens expire in 1 hour.
- Use HTTPS in production.
- Database is SQLite for simplicity; use PostgreSQL/MySQL in production.

## Educational Points
- **Secure Storage**: Never store plain passwords; use hashing.
- **Authentication**: Use tokens instead of sessions for stateless auth.
- **Input Validation**: Sanitize inputs to prevent SQL injection (using parameterized queries).
