# Security Concepts Glossary & Implementation Guide

This document explains the security concepts implemented in SecureMsg.

## 🔑 Key Concepts

### 1. Password Hashing with Bcrypt

**What it is**: Converting plain text passwords into a one-way cryptographic hash using the bcrypt algorithm.

**Why it matters**: 
- If database is breached, attackers don't get plain text passwords
- Bcrypt includes the salt, making rainbow table attacks impractical
- Automatically slower as computers get faster (adaptive)

**In this app**: [db/auth.js](db/auth.js#L10-L15)
```javascript
// Hashing
const hash = await bcrypt.hash(password, 10);

// Verification (compares without revealing hash)
const isValid = await bcrypt.compare(password, hash);
```

**Student Exercise**: 
- Notice how we never print or log the hash
- Try changing saltRounds to 15 - observe the timing difference
- Research why we compare hashes instead of comparing strings

---

### 2. SQL Injection Prevention

**What it is**: Using parameterized queries (prepared statements) to prevent SQL code injection.

**Why it matters**:
- Malicious SQL code cannot escape the parameter
- User input is treated as data, never code
- The database engine handles escaping

**Bad Practice** (DON'T DO THIS):
```javascript
// VULNERABLE - SQL INJECTION RISK
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.get(query, ...);
```

**Correct Practice** (in this app): [db/auth.js](db/auth.js#L40)
```javascript
// SAFE - Parameterized query
db.get(
  'SELECT * FROM users WHERE email = ?',
  [email],  // User input goes here, not in the query string
  (err, user) => { ... }
);
```

**Student Exercise**:
- Find all SQL queries in the codebase
- Verify they use parameterized statements (? placeholders)
- Try to exploit the login form with SQL injection attempts

---

### 3. Session Security

**What it is**: Maintaining user authentication state using secure, server-side sessions.

**Why it matters**:
- Sessions prove the user authenticated earlier
- httpOnly flag prevents JavaScript access (XSS protection)
- sameSite prevents Cross-Site Request Forgery (CSRF)

**In this app**: [server.js](server.js#L28-L37)
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,      // JavaScript cannot read this
    sameSite: 'strict',  // Only this site can use this cookie
    secure: true,        // HTTPS only (in production)
  }
}));
```

**Student Exercise**:
- Open browser DevTools → Application tab
- Login and observe the session cookie
- Notice you cannot read it (httpOnly protection)
- Try different computer types - see how that's stored in session

---

### 4. Cross-Site Request Forgery (CSRF) Protection

**What it is**: Preventing requests from being made from other websites on behalf of the user.

**Why it matters**:
- Without protection, evil.com could make your user send messages
- Sessions with sameSite flag restrict cookie usage
- Form tokens add additional verification

**In this app**: 
- Used automatically by express-session with `sameSite: 'strict'`
- Cookies only sent from your domain
- Prevents forms on other sites from submitting to our server

**Student Exercise**:
- Create an HTML file on another server
- Try to submit a form to this app from that external site
- Observe the request is blocked/ignored

---

### 5. Password Strength Requirements

**What it is**: Enforcing minimum password complexity to resist brute-force attacks.

**Why it matters**:
- Longer passwords are exponentially harder to crack
- 8+ characters gives reasonable protection
- Should also check against common passwords (not in this demo)

**In this app**: [routes/auth.js](routes/auth.js#L90)
```javascript
body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
```

**Student Exercise**:
- Try registering with passwords of different lengths
- Observe the validation message
- Research why 8 characters is a minimum standard

---

### 6. Input Validation

**What it is**: Checking that user input matches expected format before processing.

**Why it matters**:
- Prevents invalid data in database
- Protects against injection attacks
- Provides better user feedback

**In this app**: [routes/auth.js](routes/auth.js#L48-L57)
```javascript
body('email').isEmail().normalizeEmail(),
body('password').notEmpty(),
```

**Student Exercise**:
- Try submitting forms with invalid email formats
- Notice validation errors on both client and server
- Server-side validation is the important one

---

### 7. XSS (Cross-Site Scripting) Prevention

**What it is**: Preventing JavaScript code from being executed through user input.

**Why it matters**:
- Malicious JS could steal cookies or impersonate user
- Automatic escaping in template engines prevents this
- Never use `innerHTML` with user input

**In this app**: EJS auto-escapes by default
```ejs
<%= message.body %>  ← Automatically escaped
```

**Student Exercise**:
- Try sending a message with `<script>alert('xss')</script>`
- Observe it's displayed as text, not executed
- Compare with `<%- message.body %>` (unescaped - DON'T USE)

---

### 8. Authentication vs Authorization

**What it is**:
- **Authentication**: Proving who you are (login)
- **Authorization**: What you're allowed to do (permissions)

**In this app**:
- Authentication: [routes/auth.js](routes/auth.js) - login/register
- Authorization: [routes/messages.js](routes/messages.js#L10-L11) - isAuthenticated middleware

**Student Exercise**:
- Notice `isAuthenticated` middleware checks session exists
- Try accessing `/messages` without logging in
- Observe the redirect to login page

---

### 9. Secure Password Reset (NOT in this app)

**What it would look like**:
```javascript
// Generate temporary token
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenHash = await bcrypt.hash(resetToken, 10);

