# Secure Mailer - Student Implementation Guidelines

This document provides guidance for students implementing their own version of the Secure Mailer application.

## Assignment Overview

Your task is to build a web application that:
1. Allows users to create accounts with email and password
2. Stores passwords securely (never in plain text)
3. Authenticates users with a login system
4. Allows authenticated users to send and receive messages
5. Ensures users can only view their own messages

## Key Requirements

### Security Requirements
- ✅ Passwords must be hashed before storage
- ✅ Users must be authenticated to access protected pages
- ✅ Users can only view/delete their own messages
- ✅ Input validation on all forms
- ✅ SQL injection prevention
- ✅ CSRF protection considerations
- ✅ Session security (httpOnly cookies)

### Functional Requirements
- ✅ User registration form
- ✅ User login form
- ✅ Message inbox view
- ✅ Compose and send messages
- ✅ View individual messages
- ✅ Delete messages
- ✅ Logout functionality

### UI/UX Requirements
- ✅ Clean, professional design
- ✅ Responsive layout
- ✅ Clear navigation
- ✅ Error messages for failed operations
- ✅ Confirmation dialogs for destructive actions

## Recommended Implementation Steps

### Phase 1: Setup & Basics (Week 1)
1. Initialize Node.js project with npm
2. Install and configure Express.js
3. Create basic server structure
4. Set up EJS templating engine
5. Create static file serving for CSS/JS

### Phase 2: Database & User Model (Week 1-2)
1. Set up SQLite database
2. Create users table with schema
3. Write database helper functions
4. Implement user creation function
5. Implement user lookup function

### Phase 3: Authentication (Week 2)
1. Install bcryptjs for password hashing
2. Implement registration route
3. Implement login route
4. Set up express-session
5. Create authentication middleware

### Phase 4: Messages (Week 3)
1. Create messages table
2. Implement message sending
3. Implement message retrieval
4. Implement message deletion
5. Add read status tracking

### Phase 5: UI & Polish (Week 3-4)
1. Design login page
2. Design inbox view
3. Design compose form
4. Design message view
5. Add CSS styling
6. Test responsiveness

## Code Examples to Study

### Example 1: Password Hashing
```javascript
const bcrypt = require('bcryptjs');

// When registering
const hashedPassword = await bcrypt.hash(password, 10);
// Store hashedPassword in database

// When logging in
const isMatch = await bcrypt.compare(userInput, storedHash);
```

### Example 2: Authentication Middleware
```javascript
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next(); // User is logged in
  } else {
    res.redirect('/login'); // Redirect to login
  }
};

// Use on protected routes
app.get('/inbox', isAuthenticated, (req, res) => { /* ... */ });
```

### Example 3: Input Validation
```javascript
const { body, validationResult } = require('express-validator');

app.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { error: 'Invalid input' });
  }
  // Process login
});
```

### Example 4: Authorization Check
```javascript
// Ensure user owns the message
app.get('/message/:id', isAuthenticated, (req, res) => {
  const message = db.getMessageById(req.params.id);
  
  if (message.recipient_id !== req.session.userId) {
    return res.status(403).send('Unauthorized');
  }
  
  res.render('message', { message });
});
```

### Example 5: Parameterized Queries (SQL Injection Prevention)
```javascript
// BAD - VULNERABLE TO SQL INJECTION:
const sql = `SELECT * FROM users WHERE email = '${email}'`;
db.query(sql); // DON'T DO THIS!

// GOOD - SAFE FROM SQL INJECTION:
const sql = 'SELECT * FROM users WHERE email = ?';
db.query(sql, [email]); // Use parameterized queries
```

## Common Mistakes to Avoid

❌ **Storing passwords in plain text**
- ✅ Solution: Always use bcryptjs to hash passwords

❌ **Trusting user input**
- ✅ Solution: Validate and sanitize all inputs with express-validator

❌ **Not checking authorization**
- ✅ Solution: Always verify user owns the data they're accessing

❌ **Using session data without authentication check**
- ✅ Solution: Create isAuthenticated middleware and use it on protected routes

❌ **Building SQL queries with string concatenation**
- ✅ Solution: Use parameterized queries with placeholders (?)

❌ **Storing sensitive info in cookies**
- ✅ Solution: Only store session ID, keep data server-side

❌ **Forgetting to validate on the server**
- ✅ Solution: Client-side validation is for UX, server validation is for security

## Testing Checklist

Before submitting, verify:

- [ ] User can register with email and password
- [ ] User cannot register with duplicate email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] User is redirected to login when accessing protected pages without session
- [ ] User can view inbox with received messages
- [ ] User can compose and send messages
- [ ] User can view message details
- [ ] User can delete messages
- [ ] User cannot view other users' messages
- [ ] Logout properly clears session
- [ ] Application handles database errors gracefully
- [ ] Design is clean and responsive
- [ ] All forms validate input
- [ ] Navigation is intuitive

## Evaluation Criteria

Your implementation will be evaluated on:

1. **Functionality** (40%)
   - All required features work correctly
   - Edge cases are handled
   - Database operations are correct

2. **Security** (40%)
   - Passwords are hashed
   - Authentication is required for protected pages
   - Authorization checks prevent unauthorized access
   - Input validation prevents attacks
   - SQL injection is prevented

3. **Code Quality** (20%)
   - Code is organized and readable
   - Comments explain complex logic
   - No hardcoded secrets
   - Proper error handling
   - DRY principle followed

## Resources

- **Express Documentation**: https://expressjs.com/
- **bcryptjs Guide**: https://github.com/dcodeIO/bcrypt.js
- **SQLite3 Node**: https://github.com/mapbox/node-sqlite3
- **Express Validator**: https://express-validator.github.io/
- **OWASP Authentication Cheat Sheet**: https://cheatsheetseries.owasp.org/

## Questions to Think About

1. Why is bcryptjs used instead of storing passwords in plain text?
2. How does the isAuthenticated middleware prevent unauthorized access?
3. What could happen if you didn't check authorization in the /message/:id route?
4. How would a parameterized query prevent SQL injection?
5. Why should sensitive data be stored server-side instead of in cookies?
6. How does the session mechanism work to keep users logged in?
7. What would happen if someone knew another user's session ID?

Good luck with your implementation! 🚀
