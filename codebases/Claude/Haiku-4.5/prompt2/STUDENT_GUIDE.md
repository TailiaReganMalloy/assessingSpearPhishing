# Secure Messaging Application - Quick Start Guide for Students

## What You're Building

This is an educational web application that demonstrates:
- **Secure user authentication** with encrypted password storage
- **Messaging system** between users
- **Best practices** for web security

The application is designed to look like BlueMind v5, a professional messaging platform.

## Getting Started

### 1. Start the Server

```bash
npm start
```

You should see:
```
Secure Messaging App running on http://localhost:3000
Educational project for web development students
Connected to SQLite database
```

### 2. Open in Browser

Navigate to: **http://localhost:3000**

You'll see a login page with the BlueMind branding.

### 3. Create a Test Account

Click "Create one" to register a new account:
- **Full Name**: Any name
- **Email**: any.email@example.com (must be valid format)
- **Password**: Minimum 8 characters (for security)

Click "Create Account" to register.

### 4. Login

After registration, you'll be returned to the login page. Login with your new credentials.

### 5. Explore the App

Once logged in, you'll see:
- **Inbox**: Messages sent to you
- **Compose Message**: Send a message to another user
- **Sent Messages**: Messages you've sent

## Creating Multiple Test Users

To test the messaging system, you need multiple users:

1. Create User 1: `alice@example.com` / password
2. Logout (click Logout button)
3. Create User 2: `bob@example.com` / password
4. Login as User 2
5. Go to "Compose Message" and send a message to Alice
6. Logout and login as Alice
7. Check Inbox to see Bob's message

## Key Security Features to Study

### 1. Password Hashing (File: `routes/auth.js`)

```javascript
const salt = await bcrypt.genSalt(10);
const password_hash = await bcrypt.hash(password, salt);
```

- Passwords are hashed with bcryptjs (10 salt rounds)
- Even if database is stolen, passwords are unreadable
- Each password gets a unique salt, preventing rainbow table attacks

### 2. Input Validation (File: `routes/auth.js`)

```javascript
const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');
```

- Prevents injection attacks
- Validates data types and formats
- Sanitizes input before use

### 3. Database Queries (File: `db/database.js`)

```javascript
db.run(
  'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
  [email, password_hash, full_name]
);
```

- Uses **parameterized queries** (question marks ?)
- Parameters are passed separately from SQL
- Prevents SQL injection attacks

### 4. Session Security (File: `server.js`)

```javascript
cookie: {
  secure: false,        // Set to true with HTTPS
  httpOnly: true,       // JavaScript cannot access cookies
  sameSite: 'strict',   // Prevents CSRF attacks
  maxAge: 86400000      // 24 hour expiration
}
```

- Sessions stored server-side only
- Client has session ID in secure cookie
- Automatically expires after 24 hours

### 5. Authorization Checks (File: `routes/messages.js`)

```javascript
if (message.recipient_id !== userId && message.sender_id !== userId) {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

- Only sender or recipient can view/delete messages
- Other users get 403 Forbidden error
- Prevents unauthorized data access

## How the Messaging System Works

### Sending a Message

1. User selects recipient from dropdown
2. Enters subject and message
3. Clicks "Send Message"
4. JavaScript sends POST request to `/api/messages/send`
5. Server validates the data
6. Message stored in database
7. Confirmation shown to user

### Receiving a Message

1. Recipient logs in and checks Inbox
2. JavaScript fetches `/api/messages/inbox`
3. Message marked as "read" when opened
4. Only recipient and sender can view full message

## File Structure Explanation

```
project/
├── server.js                 # Main Express application
├── package.json             # Node.js dependencies
├── db/
│   └── database.js         # SQLite database setup and helpers
├── routes/
│   ├── auth.js            # Login, register, user info
│   └── messages.js        # Send, receive, delete messages
└── public/
    ├── index.html         # HTML markup (all pages in one file)
    ├── styles.css        # CSS styling (desktop & mobile responsive)
    └── app.js            # Client-side JavaScript (all interactions)