// Save hash in database with expiration
db.run('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
  [resetTokenHash, Date.now() + 3600000, userId]);

// Send token in URL (only sent to user's email)
const resetUrl = `https://app.com/reset/${resetToken}`;

// User must provide token to reset - validate and hash it
const resetToken = req.params.token;
const user = await getUser(req.session.userId);
const isValid = await bcrypt.compare(resetToken, user.reset_token_hash);
```

---

### 10. Logging Security Events

**What it would look like**:
```javascript
async function logAuthEvent(userId, eventType, ip, success) {
  db.run(
    'INSERT INTO auth_logs (user_id, event_type, ip_address, success, timestamp) VALUES (?, ?, ?, ?, ?)',
    [userId, eventType, ip, success, Date.now()]
  );
}

// In login route:
await logAuthEvent(user.id, 'login', req.ip, true);
```

**Why it matters**: Detect suspicious patterns and security incidents

---

## 🧪 Security Testing Checklist

Students should test these attack vectors:

- [ ] **SQL Injection**: Try entering `' OR '1'='1` in login
- [ ] **XSS**: Send message with `<img src=x onerror=alert('xss')>`
- [ ] **CSRF**: Try POST request from another site
- [ ] **Weak Password**: Try password less than 8 chars
- [ ] **Brute Force**: Try many login attempts (not rate limited)
- [ ] **Session Hijacking**: Try using session cookie on another browser
- [ ] **Plain Text Storage**: Check database.js - passwords hashed?
- [ ] **Authentication Bypass**: Try `/messages` without login

---

## 📚 Further Reading

1. **OWASP Top 10**: https://owasp.org/Top10/
2. **OWASP Authentication Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
3. **Bcrypt Documentation**: https://www.npmjs.com/package/bcryptjs
4. **Express Security Best Practices**: https://expressjs.com/en/advanced/best-practice-security.html
5. **Node.js Security Best Practices**: https://nodejs.org/en/docs/guides/security/

---

## 🔧 How to Add Security Features

### Adding Rate Limiting to Login

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

router.post('/login', loginLimiter, async (req, res) => {
  // ... existing code
});
```

### Adding Email Verification

```javascript
// After registration, create verification token
const verificationToken = crypto.randomBytes(32).toString('hex');
db.run('UPDATE users SET verification_token = ? WHERE id = ?',
  [verificationToken, user.id]);

// Send email with: http://app.com/verify/{verificationToken}

// Verify endpoint
router.get('/verify/:token', async (req, res) => {
  const user = await db.get(
    'SELECT id FROM users WHERE verification_token = ?',
    [req.params.token]
  );
  
  if (user) {
    db.run('UPDATE users SET verified = 1, verification_token = NULL WHERE id = ?',
      [user.id]);
    res.send('Email verified! You can now login.');
  }
});
```

### Adding Two-Factor Authentication (2FA)

```javascript
const speakeasy = require('speakeasy');

// Generate 2FA secret
const secret = speakeasy.generateSecret({
  name: `SecureMsg (${user.email})`
});

// Store secret in database (encrypted)
db.run('UPDATE users SET two_fa_secret = ? WHERE id = ?',
  [encrypt(secret.base32), userId]);

// Verify TOTP code
const verified = speakeasy.totp.verify({
  secret: decrypt(user.two_fa_secret),
  encoding: 'base32',
  token: req.body.totpCode,
  window: 2
});
```

---

## 🎓 Discussion Questions

1. Why hash passwords instead of encrypting them?
2. What's the difference between httpOnly and secure cookie flags?
3. How would you detect a brute-force attack?
4. Why is parameterized queries important?
5. What's the difference between authentication and authorization?
6. How would you implement "forgot password" securely?
7. Why use sessions instead of just storing data in cookies?
8. How would you add multi-device login support?
9. What's a rainbow table and why does bcrypt prevent them?
10. How would you implement password expiration?

---

**Last Updated**: 2024
**Security Level**: Educational (not production-ready)
