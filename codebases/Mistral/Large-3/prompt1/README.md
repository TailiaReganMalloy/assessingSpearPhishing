# BlueMind v5 - Secure Messaging Application

## Educational Example for Web Security & Authentication

This is a complete educational example of a secure login and messaging system built with Node.js. It demonstrates best practices for user authentication, password storage, session management, and secure messaging functionality.

![BlueMind Login](https://img.shields.io/badge/BlueMind-v5-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📚 Learning Objectives

Students will learn:

1. **Secure Password Storage** - Using bcrypt for hashing
2. **Session Management** - Implementing secure user sessions
3. **Authentication & Authorization** - Protecting routes and resources
4. **SQL Database Design** - Creating normalized database schemas
5. **Input Validation** - Preventing security vulnerabilities
6. **RESTful Routing** - Organizing application endpoints
7. **Template Rendering** - Using EJS for dynamic HTML

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- A code editor (VS Code recommended)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   - Open your browser and navigate to: `http://localhost:3000`

---

## 👥 Demo Accounts

The application comes pre-configured with three demo accounts:

| Email | Password |
|-------|----------|
| alice@bluemind.net | Alice123! |
| bob@bluemind.net | Bob123! |
| carol@bluemind.net | Carol123! |

Demo messages are automatically created between these users.

---

## 📁 Project Structure

```
secure-messaging-app/
├── server.js              # Main application server
├── database.js            # Database schema and operations
├── package.json           # Project dependencies
├── views/                 # EJS templates
│   ├── login.ejs         # Login page
│   ├── register.ejs      # Registration page
│   ├── dashboard.ejs     # Inbox view
│   ├── view-message.ejs  # Single message view
│   └── compose.ejs       # Compose new message
├── public/               # Static assets
│   └── css/
│       └── styles.css    # Application styles
└── database.db           # SQLite database (created on first run)
```

---

## 🔐 Security Features

### 1. Password Hashing with bcrypt

**Why it matters:** Never store passwords in plain text!

```javascript
// When creating a user
const hashedPassword = await bcrypt.hash(password, 10);

// When verifying login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Key concept:** The `10` is the salt rounds - it determines how computationally expensive the hash is. Higher = more secure but slower.

### 2. Session Management

**Why it matters:** Sessions keep users logged in securely without sending credentials with each request.

```javascript
app.use(session({
  secret: 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // Prevents client-side JavaScript from accessing
    secure: false,     // Set to true in production with HTTPS
    maxAge: 86400000   // 24 hours
  }
}));
```

**Note:** The session duration differs based on whether the user selects "Private" or "Public" computer:
- Private: 24 hours
- Public: 30 minutes

### 3. Route Protection

**Why it matters:** Prevent unauthorized access to protected pages.

```javascript
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Protect routes
app.get('/dashboard', isAuthenticated, (req, res) => {
  // Only accessible if logged in
});
```

### 4. SQL Injection Prevention

**Why it matters:** Parameterized queries prevent SQL injection attacks.

```javascript
// ✅ SAFE - Using parameterized query
const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
const user = stmt.get(email);

// ❌ UNSAFE - String concatenation (NEVER DO THIS)
// const query = 'SELECT * FROM users WHERE email = "' + email + '"';
```

### 5. Input Validation

**Why it matters:** Validate all user input to prevent security issues.

```javascript
// Check if required fields are present
if (!email || !password) {
  return res.render('login', { error: 'Please provide email and password' });
}

// Validate password strength
if (password.length < 8) {
  return res.render('register', { 
    error: 'Password must be at least 8 characters long' 
  });
}
```

---

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
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users (id),
  FOREIGN KEY (recipient_id) REFERENCES users (id)
)
```

**Key concepts:**
- `AUTOINCREMENT`: Automatically generates unique IDs
- `UNIQUE`: Ensures no duplicate emails
- `FOREIGN KEY`: Maintains referential integrity
- `DEFAULT`: Sets default values for new records

---

## 🛣️ Application Routes

### Public Routes (No Authentication Required)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Redirects to login or dashboard |
| GET | `/login` | Display login page |
| POST | `/login` | Handle login submission |
| GET | `/register` | Display registration page |
| POST | `/register` | Handle registration submission |

### Protected Routes (Authentication Required)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Display inbox |
| GET | `/sent` | Display sent messages |
| GET | `/message/:id` | View single message |
| GET | `/compose` | Display compose form |
| POST | `/send-message` | Send a new message |
| POST | `/logout` | Log out user |

---

## 🎨 User Interface

The application features a modern, professional interface inspired by BlueMind:

- **Clean, minimal design** with a blue color scheme
- **Responsive layout** that works on desktop and mobile
- **Intuitive navigation** with sidebar menu
- **Real-time feedback** with success/error messages
- **Unread message badges** for better UX

---

## 🔧 Configuration & Customization

### Changing the Port

Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your desired port
```

### Session Secret (IMPORTANT for Production!)

Edit `server.js`:
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-here',
  // ... other options
}));
```

