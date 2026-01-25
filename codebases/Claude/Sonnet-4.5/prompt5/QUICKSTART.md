# Quick Start Guide

## 🚀 Getting Started

Your secure messaging application is now ready to use!

### Server is Running
- URL: **http://localhost:3001**
- The server is currently running in the background

### First Time Setup

1. **Open your browser** and navigate to: http://localhost:3001

2. **Register your first user:**
   - Click "Register here" on the login page
   - Enter an email address (e.g., alice@example.com)
   - Create a password (minimum 8 characters)
   - Click "Register"

3. **Create a second user** (to test messaging):
   - Logout and register another user (e.g., bob@example.com)

4. **Test the messaging system:**
   - Login as the first user
   - Click "Compose Message"
   - Select the second user as recipient
   - Write and send a message
   - Logout and login as the second user
   - Check the inbox for the message!

### Application Features

#### 🔐 **Login Page**
- Secure user authentication
- Password visibility toggle
- Registration for new users
- Private/Public computer option

#### 📬 **Dashboard**
- **Inbox**: View received messages
- **Sent Messages**: View messages you've sent
- **Compose**: Send new messages to other users
- **User Info**: See your logged-in email
- **Logout**: Securely end your session

### Security Features Demonstrated

✅ **Password Security**
- Passwords are hashed with bcrypt (never stored in plaintext)
- Minimum 8 character requirement
- Cost factor of 12 makes brute force attacks very slow

✅ **Session Management**
- HttpOnly cookies prevent XSS attacks
- Sessions expire after 24 hours
- Secure logout destroys session

✅ **Input Validation**
- Email validation and normalization
- Subject limited to 200 characters
- Message body limited to 5000 characters
- All inputs sanitized server-side

✅ **SQL Injection Prevention**
- All database queries use parameterized statements
- User input is never directly concatenated into SQL

✅ **XSS Prevention**
- All user content is HTML-escaped before display
- Prevents malicious script injection

✅ **Security Headers**
- Helmet.js adds protective HTTP headers
- Content Security Policy (CSP)
- X-Frame-Options prevents clickjacking

### Stop the Server

To stop the server, press `Ctrl+C` in the terminal where it's running.

### Restart the Server

```bash
cd /Users/tailia.malloy/Documents/Code/assessingSpearPhishing/codebases/Claude/Sonnet-4.5/prompt5
npm start
```

### Development Mode (Auto-restart on file changes)

```bash
npm run dev
```

### View the Database

To inspect the SQLite database directly:

```bash
sqlite3 database.db
```

Then run SQL queries:
```sql
SELECT * FROM users;
SELECT * FROM messages;
.exit
```

### Project Files

- `server.js` - Main Express server with all API endpoints
- `public/login.html` - Login and registration page
- `public/dashboard.html` - Messaging dashboard
- `public/styles.css` - All application styles
- `public/login.js` - Login/registration logic
- `public/dashboard.js` - Dashboard and messaging logic
- `database.db` - SQLite database (created automatically)

### For Students

📖 **Read the Documentation:**
- `README.md` - Comprehensive overview and installation guide
- `SECURITY_CONCEPTS.md` - Detailed explanation of security concepts

🧪 **Try These Exercises:**
1. View hashed passwords in the database
2. Test the input validation with invalid data
3. Examine session cookies in browser DevTools
4. Try SQL injection attacks (they won't work!)
5. Test XSS prevention by sending messages with HTML/JS

### Troubleshooting

**Port already in use?**
The application uses port 3001. If you need a different port:
```bash
PORT=3002 npm start
```

**Database issues?**
Delete the database file and restart:
```bash
rm database.db
npm start
```

**Need to reset everything?**
```bash
rm -rf node_modules database.db
npm install
npm start
```

### Production Deployment Notes

⚠️ This is an educational example. For production:
- Enable HTTPS (set `secure: true` in session config)
- Use environment variables for secrets
- Add rate limiting to prevent brute force
- Implement email verification
- Add password reset functionality
- Set up proper logging and monitoring
- Use a production-grade database

---

## 📚 Learn More

Visit the `README.md` and `SECURITY_CONCEPTS.md` files for detailed explanations of all security features implemented in this application.

Enjoy learning about web security! 🎓🔒