```

### Database Schema

**Users Table:**
- Stores user accounts with hashed passwords
- No plaintext passwords ever stored
- Last login timestamp tracks activity

**Messages Table:**
- Stores message content and metadata
- Links to sender and recipient via foreign keys
- "read_at" field tracks if message has been viewed

## Common Tasks for Students

### Task 1: Add Password Strength Requirements

Challenge: Modify password validation to require:
- At least one uppercase letter
- At least one number
- At least one special character

Location: `routes/auth.js` - Modify validatePassword function

### Task 2: Add Message Search

Challenge: Add ability to search messages by content or sender name

Hints:
- Add search form in HTML
- Create new API endpoint: `GET /api/messages/search?q=...`
- Use SQL LIKE operator for searching

### Task 3: Add User Profiles

Challenge: Create user profile page showing:
- User's full name
- Registration date
- Number of sent/received messages
- Last login time

Hints:
- Create new HTML section
- Add new API endpoint: `GET /api/users/:id`
- Display aggregated data from messages table

### Task 4: Add Message Categories

Challenge: Add ability to mark messages as:
- Work
- Personal
- Urgent
- Other

Hints:
- Add "category" column to messages table
- Modify HTML form to include category dropdown
- Filter inbox by selected category

## Testing Security

### Test 1: SQL Injection Prevention

Try entering this in the email field:
```
test@example.com' OR '1'='1
```

The system will reject it because:
1. It's not a valid email format
2. Email validation uses regex
3. Parameterized queries prevent actual injection

### Test 2: XSS Prevention

Try sending a message with HTML/JavaScript:
```html
<script>alert('XSS')</script>
```

The system escapes it because `app.js` uses:
```javascript
div.textContent = text;  // Not innerHTML
```

### Test 3: Password Security

Notice that:
1. Password is never echoed back
2. Password length is validated (minimum 8 characters)
3. Password is never shown in console or network requests
4. Server never sends password back, only user ID and email

## Debugging Tips

### Check Browser Console
Press F12 to open Developer Tools:
- **Console tab**: JavaScript errors
- **Network tab**: See API requests/responses
- **Application tab**: See session cookies

### Check Server Output
Terminal shows:
- Database operations
- Error messages
- Session creation
- Login/logout events

### Common Issues

**Problem**: "Cannot POST /api/auth/login"
- Solution: Make sure server is running with `npm start`

**Problem**: "Cannot find module 'express'"
- Solution: Run `npm install` to install dependencies

**Problem**: "Database error"
- Solution: Delete `db/secure-messaging.db` to reset database

## Running in Production

**IMPORTANT**: Do NOT use this in production without these changes:

1. **Use HTTPS**: Set `secure: true` in session cookie
2. **Use PostgreSQL**: SQLite not suitable for production
3. **Environment Variables**: Move secrets to `.env` file
4. **CORS**: Configure specific domains in server.js
5. **Rate Limiting**: Add rate limiting to prevent brute force
6. **Logging**: Implement proper logging for auditing
7. **Email Verification**: Verify email before account use
8. **Password Reset**: Add secure password reset flow
9. **2FA**: Add two-factor authentication
10. **Monitoring**: Set up error tracking and performance monitoring

## Learning Resources

### For Understanding Security:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### For Web Development:
- [MDN Web Docs](https://developer.mozilla.org/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)

## Questions to Explore

1. **Why use bcrypt instead of MD5 or SHA-256?**
   - Bcrypt is intentionally slow, making brute-force attacks expensive

2. **What happens if someone steals the database?**
   - Passwords are hashed with unique salts, so they're still protected

3. **Why is httpOnly important?**
   - Prevents JavaScript from accessing session cookie, stopping XSS attacks

4. **How does parameterized query prevent SQL injection?**
   - SQL and data are kept separate, so data cannot modify query structure

5. **What would happen without input validation?**
   - Invalid data could crash the server or be used in attacks

## Support & Troubleshooting

If you encounter issues:

1. **Check the README.md** - Full documentation
2. **Review the code comments** - Each file has explanatory comments
3. **Check server output** - Error messages appear in terminal
4. **Read error messages carefully** - They often tell you exactly what's wrong
5. **Use browser DevTools** - Network tab shows API responses

## Next Steps

After understanding this project:

1. Modify features to add new functionality
2. Deploy to a hosting platform (Heroku, Railway, etc.)
3. Add additional security features
4. Explore database optimization
5. Learn about microservices architecture
6. Study authentication standards (OAuth, OIDC)

Good luck with your learning! 🚀
