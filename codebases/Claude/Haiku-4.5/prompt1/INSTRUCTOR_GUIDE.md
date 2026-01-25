# Secure Mailer - Instructor's Quick Start Guide

## Overview

This is a complete, production-quality example of a secure web application demonstrating user authentication and messaging. It's designed for teaching students about:
- Secure password storage
- Authentication and session management
- Authorization and access control
- Input validation and sanitization
- Security best practices in web development

## 5-Minute Setup

### Step 1: Install Node.js
Download from https://nodejs.org/ (LTS version recommended)

### Step 2: Install Dependencies
```bash
cd Claude-Haiku-4.5
npm install
```

### Step 3: Start the Server
```bash
npm start
```

Server runs on: `http://localhost:3000`

### Step 4: Create Test Users
Visit http://localhost:3000/register and create accounts:
- alice@example.com / password123
- bob@example.com / password456

### Step 5: Send Test Messages
- Log in as Alice
- Click "Compose"
- Send a message to Bob
- Log out and log in as Bob
- View the message in inbox

## Project Contents

| File | Purpose |
|------|---------|
| `server.js` | Main application logic, routes, authentication |
| `db.js` | Database operations (SQLite) |
| `package.json` | Dependencies and scripts |
| `public/styles.css` | Complete styling |
| `views/*.ejs` | All HTML templates |
| `seed.js` | Sample data generator |
| `README.md` | Full documentation |
| `STUDENT_GUIDE.md` | Implementation guidelines for students |
| `requirements.txt` | Package documentation |

## Key Features to Highlight in Class

### 🔐 Security Features
1. **Password Hashing with bcryptjs**
   - Show how passwords are hashed before storage
   - Compare with storing plain text (BAD)
   - Explain salt rounds and computation time

2. **Session Management**
   - Demonstrate how sessions keep users logged in
   - Show the session cookie in browser DevTools
   - Explain httpOnly flag prevents XSS attacks

3. **Authentication Middleware**
   - Show the `isAuthenticated` function
   - Explain why it's needed on protected routes
   - Demo what happens without it

4. **Authorization Checks**
   - Show how users can only view their own messages
   - Try accessing another user's message (will fail)
   - Explain recipient_id checking

5. **Input Validation**
   - Show express-validator in action
   - Try submitting invalid email (shows error)
   - Explain server-side validation importance

## Demo Scenarios

### Scenario 1: Show Password Security
```javascript
// Show in server.js lines 97-113
// Explain why this prevents dictionary attacks:
// - bcryptjs adds random salt
// - Multiple iterations make cracking slow
// - Same password produces different hashes each time
```

### Scenario 2: Demonstrate Authorization
1. Log in as User A
2. Get message ID from inbox
3. Open DevTools, modify URL to another user's message
4. Show "Unauthorized" error
5. Explain the authorization check in code

### Scenario 3: Show Input Validation
1. Try registering with invalid email
2. Try password less than 6 characters
3. Show validation messages
4. Open DevTools and try bypassing client-side validation
5. Show server-side validation still works

### Scenario 4: Explain SQL Injection Prevention
```javascript
// VULNERABLE (don't use):
const sql = `SELECT * FROM users WHERE email = '${email}'`;

// SAFE (use this):
const sql = 'SELECT * FROM users WHERE email = ?';
db.run(sql, [email]);
```

## Teaching Points by Week

### Week 1: Authentication
- User registration process
- Password hashing necessity
- Login flow
- Session management

### Week 2: Authorization & Access Control
- Why authentication isn't enough
- Authorization checks in code
- Viewing only own resources
- Testing with DevTools

### Week 3: Input Validation
- Client-side vs server-side validation
- Express-validator syntax
- Email format validation
- Custom validation rules

### Week 4: Database & SQL
- Database schema design
- Foreign key relationships
- Parameterized queries
- Preventing SQL injection

## Assessment Ideas

### Code Review
Have students review `server.js` and identify:
- Which routes need `isAuthenticated` middleware?
- Are all authorization checks in place?
- Is input validation complete?

### Security Audit
Ask students to find vulnerabilities if we:
- Removed the authorization check in `/message/:id`
- Used string concatenation for SQL queries
- Stored passwords in plain text

### Enhancement Projects
- Add email verification
- Implement password reset
- Add user profiles
- Implement 2FA
- Add message search
- Create drafts folder

### Presentation Topics
- Why bcryptjs is better than MD5
- How sessions work in HTTP (stateless protocol)
- OWASP Top 10 vulnerabilities
- Defense in depth concept

## Common Questions Students Ask

**Q: Why do we need both authentication and authorization?**
A: Authentication verifies WHO you are. Authorization checks WHAT you can access.

**Q: What if I remove the authorization check?**
A: Users could view/delete other users' messages by guessing message IDs.

**Q: Why can't I see the password in the database?**
A: Because it's hashed - irreversible. Even database admins can't see it.

**Q: What's SQL injection?**
A: When user input is directly concatenated into SQL queries. Use parameterized queries instead.

**Q: Can someone steal my session cookie?**
A: If they do, they can impersonate you. That's why httpOnly flag prevents JavaScript access.

## Database File

The application automatically creates `mailer.db` in the project root on first run. This SQLite file contains:
- **users table**: email (unique), hashed passwords, timestamps
- **messages table**: sender_id, recipient_id, subject, body, read status

To reset the database, simply delete `mailer.db` and restart the server.

## Modification Ideas for Students

### Difficulty: Easy
- Change color scheme
- Add a user bio/profile field
- Add message subjects (already there - could expand)

### Difficulty: Medium
- Add "remember me" checkbox
- Implement message search
- Add unread message counter
- Create sent messages folder

### Difficulty: Hard
- Add email verification
- Implement password reset
- Add two-factor authentication
- Create message groups/distribution lists
- Add file attachments

## Troubleshooting Tips

**Server won't start:**
- Check if port 3000 is available
- Run `npm install` again
- Delete `node_modules` and reinstall

**Can't send messages:**
- Check browser console for errors
- Verify both users exist in database
- Check database file isn't corrupted

**Forgot password:**
- Delete `mailer.db` to reset database
- Restart server

## Resources for Instructors

- **OWASP Education**: https://owasp.org/www-community/attacks/
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/
- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-security.html
- **Web Security Academy**: https://portswigger.net/web-security

## Licensing & Attribution

This is provided as an educational example. Students should:
- Study the code thoroughly
- Implement their own version (not copy)
- Understand each security principle
- Apply concepts to their assignments

## Tips for Success

✅ **Do:**
- Have students read all code before implementing their own
- Discuss security concepts before coding
- Use this as a reference while they build
- Make them explain what each function does
- Have them identify security features

❌ **Don't:**
- Let students just copy and submit this
- Skip the security explanation
- Allow them to use plain text passwords
- Let them skip input validation

## Support

For questions about the code, refer to:
1. README.md - Full documentation
2. STUDENT_GUIDE.md - Implementation help
3. Code comments in server.js and db.js
4. The three reference implementations in sibling folders

Good luck teaching web security! 🎓
