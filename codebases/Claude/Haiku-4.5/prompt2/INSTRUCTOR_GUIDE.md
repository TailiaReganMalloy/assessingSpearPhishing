# Security Best Practices Documentation

## For Web Development Instructors

This document provides guidance on using this application as an educational resource for teaching secure authentication and messaging systems.

## Curriculum Integration Points

### 1. User Authentication (1-2 weeks)

**Concepts to teach:**
- Hashing vs. Encryption
- Salts and why they're necessary
- Bcrypt algorithm and why it's better than SHA/MD5
- Timing attacks and constant-time comparisons
- Session management
- Cookie security flags

**Activities:**
- Have students modify `routes/auth.js` to implement custom password strength requirements
- Debug: What happens if you use `password === storedPassword` instead of bcrypt?
- Experiment: Create accounts and check the database to show hash diversity

**Code Review Points:**
```javascript
// File: routes/auth.js

// Good: Uses bcrypt with salt rounds
const salt = await bcrypt.genSalt(10);
const password_hash = await bcrypt.hash(password, salt);

// Bad: Would be unsalted or single salt
// const password_hash = sha256(password);

// Good: Uses bcrypt comparison (timing-attack resistant)
const isPasswordValid = await bcrypt.compare(password, user.password_hash);

// Bad: Direct comparison (timing attack vulnerable)
// if (password === storedPassword) { ... }
```

### 2. Input Validation & Sanitization (1 week)

**Concepts to teach:**
- Types of injection attacks (SQL, NoSQL, Command, etc.)
- Parameterized queries
- Input validation vs. sanitization
- Whitelist vs. blacklist approaches
- Regular expressions for validation

**Activities:**
- Have students modify the email regex pattern
- Add new required fields and validation rules
- Attempt SQL injection in forms (should fail safely)
- Compare parameterized vs. concatenated queries

**Code Review Points:**
```javascript
// File: routes/auth.js

// Good: Parameterized query with separate parameters
db.run(
  'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
  [email, password_hash, full_name]
);

// Bad: String concatenation (SQL injection vulnerability)
// db.run(`INSERT INTO users VALUES ('${email}', '${password_hash}', '${full_name}')`);

// Good: Input validation
const validateEmail = body('email')
  .isEmail()
  .normalizeEmail();

// Bad: No validation
// const email = req.body.email;
```

### 3. Authorization & Access Control (1 week)

**Concepts to teach:**
- Authentication vs. Authorization
- Role-based access control (RBAC)
- Least privilege principle
- Object-level authorization

**Activities:**
- Challenge: Try to view another user's messages (should fail)
- Modify code to implement admin role
- Implement message-level permissions
- Create activity logs for access attempts

**Code Review Points:**
```javascript
// File: routes/messages.js

// Good: Checks user is authenticated AND authorized
if (!req.session.userId) {
  return res.status(401).json({ error: 'Not authenticated' });
}

// Verify user is sender or recipient
if (message.recipient_id !== userId && message.sender_id !== userId) {
  return res.status(403).json({ error: 'Unauthorized' });
}

// Bad: Only checking one condition
// if (req.session.userId) { ... }  // Not enough!
```

### 4. Session Management (1 week)

**Concepts to teach:**
- Session hijacking prevention
- Cookie security flags (secure, httpOnly, sameSite)
- Session expiration and timeout
- Session storage (server vs. client)
- CSRF prevention

**Activities:**
- Show cookie contents in browser DevTools
- Explain why httpOnly prevents XSS exploitation
- Implement session timeout warning
- Add "remember me" functionality securely

**Code Review Points:**
```javascript
// File: server.js

// Good: Secure session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,     // Change to true in production with HTTPS
    httpOnly: true,    // JavaScript cannot access
    sameSite: 'strict', // CSRF protection
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Bad: Insecure configuration
// cookie: { secure: false, httpOnly: false }
```

### 5. XSS Prevention (1 week)

**Concepts to teach:**
- Stored vs. Reflected XSS
- Context-aware escaping
- Content Security Policy (CSP)
- XSS testing techniques

**Activities:**
- Attempt to inject scripts in messages (should fail)
- Compare `textContent` vs. `innerHTML` security
- Implement a Content Security Policy header
- Review how Helmet.js provides XSS protection

