# BlueMind v5 - Secure Authentication & Messaging System

An educational reference implementation demonstrating secure authentication and messaging capabilities built with Node.js, Express, and SQLite.

## 🔒 Security Features

This implementation demonstrates enterprise-grade security practices:

### Authentication Security
- **Password Hashing**: Uses bcrypt with configurable salt rounds (default: 12)
- **Account Lockout**: Configurable failed attempt limits and cooldown periods
- **Session Management**: Secure session handling with different timeouts for private/public computers
- **Rate Limiting**: Protection against brute force attacks
- **CSRF Protection**: Cross-Site Request Forgery prevention on all forms
- **Input Validation**: Comprehensive server-side validation using express-validator

### Application Security
- **SQL Injection Prevention**: Parameterized queries with SQLite3
- **XSS Protection**: Content Security Policy headers with Helmet.js
- **Security Headers**: Comprehensive HTTP security headers
- **Session Security**: HTTPOnly and Secure cookie flags
- **Environment Configuration**: Sensitive data managed through environment variables

### Logging & Monitoring
- **Login Attempt Tracking**: All authentication attempts logged with IP and user agent
- **Security Event Logging**: Failed login attempts and account lockouts tracked
- **Rate Limit Monitoring**: Request rate limiting per IP address

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/your/project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database with demo data:**
   ```bash
   npm run init-db
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   # or for production
   npm start
   ```

6. **Access the application:**
   - Open http://localhost:3000 in your browser
   - Use the demo credentials provided after database initialization

## 👥 Demo Users

After running `npm run init-db`, you'll have these demo accounts:

- **alice@bluemind.net** : SecurePass123!
- **bob@bluemind.net** : SecurePass456!
- **charlie@bluemind.net** : SecurePass789!

## 📁 Project Structure

```
├── config/
│   └── database.js          # SQLite database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   └── messages.js          # Message management routes
├── views/
│   ├── partials/            # EJS template partials
│   ├── login.ejs            # Login page (matches provided design)
│   ├── register.ejs         # User registration
│   ├── messages.ejs         # Message dashboard
│   ├── compose.ejs          # Compose new messages
│   ├── message-detail.ejs   # View individual messages
│   └── error.ejs            # Error page template
├── public/
│   ├── styles.css           # Custom CSS matching BlueMind design
│   └── bluemind-icon.svg    # Application icon
├── scripts/
│   └── init-db.js           # Database initialization script
├── database/
│   └── app.db               # SQLite database (created automatically)
└── server.js                # Main application server
```

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Session Security (CHANGE IN PRODUCTION!)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Database
DB_PATH=./database/app.db

# Security Settings
BCRYPT_ROUNDS=12                    # Password hashing strength
MAX_LOGIN_ATTEMPTS=5                # Failed attempts before lockout
LOGIN_COOLDOWN_MINUTES=15           # Lockout duration

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000         # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100         # Requests per window
```

### Database Schema

The application uses SQLite with the following tables:

- **users**: User accounts with security fields
- **messages**: User-to-user messages
- **login_attempts**: Security audit log

## 🛡️ Security Implementation Details

### Password Security
- Passwords hashed using bcrypt with configurable rounds
- Minimum password requirements enforced
- Failed login attempt tracking with account lockout

### Session Management
- Different session durations for private vs. public computers
- Secure cookie configuration
- Automatic session cleanup

### Input Validation
- Email format validation and normalization
- Password strength requirements
- Message content length limits
- HTML entity encoding for XSS prevention

### Rate Limiting
- Global application rate limiting
- Enhanced rate limiting for authentication endpoints
- IP-based request tracking

## 🧪 Educational Use

This implementation serves as a comprehensive example of:

1. **Secure Authentication Patterns**: Industry-standard login/logout flows
2. **Password Security**: Proper hashing and validation techniques
3. **Session Management**: Secure session handling
4. **Input Validation**: Comprehensive data validation strategies
5. **Security Headers**: HTTP security header implementation
6. **Rate Limiting**: Brute force attack prevention
7. **Audit Logging**: Security event tracking
8. **Error Handling**: Secure error response patterns

## 📚 Learning Objectives

Students will learn to implement:

- ✅ Secure user authentication with bcrypt password hashing
- ✅ Account lockout mechanisms for failed login attempts
- ✅ CSRF protection for form submissions
- ✅ Rate limiting to prevent abuse
- ✅ Secure session management
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ Security header configuration
- ✅ Audit logging for security events
- ✅ Environment-based configuration

## 🔍 Testing Security Features

### Test Account Lockout:
1. Attempt to login with incorrect password 5 times
2. Account should be temporarily locked
3. Check the console for lockout messages

### Test Rate Limiting:
1. Make multiple rapid requests to `/auth/login`
2. Should receive rate limit error after threshold

### Test CSRF Protection:
1. Try to submit forms without CSRF tokens
2. Should receive 403 Forbidden errors

## 🚨 Production Considerations

Before deploying to production:

1. **Change all default secrets** in `.env`
2. **Use HTTPS** in production (set `NODE_ENV=production`)
3. **Configure proper database** (consider PostgreSQL/MySQL for production)
4. **Set up proper logging** infrastructure
5. **Implement monitoring** and alerting
6. **Regular security updates** for dependencies
7. **Database backups** strategy
8. **Load balancing** for high availability

## 🤝 Contributing

This is an educational project. Contributions that enhance the security demonstrations or improve the learning experience are welcome.

## 📄 License

MIT License - This project is intended for educational purposes.

---

**Note**: This is a demonstration application for educational purposes. While it implements many security best practices, additional security measures would be required for production use.