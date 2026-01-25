# BlueMind Security Demo Application

An educational Node.js web application demonstrating secure user authentication, session management, and messaging functionality with comprehensive security features.

## 🎯 Educational Purpose

This application is designed for teaching web security concepts including:
- Secure user authentication and authorization
- Password security and hashing best practices
- Session management and security
- Input validation and sanitization
- Protection against common web vulnerabilities
- Security logging and monitoring

## 🔒 Security Features Implemented

### 1. Authentication Security
- **Password Hashing**: bcrypt with configurable rounds (default: 12)
- **Account Lockout**: Progressive lockout after failed login attempts
- **Rate Limiting**: Prevents brute force attacks
- **Session Duration**: Different timeouts for private vs public computers
- **Secure Session Management**: HTTP-only, secure cookies with SameSite protection

### 2. Input Security
- **Input Validation**: Server-side validation using express-validator
- **XSS Prevention**: HTML sanitization for user-generated content
- **SQL Injection Prevention**: Parameterized queries with SQLite
- **CSRF Protection**: Cross-site request forgery protection on all forms

### 3. Application Security
- **Security Headers**: Helmet.js for comprehensive security headers
- **Content Security Policy**: Strict CSP to prevent code injection
- **Error Handling**: Secure error messages without information disclosure
- **Security Logging**: Comprehensive logging of security events

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn package manager

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /path/to/project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your configurations
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

5. **Access the application:**
   - Open browser to: http://localhost:3000

### Demo Credentials

The application comes with pre-configured demo users:

| Email | Password | Role |
|-------|----------|------|
| admin@bluemind.net | SecurePass123! | Admin |
| user1@bluemind.net | UserPass456! | User |
| user2@bluemind.net | TestPass789! | User |

## 🏗️ Project Structure

```
bluemind-security-demo/
├── server.js              # Main application server
├── package.json            # Dependencies and scripts
├── .env                   # Environment configuration
├── database/
│   ├── database.js        # Database initialization and setup
│   └── bluemind.db        # SQLite database (auto-created)
├── middleware/
│   └── security.js        # Security middleware functions
├── routes/
│   ├── auth.js           # Authentication routes
│   └── messages.js       # Messaging routes
├── views/
│   ├── login.ejs         # Login page template
│   ├── register.ejs      # Registration page template
│   ├── dashboard.ejs     # Dashboard template
│   ├── compose.ejs       # Message composition template
│   └── message.ejs       # Message view template
└── public/
    └── css/
        └── styles.css     # Application styles (BlueMind themed)
```

## 🛡️ Security Concepts Demonstrated

### 1. Password Security
```javascript
// Secure password hashing with bcrypt
const hashedPassword = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### 2. Session Security
```javascript
// Secure session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: computerType === 'private' ? 24*60*60*1000 : 30*60*1000
}));
```

### 3. Input Validation
```javascript
// Server-side validation
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
```

### 4. XSS Prevention
```javascript
// HTML sanitization
const sanitizedContent = sanitizeHtml(userInput, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: {}
});
```

## 📚 Educational Features

### Security Event Logging
All security-relevant events are logged to the console with detailed information:
- Login attempts (successful and failed)
- Account lockouts
- Session creation and destruction
- Message sending and reading
- Security violations

### Interactive Security Dashboard
The dashboard displays:
- Current session security information
- Real-time security statistics
- Educational security tips
- Session duration warnings for public computers

### Progressive Security Measures
- **Rate Limiting**: Demonstrates protection against brute force attacks
- **Account Lockout**: Shows progressive security measures
- **Session Management**: Different timeouts based on computer trust level
- **CSRF Protection**: Form-based attack prevention

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_PATH=./database/bluemind.db

# Security
SESSION_SECRET=your-super-secret-session-key
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOGIN_ATTEMPT_WINDOW=15

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=5

# Application
PORT=3000
NODE_ENV=development
```

### Security Headers
The application automatically sets secure headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- X-XSS-Protection

## 🧪 Testing Security Features

### 1. Test Rate Limiting
1. Go to login page
2. Make 5+ failed login attempts quickly
3. Observe rate limiting kick in

### 2. Test Account Lockout
1. Make 5 failed login attempts for the same account
2. Account gets temporarily locked
3. Try logging in with correct credentials (should be blocked)

### 3. Test Session Duration
1. Login with "Public Computer" selected
2. Session expires in 30 minutes
3. Login with "Private Computer" selected
4. Session lasts 24 hours

### 4. Test CSRF Protection
1. Try submitting forms without CSRF token
2. Observe protection in action

### 5. Test XSS Prevention
1. Try sending messages with HTML/JavaScript content
2. Content gets sanitized automatically

## 🎓 Learning Objectives

After working with this application, students should understand:

1. **Authentication Security**
   - Importance of password hashing
   - Account lockout mechanisms
   - Session management best practices

2. **Input Validation**
   - Server-side validation necessity
   - XSS attack vectors and prevention
   - SQL injection prevention techniques

3. **Session Security**
   - Secure cookie configuration
   - Session duration considerations
   - CSRF attack prevention

4. **Security Headers**
   - Content Security Policy implementation
   - Browser security feature utilization
   - Defense in depth strategies

5. **Security Logging**
   - Event tracking for security analysis
   - Incident response preparation
   - Security monitoring practices

## ⚠️ Security Notes

This application is designed for educational purposes and includes:

- **Visible Security Information**: Security details are intentionally exposed for learning
- **Demo Credentials**: Pre-configured users with known passwords
- **Development Settings**: Some features optimized for learning over production security
- **Verbose Logging**: Detailed security event logging for educational insight

## 🚨 Production Considerations

For production deployment, consider:

1. **Environment Security**
   - Use strong, unique SESSION_SECRET
   - Enable HTTPS (secure cookies)
   - Set NODE_ENV=production
   - Use environment-specific database

2. **Database Security**
   - Use production database (PostgreSQL/MySQL)
   - Enable database authentication
   - Regular security updates
   - Database connection encryption

3. **Application Security**
   - Remove demo users and credentials
   - Implement proper user management
   - Add comprehensive input validation
   - Enable production error handling
   - Implement security monitoring

4. **Infrastructure Security**
   - Use HTTPS/TLS certificates
   - Configure proper firewall rules
   - Regular security updates
   - Monitoring and alerting

## 🤝 Contributing

This is an educational project. Contributions that enhance the learning experience are welcome:

- Additional security feature demonstrations
- Enhanced documentation
- Security test cases
- UI/UX improvements for educational clarity

## 📄 License

MIT License - This project is intended for educational purposes.

## 🔗 Educational Resources

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Web Security Academy](https://portswigger.net/web-security)

---

**Remember**: This application demonstrates security concepts for educational purposes. Always follow current security best practices for production applications.