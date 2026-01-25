# Security Analysis and Learning Guide

## 🔍 Security Features Deep Dive

### 1. Password Security Implementation

**File:** [server.js](server.js#L89-L95)

```javascript
// Password hashing with bcrypt (salt rounds: 12)
bcrypt.hash(user.password, 12, (err, hash) => {
  if (err) return;
  db.run('INSERT OR IGNORE INTO users (email, password_hash) VALUES (?, ?)', 
    [user.email, hash]);
});
```

**Why this matters:**
- bcrypt automatically generates unique salts
- Salt rounds of 12 provides strong security vs performance balance
- Passwords are never stored in plaintext

**Student Exercise:** Try reducing salt rounds to 1 and measure the performance difference.

### 2. SQL Injection Prevention

**File:** [server.js](server.js#L158-L160)

```javascript
// Parameterized queries prevent SQL injection
db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
```

**Vulnerable approach (DON'T DO THIS):**
```javascript
// This would be vulnerable to SQL injection
db.get(`SELECT * FROM users WHERE email = '${email}'`, (err, user) => {
```

**Attack example:** An attacker could input: `'; DROP TABLE users; --`

### 3. CSRF Protection

**File:** [server.js](server.js#L50) and [login.ejs](views/login.ejs#L37)

```javascript
// Server setup
const csrfProtection = csrf({ cookie: true });

// In forms
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
```

**Why CSRF tokens work:**
- Tokens are unique per session
- Attackers can't predict or access the token
- All state-changing requests require valid tokens

### 4. Session Security

**File:** [server.js](server.js#L30-L39)

```javascript
app.use(session({
  secret: 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

**Security considerations:**
- `httpOnly: true` prevents XSS access to session cookies
- `secure: true` ensures cookies only sent over HTTPS
- `maxAge` limits session lifetime

### 5. Input Validation & Sanitization

**File:** [server.js](server.js#L145-L149)

```javascript
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];
```

**Validation layers:**
1. Client-side validation (user experience)
2. Server-side validation (security)
3. Database constraints (data integrity)

## 🎯 Common Vulnerabilities and Their Prevention

### 1. SQL Injection
**Prevention:** Parameterized queries
**Location:** All database operations in [server.js](server.js)

### 2. Cross-Site Scripting (XSS)
**Prevention:** Input escaping, CSP headers
**Location:** EJS templates and Helmet configuration

### 3. Cross-Site Request Forgery (CSRF)
**Prevention:** CSRF tokens
**Location:** Form protection in views

### 4. Session Hijacking
**Prevention:** Secure session configuration
**Location:** Session middleware setup

### 5. Brute Force Attacks
**Prevention:** Rate limiting
**Location:** Login rate limiter configuration

## 🧪 Security Testing Exercises

### Exercise 1: Password Security Test

1. Create a user with a weak password
2. Try to crack it using common password lists
3. Compare with bcrypt-hashed passwords

### Exercise 2: SQL Injection Attempt

1. Find the login form
2. Try these inputs in the email field:
   - `'; DROP TABLE users; --`
   - `admin' OR '1'='1`
   - `' UNION SELECT password_hash FROM users --`

**Expected result:** All attempts should fail safely

### Exercise 3: CSRF Protection Test

1. Create an external HTML form targeting the application
2. Try to submit without CSRF token
3. Observe the protection in action

### Exercise 4: Session Security Test

1. Log in with "Public computer" selected
2. Note the shorter session timeout
3. Compare with "Private computer" behavior

### Exercise 5: Rate Limiting Test

1. Make multiple failed login attempts
2. Observe rate limiting after 5 attempts
3. Wait 15 minutes and try again

## 🔧 Security Configuration Options

### Environment Variables for Production

```bash
# .env file (not included in repository)
NODE_ENV=production
SESSION_SECRET=your-super-secure-random-string
DB_PATH=./production.db
PORT=3000
```

### Production Security Headers

**File:** [server.js](server.js#L19)

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 🚨 Security Audit Checklist

### ✅ Authentication Security
- [ ] Passwords are hashed with bcrypt
- [ ] Session timeout is implemented
- [ ] Rate limiting prevents brute force
- [ ] Secure session configuration

### ✅ Input Security
- [ ] All inputs are validated
- [ ] SQL queries use parameters
- [ ] XSS prevention is active
- [ ] File upload restrictions (if applicable)

### ✅ Session Security
- [ ] CSRF protection on forms
- [ ] Session cookies are httpOnly
- [ ] Session expiration is enforced
- [ ] Secure cookies in production

### ✅ Communication Security
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Sensitive data not logged
- [ ] Error messages don't reveal system info

## 📊 Security Metrics to Monitor

### 1. Failed Login Attempts
- Track failed login patterns
- Monitor for brute force attacks
- Alert on suspicious activity

### 2. Session Activity
- Monitor active session count
- Track session duration
- Alert on unusual patterns

### 3. Input Validation Failures
- Log validation failures
- Monitor for attack attempts
- Identify common attack vectors

### 4. Rate Limiting Events
- Track rate limit triggers
- Identify potential attackers
- Adjust limits based on patterns

## 🎓 Advanced Learning Topics

### 1. OAuth 2.0 Integration
- Understanding third-party authentication
- Implementing Google/GitHub login
- Token-based authentication

### 2. Two-Factor Authentication
- TOTP implementation
- SMS verification
- Backup codes

### 3. Security Logging
- Structured logging for security events
- Log analysis and alerting
- Compliance requirements

### 4. Penetration Testing
- Automated security scanning
- Manual security testing
- Vulnerability assessment

## 📚 Additional Resources

### Books
- "The Web Application Hacker's Handbook" by Dafydd Stuttard
- "OWASP Testing Guide"
- "Node.js Security" by Liran Tal

### Online Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

### Tools
- **Burp Suite** - Web application security testing
- **OWASP ZAP** - Security scanning
- **npm audit** - Dependency vulnerability checking
- **ESLint Security Plugin** - Code security linting

---

**Remember:** This is a learning environment. In production, additional security measures like proper logging, monitoring, backup strategies, and incident response plans are essential.