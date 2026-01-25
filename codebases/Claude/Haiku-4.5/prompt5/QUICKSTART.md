# Quick Start Guide

Get the SecureMsg application running in 5 minutes.

## Prerequisites Check

```bash
# Verify you have Node.js installed
node --version  # Should be 14.0.0 or higher

# Verify you have npm installed
npm --version
```

## Installation & Setup

### Step 1: Install Dependencies (1 minute)

```bash
npm install
```

This installs all required packages listed in package.json:
- express (web framework)
- bcryptjs (password hashing)
- sqlite3 (database)
- express-validator (input validation)
- And more...

### Step 2: Start the Application (1 minute)

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║  Secure Messaging Application - Educational Demo      ║
║  Server running at http://localhost:3000                ║
║  Node.js Web Security Course Material                 ║
╚════════════════════════════════════════════════════════╝
```

### Step 3: Open in Browser (30 seconds)

Navigate to: **http://localhost:3000**

You'll be redirected to the login page.

### Step 4: Create Your First Account (1 minute)

Click "Create one here" and register:

```
Full Name: John Student
Email: john@example.com
Password: SecurePassword123
```

The password will be:
- Validated (minimum 8 characters)
- Hashed with bcrypt
- Never stored as plain text

### Step 5: Start Using the App (30 seconds)

After registration, you'll see the inbox. Try:

1. **Create another account** for testing (open another browser or incognito)
   - Email: alice@example.com
   - Password: AnotherSecure456

2. **Send a message** from one account to another:
   - Click "Compose" 
   - Select recipient
   - Write and send message

3. **Check the inbox** from recipient account
   - Message appears with sender info
   - Click to read full message
   - Status shows "read" automatically

## Development Mode (with auto-reload)

For active development, use:

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Stopping the Application

```bash
# In the terminal running the app, press:
Ctrl + C

# Or on Windows:
Ctrl + Break
```

## Accessing the Database

The SQLite database is automatically created at: `app.db`

To inspect it, use SQLite CLI:

```bash
# Install sqlite3 (if not already installed)
# macOS: brew install sqlite3
# Ubuntu: sudo apt install sqlite3

# Open the database
sqlite3 app.db

# Common queries
sqlite> .tables                    # List tables
sqlite> SELECT * FROM users;       # View all users
sqlite> SELECT * FROM messages;    # View all messages
sqlite> .quit                      # Exit
```

## What's Happening Behind the Scenes?

### On Registration:
1. ✅ Your password is validated (minimum 8 characters)
2. ✅ Your password is hashed with bcrypt (never stored plain)
3. ✅ Your data is stored in SQLite database
4. ✅ Session is created (you stay logged in)

### On Login:
1. ✅ Email is looked up in database
2. ✅ Your password is compared with the stored hash
3. ✅ If correct, session is created
4. ✅ Session cookie is set (httpOnly, secure)

### Sending a Message:
1. ✅ Your authentication is verified (you must be logged in)
2. ✅ Recipient is validated (exists in database)
3. ✅ Message is stored with sender ID, recipient ID, and content
4. ✅ Database connection uses parameterized queries (SQL injection safe)

### Viewing a Message:
1. ✅ Authentication verified (you must be logged in)
2. ✅ Authorization verified (you must be sender or recipient)
3. ✅ Message is marked as read
4. ✅ Content is automatically escaped (XSS protection)

## Troubleshooting

### Error: "Port 3000 is already in use"

Something else is running on port 3000. Either:

```bash
# Option 1: Stop the other process
# Or Option 2: Use a different port
PORT=3001 npm start
```

### Error: "Cannot find module 'express'"

Dependencies not installed. Run:

```bash
npm install
```

### Error: "Database locked"

Likely running multiple instances. Restart:

```bash
# Press Ctrl+C to stop
# Then start again
npm start
```

### Can't login to an account I created

Check:
- Email spelling (case-insensitive, but exact match)
- Password is correct (case-sensitive)
- Account was registered successfully
- Try clearing browser cookies and login again

## Files to Explore

For learning purposes, start by reading:

1. **[server.js](server.js)** - Main application file, security setup
2. **[db/auth.js](db/auth.js)** - Password hashing and authentication
3. **[routes/auth.js](routes/auth.js)** - Login/register routes
4. **[db/database.js](db/database.js)** - Database schema
5. **[SECURITY.md](SECURITY.md)** - Detailed security concepts

## Security Features You'll See

- 🔒 Passwords hashed with bcrypt (not stored plain)
- 🛡️ HTTP security headers with Helmet.js
- 🔐 Session-based authentication
- ✅ Input validation on all forms
- 🚫 SQL injection prevention (parameterized queries)
- 🔒 XSS protection (template escaping)
- 📋 CSRF protection (httpOnly cookies)

## Keyboard Shortcuts

- **Tab** - Navigate form fields
- **Enter** - Submit forms
- **Ctrl+C** - Stop server

## Next Steps

1. Create multiple test accounts
2. Send messages between accounts
3. Try to send a message with suspicious input (test security)
4. Read [SECURITY.md](SECURITY.md) for in-depth explanations
5. Modify the code and observe the changes
6. Try to break it (attempted security testing)
7. Add new features securely

## Clean Up

To delete the database and start fresh:

```bash
rm app.db
npm start
```

A new empty database will be created.

## Questions?

Refer to:
- [README.md](README.md) - Full documentation
- [SECURITY.md](SECURITY.md) - Security concepts explained
- Code comments - Each file has detailed security notes

---

**Happy learning! 🎓**
