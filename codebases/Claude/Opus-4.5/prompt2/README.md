# BlueMind Secure Messaging - Educational Project

A comprehensive Node.js web application demonstrating secure user authentication and messaging functionality, designed for computer science education.

## 🎯 Learning Objectives

This project teaches students about:

- **Secure Authentication**: Password hashing, session management, and login protection
- **Database Security**: SQLite integration with prepared statements to prevent SQL injection
- **Web Security**: Rate limiting, input validation, XSS protection, and CSRF prevention
- **Modern Web Development**: Express.js server architecture and responsive frontend design
- **Security Best Practices**: HTTP-only cookies, secure session configuration, and proper error handling

## 🔐 Security Features Implemented

### Authentication & Authorization
- **Bcrypt Password Hashing**: Passwords are hashed with salt rounds for secure storage
- **Session Management**: HTTP-only cookies with configurable expiration times
- **Rate Limiting**: Login attempts limited to prevent brute force attacks
- **Computer Type Selection**: Different session durations for private vs. public computers

### Input Validation & Protection
- **Server-side Validation**: All inputs validated and sanitized
- **XSS Protection**: HTML escaping prevents cross-site scripting
- **SQL Injection Prevention**: Prepared statements for all database queries
- **CSRF Protection**: Session-based CSRF token validation

### Security Headers & Middleware
- **Helmet.js**: Sets security headers including CSP, HSTS, and X-Frame-Options
- **Content Security Policy**: Restricts resource loading to prevent XSS
- **Express Security**: Additional middleware for common vulnerabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- npm package manager

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open your browser to `http://localhost:3000`
   - The SQLite database and sample data are created automatically

## 👥 Demo Accounts

The application includes pre-configured demo accounts for testing:

| User | Email | Password | Role |
|------|-------|----------|------|
| John Doe | john.doe@bluemind.net | SecurePass123! | User |
| Jane Smith | jane.smith@bluemind.net | SecurePass456! | User |
| Admin | admin@bluemind.net | AdminPass789! | Administrator |

## 🏗️ Project Structure

```
bluemind-secure-messaging/
├── server.js                 # Main Express.js server
├── package.json              # Project dependencies and scripts
├── bluemind.db              # SQLite database (auto-generated)
└── public/                   # Static frontend files
    ├── login.html           # Login page
    ├── dashboard.html       # User dashboard
    ├── styles.css           # Responsive CSS styles
    ├── login.js            # Login page JavaScript
    └── dashboard.js        # Dashboard JavaScript
```

## 🔧 Technical Implementation

### Backend (Node.js + Express)
- **Express.js**: Web application framework
- **SQLite3**: Lightweight database for user and message storage
- **Bcrypt**: Password hashing library
- **Express-session**: Session management middleware
- **Express-validator**: Input validation and sanitization
- **Helmet**: Security headers middleware

### Frontend
- **Vanilla JavaScript**: No framework dependencies for educational clarity
- **Responsive CSS**: Mobile-first design with CSS Grid and Flexbox
- **Progressive Enhancement**: Works without JavaScript for basic functionality

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Messages Table
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME NULL,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (recipient_id) REFERENCES users (id)
);
```

## 🎓 Educational Features

### Security Demonstrations
- **Password Storage**: Shows proper hashing vs. plain text storage
- **Session Security**: Demonstrates session hijacking prevention
- **Rate Limiting**: Protects against brute force attacks
- **Input Validation**: Prevents common injection attacks

### Code Organization
- **Separation of Concerns**: Clear separation between server logic and client code
- **Error Handling**: Proper error responses and user feedback
- **Async/Await**: Modern JavaScript async patterns
- **Database Transactions**: Safe database operations

### Console Learning Tools
The application includes educational console logs that explain:
- Security features as they're implemented
- Best practices for web development
- Common vulnerabilities and their prevention

## 🛡️ Security Considerations

### Production Deployment
Before deploying to production, consider:

1. **Environment Variables**: Move secrets to environment variables
2. **HTTPS**: Enable SSL/TLS encryption
3. **Database**: Upgrade to PostgreSQL or MySQL for production
4. **Session Store**: Use Redis or database-backed session storage
5. **Monitoring**: Add logging and security monitoring
6. **Updates**: Regularly update dependencies for security patches

### Common Vulnerabilities Addressed
- ✅ **SQL Injection**: Prevented with prepared statements
- ✅ **XSS**: Mitigated with input escaping and CSP headers
- ✅ **CSRF**: Protected with session-based tokens
- ✅ **Session Fixation**: Regenerated on login
- ✅ **Brute Force**: Rate limited login attempts
- ✅ **Password Security**: Bcrypt hashing with salt

## 📚 Assignment Ideas

### Beginner Exercises
1. Add email validation on the frontend
2. Implement a "Remember Me" checkbox
3. Create a simple password strength meter
4. Add user registration functionality

### Intermediate Projects
1. Implement password reset functionality
2. Add two-factor authentication
3. Create message threading/replies
4. Add file attachment support

### Advanced Challenges
1. Implement OAuth2 social login
2. Add real-time messaging with WebSockets
3. Create an admin dashboard
4. Add API rate limiting and documentation

## 🤝 Contributing

This is an educational project. Students and educators are welcome to:
- Report bugs or security issues
- Suggest improvements
- Submit pull requests for educational enhancements
- Adapt for different learning objectives

## 📄 License

MIT License - Feel free to use this project for educational purposes.

## 🆘 Support

For educational use and questions:
- Check the console logs for security feature explanations
- Review the commented code for implementation details
- Use the demo accounts to explore functionality
- Examine the network tab to understand API communication

---

**Note**: This is an educational demonstration. For production applications, additional security measures and comprehensive testing would be required.