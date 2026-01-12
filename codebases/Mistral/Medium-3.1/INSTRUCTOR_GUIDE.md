# Instructor Guide

This is a complete reference implementation for teaching web security, authentication, and secure messaging systems.

## Course Integration

### Prerequisite Topics
Students should understand:
- Basic Node.js and Express
- HTML/CSS/JavaScript
- SQL and database basics
- HTTP and REST APIs
- Basic cryptography concepts

### Time Allocation
- **Day 1:** Code walkthrough (2-3 hours)
  - Database design and schema
  - Authentication flow
  - Password hashing with bcrypt
  - Session management

- **Day 2:** Security deep-dive (2-3 hours)
  - Input validation and sanitization
  - Authorization checks
  - Common vulnerabilities (SQL injection, XSS)
  - Error handling and information disclosure

- **Day 3-5:** Feature implementation (5-8 hours)
  - Students implement one extension feature
  - Code review and security audit
  - Testing and deployment considerations

## Key Learning Objectives

By the end of this assignment, students will:

✅ Understand why plain-text password storage is insecure
✅ Implement bcrypt password hashing correctly
✅ Design secure database schemas with proper relationships
✅ Implement session-based authentication
✅ Validate and sanitize user input
✅ Implement authorization (access control)
✅ Recognize common web vulnerabilities
✅ Apply OWASP best practices

## Code Walkthrough Guide

### 1. Database Design (30 min)
**File:** `db.js`

Key Points:
- Two main tables: `users` and `messages`
- Foreign key constraints ensure data integrity
- Indexes on frequently queried columns
- Use of timestamp for audit trail

**Discussion Questions:**
1. Why do we use AUTOINCREMENT for IDs?
2. What happens if we don't have foreign key constraints?
3. Why is there an index on `messages.recipient_id`?
4. How would you handle deleted users?

### 2. Password Hashing (45 min)
**File:** `routes/auth.js` lines 30-35, 77-87

Key Points:
- Never store passwords as plain text
- Bcrypt uses salt and key stretching
- SALT_ROUNDS = 10 provides good security/performance balance
- Use bcrypt.compare() to verify passwords

**Live Demo:**
```javascript
// Show the difference
const bcrypt = require('bcryptjs');

// What NOT to do
const plainPassword = "password123";
// ❌ DANGEROUS: db.password = plainPassword;

// What TO do
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(plainPassword, salt);
// ✅ GOOD: db.password_hash = hash;

// Verification
const match = await bcrypt.compare(plainPassword, hash);
```

**Discussion Questions:**
1. Why is bcrypt better than MD5 or SHA-256?
2. What is a salt and why do we need it?
3. Why does password hashing take longer than hashing regular data?
4. How would you implement password reset securely?

### 3. Session Management (30 min)
**File:** `server.js` lines 15-23

Key Points:
- Sessions stored server-side (not in JWT)
- HTTPOnly flag prevents JavaScript access
- Secure flag forces HTTPS in production
- maxAge limits session duration
- Public computer option shortens session

**Discussion Questions:**
1. What's the difference between HTTPOnly and regular cookies?
2. Why store sessions server-side instead of in JWT tokens?
3. How would you implement "remember me"?
4. What security implications does cross-site requests have?

### 4. Input Validation (30 min)
**Files:** `routes/auth.js` lines 14-26, `routes/messages.js` lines 20-30

Key Points:
- Always validate on server-side (client-side is not sufficient)
- Check for empty values, length, format
- Sanitize HTML to prevent XSS
- Use whitelist approach (allow specific formats)

**Demonstration:**
```javascript
// Bad: No validation
const email = req.body.email;
db.query(`SELECT * FROM users WHERE email = '${email}'`);
// Vulnerable to: SQL injection, invalid emails

// Good: Validation and parameterized queries
if (!email || !email.includes('@')) {
  return res.status(400).json({ error: 'Invalid email' });
}
if (password.length < 8) {
  return res.status(400).json({ error: 'Password too short' });
}
db.run('SELECT * FROM users WHERE email = ?', [email]);
```

**Discussion Questions:**
1. Why is server-side validation necessary if we validate on the client?
2. What is the difference between validation and sanitization?
3. How would you prevent XSS in message display?
4. Why do we use parameterized queries?

### 5. Authorization (30 min)
**File:** `routes/messages.js` lines 94-104

Key Points:
- Authentication ≠ Authorization
- Always check ownership of resources
- Use middleware for route protection
- Verify user can perform requested action