**In production:** Always use environment variables for secrets:
```bash
export SESSION_SECRET="your-very-long-random-string"
```

### Password Requirements

Edit the validation in `server.js` POST `/register` route:
```javascript
if (password.length < 8) {
  // Adjust minimum length or add complexity requirements
}
```

---

## 🧪 Testing the Application

### Manual Testing Checklist

**Registration:**
- [ ] Register a new user with valid email and password
- [ ] Try registering with an existing email (should fail)
- [ ] Try registering with mismatched passwords (should fail)
- [ ] Try registering with short password (should fail)

**Login:**
- [ ] Log in with valid credentials
- [ ] Try logging in with wrong password (should fail)
- [ ] Try logging in with non-existent email (should fail)
- [ ] Test "Private Computer" option (24-hour session)
- [ ] Test "Public Computer" option (30-minute session)

**Messaging:**
- [ ] View inbox messages
- [ ] View sent messages
- [ ] Read a message (should mark as read)
- [ ] Compose and send a new message
- [ ] Verify unread count updates

**Security:**
- [ ] Try accessing `/dashboard` without logging in (should redirect)
- [ ] Try viewing another user's message by changing URL ID
- [ ] Verify password is hidden in login form
- [ ] Verify logout works correctly

---

## 🚧 Common Issues & Solutions

### Issue: "Cannot find module 'better-sqlite3'"

**Solution:** Run `npm install` to install all dependencies.

### Issue: "Port 3000 is already in use"

**Solution:** Either stop the other process using port 3000, or change the port in `server.js`.

### Issue: Database doesn't reset

**Solution:** Delete `database.db` file and restart the server to recreate it with demo data.

### Issue: Session doesn't persist

**Solution:** Make sure cookies are enabled in your browser.

---

## 📖 Additional Learning Resources

### Recommended Reading

1. **OWASP Top 10** - Learn about the most critical web security risks
   - https://owasp.org/www-project-top-ten/

2. **Node.js Security Best Practices**
   - https://nodejs.org/en/docs/guides/security/

3. **Express.js Security Tips**
   - https://expressjs.com/en/advanced/best-practice-security.html

### Topics for Further Study

- **HTTPS/TLS** - Encrypting data in transit
- **CSRF Protection** - Preventing cross-site request forgery
- **XSS Prevention** - Protecting against cross-site scripting
- **Rate Limiting** - Preventing brute force attacks
- **Two-Factor Authentication** - Adding an extra security layer
- **OAuth 2.0** - Third-party authentication
- **JWT Tokens** - Alternative to sessions

---

## 🔄 Development Mode

For development with automatic server restart on file changes:

```bash
npm run dev
```

This uses `nodemon` to watch for file changes and restart automatically.

---

## 🎓 Assignment Ideas

1. **Add Password Reset Functionality**
   - Create a "Forgot Password" link
   - Generate secure reset tokens
   - Send reset emails (use console.log for demo)

2. **Implement Message Deletion**
   - Add delete button to messages
   - Soft delete vs hard delete
   - Prevent deleting other users' messages

3. **Add Search Functionality**
   - Search messages by subject or sender
   - Implement full-text search
   - Add filters (date range, read/unread)

4. **Enhance Security**
   - Add CSRF protection
   - Implement rate limiting on login
   - Add password strength meter
   - Require email verification

5. **Improve UI/UX**
   - Add pagination for message list
   - Implement real-time notifications
   - Add file attachments to messages
   - Create a dark mode theme

---

## ⚠️ Important Security Notes

**This is an educational example.** Before deploying to production:

1. **Use HTTPS** - Enable SSL/TLS certificates
2. **Environment Variables** - Store secrets in `.env` file
3. **Input Sanitization** - Add comprehensive validation
4. **CSRF Protection** - Implement CSRF tokens
5. **Rate Limiting** - Prevent brute force attacks
6. **Security Headers** - Use helmet.js
7. **Database Backups** - Implement regular backups
8. **Logging** - Add proper error and access logging
9. **Updates** - Keep dependencies up to date
10. **Code Review** - Have security professionals review

---

## 📝 License

MIT License - Feel free to use this code for educational purposes.

---

## 🤝 Contributing

This is an educational project. Students are encouraged to:
- Fork the repository
- Experiment with new features
- Share improvements
- Ask questions

---

## 💡 Tips for Students

1. **Read the code carefully** - Understanding is more important than copying
2. **Experiment** - Try breaking things to understand how they work
3. **Use the browser's Developer Tools** - Inspect network requests and cookies
4. **Read error messages** - They often tell you exactly what's wrong
5. **Comment your code** - Explain your thought process
6. **Test thoroughly** - Try to break your own code
7. **Security first** - Always think about potential vulnerabilities

---

## 📞 Support

For questions or issues with this educational project:

1. Check the code comments for detailed explanations
2. Review the security section above
3. Try debugging with console.log statements
4. Search for error messages online
5. Ask your instructor for guidance

---

**Happy Learning! 🎉**

Remember: Security is not a feature, it's a mindset. Always think about how your code could be exploited and code defensively.
