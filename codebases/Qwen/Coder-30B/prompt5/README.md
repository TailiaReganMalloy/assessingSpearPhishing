# BlueMind v5 - Secure Web Application

This is a Node.js web application designed for teaching web security concepts including:
- User authentication
- Secure password management
- Messaging between registered users
- CSRF protection
- Rate limiting
- HTTP security headers

## Features Implemented

1. **User Authentication**
   - Secure login with password hashing using bcrypt
   - Session management with express-session
   - Role-based access (admin/user)

2. **Message System**
   - View messages between users
   - Secure message handling

3. **Security Measures**
   - CSRF protection (using deprecated csurf package)
   - Rate limiting to prevent brute force attacks
   - HTTP security headers with helmet
   - Password hashing for secure storage

## Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

```bash
npm start
```

The application will be available at http://localhost:3000

## Educational Notes

### Security Concepts Demonstrated

1. **Password Security**: Passwords are stored using bcrypt hashing with salt
2. **Session Management**: Sessions are securely managed with proper cookie settings
3. **CSRF Protection**: While csurf is deprecated, this demonstrates the concept
4. **Rate Limiting**: Prevents brute force attacks on login
5. **HTTP Headers**: Security headers are set using helmet

### Important Security Notes

1. **CSRF Package Deprecation**: The `csurf` package is deprecated. In production, consider using alternative approaches or frameworks with built-in CSRF protection.
2. **Secret Keys**: In production, store secrets in environment variables, not hardcoded.
3. **HTTPS**: The application uses HTTP in development. Always use HTTPS in production.
4. **Database Storage**: This demo uses in-memory storage. Production applications should use a proper database.

## Users

- Admin user: admin / password123
- Regular user: user1 / password123

## Files Structure

- `server.js` - Main application entry point
- `public/style.css` - Styling for the application