**Common Vulnerability:**
```javascript
// ❌ BAD - Missing authorization check
router.delete('/messages/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM messages WHERE id = ?', [req.params.id]);
  // Any authenticated user can delete any message!
});

// ✅ GOOD - Verify ownership
router.delete('/messages/:id', requireAuth, async (req, res) => {
  const message = await db.get(
    'SELECT id FROM messages WHERE id = ? AND (recipient_id = ? OR sender_id = ?)',
    [req.params.id, req.session.userId, req.session.userId]
  );
  
  if (!message) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  db.run('DELETE FROM messages WHERE id = ?', [req.params.id]);
});
```

**Discussion Questions:**
1. What's the difference between authentication and authorization?
2. How would you check if a user can edit another user's profile?
3. Why is role-based access control useful?
4. How would you implement admin privileges?

### 6. Error Handling (20 min)
**File:** `routes/auth.js` lines 51-53

Key Points:
- Don't reveal which email exists (user enumeration)
- Don't reveal detailed database errors to users
- Log detailed errors server-side for debugging
- Use consistent error responses

**Vulnerability Example:**
```javascript
// ❌ BAD - Reveals if email exists
const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
if (!user) {
  return res.status(404).json({ error: 'Email not found' });
  // Attacker learns this email is not registered
}

// ✅ GOOD - Generic error
if (!user || !bcrypt.compare(password, user.password_hash)) {
  return res.status(401).json({ error: 'Invalid email or password' });
  // Attacker can't tell if email or password was wrong
}
```

**Discussion Questions:**
1. What is user enumeration and why is it a problem?
2. How would you balance security with helpful error messages?
3. What errors should be logged but not shown to users?
4. How would you handle database connection failures?

## Assignment Options

### Option 1: Message Attachments (Intermediate)
**Learning Goals:** File handling, file validation, MIME types

**Requirements:**
- Upload files with messages
- Store in `uploads/` directory
- Validate file type (whitelist)
- Display download link in message view
- Delete files when message is deleted

**Security Considerations:**
- Validate file type server-side (not just extension)
- Use random filenames to prevent enumeration
- Check file size limits
- Prevent directory traversal attacks

**Sample Implementation:**
```javascript
const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    // Whitelist allowed MIME types
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
```

### Option 2: User Blocking (Intermediate)
**Learning Goals:** Relationships, authorization, notification

**Requirements:**
- Add block/unblock functionality
- Prevent blocked users from sending messages
- Show blocked users list
- Unblock option

**Database Changes:**
```sql
CREATE TABLE blocks (
  id INTEGER PRIMARY KEY,
  blocker_id INTEGER NOT NULL,
  blocked_id INTEGER NOT NULL,
  created_at DATETIME,
  UNIQUE(blocker_id, blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES users(id),
  FOREIGN KEY (blocked_id) REFERENCES users(id)
)
```

### Option 3: Message Search (Easy-Intermediate)
**Learning Goals:** Full-text search, query optimization, pagination

**Requirements:**
- Search by sender, subject, content
- Filter by date range
- Pagination (10 items per page)
- Highlighting of search terms

**Sample Query:**
```javascript
const searchTerm = req.query.q;
const offset = (req.query.page - 1) * 10;

const results = await db.all(`
  SELECT m.* FROM messages m
  JOIN users u ON m.sender_id = u.id
  WHERE m.recipient_id = ?
    AND (u.email LIKE ? OR m.subject LIKE ? OR m.body LIKE ?)
  ORDER BY m.created_at DESC
  LIMIT 10 OFFSET ?
`, [userId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, offset]);
```

### Option 4: Two-Factor Authentication (Advanced)
**Learning Goals:** TOTP/email verification, recovery codes, security

**Requirements:**
- Optional 2FA setup
- TOTP (authenticator app) support
- Recovery codes for account recovery
- Verify code after password

**Sample Implementation:**
```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate secret
const secret = speakeasy.generateSecret({
  name: `BlueMind (${user.email})`
});

// Verify code
const verified = speakeasy.totp.verify({
  secret: user.totp_secret,
  encoding: 'base32',
  token: userProvidedCode,
  window: 2
});
```

### Option 5: Message Encryption (Advanced)
**Learning Goals:** Cryptography, public key encryption, key management

**Requirements:**
- Encrypt messages before storing
- Only recipient can decrypt
- Add encryption toggle in UI
- Show encryption status

**Sample Implementation:**
```javascript
const crypto = require('crypto');

// Generate key pair for user
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048
});

// Encrypt message
const encrypted = crypto.publicEncrypt(
  recipientPublicKey,
  Buffer.from(messageBody)
);

// Decrypt message (only recipient has private key)
const decrypted = crypto.privateDecrypt(
  userPrivateKey,
  encryptedMessage
);
```

