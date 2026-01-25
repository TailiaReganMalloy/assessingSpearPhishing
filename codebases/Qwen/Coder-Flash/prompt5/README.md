# BlueMind v5 - Web Security Educational Application

This is a Node.js web application designed for teaching web security concepts including:
- User authentication
- Secure password management
- Messaging between registered users

## Features Implemented

1. **Secure Login System**
   - Username/password authentication
   - Password hashing using bcrypt
   - Session management with express-session
   - Different security considerations for private vs public computers

2. **Message Viewing Functionality**
   - Secure access to user messages
   - Role-based access control
   - Message filtering by user

3. **Security Concepts Demonstrated**
   - Password hashing
   - Session management
   - CSRF protection (conceptual)
   - Secure cookies
   - Input validation

## Project Structure

```
.
├── server.js          # Main application server
├── package.json       # Dependencies and scripts
├── test.sh            # Test script to verify setup
├── public/
│   └── login.html     # Login page UI
└── views/
    └── messages.ejs   # Messages page template
```

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

```bash
node server.js
```

The application will be available at `http://localhost:3000`

## Default Users

- **Admin**: username: `admin`, password: `password`
- **User**: username: `user1`, password: `password`

## Security Features Implemented

1. **Password Security**
   - Passwords are hashed using bcrypt before storage
   - Salted hashes prevent rainbow table attacks

2. **Session Security**
   - Sessions stored securely with HTTPOnly cookies
   - Session timeout after 24 hours of inactivity

3. **Input Validation**
   - Basic input sanitization
   - Form validation

4. **Access Control**
   - Users can only view their own messages
   - Authentication required for all protected routes

## Educational Use Cases

This application demonstrates:
- How to implement secure authentication
- The importance of password hashing
- Session management best practices
- Role-based access control
- Secure cookie configuration
- Preventing unauthorized access to resources

## Important Notes for Students

1. This is a simplified demonstration application for educational purposes
2. In production, you would need to:
   - Use a proper database instead of in-memory storage
   - Implement proper CSRF protection
   - Add rate limiting
   - Use HTTPS in production
   - Implement more robust input validation
   - Add logging and monitoring
   - Use environment variables for secrets