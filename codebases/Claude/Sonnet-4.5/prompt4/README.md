# Secure Login & Messaging Application

An educational web application demonstrating secure authentication mechanisms, safe password storage practices, and inter-user messaging features for software engineering curriculum.

## 🎓 Educational Purpose

This project demonstrates key security concepts for web applications:
- **Secure password hashing** using bcrypt
- **Session-based authentication**
- **Protection against common vulnerabilities**
- **User-to-user messaging system**

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## 👥 Demo Accounts

The application comes with pre-configured demo accounts:

| Email | Password | Name |
|-------|----------|------|
| alice@bluemind.net | demo123 | Alice Johnson |
| bob@bluemind.net | demo123 | Bob Smith |
| carol@bluemind.net | demo123 | Carol Williams |

## 🔒 Security Features Demonstrated

### 1. Password Hashing with bcrypt

**What it does:** Passwords are never stored in plain text. Instead, they are hashed using bcrypt with a salt factor of 10.

**Code example from server.js:**
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

**Why it matters:**
- If the database is compromised, attackers cannot retrieve original passwords
- bcrypt is designed to be slow, making brute-force attacks computationally expensive
- Each password has a unique salt, preventing rainbow table attacks

**Learning point:** Never use MD5, SHA-1, or plain SHA-256 for passwords. Always use purpose-built password hashing algorithms like bcrypt, scrypt, or Argon2.

### 2. Session Management

**What it does:** After successful login, the server creates a secure session stored on the server side. The client receives only a session ID in a cookie.

**Code example:**
```javascript
app.use(session({
  secret: 'educational-demo-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

**Security features:**
- `httpOnly`: Prevents JavaScript from accessing the cookie (XSS protection)
- `secure`: Should be true in production to require HTTPS
- `maxAge`: Automatically expires sessions

**Learning point:** Session-based authentication is more secure than storing authentication tokens in localStorage, which is vulnerable to XSS attacks.

### 3. Authentication Middleware

**What it does:** Protects API endpoints by verifying the user is logged in before allowing access.

**Code example:**
```javascript
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

app.get('/api/messages', requireAuth, (req, res) => {
  // Only authenticated users can access messages
});
```

**Learning point:** Always validate authentication on the server side. Client-side validation is easily bypassed.

### 4. Input Validation

**What it does:** Validates user input before processing to prevent injection attacks and data corruption.

**Code example:**
```javascript
if (!email || !password) {
  return res.status(400).json({ error: 'Email and password are required' });
}
```

**Learning point:** Never trust client input. Always validate on the server side.

### 5. XSS Protection

**What it does:** Escapes HTML content in messages to prevent Cross-Site Scripting attacks.

**Code example from dashboard.js:**
```javascript
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

**Learning point:** Always sanitize user-generated content before displaying it to prevent XSS attacks.

### 6. Private vs Public Computer Option

**What it does:** Adjusts session duration based on whether the user is on a private or public computer.

**Code example:**
```javascript
if (!isPrivateComputer) {
  req.session.cookie.maxAge = 60 * 60 * 1000; // 1 hour for public computers
}
```

**Learning point:** Consider the user's context when setting session lifetimes.

## 📁 Project Structure

```
├── server.js              # Express server with all API endpoints
├── package.json           # Node.js dependencies
├── public/
│   ├── index.html        # Login/Register page
│   ├── dashboard.html    # Messaging dashboard
│   ├── styles.css        # Styling matching BlueMind design
│   ├── login.js          # Login/register functionality
│   └── dashboard.js      # Messaging functionality
└── README.md             # This file
```

## 🛡️ Security Best Practices Demonstrated

1. **Password Security**
   - Minimum password length enforcement
   - Hashing with bcrypt (not reversible encryption)
   - Salt automatically generated per password

2. **Session Security**
   - Server-side session storage
   - HttpOnly cookies to prevent XSS
   - Session expiration
   - Different durations for private/public computers

3. **Authentication**
   - Credentials never exposed in URLs
   - POST requests for sensitive operations
   - Session-based authentication
   - Middleware-protected routes

4. **Data Protection**
   - Input validation on all endpoints
   - HTML escaping for user content
   - Error messages don't reveal system details

5. **API Security**
   - RESTful API design
   - Proper HTTP status codes
   - JSON-based communication

## 🚫 Important: NOT for Production

This is an **educational demonstration** only. Before using in production:

1. **Replace in-memory storage** with a proper database (PostgreSQL, MongoDB, etc.)
2. **Use environment variables** for secrets (never hardcode)
3. **Enable HTTPS** and set `secure: true` for cookies
4. **Add rate limiting** to prevent brute-force attacks
5. **Implement CSRF protection**
6. **Add input sanitization** library
7. **Set up proper logging** and monitoring
8. **Use a production-grade session store** (Redis, etc.)
9. **Add email verification** for new accounts
10. **Implement password reset** functionality
11. **Add two-factor authentication** (2FA)
12. **Set up proper error handling** without exposing system details

## 📚 Common Vulnerabilities This App Protects Against

| Vulnerability | Protection Method |
|---------------|-------------------|
| SQL Injection | Using object-based database operations (not SQL strings) |
| XSS (Cross-Site Scripting) | HTML escaping user content |
| Password Attacks | bcrypt hashing with salt |
| Session Hijacking | HttpOnly cookies, session expiration |
| Brute Force | (Should add rate limiting in production) |
| CSRF | (Should add CSRF tokens in production) |

## 🧪 Testing the Application

1. **Register a new user:**
   - Click "Register here" on the login page
   - Enter name, email, and password (min 6 characters)
   - Submit to create account

2. **Login:**
   - Use one of the demo accounts or your new account
   - Select "Private computer" or "Public computer"
   - Note: Public computer sessions expire faster

3. **Send a message:**
   - After login, go to "Compose Message" tab
   - Select a recipient from the dropdown
   - Type your message and send

4. **View messages:**
   - Go to "Inbox" tab
   - See all sent and received messages
   - Messages auto-refresh every 10 seconds

5. **Test password security:**
   - Try to login with wrong password (will fail)
   - Notice you can't see actual passwords in the database
   - Each password hash is unique even if passwords match

## 🔍 Learning Exercises for Students

1. **Inspect the Network Tab:**
   - Open browser DevTools → Network tab
   - Watch how login credentials are sent (POST, not GET)
   - See how sessions work (cookie-based)

2. **Try to Hack It:**
   - Can you see other users' passwords? (No - they're hashed)
   - Can you access messages without login? (No - middleware blocks it)
   - Can you inject HTML in messages? (No - content is escaped)

3. **Improve It:**
   - Add password strength indicator
   - Add "Remember me" functionality
   - Implement message deletion
   - Add user profile pictures
   - Add real-time notifications

4. **Security Audit:**
   - What happens if you try SQL injection?
   - Can you steal session cookies with JavaScript?
   - What if you guess session IDs?
   - How long until sessions expire?

## 📖 Additional Resources

- [OWASP Top 10 Web Security Risks](https://owasp.org/www-project-top-ten/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [Express Session Documentation](https://www.npmjs.com/package/express-session)
- [Web Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/Security)

## 📝 License

MIT License - This is educational software, free to use and modify for learning purposes.

## ⚠️ Disclaimer

This application is designed for educational purposes to demonstrate security concepts in a controlled environment. It should not be deployed in production without significant security enhancements. The developers assume no liability for any misuse or security breaches resulting from the use of this code.
