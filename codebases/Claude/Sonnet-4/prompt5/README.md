# BlueMind Security Demo - Web Security Course Application

A comprehensive Node.js application demonstrating secure web development practices including user authentication, password management, and secure messaging functionality. Built as a teaching resource for web security concepts.

## 🎓 Educational Purpose

This application serves as a practical example for students learning:
- Secure user authentication
- Password hashing and management
- Session security
- CSRF protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Security headers

## 🔧 Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## 🔐 Demo Accounts

The application includes pre-configured demo accounts for testing:

| Email | Password | Purpose |
|-------|----------|---------|
| `demo@bluemind.net` | `SecurePass123!` | General demonstration |
| `student@bluemind.net` | `StudentPass456!` | Student account |
| `teacher@bluemind.net` | `TeacherPass789!` | Teacher account |

## 🛡️ Security Features Implemented

### 1. Password Security
- **bcrypt hashing** with salt rounds of 12
- Minimum password length requirements
- Secure password storage (never stored in plaintext)

### 2. Authentication & Session Management
- Express sessions with secure configuration
- Session expiry based on computer type:
  - Private computers: 24 hours
  - Public computers: 30 minutes
- Secure cookie settings (httpOnly, secure in production)

### 3. CSRF Protection
- CSRF tokens on all forms
- Validation of CSRF tokens on state-changing requests

### 4. Rate Limiting
- Login attempt limiting (5 attempts per 15 minutes per IP)
- Prevents brute force attacks

### 5. Input Validation & Sanitization
- Server-side validation using express-validator
- Input sanitization and escaping
- Maximum length limits on user inputs

### 6. SQL Injection Prevention
- Parameterized queries with SQLite
- No dynamic SQL construction with user input

### 7. XSS Protection
- Input escaping in templates
- Content Security Policy headers via Helmet.js
- Output encoding

### 8. Security Headers
- Helmet.js middleware for security headers
- Protection against common vulnerabilities

## 📁 Project Structure

```
bluemind-security-demo/
├── server.js              # Main application server
├── package.json           # Project dependencies and scripts
├── database.db           # SQLite database (auto-generated)
├── views/                # EJS templates
│   ├── login.ejs         # Login page
│   └── dashboard.ejs     # User dashboard
├── public/               # Static assets
│   └── styles.css        # Application styles
└── README.md            # This file
```

## 🎯 Features

### Login System
- Email/password authentication
- Computer type selection (private vs public)
- Visual feedback for login attempts
- Demo account information display

### Messaging System
- Send secure messages between users
- View received and sent messages
- Mark messages as read
- Input validation and sanitization

### Security Dashboard
- Real-time security feature status
- Educational security information
- Demo account management

## 🧑‍🏫 Teaching Notes

### Security Concepts Demonstrated

1. **Authentication vs Authorization**
   - Users must authenticate (login) to access protected resources
   - Session-based authorization for subsequent requests

2. **Password Security Best Practices**
   - Strong password requirements
   - Secure hashing (never store plaintext passwords)
   - Salt usage to prevent rainbow table attacks

3. **Session Management**
   - Secure session configuration
   - Different session lifetimes based on trust level
   - Proper session destruction on logout

4. **CSRF Prevention**
   - Understanding Cross-Site Request Forgery
   - Token-based CSRF protection implementation

5. **Input Validation**
   - Client-side vs server-side validation
   - Whitelist approach to input validation
   - SQL injection and XSS prevention

6. **Rate Limiting**
   - Preventing abuse through request limiting
   - Protection against brute force attacks

## 🔍 API Endpoints

### Authentication
- `GET /` - Login page
- `POST /login` - Authenticate user
- `POST /logout` - End user session

### Dashboard
- `GET /dashboard` - User dashboard (protected)
- `POST /send-message` - Send message (protected)
- `POST /mark-read/:id` - Mark message as read (protected)

### Information
- `GET /security-info` - Security implementation details (JSON)

## 🚨 Security Considerations for Production

**⚠️ This is a demo application. For production use, consider:**

1. **Environment Variables**
   - Move secrets to environment variables
   - Use strong, random session secrets

2. **HTTPS**
   - Enable HTTPS in production
   - Set secure cookie flags

3. **Database**
   - Use a production database (PostgreSQL, MySQL)
   - Implement proper database security

4. **Logging & Monitoring**
   - Add comprehensive logging
   - Implement security monitoring

5. **Additional Security**
   - Two-factor authentication
   - Password complexity requirements
   - Account lockout policies
   - Security auditing

## 📚 Learning Exercises

### For Students

1. **Code Review Exercise**
   - Identify all security measures in the code
   - Explain how each feature prevents specific attacks

2. **Vulnerability Testing**
   - Try to bypass rate limiting
   - Attempt SQL injection attacks
   - Test for XSS vulnerabilities

3. **Enhancement Projects**
   - Add password strength meter
   - Implement password reset functionality
   - Add two-factor authentication
   - Create admin user management

4. **Attack Simulation**
   - Create a "vulnerable" version without security measures
   - Demonstrate successful attacks
   - Then show how the security measures prevent them

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   Error: listen EADDRINUSE :::3000
   ```
   Solution: Change the port in server.js or kill the process using port 3000

2. **Database Permissions**
   - Ensure the application has write permissions in the directory
   - The SQLite database file will be created automatically

3. **Node Version Issues**
   - Ensure you're using Node.js version 14 or higher
   - Some dependencies require newer Node.js versions

## 📞 Support

This application is designed for educational purposes. For questions about web security concepts or implementation details, refer to:

- OWASP Security Guidelines
- Node.js Security Best Practices
- Express.js Security Documentation

## 📄 License

This project is created for educational purposes. Feel free to use and modify for learning and teaching web security concepts.

---

**Remember:** Security is a continuous process, not a destination. Always stay updated with the latest security best practices and vulnerabilities!