**Code Review Points:**
```javascript
// File: public/app.js

// Good: Escaped text content (safe from XSS)
div.textContent = text;

// Bad: Unescaped HTML (XSS vulnerability)
// div.innerHTML = userProvidedHTML;

// Good: Use helper function
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

## Assignment Ideas

### Assignment 1: Password Reset Feature (Difficulty: Medium)

**Requirements:**
1. Add "Forgot Password" link on login page
2. User enters email
3. Generate random token
4. Store token in database with expiration
5. Send email link (mock: just show the token)
6. User clicks link and enters new password
7. Validate token and update password

**Deliverables:**
- Modified database schema
- New API endpoints
- Updated HTML forms
- Security considerations document

**Security Focus:** Token generation, expiration, timing attacks

### Assignment 2: Two-Factor Authentication (Difficulty: Hard)

**Requirements:**
1. User registers mobile number
2. On login, generate 6-digit code
3. Send code via SMS (mock: display in console)
4. User enters code before session creation
5. Implement backup codes

**Deliverables:**
- Database changes for 2FA data
- TOTP/SMS generation (mock)
- New login flow
- Session creation only after 2FA

**Security Focus:** OTP security, backup codes, rate limiting

### Assignment 3: Message Encryption (Difficulty: Hard)

**Requirements:**
1. Encrypt message content before storage
2. Only sender and recipient can decrypt
3. Use public-key cryptography (suggest: TweetNaCl.js)
4. Handle key distribution

**Deliverables:**
- Encryption/decryption functions
- Key generation and storage
- Modified message send/receive

**Security Focus:** End-to-end encryption, key management

### Assignment 4: Audit Logging (Difficulty: Medium)

**Requirements:**
1. Create audit_logs table
2. Log all authentication events (login, logout, failed attempts)
3. Log all message operations (send, read, delete)
4. Create admin dashboard to view logs
5. Implement alerting for suspicious activity

**Deliverables:**
- Audit log schema
- Logging middleware
- Admin dashboard
- Alert thresholds

**Security Focus:** Intrusion detection, compliance, forensics

### Assignment 5: API Rate Limiting (Difficulty: Medium)

**Requirements:**
1. Limit login attempts to 5 per minute per IP
2. Limit message sends to 10 per minute per user
3. Implement exponential backoff for repeated failures
4. Track and log rate limit violations

**Deliverables:**
- Rate limiting middleware
- Modified authentication routes
- Monitoring dashboard

**Security Focus:** Brute force prevention, DoS protection

## Grading Rubric Template

### Functionality (25%)
- [ ] Features work as specified
- [ ] No crashes or major errors
- [ ] Database operations correct
- [ ] API responses properly formatted

### Security (40%)
- [ ] Input validation implemented correctly
- [ ] Parameterized queries used
- [ ] Passwords properly hashed
- [ ] Authentication/authorization working
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities
- [ ] Session management secure

### Code Quality (20%)
- [ ] Code is readable and well-commented
- [ ] Follows project structure
- [ ] Error handling implemented
- [ ] DRY principles followed
- [ ] Consistent naming conventions

### Documentation (15%)
- [ ] README or setup guide included
- [ ] Security considerations documented
- [ ] Code comments explain key parts
- [ ] Design decisions justified

## Discussion Topics

1. **Bcrypt vs. Argon2**: Why might Argon2 be better? When would you choose each?

2. **SQL vs. NoSQL Security**: How do security concerns differ between relational and document databases?

3. **Microservices**: How would authentication change in a microservices architecture?

4. **OAuth/OpenID**: When should you outsource authentication to a third party?

5. **Zero Trust Architecture**: How could this application implement zero trust principles?

6. **Compliance**: What are GDPR, CCPA, and HIPAA implications for this application?

7. **Incident Response**: If the database was stolen, what would you do?

8. **Secrets Management**: How should API keys and secrets be handled differently in dev vs. production?

## Real-World Scenarios

### Scenario 1: Brute Force Attack

A user is repeatedly trying to login with different passwords. How would you:
1. Detect this in real-time?
2. Prevent it?
3. Alert administrators?
4. Balance user experience with security?

### Scenario 2: Data Breach

The database containing all passwords is stolen. What now?
1. How serious is this if passwords are hashed?
2. What would you tell users?
3. What if someone had weak passwords?
4. How would you prevent future breaches?

### Scenario 3: Insider Threat

An administrator uses their access to read private messages. How do you:
1. Prevent this?
2. Detect this?
3. Handle the fallout?
4. Maintain audit trails?

### Scenario 4: Zero-Day XSS

A new XSS vulnerability is discovered. How do you:
1. Respond quickly?
2. Patch the vulnerability?
3. Check if you were compromised?
4. Prevent similar issues?

## Advanced Topics

### Threat Modeling

Have students perform OWASP threat modeling:
1. Identify assets (user data, messages)
2. Identify threats (theft, modification, disclosure)
3. Identify vulnerabilities (weak hashing, no encryption)
4. Create mitigation strategies

### Security Audit Checklist

```
[ ] All inputs validated
[ ] All queries parameterized
[ ] Passwords hashed with proper algorithm
[ ] Sessions stored server-side
[ ] Cookies have security flags
[ ] HTTPS enforced in production
[ ] Error messages don't leak info
[ ] Logging implemented
[ ] Rate limiting implemented
[ ] Access control verified
[ ] Dependencies scanned for vulnerabilities
[ ] Code reviewed by peer
[ ] Security headers configured
[ ] Database encrypted at rest
[ ] Secrets not in version control
```

## Resources for Instructors

### Security Standards
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CWE/SANS Top 25: https://cwe.mitre.org/
- NIST Cybersecurity Framework: https://www.nist.gov/

### Tools
- OWASP ZAP: Automated security testing
- Burp Suite Community: Manual security testing
- npm audit: Dependency vulnerability scanning
- Snyk: Security vulnerability monitoring

### Further Learning
- "The Web Application Hacker's Handbook" by Stuttard & Pinto
- "Web Security Testing Cookbook" by Stuttard & Pinto
- OWASP WebGoat: Interactive security training
- HackTheBox: Hands-on hacking practice

## Conclusion

This application provides a solid foundation for teaching secure web development. The code is intentionally straightforward to allow students to understand both the happy path and security implications. Encourage students to:

1. Read and understand every line
2. Question security assumptions
3. Experiment with breaking the system
4. Learn from real-world vulnerabilities
5. Stay current with security news

Security is not a feature—it's a mindset.
