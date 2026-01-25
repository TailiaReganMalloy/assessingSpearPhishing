# Secure Messaging Application - Educational Example

This is an educational Node.js web application demonstrating secure user authentication and messaging functionality. It's designed as a reference implementation for students learning about web security and user authentication.

## 🎯 Learning Objectives

This example teaches students about:
- **Secure Password Storage**: Using bcrypt for password hashing
- **Session Management**: Implementing user sessions with Express
- **Authentication**: Protecting routes and validating user credentials
- **Database Design**: Creating relational data models for users and messages
- **Client-Server Communication**: Building RESTful APIs
- **Frontend-Backend Integration**: Connecting user interfaces to backend services

## 📋 Features

- ✅ Secure user login with bcrypt password hashing
- ✅ Session-based authentication
- ✅ Protected API endpoints
- ✅ User messaging system (send and receive messages)
- ✅ Real-time message reading status
- ✅ Clean, modern UI based on BlueMind template
- ✅ SQLite database with sqlite3 for easy setup and cross-platform compatibility

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize the database:**
   ```bash
   npm run init-db
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 👤 Demo Accounts

The application comes with pre-configured demo accounts:

| Email | Password |
|-------|----------|
| email@bluemind.net | password123 |
| alice@bluemind.net | alice123 |
| bob@bluemind.net | bob123 |

## 📁 Project Structure

```
.
├── server.js              # Main Express server and API routes
├── init-database.js       # Database initialization script
├── package.json           # Project dependencies
├── public/
│   ├── login.html        # Login page
│   ├── messages.html     # Messages dashboard
│   └── styles.css        # Application styling
└── README.md             # This file
```

## 🔒 Security Features Implemented

### 1. Password Hashing with bcrypt
```javascript
// Passwords are never stored in plain text
const passwordHash = bcrypt.hashSync(password, 10);

// Verification is done by comparing hashes
const passwordMatch = bcrypt.compareSync(password, user.password_hash);
```

**Why this matters:** If the database is compromised, attackers cannot retrieve user passwords.

### 2. Session-Based Authentication
```javascript
// Sessions store user state securely
req.session.userId = user.id;
req.session.email = user.email;
```

**Why this matters:** Users don't need to send credentials with every request.

### 3. HTTP-Only Cookies
```javascript
cookie: {
  httpOnly: true,  // Cannot be accessed by JavaScript
  secure: false,   // Set to true in production with HTTPS
  maxAge: 1000 * 60 * 60 * 24  // 24 hours
}
```

**Why this matters:** Protects against XSS attacks.

### 4. Route Protection
```javascript
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
}
```

**Why this matters:** Ensures only authenticated users can access sensitive endpoints.

### 5. Input Validation
```javascript
if (!email || !password) {
  return res.status(400).json({ error: 'Email and password are required' });
}
```

**Why this matters:** Prevents injection attacks and ensures data integrity.

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read BOOLEAN DEFAULT 0,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - Authenticate user and create session
- `POST /api/logout` - Destroy user session
- `GET /api/user` - Get current user info (protected)

### Messages
- `GET /api/messages` - Fetch messages for logged-in user (protected)
- `POST /api/messages` - Send a new message (protected)
- `POST /api/messages/:id/read` - Mark message as read (protected)

### Users
- `GET /api/users` - Get list of users (protected)

## 📚 Key Concepts for Students

### 1. Never Store Passwords in Plain Text
Always use a hashing algorithm like bcrypt. The application demonstrates this in `init-database.js` and `server.js`.

### 2. Use Sessions for Authentication
Sessions allow the server to remember who the user is across requests without requiring login credentials every time.

### 3. Protect Your Routes
Use middleware to ensure only authenticated users can access sensitive data and operations.

### 4. Validate User Input
Always validate and sanitize user input on the server side, even if you have client-side validation.

### 5. Use HTTPS in Production
This example uses HTTP for local development, but production applications should always use HTTPS to encrypt data in transit.

## 🔧 Customization Ideas for Students

1. **Add Registration**: Implement a user registration endpoint
2. **Password Reset**: Add password reset functionality
3. **Message Attachments**: Allow users to attach files to messages
4. **Search Functionality**: Add search for messages
5. **Message Folders**: Implement inbox, sent, and trash folders
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **Email Notifications**: Send email notifications for new messages
8. **Two-Factor Authentication**: Implement 2FA for enhanced security

## ⚠️ Important Notes for Production

This is an educational example. Before deploying to production:

1. **Change the session secret** to a strong, random value
2. **Enable HTTPS** and set `secure: true` on cookies
3. **Use a production database** (PostgreSQL, MySQL, etc.)
4. **Implement rate limiting** to prevent brute force attacks
5. **Add CSRF protection** for form submissions
6. **Use environment variables** for configuration
7. **Implement proper error handling and logging**
8. **Add input sanitization** to prevent XSS attacks
9. **Set up proper backup procedures**
10. **Consider using a session store** like Redis for scalability

## 📖 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Common web security risks
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [Express Sessions](https://www.npmjs.com/package/express-session)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

## 📝 Assignment Ideas

1. **Security Audit**: Have students identify potential security vulnerabilities
2. **Feature Addition**: Add one of the customization ideas listed above
3. **Code Review**: Review and document how each security feature works
4. **Testing**: Write tests for authentication and messaging functionality
5. **Deployment**: Deploy the application to a cloud platform with proper security

## 🤝 Support

This is an educational example. Students should:
- Review the code comments for explanations
- Experiment with modifications
- Research unfamiliar concepts
- Ask questions about implementation details

## 📄 License

MIT License - Free for educational use

---

**Remember:** Security is not a feature you add at the end—it must be built in from the start!
