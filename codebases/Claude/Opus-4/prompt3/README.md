# BlueMind - Secure Messaging Platform (Educational Example)

A Node.js reference implementation demonstrating secure authentication systems with proper password hashing and user-to-user messaging capabilities.

## 🎓 Educational Purpose

This project is designed for web programming courses to teach:
- Secure authentication practices
- Password hashing with bcrypt
- JWT token-based authentication
- Session management
- Input validation and sanitization
- Rate limiting and security headers
- User-to-user messaging systems

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## 📝 Demo Accounts

Use these pre-configured accounts to test the system:

- **Alice**: `alice@bluemind.net` / `SecurePass123!`
- **Bob**: `bob@bluemind.net` / `StrongPass456!`
- **Demo User**: `demo@bluemind.net` / `DemoPass789!`

## 🔒 Security Features

### 1. Password Security
- Bcrypt hashing with configurable rounds
- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Password strength checker endpoint

### 2. Authentication
- JWT tokens for session management
- Secure cookie storage with httpOnly flag
- Token expiration and refresh
- "Remember Me" functionality

### 3. Rate Limiting
- Global rate limiting for all endpoints
- Stricter rate limiting for authentication endpoints
- Account lockout after failed login attempts
- Configurable lockout duration

### 4. Security Headers
- Helmet.js for comprehensive security headers
- Content Security Policy (CSP)
- XSS protection
- MIME type sniffing prevention

### 5. Input Validation
- Express-validator for input sanitization
- Email validation and normalization
- SQL injection prevention (though using in-memory DB)
- XSS prevention

## 🏗️ Project Structure

```
├── server.js              # Main server file with Express setup
├── database.js            # In-memory database simulation
├── middleware/
│   └── auth.js           # Authentication middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   └── messages.js       # Messaging routes
├── public/
│   ├── index.html        # Login page
│   ├── dashboard.html    # Main messaging interface
│   ├── styles.css        # Application styles
│   ├── app.js            # Login page JavaScript
│   └── dashboard.js      # Dashboard JavaScript
├── .env                  # Environment configuration
├── package.json          # Project dependencies
└── README.md            # This file
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/check-password-strength` - Password strength checker

### Messages (Protected)
- `GET /api/messages` - Get all messages
- `GET /api/messages/inbox` - Get inbox messages
- `GET /api/messages/sent` - Get sent messages
- `POST /api/messages/send` - Send a new message
- `PATCH /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete a message
- `GET /api/messages/users` - Get list of users
- `GET /api/messages/stats` - Get message statistics

## ⚙️ Configuration

Environment variables in `.env`:

```env
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
JWT_EXPIRE=24h
NODE_ENV=development
BCRYPT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_DURATION=15
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testing Security Features

### 1. Test Rate Limiting
Try logging in with wrong credentials multiple times to see rate limiting in action.

### 2. Test Account Lockout
After 5 failed login attempts, the account will be locked for 15 minutes.

### 3. Test Password Strength
Use the password strength checker when creating new accounts.

### 4. Test JWT Expiration
Tokens expire after 24 hours (or 30 days with "Remember Me").

## ⚠️ Important Notes

1. **Educational Use Only**: This implementation uses an in-memory database and is not suitable for production use.

2. **Database**: In a real application, use a proper database like PostgreSQL or MongoDB.

3. **HTTPS**: Always use HTTPS in production to encrypt data in transit.

4. **Environment Variables**: Never commit `.env` files with real secrets to version control.

5. **Additional Security**: Consider implementing:
   - Two-factor authentication (2FA)
   - CAPTCHA for login forms
   - Email verification
   - Password reset functionality
   - Audit logging
   - GDPR compliance features

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for your own teaching purposes.

## 📄 License

MIT License - Feel free to use this for educational purposes.

---

**Remember**: Security is an ongoing process. Always stay updated with the latest security best practices and vulnerabilities.