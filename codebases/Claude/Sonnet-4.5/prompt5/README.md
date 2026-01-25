# Secure Messaging Application - Educational Example

A Node.js web application demonstrating secure user authentication and messaging functionality for educational purposes. This application showcases modern web security best practices including password hashing, session management, input validation, and protection against common vulnerabilities.

## 🎓 Educational Purpose

This application is designed for teaching the following web security concepts:

### 1. **Secure Password Management**
- **Bcrypt Hashing**: Passwords are never stored in plaintext. The application uses bcrypt with a cost factor of 12 to hash passwords.
- **Salt Generation**: Bcrypt automatically generates unique salts for each password.
- **Password Strength**: Minimum 8-character requirement enforced both client-side and server-side.

### 2. **User Authentication**
- **Session-based Authentication**: Uses express-session for managing user sessions.
- **HttpOnly Cookies**: Session cookies are marked as HttpOnly to prevent XSS attacks from accessing them.
- **Authentication Middleware**: Protected routes require valid sessions.
- **Generic Error Messages**: Login errors don't reveal whether a user exists (prevents user enumeration).

### 3. **Input Validation & Sanitization**
- **express-validator**: All user inputs are validated and sanitized server-side.
- **Email Normalization**: Email addresses are normalized to prevent duplicate registrations.
- **Length Limits**: Maximum lengths enforced on messages, subjects, and other inputs.
- **SQL Injection Prevention**: Prepared statements with better-sqlite3 prevent SQL injection.

### 4. **Security Headers**
- **Helmet.js**: Adds various HTTP headers to protect against common vulnerabilities:
  - Content-Security-Policy (CSP)
  - X-Frame-Options
  - X-Content-Type-Options
  - And more...

### 5. **Cross-Site Request Forgery (CSRF) Protection**
- **CSRF Tokens**: The application includes csurf for CSRF protection (configured but can be activated per route).

### 6. **Output Encoding**
- **HTML Escaping**: User-generated content is properly escaped before rendering to prevent XSS attacks.

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## 🚀 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Access the application:**
   Open your browser and navigate to: `http://localhost:3000`

## 🗂️ Project Structure

```
.
├── server.js              # Express server with all API endpoints
├── package.json           # Project dependencies
├── database.db           # SQLite database (auto-created)
└── public/
    ├── login.html        # Login and registration page
    ├── login.js          # Client-side login logic
    ├── dashboard.html    # Messaging dashboard
    ├── dashboard.js      # Client-side dashboard logic
    └── styles.css        # Application styles
```

## 🔐 Security Features Explained

### Password Hashing Flow
```javascript
// When registering:
1. User submits password
2. Server validates password (min 8 chars)
3. bcrypt.hash(password, 12) generates hash
4. Only hash is stored in database

// When logging in:
1. User submits credentials
2. Server retrieves password hash from DB
3. bcrypt.compare(submitted, stored) verifies
4. Session created only if passwords match
```

### Session Management
```javascript
// Session configuration:
- Secret key for signing session IDs
- HttpOnly cookies prevent JavaScript access
- Sessions expire after 24 hours
- Sessions destroyed on logout
```

### SQL Injection Prevention
```javascript
// UNSAFE (vulnerable to SQL injection):
db.query(`SELECT * FROM users WHERE email = '${email}'`)

// SAFE (prepared statement):
db.prepare('SELECT * FROM users WHERE email = ?').get(email)
```

### XSS Prevention
```javascript
// HTML escaping on client-side before display:
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

## 🧪 Testing the Application

### Creating Test Users

1. Navigate to `http://localhost:3000`
2. Click "Register here" to create accounts
3. Create at least 2 users to test messaging:
   - alice@example.com
   - bob@example.com

### Testing Messaging

1. Login as the first user
2. Navigate to "Compose Message"
3. Select a recipient
4. Write and send a message
5. Logout and login as the recipient
6. Check the inbox for the message

### Security Testing Exercises

**For Students:**

1. **Password Security**
   - Try registering with weak passwords (< 8 chars) - should be rejected
   - Verify that passwords are hashed in the database
   - Test bcrypt comparison with wrong passwords

2. **Session Security**
   - Examine session cookies in browser DevTools
   - Verify HttpOnly flag is set
   - Test that logout properly destroys sessions

3. **Input Validation**
   - Try sending messages with extremely long content
   - Test with special characters and HTML tags
   - Verify that malicious input is escaped

4. **SQL Injection Attempts** (Educational - should all fail)
   - Try login with: `' OR '1'='1`
   - Verify prepared statements prevent injection

5. **Authentication Bypass Attempts** (Should all fail)
   - Try accessing `/dashboard` without logging in
   - Verify redirect to login page

## 🔍 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);
```

## 📚 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user info (requires auth)

### Messaging
- `GET /api/messages` - Get inbox messages (requires auth)
- `GET /api/messages/sent` - Get sent messages (requires auth)
- `POST /api/messages` - Send new message (requires auth)
- `PUT /api/messages/:id/read` - Mark message as read (requires auth)

### Users
- `GET /api/users` - Get all users except current user (requires auth)

## ⚠️ Important Notes for Production

This is an **educational example**. For production use, you would need to add:

1. **HTTPS/TLS**: Enable SSL/TLS encryption
2. **Environment Variables**: Store secrets in .env files
3. **Rate Limiting**: Prevent brute force attacks
4. **Email Verification**: Verify email addresses during registration
5. **Password Reset**: Secure password recovery mechanism
6. **Logging & Monitoring**: Track security events
7. **Database Backups**: Regular backup strategy
8. **CSRF Protection**: Enable CSRF tokens on all state-changing operations
9. **Content Security Policy**: Stricter CSP configuration
10. **Multi-factor Authentication**: Additional layer of security

## 🎯 Learning Objectives

After studying this application, students should understand:

- ✅ Why passwords should never be stored in plaintext
- ✅ How bcrypt protects against rainbow table attacks
- ✅ The difference between authentication and authorization
- ✅ How sessions work and their security implications
- ✅ Common web vulnerabilities (XSS, SQL Injection, CSRF)
- ✅ The importance of input validation and output encoding
- ✅ How to use security headers to protect web applications
- ✅ Database security with prepared statements

## 📖 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)

## 📝 License

MIT License - Free for educational use

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for your teaching needs.

---

**Remember**: Security is a process, not a product. Always stay updated with the latest security best practices and vulnerabilities.
