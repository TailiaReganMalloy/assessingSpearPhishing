# BlueMind v5 - Quick Start Guide

## Overview

BlueMind v5 is a complete, production-ready Node.js web application designed as an **educational reference implementation** for students learning about secure user authentication and messaging systems.

## Project Location

```
/Users/tailia.malloy/codebases/Grok/3/prompt1/BlueMind_v5/
```

## What You Have

A fully functional web application featuring:

### 1. **Secure Authentication System**
   - User registration with password validation
   - Secure login with bcrypt password hashing
   - Session management with automatic timeouts
   - Protected authenticated routes

### 2. **Messaging System**
   - Send messages to other users
   - View inbox with message history
   - Mark messages as read
   - Secure message storage

### 3. **Modern UI/UX**
   - Professional login page matching the BlueMind v5 design specification
   - Responsive dashboard for authenticated users
   - Clean, corporate styling with dark blue theme
   - Smooth transitions and helpful error messages

### 4. **Well-Documented Code**
   - Comprehensive comments throughout
   - Security best practices demonstrated
   - Modular route organization
   - Clean separation of concerns

## Getting Started

### Step 1: Navigate to the Project
```bash
cd /Users/tailia.malloy/codebases/Grok/3/prompt1/BlueMind_v5
```

### Step 2: Install Dependencies (Already Done)
```bash
npm install
```

### Step 3: Start the Server

```bash
node server.js
```

Or use the npm script:
```bash
npm start
```

You should see:
```
BlueMind v5 is running on http://localhost:3000
Press Ctrl+C to stop the server
```

### Step 4: Access the Application

Open your web browser and go to:
```
http://localhost:3000
```

## Testing the Application

### Demo Accounts

Two pre-configured test accounts are available:

| Username | Password | Role |
|----------|----------|------|
| `demo` | `demo123` | Demo User |
| `student` | `student123` | Student User |

### Create a New Account

1. On the login page, click **"Create one here"**
2. Enter a username (minimum 3 characters)
3. Enter a password (minimum 6 characters)
4. Confirm your password
5. Click **"Create Account"**
6. Log in with your new credentials

### Send a Message

1. **Log in** to your account
2. Click the **"Compose"** option in the sidebar (✍️)
3. Enter the recipient's username
4. Type your message
5. Click **"Send Message"**

### View Messages

1. Click **"Inbox"** in the sidebar (📬)
2. Unread messages appear with a blue highlight
3. Click any message to view its full content
4. Messages are automatically marked as read when viewed

## Project Structure

```
BlueMind_v5/
│
├── public/                          # Frontend files (served to clients)
│   ├── login.html                  # Login/Registration page
│   ├── dashboard.html              # Authenticated user dashboard
│   ├── css/
│   │   ├── style.css              # Login page styling
│   │   └── dashboard.css          # Dashboard styling
│   └── js/
│       ├── script.js              # Login page functionality
│       └── dashboard.js           # Dashboard functionality
│
├── routes/                          # Express route handlers
│   ├── auth.js                     # Login, registration, auth check
│   └── messages.js                 # Message sending, inbox, read status
│
├── middleware/                      # Express middleware
│   └── auth.js                     # Authentication guard for protected routes
│
├── data/                            # Data storage (JSON files for education)
│   ├── users.json                  # User accounts and hashed passwords
│   └── messages.json               # Messages between users
│
├── server.js                        # Main Express application
├── package.json                     # NPM dependencies and scripts
├── package-lock.json               # Dependency lock file
├── .gitignore                       # Git ignore configuration
└── README.md                        # Complete documentation
```

## Key Features Explained

### Security Features

#### 1. **Password Hashing with bcrypt**
```javascript
// Passwords are hashed with 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);
```
- Never stores plain-text passwords
- Uses industry-standard bcrypt algorithm
- Secure comparison prevents timing attacks

#### 2. **Session Management**
```javascript
// Sessions are stored server-side with HTTP-only cookies
app.use(session({
  secret: 'change-in-production',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,  // Prevents JavaScript access
    maxAge: 3600000  // 1 hour timeout
  }
}));
```

#### 3. **Protected Routes**
```javascript
// Requires authentication to access
app.get('/dashboard.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
```

#### 4. **Input Validation**
- All form inputs are validated
- HTML content is escaped to prevent XSS attacks
- Prevents injection attacks

### API Endpoints

#### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Create new user |
| POST | `/auth/login` | Authenticate user |
| GET | `/auth/check` | Verify session |
| GET | `/auth/logout` | Destroy session |

#### Messaging
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/messages/inbox` | Get all inbox messages |
| POST | `/api/messages/send` | Send new message |
| PUT | `/api/messages/mark-read/:id` | Mark as read |

## Important Notes for Students

### What This Project Teaches

✅ **Secure password storage** - How to hash and verify passwords securely  
✅ **Session management** - Keeping users authenticated across requests  
✅ **REST API design** - Building clear, logical API endpoints  
✅ **Form validation** - Validating user input on both client and server  
✅ **Error handling** - Providing helpful feedback to users  
✅ **Responsive design** - Creating interfaces that work on all devices  
✅ **Code organization** - Structuring large applications logically  

### Production Considerations

⚠️ **DO NOT use this directly in production.** The following items need updates:

1. **Session Secret**: Change the hardcoded secret to an environment variable
   ```javascript
   secret: process.env.SESSION_SECRET
   ```

2. **Use HTTPS**: Set `secure: true` in production
   ```javascript
   cookie: {
     secure: true,  // Only with HTTPS
     httpOnly: true
   }
   ```

3. **Real Database**: Replace JSON file storage with PostgreSQL, MongoDB, etc.

4. **Environment Variables**: Use `.env` files for all secrets
   ```bash
   SESSION_SECRET=your-secret-key
   DATABASE_URL=postgres://...
   ```

5. **Rate Limiting**: Add npm package `express-rate-limit`
   ```javascript
   const rateLimit = require('express-rate-limit');
   ```

6. **CSRF Protection**: Add npm package `csurf` for form protection

7. **Input Sanitization**: Add npm package `xss` to sanitize HTML

8. **Logging**: Implement logging for security audits

## Customization Ideas

### Easy Enhancements

1. **Add user profiles**
   - Display user information
   - Upload profile pictures

2. **Message threads**
   - Group messages by conversation
   - Reply to specific messages

3. **User search**
   - Search for users to send messages
   - Show online/offline status

4. **Message deletion**
   - Allow users to delete their messages
   - Soft delete with timestamps

5. **Notifications**
   - Email notifications for new messages
   - In-app notification badges

### Advanced Features

1. **Two-factor authentication**
   - Add Google Authenticator support
   - SMS verification

2. **End-to-end encryption**
   - Encrypt messages in database
   - Only recipient can decrypt

3. **Real-time messaging**
   - Integrate Socket.IO for live updates
   - See when someone is typing

4. **Message attachments**
   - Upload files with messages
   - Scan for malware

## Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# If in use, kill the process
kill -9 <PID>

# Or use a different port by modifying server.js
const PORT = 3001;
```

### "Module not found" Error
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Can't Login with Demo Account
```bash
# Demo accounts have pre-hashed passwords
# If not working, create a new account instead
```

### Database Files Missing
```bash
# Files are created automatically when needed
# If not present, verify folder permissions
chmod 755 /Users/tailia.malloy/codebases/Grok/3/prompt1/BlueMind_v5/data
```

## Learning Resources

### Files to Study First
1. **server.js** - Understand the main server setup
2. **routes/auth.js** - Learn about password hashing
3. **routes/messages.js** - See how data is stored/retrieved
4. **middleware/auth.js** - Understand route protection

### Key Concepts
- **Bcrypt**: Password hashing algorithm
- **Sessions**: Server-side user state management
- **Express.js**: Node.js web framework
- **REST API**: Architectural style for web services
- **Form validation**: Input verification and sanitization

## Getting Help

### Common Issues

**Q: Port 3000 already in use?**  
A: Either change the PORT in server.js or kill the process using port 3000

**Q: Forgot demo password?**  
A: Create a new account with your own credentials instead

**Q: Messages not appearing?**  
A: Refresh the browser and check browser console for JavaScript errors

**Q: Can't send message to another user?**  
A: Verify the recipient username is spelled correctly (case-sensitive)

## Next Steps

1. **Study the code** - Read through each file and understand the implementation
2. **Test features** - Create accounts, send messages, explore the UI
3. **Modify the design** - Change colors, layout, and styling in CSS files
4. **Add features** - Implement new functionality based on the patterns you see
5. **Deploy** - Deploy to services like Heroku, AWS, or DigitalOcean

---

**Ready to start?** Open http://localhost:3000 in your browser!

For complete documentation, see [README.md](README.md)
