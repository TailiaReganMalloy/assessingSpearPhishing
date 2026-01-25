# BlueMind Security Demo - Educational Web Application

A comprehensive demonstration web application designed for teaching secure login mechanisms, safe password storage practices, and inter-user messaging features. Built with Node.js and following modern security best practices.

## 🎯 Educational Objectives

This application demonstrates:
- **Secure Authentication**: JWT tokens, bcrypt password hashing, session management
- **Password Security**: Strong password requirements, secure storage, validation
- **Attack Prevention**: Rate limiting, account lockout, CSRF protection
- **Security Monitoring**: Login attempt tracking, suspicious activity detection
- **Session Management**: Timeout policies, computer type-based session duration
- **Inter-user Communication**: Secure messaging with real-time notifications

## 🛡️ Security Features Implemented

### Authentication & Authorization
- ✅ bcrypt password hashing (12 salt rounds)
- ✅ JWT token-based authentication
- ✅ Session-based user management
- ✅ Strong password requirements (8+ chars, mixed case, numbers, symbols)
- ✅ Email validation and normalization

### Attack Prevention
- ✅ Rate limiting (5 login attempts per 15 minutes)
- ✅ Account lockout after failed attempts
- ✅ CSRF protection with Helmet.js
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)

### Session Security
- ✅ Secure session cookies (httpOnly, secure flags)
- ✅ Session timeout based on computer type:
  - Private computers: 24 hours
  - Public computers: 30 minutes
- ✅ Automatic session invalidation
- ✅ Inactivity monitoring with warnings

### Security Monitoring
- ✅ Login attempt logging (IP, User-Agent, timestamp)
- ✅ Failed login tracking and analysis
- ✅ Real-time suspicious activity detection
- ✅ Security event logging
- ✅ Developer tools detection
- ✅ Copy/paste monitoring for sensitive fields

## 🏗️ Architecture

### Backend (Node.js)
```
server.js           # Main application server
├── Authentication  # Login, registration, JWT handling
├── Database        # SQLite with security tables
├── Middleware      # Security, validation, rate limiting
├── Routes          # API endpoints and page routes
└── Security        # Monitoring, logging, protection
```

### Frontend (EJS Templates)
```
views/
├── index.ejs       # Login page (BlueMind design)
├── register.ejs    # User registration
├── dashboard.ejs   # Main messaging interface
├── security-logs.ejs # Security monitoring page
└── error.ejs       # Error handling
```

### Database Schema
```sql
users               # User accounts with security fields
├── id, email, password_hash
├── created_at, last_login
├── failed_login_attempts, locked_until
└── email_verified

messages            # Inter-user messaging
├── id, sender_id, recipient_id
├── subject, content
├── sent_at, read_at

login_attempts      # Security monitoring
├── email, ip_address, user_agent
├── success, attempted_at
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start
```bash
# Install dependencies
npm install

# Start the application
npm start

# For development with auto-restart
npm run dev
```

The application will be available at: `http://localhost:3000`

### Environment Variables (Optional)
Create a `.env` file for production:
```env
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-session-secret-key-here
PORT=3000
NODE_ENV=production
```

## 🎓 Educational Usage

### For Students
1. **Registration**: Create accounts with secure passwords
2. **Login**: Experience different session durations based on computer type
3. **Messaging**: Send and receive messages between users
4. **Security**: View login attempt logs and security features

### For Instructors
- Use this as a reference implementation for secure web applications
- Demonstrate common attack vectors and their prevention
- Show security monitoring and logging in action
- Explain password hashing, session management, and input validation

### Key Learning Points

#### Password Security
```javascript
// Strong password requirements enforced
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// bcrypt hashing with high salt rounds
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);
```

#### Rate Limiting
```javascript
// Prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts'
});
```

#### Account Lockout
```javascript
// Temporary account lockout after failed attempts
const lockUntil = newAttempts >= 5 ? 
  new Date(Date.now() + 15 * 60 * 1000) : null;
```

#### Session Security
```javascript
// Different session durations based on computer type
if (computerType === 'public') {
  req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes
} else {
  req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
}
```

## 📱 Features & Functionality

### User Registration
- Strong password requirements with real-time validation
- Email format validation and normalization
- Duplicate account prevention
- Secure password hashing before storage

### Secure Login
- Rate-limited login attempts
- Account lockout after failures
- IP address and user agent logging
- Computer type-based session duration
- Visual feedback for security states

### Messaging System
- Send messages between registered users
- Real-time notifications with Socket.io
- Message read/unread status tracking
- Secure message storage and retrieval

### Security Dashboard
- View login attempt history
- Monitor successful and failed logins
- IP address tracking for security analysis
- Statistical overview of security events

### Real-time Security Monitoring
- Detect rapid keystrokes (potential automation)
- Monitor developer tools usage
- Track copy/paste operations on sensitive fields
- Session timeout with user warnings

## 🔧 Customization

### Adding New Security Features
1. **Two-Factor Authentication**: Integrate TOTP or SMS verification
2. **Password History**: Prevent password reuse
3. **Device Fingerprinting**: Enhanced session security
4. **IP Whitelisting**: Restrict access by location

### Extending the Messaging System
1. **File Attachments**: Secure file upload and storage
2. **Message Encryption**: End-to-end encryption
3. **Group Messaging**: Multi-user conversations
4. **Message Retention**: Automatic cleanup policies

## 🛠️ Development

### Project Structure
```
secure-login-demo/
├── server.js              # Main application
├── package.json           # Dependencies
├── public/                # Static assets
│   ├── styles/main.css   # BlueMind-inspired design
│   └── js/main.js        # Client-side security
├── views/                # EJS templates
│   ├── index.ejs         # Login page
│   ├── dashboard.ejs     # Main interface
│   └── ...              # Other pages
└── README.md             # This file
```

### Key Dependencies
- **express**: Web framework
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **express-validator**: Input validation
- **express-rate-limit**: Rate limiting
- **helmet**: Security headers
- **socket.io**: Real-time messaging
- **sqlite3**: Database storage

## 🔒 Security Considerations

### Implemented Protections
✅ Password hashing with bcrypt  
✅ SQL injection prevention  
✅ XSS protection with input validation  
✅ CSRF protection with Helmet  
✅ Rate limiting and account lockout  
✅ Secure session management  
✅ Security headers with Helmet  

### Additional Recommendations for Production
- [ ] HTTPS/TLS encryption
- [ ] Content Security Policy (CSP)
- [ ] Database encryption at rest
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Security incident response plan

## 📚 Learning Resources

### Recommended Reading
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)

### Security Testing Tools
- **OWASP ZAP**: Web application security scanner
- **Burp Suite**: Security testing platform  
- **SQLMap**: SQL injection testing
- **Nikto**: Web server scanner

## 🤝 Contributing

This is an educational project. Contributions that enhance the learning experience are welcome:

1. Additional security features for demonstration
2. Improved documentation and comments
3. New attack simulation scenarios
4. Enhanced user interface elements
5. Mobile responsiveness improvements

## 📄 License

MIT License - This project is intended for educational purposes. Please use responsibly and follow your institution's academic integrity policies.

## ⚠️ Disclaimer

This application is designed for educational purposes only. While it implements many security best practices, it should not be used as-is in production environments without additional security review and hardening.

---

**For questions or support**: This is a demonstration project for educational use. Please refer to the code comments and documentation for implementation details.