# Security Notes and Educational Documentation

## 🎯 Purpose
This document provides detailed information about the security concepts implemented in the BlueMind Security Demo application, designed for educational purposes.

## 🔐 Implemented Security Features

### 1. Authentication & Authorization

#### Password Security
- **Bcrypt Hashing**: Passwords are hashed using bcrypt with 12 rounds by default
- **Salt Handling**: Bcrypt automatically handles salt generation and storage
- **Password Requirements**: Enforced complexity rules (8+ chars, mixed case, numbers, symbols)

```javascript
// Password hashing example
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

// Password verification
const isValid = await bcrypt.compare(inputPassword, storedHashedPassword);
```

#### Account Protection
- **Progressive Lockout**: Account locks after 5 failed attempts for 15 minutes
- **Attempt Tracking**: Failed login attempts are tracked per user account
- **Rate Limiting**: Global rate limiting prevents rapid-fire attacks

#### Session Management
- **Secure Cookies**: HTTP-only, secure, SameSite cookies
- **Variable Duration**: Private computers (24h) vs Public computers (30min)
- **Session Tracking**: All active sessions are logged with metadata

### 2. Input Validation & Sanitization

#### Server-Side Validation
```javascript
// Example validation rules
[
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
    body('subject').trim().isLength({ min: 1, max: 200 })
]
```

#### XSS Prevention
- **HTML Sanitization**: User content is sanitized using sanitize-html
- **Allowed Tags**: Only safe HTML tags are permitted in messages
- **Content Security Policy**: Strict CSP headers prevent script injection

```javascript
// Content sanitization example
const sanitizedContent = sanitizeHtml(userInput, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: {}
});
```

### 3. CSRF Protection

#### Implementation
- **CSRF Tokens**: All forms include unique CSRF tokens
- **Session-Based**: Tokens are validated against session data
- **Automatic Protection**: Middleware automatically validates tokens

```html
<!-- CSRF token in forms -->
<input type="hidden" name="_csrf" value="<%= csrfToken %>" />
```

### 4. SQL Injection Prevention

#### Parameterized Queries
```javascript
// Safe database query with parameters
db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', 
       [email, hashedPassword]);

// Unsafe (not used): 
// db.run(`INSERT INTO users (email, password) VALUES ('${email}', '${password}')`);
```

### 5. Security Headers

#### Helmet.js Configuration
```javascript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            // ... more directives
        },
    }
}));
```

## 🕵️ Security Event Logging

### Logged Events
1. **Authentication Events**
   - LOGIN_SUCCESS
   - LOGIN_FAILED  
   - LOGIN_ATTEMPT_INVALID_USER
   - LOGIN_ATTEMPT_LOCKED_ACCOUNT
   - LOGOUT

2. **User Management Events**
   - USER_REGISTERED
   - ACCOUNT_LOCKED
   - ACCOUNT_UNLOCKED

3. **Message Events**
   - MESSAGE_SENT
   - MESSAGE_READ
   - MESSAGE_ACCESS_DENIED

4. **Security Events**
   - RATE_LIMIT_EXCEEDED
   - CSRF_TOKEN_INVALID
   - VALIDATION_FAILED

### Log Format
```json
{
  "timestamp": "2026-01-21T10:30:45.123Z",
  "event": "LOGIN_SUCCESS",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "session": "sess_abc123",
  "userId": 1,
  "computerType": "private",
  "sessionDuration": 86400000
}
```

## 🎓 Educational Scenarios

### Scenario 1: Brute Force Attack Prevention
**Objective**: Demonstrate rate limiting and account lockout

**Steps**:
1. Attempt to login with incorrect password 5+ times
2. Observe rate limiting kick in
3. Notice account lockout after threshold
4. Try correct password (should be blocked)

**Learning**: Multiple layers of protection prevent brute force attacks

### Scenario 2: Session Security
**Objective**: Show different session behaviors

**Steps**:
1. Login selecting "Public Computer"
2. Note 30-minute session timeout warning
3. Login selecting "Private Computer"  
4. Note 24-hour session duration

**Learning**: Session security should match usage context

### Scenario 3: XSS Attack Prevention
**Objective**: Demonstrate content sanitization