## Common Student Mistakes

### Mistake 1: Not Validating Input
```javascript
// ❌ WRONG
router.post('/login', async (req, res) => {
  const user = await db.get('SELECT * FROM users WHERE email = ?', [req.body.email]);
  // What if req.body.email is null, an object, or very long?
});

// ✅ CORRECT
if (!req.body.email || typeof req.body.email !== 'string' || req.body.email.length > 255) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

### Mistake 2: Storing Passwords Incorrectly
```javascript
// ❌ WRONG
const hash = require('crypto').createHash('sha256').update(password).digest();
db.run('INSERT INTO users (password) VALUES (?)', [hash]);
// SHA256 is fast, making brute force easy!

// ✅ CORRECT
const hash = await bcrypt.hash(password, 10);
db.run('INSERT INTO users (password_hash) VALUES (?)', [hash]);
```

### Mistake 3: Missing Authorization
```javascript
// ❌ WRONG
router.get('/messages/:id', requireAuth, async (req, res) => {
  const message = await db.get('SELECT * FROM messages WHERE id = ?', [req.params.id]);
  res.json(message);
});

// ✅ CORRECT
router.get('/messages/:id', requireAuth, async (req, res) => {
  const message = await db.get(
    'SELECT * FROM messages WHERE id = ? AND recipient_id = ?',
    [req.params.id, req.session.userId]
  );
  if (!message) return res.status(404).json({ error: 'Not found' });
  res.json(message);
});
```

### Mistake 4: Revealing Information in Errors
```javascript
// ❌ WRONG
if (!user) {
  return res.status(404).json({ error: `User ${email} not found` });
}

// ✅ CORRECT
if (!user || !await bcrypt.compare(password, user.password_hash)) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

### Mistake 5: Hardcoding Secrets
```javascript
// ❌ WRONG
const sessionSecret = 'my-secret-key';
// If this is in a public GitHub repo, it's compromised!

// ✅ CORRECT
const sessionSecret = process.env.SESSION_SECRET;
// Store in .env file (not in version control)
```

## Grading Rubric

### Authentication & Passwords (20%)
- [ ] Passwords are hashed with bcrypt
- [ ] Salt rounds are appropriate (8-12)
- [ ] Password validation includes length checks
- [ ] No plain-text passwords stored

### Authorization & Access Control (20%)
- [ ] Users can only access their own data
- [ ] All protected routes have auth middleware
- [ ] Authorization checks verify resource ownership
- [ ] Proper HTTP status codes (401, 403, 404)

### Input Validation (15%)
- [ ] All user inputs are validated
- [ ] Server-side validation present
- [ ] Parameterized queries used (no SQL injection)
- [ ] Output is sanitized (no XSS)

### Database Design (15%)
- [ ] Appropriate schema with relationships
- [ ] Foreign key constraints
- [ ] Proper data types
- [ ] Efficient queries with indexes

### Code Quality (15%)
- [ ] Clear, readable, well-commented
- [ ] Consistent error handling
- [ ] DRY principle followed
- [ ] No hardcoded secrets

### Security Practices (15%)
- [ ] Session security (HTTPOnly, maxAge)
- [ ] Generic error messages
- [ ] No sensitive data in logs
- [ ] Follows OWASP guidelines

## Deployment Notes

Before showing students how to deploy:

1. **Prepare environment variables:**
   ```bash
   SESSION_SECRET=<generate random string>
   NODE_ENV=production
   ```

2. **Update security settings:**
   - `cookie.secure: true` (requires HTTPS)
   - Add rate limiting
   - Enable CORS if needed

3. **Use production database:**
   - Replace SQLite with PostgreSQL
   - Set up regular backups
   - Configure connection pooling

4. **Add monitoring:**
   - Log authentication attempts
   - Monitor for suspicious activity
   - Set up alerts for errors

## Additional Resources

### Documentation
- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

### Videos
- Bcrypt Explanation: https://auth0.com/blog/hashing-in-action-understanding-bcrypt/
- Authentication Best Practices: https://tools.ietf.org/html/rfc6234
- OWASP Top 10: https://owasp.org/www-project-top-ten/

### Tools
- **Burp Suite Community** - Web security testing
- **OWASP ZAP** - Automated security scanning
- **SQLMap** - SQL injection testing

## Support Resources for Instructors

If you need to:
- **Modify the code** - All source is well-commented and modular
- **Add features** - See assignment options section above
- **Deploy** - Follow production checklist in README
- **Troubleshoot** - Check TROUBLESHOOTING section in README

Good luck with your course! 🔐
