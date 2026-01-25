# Secure Messaging Application

An educational web application demonstrating secure authentication, password storage, and inter-user messaging. Built with Node.js and designed to teach best practices in web security.

## Features

### 🔐 Security
- **Password Hashing**: Using bcryptjs with 10 salt rounds (never stored in plain text)
- **JWT Authentication**: Secure token-based authentication
- **HTTPOnly Cookies**: Session tokens stored securely
- **CSRF Protection**: SameSite cookie policy
- **Session Management**: Token expiration based on device type (1 hour for public, 7 days for private)
- **Input Validation**: Server-side validation for all inputs

### 👤 User Management
- User registration with email validation
- Secure login mechanism
- Private vs. Public computer option
- User profile information
- Last login tracking

### 💬 Messaging System
- Send messages between users
- Inbox management
- Read/Unread status
- Message deletion
- Recipient selection from user list

### 📊 Technical Stack
- **Backend**: Express.js (Node.js)
- **Database**: SQLite3
- **Authentication**: JWT + bcryptjs
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Security**: CORS, cookie-parser, helmet-ready

## Project Structure

```
prompt4/
├── server.js                 # Main application entry point
├── db.js                     # Database initialization & connection
├── middleware.js             # JWT authentication middleware
├── package.json              # Dependencies
├── .env                      # Environment variables
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── messages.js          # Messaging API endpoints
│   ├── users.js             # User management endpoints
│   └── docs.js              # API documentation
└── public/
    ├── index.html           # Login & registration page
    └── dashboard.html       # Messaging dashboard
```

## Installation

### Prerequisites
- Node.js (v14+)
- npm

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** (optional)
   Edit `.env` file to customize:
   - `PORT` - Server port (default: 3000)
   - `JWT_SECRET` - JWT signing key (required in production)
   - `NODE_ENV` - Environment mode

3. **Run the server**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to: `http://localhost:3000`

## Usage

### Registration
1. Click "Don't have an account? Register here"
2. Fill in your details (Name, Email, Password)
3. Password must be at least 8 characters
4. Submit to create account

### Login
1. Enter your email and password
2. Choose "Private computer" (7-day session) or "Public computer" (1-hour session)
3. Click "Connect"

### Messaging
1. Go to "Compose" to send a message
2. Select a recipient from the dropdown
3. Enter subject and message body
4. Click "Send Message"
5. View received messages in "Inbox"
6. View sent messages in "Sent"

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

### Messages (Protected Routes)
- `GET /api/messages` - Get inbox messages
- `GET /api/messages/sent` - Get sent messages
- `GET /api/messages/:id` - Get message detail
- `POST /api/messages` - Send new message
- `DELETE /api/messages/:id` - Delete message

### Users (Protected Routes)
- `GET /api/users` - List all users
- `GET /api/users/profile/:id` - Get user profile

## Security Best Practices Demonstrated

### Password Security
- **Never stored in plain text** - hashed using bcryptjs
- **10 salt rounds** - Makes rainbow table attacks impractical
- **Unique hashes** - Same password produces different hashes
- **Minimum length requirement** - 8 characters enforced

### Authentication Security
- **JWT tokens** - Stateless authentication
- **Token expiration** - Different timeouts based on device trust level
- **HTTPOnly cookies** - Prevents JavaScript access to tokens
- **Secure cookies** - HTTPS only in production
- **SameSite policy** - CSRF attack prevention

### Session Management
- **Database storage** - Session tracking
- **IP logging** - Detect unusual login locations (optional enhancement)
- **Device trust** - Different token lifespans for public vs. private
- **Logout** - Session invalidation

### Data Protection
- **Input validation** - Server-side validation
- **Email validation** - Regex pattern verification
- **SQL injection prevention** - Parameterized queries
- **XSS prevention** - HTML escaping in frontend

## Learning Objectives

This application teaches students:
1. How to properly hash passwords
2. JWT-based authentication flow
3. Session management and token expiration
4. Secure cookie handling
5. Protected API routes
6. User-to-user messaging architecture
7. Database design for user and message storage
8. Front-end form validation and user experience
9. Error handling and security boundaries
10. Trust models (private vs. public computers)

## Testing the Application

### Create Test Users
```bash
# The app will create users via the registration form
# Or manually insert into database:

sqlite3 app.db
INSERT INTO users (email, password_hash, full_name) VALUES 
  ('user1@example.com', '$2a$10$...', 'Alice Smith'),
  ('user2@example.com', '$2a$10$...', 'Bob Jones');
```

### Sample Workflow
1. Register two users
2. Login as user 1
3. Send a message to user 2
4. Logout
5. Login as user 2
6. Read the message from user 1
7. Reply to user 1

## Security Warnings for Production

⚠️ **Before deploying to production:**

1. **Change JWT_SECRET** - Generate a strong random secret
2. **Use HTTPS** - Set `secure: true` in cookie options
3. **Database** - Switch to PostgreSQL/MySQL with encryption
4. **Rate limiting** - Add rate limiting to auth endpoints
5. **CORS** - Configure appropriate CORS origins
6. **Helmet.js** - Add security headers
7. **Logging** - Implement security event logging
8. **Monitoring** - Track failed login attempts
9. **2FA** - Consider adding two-factor authentication
10. **Password reset** - Implement secure password reset flow

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email
- [ ] Message encryption end-to-end
- [ ] Message attachments
- [ ] User avatars
- [ ] Message search
- [ ] Bulk message operations
- [ ] Admin dashboard
- [ ] Audit logging
- [ ] API rate limiting
- [ ] User roles and permissions
- [ ] Message threading/conversations

## License

MIT - Educational use

## References

- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [JWT.io](https://jwt.io/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Educational Project** - For learning purposes only. Not recommended for production use without significant security hardening.