**Steps**:
1. Try sending message with HTML: `<script>alert('XSS')</script>`
2. Send message with safe HTML: `<b>Bold text</b>`
3. Observe sanitization in action

**Learning**: All user content must be sanitized

### Scenario 4: CSRF Protection
**Objective**: Show form protection

**Steps**:
1. Inspect form HTML to see CSRF token
2. Try submitting form without token (use browser dev tools)
3. Observe protection response

**Learning**: All state-changing operations need CSRF protection

## 🔍 Security Testing

### Manual Testing Checklist

#### Authentication Testing
- [ ] Try weak passwords during registration
- [ ] Test password requirements enforcement
- [ ] Verify account lockout after failed attempts
- [ ] Test session expiration
- [ ] Verify logout functionality

#### Input Validation Testing
- [ ] Submit forms with missing fields
- [ ] Try XSS payloads in message content
- [ ] Test with oversized inputs
- [ ] Verify email format validation

#### Authorization Testing
- [ ] Try accessing dashboard without login
- [ ] Attempt to view other users' messages
- [ ] Test session timeout behavior

### Automated Testing Ideas

```javascript
// Example test cases (not implemented)
describe('Authentication Security', () => {
  it('should hash passwords with bcrypt', () => {
    // Test password hashing
  });
  
  it('should lock account after 5 failed attempts', () => {
    // Test account lockout
  });
  
  it('should expire sessions based on computer type', () => {
    // Test session duration
  });
});
```

## 🚨 Common Vulnerabilities Prevented

### 1. Password Attacks
- **Brute Force**: Rate limiting + account lockout
- **Dictionary Attacks**: Password complexity requirements
- **Rainbow Tables**: Proper salt usage with bcrypt

### 2. Session Attacks
- **Session Hijacking**: Secure, HTTP-only cookies
- **Session Fixation**: New session ID on login
- **Cross-Site Request Forgery**: CSRF tokens

### 3. Injection Attacks
- **SQL Injection**: Parameterized queries
- **XSS (Cross-Site Scripting)**: Input sanitization + CSP
- **HTML Injection**: Content filtering

### 4. Information Disclosure
- **Error Messages**: Generic error responses
- **Debug Information**: Production-safe error handling
- **Enumeration**: Consistent response times

## 🔧 Security Configuration

### Environment Variables Explained

```bash
# Database path
DB_PATH=./database/bluemind.db

# Session secret (should be cryptographically random)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Password hashing rounds (higher = more secure but slower)
BCRYPT_ROUNDS=12

# Account lockout settings
MAX_LOGIN_ATTEMPTS=5        # Failed attempts before lockout
LOGIN_ATTEMPT_WINDOW=15     # Minutes to track attempts

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes in milliseconds
RATE_LIMIT_MAX=5            # Max attempts per window

# Application settings
PORT=3000
NODE_ENV=development        # Set to 'production' for production
```

### Production Security Checklist

#### Before Deployment
- [ ] Change SESSION_SECRET to cryptographically random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS and update cookie settings
- [ ] Review and update CSP directives
- [ ] Remove demo users and credentials
- [ ] Set up proper database with authentication
- [ ] Configure logging to secure location
- [ ] Set up monitoring and alerting

#### Post-Deployment
- [ ] Regular security updates
- [ ] Log monitoring and analysis
- [ ] Penetration testing
- [ ] Security audit reviews
- [ ] Backup and recovery testing

## 📚 Further Learning

### Recommended Reading
1. **OWASP Top 10**: Current web application security risks
2. **Node.js Security Checklist**: Platform-specific security guide
3. **Express Security Best Practices**: Framework security guide

### Next Steps
1. Implement additional security features (2FA, password reset)
2. Add comprehensive logging and monitoring
3. Implement proper user role management
4. Add API security features
5. Create automated security tests

### Security Tools to Explore
- **Static Analysis**: ESLint security plugins, semgrep
- **Dynamic Testing**: OWASP ZAP, Burp Suite
- **Dependency Scanning**: npm audit, Snyk
- **Security Headers**: securityheaders.com testing

---

**Remember**: Security is an ongoing process, not a destination. Stay updated with current threats and best practices!