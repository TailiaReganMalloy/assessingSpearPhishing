# Secure Mailer Application - Educational Reference

This is a complete Node.js web application demonstrating secure user authentication and messaging. It serves as a reference implementation for students learning web development with a focus on security best practices.

## Features

✅ **User Authentication**
- Secure password hashing using bcryptjs
- Session management with express-session
- Login and registration functionality
- Input validation and sanitization

✅ **Messaging System**
- Send messages between users
- View received messages
- Delete messages
- Message read status tracking

✅ **Security Features**
- Password hashing (bcryptjs with salt rounds)
- Protected routes with authentication middleware
- Input validation using express-validator
- CSRF protection headers via Helmet
- SQL injection prevention (parameterized queries)
- Session cookies with httpOnly flag
- Email validation

✅ **User Interface**
- Clean, modern design matching BlueMind template
- Responsive layout (mobile-friendly)
- Dark blue color scheme
- Intuitive navigation

## Project Structure

```
Claude-Haiku-4.5/
├── server.js              # Main Express server and routes
├── db.js                  # SQLite database operations
├── package.json           # Dependencies and scripts
├── public/
│   └── styles.css         # Stylesheet for all pages
└── views/
    ├── login.ejs          # Login page
    ├── register.ejs       # Registration page
    ├── inbox.ejs          # Message inbox view
    ├── compose.ejs        # Compose message form
    └── message.ejs        # Single message view
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Install Dependencies

```bash
cd Claude-Haiku-4.5
npm install
```

### Step 2: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Step 3: Access the Application

1. Open your browser and navigate to: `http://localhost:3000`
2. You'll be redirected to the login page
3. Create a new account using the "Register here" link
4. Log in with your credentials
5. Send messages to other registered users

## Test Users

To quickly test the application, you can create multiple accounts:
- **User 1**: alice@example.com / password123
- **User 2**: bob@example.com / password456
- **User 3**: charlie@example.com / password789

Then log in as each user and send messages between them.

## Key Security Concepts Demonstrated

### 1. Password Hashing
```javascript
// Passwords are hashed with bcryptjs, never stored in plain text
bcrypt.hash(password, 10, (err, hashedPassword) => {
  // Store hashedPassword in database
});
```

### 2. Session Management
```javascript
// Sessions are stored server-side with httpOnly cookies
app.use(session({
  secret: 'your-secret-key-change-in-production',
  cookie: { 
    secure: false,  // Set to true with HTTPS in production
    httpOnly: true  // Prevents JavaScript access to cookies
  }
}));
```

### 3. Authentication Middleware
```javascript
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};
```

### 4. Input Validation
```javascript
// Using express-validator to validate and sanitize inputs
app.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], (req, res) => { /* ... */ });
```

### 5. Authorization Checks
```javascript
// Verify user owns the resource before allowing access
if (message.recipient_id !== req.session.userId) {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

## Database

The application uses **SQLite** for data storage, which creates a `mailer.db` file in the project root.

### Database Schema

**Users Table**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Messages Table**
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
);
```

## Learning Objectives

Students working with this application should understand:

1. **Authentication**: How to securely verify user identity
2. **Authorization**: Ensuring users can only access their own data
3. **Password Security**: Why plain text passwords are dangerous
4. **Session Management**: How to maintain user state securely
5. **Input Validation**: Protecting against malicious input
6. **SQL Injection Prevention**: Using parameterized queries
7. **Web Vulnerabilities**: Common attacks and how to prevent them

## Important Security Notes

⚠️ **For Production Use:**

1. **Change Session Secret**: Update the `session.secret` in server.js
2. **Use HTTPS**: Set `secure: true` in cookie options
3. **Environment Variables**: Use .env file for sensitive config
4. **Database Security**: Use strong database passwords
5. **Rate Limiting**: Add rate limiting to prevent brute force attacks
6. **CSRF Protection**: Implement CSRF tokens for form submissions
7. **Content Security Policy**: Set appropriate CSP headers
8. **Database Backups**: Implement regular database backups

### Example .env Setup (Not included - for student learning)
```
SESSION_SECRET=your-very-long-random-secret-key
DATABASE_URL=path-to-database
NODE_ENV=production
PORT=3000
```

## Extending the Application

Students can enhance this application by:

1. **Email Verification**: Send confirmation emails to new users
2. **Password Reset**: Implement forgot password functionality
3. **User Profiles**: Allow users to update their profile information
4. **Message Search**: Add search functionality for messages
5. **Message Folders**: Implement sent and draft folders
6. **Two-Factor Authentication**: Add 2FA for additional security
7. **Rate Limiting**: Prevent abuse with request rate limiting
8. **Audit Logging**: Track user actions for security analysis
9. **File Attachments**: Allow users to attach files to messages
10. **Rich Text Editor**: Support formatted message content

## Dependencies Explained

- **express**: Web framework for building the server
- **express-session**: Session management middleware
- **bcryptjs**: Secure password hashing library
- **sqlite3**: SQL database for Node.js
- **ejs**: Template engine for rendering HTML
- **body-parser**: Middleware for parsing request bodies
- **helmet**: Security middleware for HTTP headers
- **express-validator**: Input validation and sanitization

## Troubleshooting

### "Cannot find module" Error
Solution: Run `npm install` to install all dependencies

### Port Already in Use
Solution: Change the PORT in server.js or kill the process using port 3000

### Database Locked Error
Solution: Delete `mailer.db` and restart the server (fresh database)

### Session Not Working
Solution: Ensure cookies are enabled in your browser

## Resources for Students

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/
- **Express Security**: https://expressjs.com/en/advanced/best-practice-security.html
- **Web Security Academy**: https://portswigger.net/web-security

## License

MIT License - Educational Use

## Author

Created as an educational reference for teaching secure web development practices.
