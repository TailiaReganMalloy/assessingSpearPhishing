# Students: Start Here!

This is a reference implementation of a secure login and messaging system. Use this to understand how to:

## What You'll Learn

1. **User Authentication** - How to securely handle login and registration
2. **Password Security** - Why bcrypt is critical (never use plain-text passwords)
3. **Session Management** - How web sessions work and their security implications
4. **Database Design** - Proper schema with relationships and constraints
5. **API Design** - RESTful endpoints for authentication and messaging
6. **Input Validation** - Always validate user input
7. **Security Practices** - OWASP principles applied in code

## How to Use This

### 1. Read the Code

Start with these files in order:

1. **[package.json](./package.json)** - Understand dependencies
2. **[server.js](./server.js)** - Main application entry point
3. **[db.js](./db.js)** - Database layer and schema
4. **[routes/auth.js](./routes/auth.js)** - Authentication logic (password hashing!)
5. **[routes/messages.js](./routes/messages.js)** - Messaging and authorization
6. **[public/index.html](./public/index.html)** - Login UI
7. **[public/messages.html](./public/messages.html)** - Messages UI

### 2. Run It Locally

```bash
npm install
npm start
```

Visit http://localhost:3000

### 3. Understand Key Concepts

#### Password Hashing
Look at `routes/auth.js` lines 30-35:
```javascript
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
```
This uses bcrypt to hash passwords. **Never store passwords as plain text!**

#### Session Security
Look at `server.js` lines 15-23:
```javascript
cookie: {
  httpOnly: true  // Prevents JavaScript access
}
```
This prevents session hijacking via XSS attacks.

#### Authorization
Look at `routes/messages.js` line 95:
```javascript
WHERE m.recipient_id = ? AND m.is_read = ?
```
Always verify users can only access their own data.

### 4. Study the Security Features

| Feature | Location | Why It Matters |
|---------|----------|---|
| Password Hashing | auth.js:30-35 | Protects passwords if database is breached |
| HTTPOnly Cookies | server.js:20 | Prevents XSS attacks stealing sessions |
| Input Validation | auth.js:14-26 | Prevents injection attacks |
| Error Messages | auth.js:51 | Prevents user enumeration |
| Foreign Keys | db.js:24-25 | Maintains data integrity |

## Your Assignment

Extend this application with ONE of these features:

### Option 1: Message Attachments
- Add ability to upload files with messages
- Store files securely
- Validate file types

### Option 2: User Blocking
- Implement user blocking system
- Prevent messages from blocked users
- Show block/unblock UI

### Option 3: Message Search
- Add search functionality
- Filter messages by sender, subject, content
- Implement pagination

### Option 4: Two-Factor Authentication
- Add optional 2FA to login
- Use email or authenticator app
- Verify code before creating session

### Option 5: Message Encryption
- Encrypt message bodies before storing
- Only recipient can decrypt
- Add client-side encryption option

## Security Checklist for Your Code

Before submitting, ensure:

- [ ] Passwords are hashed with bcrypt
- [ ] User input is validated
- [ ] Sessions use HTTPOnly cookies
- [ ] Users can only access their own data
- [ ] Error messages don't reveal sensitive info
- [ ] Database uses proper schema with relationships
- [ ] All routes requiring auth have middleware check
- [ ] No hardcoded secrets in code
- [ ] SQL uses parameterized queries (not string concatenation!)

## Common Mistakes to Avoid

❌ **DON'T:**
```javascript
// Never store plain-text passwords
db.run("INSERT INTO users (password) VALUES (?)", userPassword);

// Never trust user input blindly
const query = `SELECT * FROM users WHERE email = '${email}'`; // SQL INJECTION!

// Never send detailed error messages
res.status(400).json({ error: `User ${email} not found` }); // User enumeration!

// Never store sensitive data in cookies
req.session.password = password;

// Never concatenate SQL queries
const result = db.query("SELECT * FROM users WHERE id = " + userId);
```

✅ **DO:**
```javascript
// Hash passwords with bcrypt
const hash = await bcrypt.hash(password, 10);

// Validate input
if (!email || !email.includes('@')) return error;

// Use generic error messages
return res.status(401).json({ error: 'Invalid credentials' });

// Use parameterized queries
db.run("SELECT * FROM users WHERE id = ?", [userId]);

// Implement authorization checks
if (message.recipient_id !== req.session.userId) return error;
```

## Questions to Ask Yourself

When reviewing the code:

1. Why does the auth route use `bcrypt.compare()` instead of comparing hashes directly?
2. Why is the session cookie `httpOnly: true`?
3. Why does login return "Invalid email or password" instead of separate messages?
4. How does the app prevent users from seeing other users' messages?
5. What would happen if you stored the session secret in version control?
6. How would you prevent brute force attacks on the login endpoint?

## Next Steps

1. **Understand the current code** - Run it, explore, read comments
2. **Implement your feature** - Choose one extension from above
3. **Test security** - Try to break it! (SQL injection, XSS, unauthorized access)
4. **Document your changes** - Explain why your implementation is secure
5. **Submit your work** - Include a report on security decisions

## Resources

- **Bcrypt Guide:** https://github.com/dcodeIO/bcrypt.js
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Session Security:** https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- **Password Storage:** https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

Good luck! 🔐
