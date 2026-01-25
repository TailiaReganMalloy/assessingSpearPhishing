# BlueMind v5 - Secure Messaging System

A comprehensive Node.js web application demonstrating secure user authentication and encrypted password storage with messaging functionality. This educational project showcases modern web security practices for computer science students.

## 🎯 Educational Objectives

This application demonstrates the following security concepts:

### 🔒 Authentication & Authorization
- **Password Hashing**: Uses bcrypt with configurable salt rounds (default: 12)
- **Session Management**: Secure HTTP-only cookies with configurable expiration
- **Rate Limiting**: Prevents brute force attacks on login endpoints
- **Input Validation**: Server-side validation using express-validator

### 🛡️ Security Features
- **CSRF Protection**: Built-in CSRF token validation
- **Content Security Policy**: Helmet.js security headers
- **SQL Injection Prevention**: Parameterized queries with SQLite
- **Session Security**: Secure session configuration with proper flags
- **Password Strength Validation**: Client-side and server-side password requirements

### 💬 Messaging System
- **Secure Message Storage**: Encrypted session-based message handling
- **User-to-User Messaging**: Send and receive messages between registered users
- **Message Validation**: Input sanitization and length limits
- **Real-time Features**: Auto-refresh and draft saving capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd /path/to/project/directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database with sample data**
   ```bash
   npm run init-db
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Use one of the sample accounts to login

## 👤 Sample Accounts

The database initialization creates the following accounts for testing:

| Email | Password | Role |
|-------|----------|------|
| professor@bluemind.net | SecurePass123! | Professor |
| student1@bluemind.net | StudentPass1! | Student |
| student2@bluemind.net | StudentPass2! | Student |
| admin@bluemind.net | AdminSecure456! | Admin |

> ⚠️ **Security Note**: These are sample accounts for educational purposes. Change passwords in production!

## 📁 Project Structure

```
├── server.js              # Main application server
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (DO NOT COMMIT)
├── database/             
│   └── app.db            # SQLite database (auto-created)
├── scripts/
│   └── init-database.js  # Database initialization script
├── views/                # EJS templates
│   ├── login.ejs         # Login page
│   ├── register.ejs      # Registration page
│   ├── dashboard.ejs     # Message dashboard
│   ├── compose.ejs       # Compose message
│   └── 404.ejs          # Error page
└── public/
    └── styles.css        # Application styles
```

## 🔧 Configuration

### Environment Variables

Create/modify `.env` file to configure the application:

```env
# Security Configuration
SESSION_SECRET=your-super-secure-session-secret-min-32-characters
BCRYPT_ROUNDS=12

# Database
DB_PATH=./database/app.db

# Server
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW=900000     # 15 minutes
RATE_LIMIT_MAX_ATTEMPTS=5    # 5 attempts per window

# Session Security
SESSION_MAX_AGE=1800000      # 30 minutes
```

### Security Recommendations for Production

1. **Change SESSION_SECRET**: Use a cryptographically secure random string (min 32 characters)
2. **Enable HTTPS**: Set `NODE_ENV=production` and configure SSL certificates
3. **Database Security**: Use PostgreSQL or MySQL with proper user permissions
4. **Rate Limiting**: Adjust rate limits based on your requirements
5. **Logging**: Implement proper security event logging
6. **Regular Updates**: Keep dependencies updated for security patches

## 📚 Security Learning Points

### 1. Password Security
```javascript
// Secure password hashing with bcrypt
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### 2. Session Management
```javascript
// Secure session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 30 * 60 * 1000 // 30 minutes
    }
}));
```

### 3. Input Validation
```javascript
// Server-side validation
[
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
], async (req, res) => {
    const errors = validationResult(req);
    // Handle validation errors...
}
```

### 4. SQL Injection Prevention
```javascript
// Parameterized queries
db.get('SELECT * FROM users WHERE email = ?', [email], callback);
```

## 🎓 Assignment Ideas

### Beginner Level
1. **Password Policy Analysis**: Examine the password strength checker implementation
2. **Session Exploration**: Test session timeout and security features
3. **UI/UX Security**: Identify security-focused UI elements

### Intermediate Level
1. **Security Audit**: Find and document all security features implemented
2. **Attack Simulation**: Test the rate limiting with multiple failed login attempts
3. **Code Review**: Analyze the authentication middleware and session handling

### Advanced Level
1. **Security Enhancement**: Implement additional security features (2FA, password reset)
2. **Vulnerability Assessment**: Test for common web vulnerabilities
3. **Performance Analysis**: Measure bcrypt performance with different salt rounds

## 🐛 Common Issues & Solutions

### Database Issues
- **Error: Database locked**: Stop the server and restart
- **Missing tables**: Run `npm run init-db` to reinitialize

### Authentication Issues
- **Session expired**: Check SESSION_MAX_AGE configuration
- **Rate limited**: Wait for the rate limit window to reset

### Development Tips
- Use `npm run dev` for auto-restart during development
- Check browser console for client-side security warnings
- Monitor server logs for security events

## 📖 Further Reading

- [OWASP Web Security](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)

## 🤝 Contributing

This is an educational project. Students are encouraged to:

1. Fork the repository
2. Implement additional security features
3. Submit improvements or bug fixes
4. Share security findings and enhancements

## 📄 License

MIT License - See LICENSE file for details.

## ⚠️ Disclaimer

This application is designed for educational purposes to demonstrate web security concepts. While it implements industry-standard security practices, additional hardening would be required for production use.

---

**Happy Learning! 🎓🔒**