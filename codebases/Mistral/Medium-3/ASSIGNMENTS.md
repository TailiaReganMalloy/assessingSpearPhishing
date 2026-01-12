# Assignment Extension Ideas for Students

Use this BlueMind application as a starting point. Here are suggested features and improvements students can implement to deepen their understanding:

## Level 1: Basic Extensions

### 1. User Profile
**Skills:** HTML forms, database updates, file handling
```javascript
// Add profile table
CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY,
  full_name TEXT,
  bio TEXT,
  profile_picture BLOB,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Tasks:**
- Create profile edit page
- Store profile picture (with file validation)
- Display user profiles before sending messages
- Add profile visibility settings

### 2. Message Drafts
**Skills:** Frontend state management, database design
- Save draft messages that aren't sent yet
- Auto-save drafts every 30 seconds
- Recover from draft or delete draft

### 3. User Search
**Skills:** SQL queries, search optimization
- Search for users by email or name
- Implement search pagination
- Add search filters (active users, new users, etc.)

### 4. Message Folders
**Skills:** Database queries, folder management
- Create/delete custom folders
- Move messages between folders
- Archive old messages

## Level 2: Intermediate Extensions

### 5. Two-Factor Authentication (2FA)
**Skills:** OTP generation, email sending, security
```javascript
// Add 2FA table
CREATE TABLE two_factor_auth (
  user_id INTEGER PRIMARY KEY,
  secret TEXT,
  enabled BOOLEAN DEFAULT 0,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Libraries:** `speakeasy` (OTP generation), `qrcode` (QR code generation)

**Tasks:**
- Generate TOTP secrets
- Display QR code for authenticator apps
- Verify OTP during login
- Backup codes for account recovery

### 6. Email Notifications
**Skills:** Email sending, async operations, scheduling
- Notify users of new messages via email
- Digest notifications (daily/weekly summary)
- Configurable notification preferences

**Libraries:** `nodemailer`, `node-schedule`

### 7. Message Encryption
**Skills:** Cryptography, data handling
```javascript
const crypto = require('crypto');

// Encrypt message before storing
function encryptMessage(message, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  const encrypted = Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt when retrieving
function decryptMessage(encryptedData, key) {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(parts[1], 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}
```

**Tasks:**
- Implement AES-256 encryption for messages
- Manage encryption keys securely
- Add ability to view encrypted message history

### 8. Rate Limiting & Brute Force Protection
**Skills:** Security, data validation
```javascript
const rateLimit = require('express-rate-limit');

// Limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                      // 5 attempts per IP
  message: 'Too many login attempts'
});

// Limit message sending
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 10                       // 10 messages per minute
});
```

**Tasks:**
- Implement rate limiting on all endpoints
- Add account lockout after failed attempts
- Log suspicious activity

### 9. Audit Logging
**Skills:** Logging, security tracking
```javascript
// Add audit log table
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT,
  target_user_id INTEGER,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

// Log all important actions
function logAction(userId, action, targetUserId, details, req) {
  db.run(`
    INSERT INTO audit_logs 
    (user_id, action, target_user_id, details, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [userId, action, targetUserId, details, req.ip, req.get('user-agent')]);
}
```

**Tasks:**
- Log login/logout events
- Log message send/read events
- Log password changes
- Create audit log viewer for admins

### 10. Admin Dashboard
**Skills:** Role-based access control, data management
- Admin user role
- View all users and messages (with proper authorization)
- Disable/enable user accounts
- View audit logs
- System statistics

## Level 3: Advanced Extensions

### 11. Multi-User Conversations
**Skills:** Complex database queries, real-time updates
```javascript
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE conversation_members (
  conversation_id INTEGER,
  user_id INTEGER,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE conversation_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER,
  sender_id INTEGER,
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

**Tasks:**
- Create group conversations
- View conversation history
- Add/remove members
- Typing indicators
- Message reactions/emojis

### 12. Real-Time Messaging with WebSockets
**Skills:** WebSockets, async communication, real-time updates
```javascript
const io = require('socket.io')(app);

io.on('connection', (socket) => {
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('send_message', (conversationId, message) => {
    io.to(`conversation_${conversationId}`).emit('new_message', message);
  });
});
```

**Libraries:** `socket.io`

**Tasks:**
- Real-time message delivery
- Typing indicators
- Online status
- Live notifications
- Presence awareness

### 13. Message Search & Full-Text Search
**Skills:** Database optimization, complex queries
```javascript
// Create full-text search index
CREATE VIRTUAL TABLE message_fts USING fts5(
  subject,
  body,
  content=messages,
  content_rowid=id
);

// Search implementation
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  db.all(`
    SELECT m.* FROM messages m
    JOIN message_fts fts ON m.id = fts.rowid
    WHERE fts.message_fts MATCH ? AND m.receiver_id = ?
  `, [query, req.session.userId], (err, messages) => {
    res.json({ messages });
  });
});
```

**Tasks:**
- Full-text search on message content
- Search filters (date range, sender, etc.)
- Search result highlighting
- Search history

### 14. Password Reset with Email
**Skills:** Email handling, secure token generation, expiration
```javascript
CREATE TABLE password_reset_tokens (
  user_id INTEGER,
  token TEXT UNIQUE,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Tasks:**
- Generate secure reset tokens
- Send reset email
- Validate token expiration
- Implement reset form
- Auto-delete expired tokens

### 15. API Documentation & Testing
**Skills:** API design, testing, documentation
```javascript
// Use Swagger/OpenAPI for documentation
// Example route documentation:
/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get all messages for current user
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Not authenticated
 */
```

**Libraries:** `swagger-jsdoc`, `swagger-ui-express`, `jest`, `supertest`

**Tasks:**
- Document all endpoints
- Create API test suite
- Set up CI/CD for tests
- Create postman collection

## Level 4: Security & DevOps

### 16. CSRF Protection
**Skills:** Security headers, form protection
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.post('/api/messages', csrfProtection, (req, res) => {
  // Protected endpoint
});
```

### 17. Security Headers
**Skills:** Security, HTTP headers
```javascript
const helmet = require('helmet');
app.use(helmet());

// Configurable headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"]
  }
}));
```

### 18. Docker Containerization
**Skills:** DevOps, containerization
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### 19. Database Migrations
**Skills:** Database versioning, schema management
```javascript
const migrations = [
  {
    version: 1,
    up: () => {
      db.run('CREATE TABLE users (...)');
    },
    down: () => {
      db.run('DROP TABLE users');
    }
  }
];
```

### 20. Deployment Configuration
**Skills:** Production deployment, environment management
- Environment-based configuration
- Database backups
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Load balancing
- SSL/TLS certificates

## Suggested Learning Paths

### Path 1: Security-Focused (Weeks 1-4)
1. Password reset with email (14)
2. Two-factor authentication (5)
3. Rate limiting & brute force protection (8)
4. Audit logging (9)
5. CSRF protection (16)
6. Security headers (17)

### Path 2: Feature-Rich (Weeks 1-4)
1. User profiles (1)
2. Message folders (4)
3. Multi-user conversations (11)
4. Message encryption (7)
5. Real-time messaging (12)
6. Message search (13)

### Path 3: Full-Stack (Weeks 1-6)
1. User profiles (1)
2. Rate limiting (8)
3. Email notifications (6)
4. Real-time messaging (12)
5. Docker containerization (18)
6. Deployment configuration (20)

## Grading Rubric Template

For each extension, consider:
- **Functionality (30%)**: Does it work as intended?
- **Security (30%)**: Is it secure? No new vulnerabilities?
- **Code Quality (20%)**: Is it clean, readable, well-documented?
- **Testing (20%)**: Is it properly tested?

## Resources

- Express.js: https://expressjs.com/
- SQLite: https://www.sqlite.org/
- bcryptjs: https://github.com/dcodeIO/bcrypt.js
- Socket.io: https://socket.io/
- JWT: https://jwt.io/
- OWASP: https://owasp.org/
- Node.js Security: https://nodejs.org/en/docs/guides/nodejs-security/
