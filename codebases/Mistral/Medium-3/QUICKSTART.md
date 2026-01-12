# Quick Start Guide

Get the BlueMind application running in 5 minutes!

## 1. Install Dependencies
```bash
npm install
```

This installs all required packages:
- `express` - Web server framework
- `bcryptjs` - Password hashing
- `sqlite3` - Database
- `express-session` - Session management
- `body-parser` - Request parsing

## 2. Start the Server
```bash
npm start
```

You should see:
```
Connected to SQLite database
Server running at http://localhost:3000
Press Ctrl+C to stop the server
```

## 3. Open in Browser
Navigate to: **http://localhost:3000**

## 4. Create Test Accounts
1. Click "Register here"
2. Create first account:
   - Email: `alice@example.com`
   - Password: `SecurePass123`
3. Click Register
4. Create second account:
   - Email: `bob@example.com`
   - Password: `SecurePass456`

## 5. Test Messaging
1. Login as `alice@example.com` / `SecurePass123`
2. Click "Compose" tab
3. Select `bob@example.com` as recipient
4. Write a test message
5. Click "Send Message"
6. Logout (button in top right)
7. Login as `bob@example.com`
8. View the message in Inbox

## 6. Explore the Code
- **server.js** - Main application logic
- **public/login.html** - Login page
- **public/register.html** - Registration page  
- **public/dashboard.html** - Main application interface
- **public/styles.css** - Styling

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find what's using port 3000 (macOS/Linux)
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Locked Error
```bash
# Delete the database and start fresh
rm app.db
npm start
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Can't Login Even with Correct Password
1. Check database exists: `ls -la app.db`
2. Try registering a new account
3. Check console for error messages
4. Delete database and restart

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Read [SECURITY.md](SECURITY.md) to understand security implementation
- Check [ASSIGNMENTS.md](ASSIGNMENTS.md) for extension ideas
- Modify the code to add new features
- Deploy to production with proper security settings

## Development Tips

### Use Development Mode
For auto-reloading on code changes:
```bash
npm run dev
```

### View Database
```bash
# Using sqlite3 command line
sqlite3 app.db

# View tables
.tables

# View users
SELECT * FROM users;

# Exit
.quit
```

### Debug Mode
Add this to see SQL queries:
```javascript
// In server.js, after creating db connection
db.all('SELECT 1', () => console.log('DB configured'));
```

Then view console output to see queries executing.

### Test Email Validation
Try these test cases:
- Empty email: `` (should fail)
- Invalid email: `notanemail` (should fail)
- Valid email: `user@example.com` (should work)

### Test Password Security
- Check that passwords in database are hashed
- Open `app.db` with SQLite viewer
- Passwords should look like: `$2a$10$E9y0kwx...`
- Never plain text passwords

## Security Checklist for Students

Before submitting your project:

- [ ] Passwords are hashed (not plain text in database)
- [ ] Parameterized queries used (no SQL injection)
- [ ] Server-side validation on all endpoints
- [ ] Session checks on protected routes
- [ ] Generic error messages (no info leakage)
- [ ] HTTP-only cookies used
- [ ] No sensitive data in console.log
- [ ] .gitignore prevents secrets upload
- [ ] Password validation (minimum 8 chars)
- [ ] Email validation (valid format)

## Common Modifications

### Change Session Timeout
In `server.js`, find this line:
```javascript
maxAge: 1000 * 60 * 60 * 24 // 24 hours
```

Change to:
```javascript
maxAge: 1000 * 60 * 60 // 1 hour
```

### Change Bcrypt Rounds
In `server.js`:
```javascript
const hashedPassword = await bcryptjs.hash(password, 10); // 10 is the rounds
```

More rounds = more secure but slower. Range: 8-12 recommended.

### Add New Database Field
1. Create migration or manual SQL
2. Create table with new column
3. Update INSERT statements
4. Update SELECT queries
5. Update API responses

Example - Add phone number:
```javascript
// Add to users table
ALTER TABLE users ADD COLUMN phone TEXT;

// Update registration
db.run(
  'INSERT INTO users (email, password_hash, phone) VALUES (?, ?, ?)',
  [email, hashedPassword, phone]
);
```

## Performance Tips

1. Add database indexes:
```sql
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_message_receiver ON messages(receiver_id);
```

2. Implement pagination for messages:
```javascript
// Get messages with limit/offset
db.all(
  'SELECT * FROM messages WHERE receiver_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
  [userId, limit, offset]
);
```

3. Cache frequently accessed data
4. Use connection pooling for production

## Deployment Checklist

Before deploying to production:

- [ ] Change SESSION_SECRET to random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/TLS
- [ ] Set cookie.secure = true
- [ ] Use environment variables
- [ ] Set up proper logging
- [ ] Enable rate limiting
- [ ] Set up backups
- [ ] Monitor for errors
- [ ] Update dependencies for security patches

## Support & Questions

- Check [README.md](README.md) for more details
- Review [SECURITY.md](SECURITY.md) for security concepts
- Check [ASSIGNMENTS.md](ASSIGNMENTS.md) for learning paths
- Test with the provided test accounts
- Read error messages carefully

Happy coding! 🚀
