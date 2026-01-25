# Secure Authentication & Messaging Demo

🎓 **Educational Reference Implementation**

This Node.js application demonstrates secure authentication and user-to-user messaging capabilities for web programming education. It serves as a comprehensive example of security best practices in web development.

## ⚠️ Important Notice

This is an **educational demonstration** designed specifically for learning purposes. While it implements many security best practices, it should not be used in production without thorough security review and additional hardening.

## 🔒 Security Features Demonstrated

### Authentication & Session Management
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: HttpOnly cookies with secure flags
- **Session Control**: Different expiration based on device type (private vs public computer)
- **Rate Limiting**: Protection against brute force attacks (5 attempts per 15 minutes)

### Input Validation & Sanitization
- **Server-side Validation**: express-validator for comprehensive input checking
- **SQL Injection Protection**: Parameterized queries with SQLite3
- **XSS Prevention**: HTML escaping for all user inputs
- **CSRF Protection**: SameSite cookie attributes

### Security Headers & Middleware
- **Helmet.js**: Comprehensive security headers
- **CORS**: Controlled cross-origin resource sharing
- **Content Security**: Input length limits and content type validation

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 3. Access the Application
Open your browser to: http://localhost:3000

## 👤 Demo Accounts

The application includes three pre-configured accounts for testing:

| Email | Password | Use Case |
|-------|----------|----------|
| alice@example.com | securePass123! | Primary test account |
| bob@example.com | anotherSecurePass456! | Secondary user for messaging |
| charlie@example.com | yetAnotherPass789! | Third user for group testing |

## 🏗️ Application Structure

```
├── server.js              # Main application server
├── package.json           # Dependencies and scripts
├── public/                # Static frontend files
│   ├── login.html         # Login interface (matches BlueMind design)
│   ├── dashboard.html     # User dashboard for messaging
│   ├── styles.css         # Responsive CSS styling
│   ├── login.js          # Client-side login logic
│   └── dashboard.js      # Client-side dashboard functionality
└── README.md             # This documentation
```

## 📚 Educational Learning Points

### 1. Password Security
- Never store plaintext passwords
- Use proper hashing algorithms (bcrypt, scrypt, argon2)
- Implement minimum password requirements
- Consider password strength indicators

### 2. Session Management
- Use secure, HttpOnly cookies for tokens
- Implement appropriate session timeouts
- Distinguish between trusted and untrusted devices
- Provide clear logout functionality

### 3. Input Validation
- Validate on both client and server sides
- Use whitelist validation approaches
- Implement proper error handling
- Sanitize all user inputs

### 4. API Security
- Rate limit authentication endpoints
- Use HTTPS in production
- Implement proper error messages (don't leak information)
- Log security events for monitoring

### 5. Frontend Security
- Escape HTML content to prevent XSS
- Use Content Security Policy headers
- Validate data before display
- Implement proper error handling

## 🔧 Technical Implementation

### Backend (Node.js + Express)
- **Framework**: Express.js with security middleware
- **Database**: SQLite3 (in-memory for demo)
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: express-validator for input sanitization
- **Security**: helmet, cors, rate-limiting

### Frontend (Vanilla JavaScript)
- **Design**: Responsive CSS matching BlueMind interface
- **Interaction**: Modern JavaScript with async/await
- **Security**: Client-side validation + XSS protection
- **UX**: Real-time feedback and error handling

### Database Schema
```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Messages table
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (from_user_id) REFERENCES users (id),
    FOREIGN KEY (to_user_id) REFERENCES users (id)
);
```

## 🛡️ Security Checklist for Production

Before deploying any authentication system to production, ensure:

- [ ] Use environment variables for secrets (JWT_SECRET, database credentials)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Implement proper database security (not in-memory)
- [ ] Set up comprehensive logging and monitoring
- [ ] Enable two-factor authentication
- [ ] Implement account lockout mechanisms
- [ ] Regular security audits and dependency updates
- [ ] Proper backup and recovery procedures
- [ ] GDPR/privacy compliance measures
- [ ] Penetration testing

## 📖 Learning Resources

### Recommended Reading
- [OWASP Web Application Security](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Guide](https://expressjs.com/en/advanced/best-practice-security.html)

### Security Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Vulnerability scanning
- [Snyk](https://snyk.io/) - Dependency security monitoring
- [helmet.js](https://helmetjs.github.io/) - Security headers
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit) - Rate limiting

## 🤝 Educational Use

This implementation is designed for:
- Web development courses
- Security training workshops
- Code review exercises
- Understanding authentication flows
- Learning secure coding practices

## 📄 License

MIT License - Free for educational use. See the security disclaimers above before any production use.

---

**Remember**: Security is a process, not a product. Always stay updated with the latest security practices and regularly audit your applications!