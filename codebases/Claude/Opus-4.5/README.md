# BlueMind Secure Messaging - Educational Example

A Node.js web application demonstrating secure authentication and messaging functionality. This project serves as a reference implementation for students learning about web security best practices.

![BlueMind Login](https://img.shields.io/badge/Node.js-v18+-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Learning Objectives

This project demonstrates:

1. **Secure Password Storage** - Using bcrypt for password hashing
2. **Session Management** - Secure cookie configuration
3. **CSRF Protection** - Token-based request validation
4. **Rate Limiting** - Preventing brute force attacks
5. **Input Validation** - Sanitizing user input
6. **SQL Injection Prevention** - Parameterized queries

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- npm (Node Package Manager)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment configuration
cp .env.example .env

# 3. Start the application
npm start
```

The server will start at `http://localhost:3000`

### Demo Accounts

| Email | Password |
|-------|----------|
| alice@bluemind.net | password123 |
| bob@bluemind.net | password456 |
| charlie@bluemind.net | password789 |

## 📁 Project Structure

```
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
├── .env.example              # Environment configuration template
│
├── database/
│   └── init.js               # Database initialization & seeding
│
├── middleware/
│   └── auth.js               # Authentication middleware
│
├── routes/
│   ├── auth.js               # Login, logout, register routes
│   └── messages.js           # Messaging routes
│
├── views/
│   ├── login.ejs             # Login page
│   ├── register.ejs          # Registration page
│   ├── inbox.ejs             # Message inbox
│   ├── sent.ejs              # Sent messages
│   ├── compose.ejs           # Compose new message
│   ├── message.ejs           # View single message
│   ├── error.ejs             # Error page
│   ├── logout.ejs            # Logout confirmation
│   └── partials/             # Reusable view components
│       ├── header.ejs
│       ├── sidebar.ejs
│       └── footer.ejs
│
└── public/
    └── css/
        └── styles.css        # Application styles
```

## 🔒 Security Features Explained

### 1. Password Hashing with bcrypt

```javascript
// NEVER store plain text passwords!
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Hashing a password
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// Verifying a password
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

**Why bcrypt?**
- Automatically generates a random salt
- Computationally expensive (adjustable via salt rounds)
- Resistant to rainbow table attacks
- Constant-time comparison prevents timing attacks

### 2. Session Security

```javascript
app.use(session({
    cookie: {
        secure: true,      // Only send over HTTPS
        httpOnly: true,    // Prevent JavaScript access
        sameSite: 'strict' // Prevent CSRF attacks
    }
}));
```

### 3. CSRF Protection

Every form includes a hidden CSRF token:
```html
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
```

The server validates this token before processing any POST request.

### 4. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                    // 5 attempts per window
    message: 'Too many login attempts'
});
```

### 5. Input Validation

```javascript
const { body, validationResult } = require('express-validator');

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
];
```

### 6. SQL Injection Prevention

```javascript
// ❌ WRONG - Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ CORRECT - Parameterized query
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
```

## 📚 Study Guide

### Key Files to Review

1. **[routes/auth.js](routes/auth.js)** - Authentication logic, password verification
2. **[database/init.js](database/init.js)** - Database schema, password hashing
3. **[server.js](server.js)** - Security middleware configuration
4. **[middleware/auth.js](middleware/auth.js)** - Session verification

### Exercises for Students

1. **Account Lockout**: How does the application prevent brute force attacks?
2. **Password Requirements**: What validation rules are enforced for new passwords?
3. **Session Fixation**: How does session regeneration protect against attacks?
4. **XSS Prevention**: How is user input sanitized before display?

## 🛠 Development

```bash
# Start with auto-reload (development)
npm run dev

# Reinitialize database with fresh data
npm run init-db
```

## ⚠️ Production Considerations

This is an educational example. For production use, you would need:

- [ ] HTTPS/TLS configuration
- [ ] External database (PostgreSQL, MySQL)
- [ ] Enhanced logging and monitoring
- [ ] Security headers (already included via Helmet)
- [ ] Content Security Policy tuning
- [ ] Password complexity requirements
- [ ] Multi-factor authentication
- [ ] Email verification
- [ ] Password reset functionality

## 📖 Additional Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Express Session Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)

## 📄 License

MIT License - This project is intended for educational purposes.

---

**Note**: The design is inspired by BlueMind messaging interface for educational demonstration purposes only.
