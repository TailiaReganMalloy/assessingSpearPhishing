# 📚 SecureMsg - Course Materials Overview

## What This Is

A complete, production-quality Node.js web application designed as **course materials** for teaching web security concepts. Based on the BlueMind login interface template, it demonstrates secure authentication, password management, and secure messaging.

## 🎯 Course Learning Objectives

Students will understand and implement:

1. ✅ **Secure Password Hashing** - Why bcrypt, not encryption
2. ✅ **User Authentication** - Login/register securely  
3. ✅ **Session Management** - Keeping users logged in safely
4. ✅ **Secure Messaging** - Inter-user communication
5. ✅ **Input Validation** - Preventing invalid/malicious data
6. ✅ **SQL Injection Prevention** - Parameterized queries
7. ✅ **XSS Protection** - Template escaping
8. ✅ **CSRF Protection** - Secure cookies and sessions
9. ✅ **HTTP Security** - Security headers with Helmet.js
10. ✅ **Database Security** - Schema design and constraints

## 📂 Project Structure

```
prompt5/
├── 📄 README.md                    Main documentation
├── 📄 QUICKSTART.md                5-minute setup guide
├── 📄 SECURITY.md                  Security concepts explained
├── 📄 package.json                 Dependencies
├── 📄 server.js                    Main application (⭐ Start here)
├── .env                            Configuration
├── .gitignore                      Git ignore rules
│
├── 📁 db/                          Database layer
│   ├── database.js                 Schema & initialization
│   ├── auth.js                     Password & authentication (⭐)
│   └── messages.js                 Message operations
│
├── 📁 routes/                      API endpoints
│   ├── auth.js                     Login/register routes (⭐)
│   └── messages.js                 Message routes
│
├── 📁 views/                       HTML templates (EJS)
│   ├── login.ejs                   Login page (BlueMind style)
│   ├── register.ejs                Registration page
│   ├── messages.ejs                Inbox listing
│   ├── sent.ejs                    Sent messages
│   ├── compose.ejs                 Message composition
│   ├── message-detail.ejs          Single message view
│   └── 404.ejs                     Error page
│
└── 📁 public/
    └── css/
        └── style.css               Application styling
```

**⭐ = Essential files for understanding the security implementation**

## 🚀 Getting Started

### 1. Install & Run (2 minutes)

```bash
cd prompt5
npm install
npm start
```

Navigate to `http://localhost:3000`

### 2. Create Test Accounts

Register a couple of accounts:
- alice@example.com / securepass1
- bob@example.com / securepass2

### 3. Send a Message

- Login as Alice
- Compose message to Bob
- Logout, login as Bob
- Read Alice's message

### 4. Explore the Code

Start with these files in this order:
1. [QUICKSTART.md](QUICKSTART.md) - Understanding the flow
2. [server.js](server.js) - Application structure
3. [db/auth.js](db/auth.js) - Password security
4. [db/database.js](db/database.js) - Database queries
5. [SECURITY.md](SECURITY.md) - Deep dive into concepts

## 🔐 Security Features Implemented

| Feature | File | Concept |
|---------|------|---------|
| Password Hashing | db/auth.js | Bcrypt with 10 salt rounds |
| Login Validation | routes/auth.js | Credentials verification |
| Session Management | server.js | httpOnly, sameSite cookies |
| SQL Injection Prevention | db/*.js | Parameterized queries |
| XSS Protection | views/*.ejs | Template auto-escaping |
| CSRF Protection | server.js | Secure session cookies |
| Input Validation | routes/*.js | express-validator |
| HTTP Security Headers | server.js | Helmet.js middleware |
| Database Schema | db/database.js | Foreign keys, constraints |
| Authentication Middleware | routes/auth.js | isAuthenticated checks |

## 📋 Key Files Explained

### [server.js](server.js) - The Backbone
- Initializes Express server
- Sets up security middleware
- Configures session management
- Mounts routes
- Handles errors

**Security highlights**:
```javascript
// HTTP security headers
app.use(helmet());

// Secure sessions
app.use(session({
  cookie: {
    httpOnly: true,    // Prevent JavaScript access
    sameSite: 'strict' // CSRF protection
  }
}));
```

### [db/auth.js](db/auth.js) - Password Security ⭐
- Password hashing with bcrypt
- Password verification
- User registration
- User authentication

**Key function**:
```javascript
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}
```

### [routes/auth.js](routes/auth.js) - Login Routes ⭐
- GET /login - Show login page
- POST /login - Process login
- GET /register - Show register page
- POST /register - Process registration
- GET /logout - Destroy session

### [db/database.js](db/database.js) - Database Setup
- SQLite initialization
- Schema definition
- Table creation
- Foreign key relationships

### [db/messages.js](db/messages.js) - Messaging
- Send message
- Get inbox/sent messages
- Mark as read
- Retrieve single message

### [routes/messages.js](routes/messages.js) - Message Routes
- View inbox
- View sent messages
- Compose form
- Send message endpoint
- View single message

### Views - User Interface
- [login.ejs](views/login.ejs) - BlueMind-inspired login
- [register.ejs](views/register.ejs) - Account creation
- [messages.ejs](views/messages.ejs) - Inbox listing
- [compose.ejs](views/compose.ejs) - Message form
- [message-detail.ejs](views/message-detail.ejs) - Read message

### [public/css/style.css](public/css/style.css) - Styling
- BlueMind visual theme
- Responsive design
- Form styling
- Message list styles

## 🧪 Testing Scenarios

### Scenario 1: New User Signup
1. Click "Register"
2. Fill out form with valid data
3. Observe password being hashed
4. Auto-login after registration
5. Redirect to inbox

**Security lessons**: Password validation, bcrypt hashing, auto-login safety

### Scenario 2: Login Flow
1. Logout first
2. Go to /login
3. Enter credentials
4. Session created
5. Can now access /messages

**Security lessons**: Session creation, authentication state

### Scenario 3: Send Message
1. Login as User A
2. Navigate to /messages/compose
3. Select User B as recipient
4. Write message
5. Send
6. Check /messages/sent

**Security lessons**: Authorization, data validation, secure storage

### Scenario 4: Security Testing
Try these attacks (all should be prevented):

```
SQL Injection in email:
  ' OR '1'='1

XSS in message:
  <script>alert('xss')</script>

CSRF (from another site):
  POST /messages/send from external.com

Weak password:
  short  (less than 8 chars)
```

All should fail safely.

## 📚 Learning Paths

### For Students New to Security
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Run the application
3. Create accounts and send messages
4. Read [README.md](README.md) "Security Implementation Details"
5. Examine code comments in [server.js](server.js)

### For Students Learning Authentication
1. Review [db/auth.js](db/auth.js) - understand bcrypt
2. Look at [routes/auth.js](routes/auth.js) - understand flow
3. Read SECURITY.md section "Password Hashing with Bcrypt"
4. Try changing salt rounds, observe timing
5. Research why hashing > encryption for passwords

### For Students Learning Secure Coding
1. Find all SQL queries in [db/*.js](db/)
2. Verify they use parameterized queries
3. Read SECURITY.md section "SQL Injection Prevention"
4. Try SQL injection attacks on login form
5. Understand why parameterized queries matter

### For Advanced Students
1. Add rate limiting to login
2. Implement password reset securely
3. Add email verification
4. Add two-factor authentication
5. Implement message encryption

## ✏️ Modification Ideas for Assignments

Students could extend the app to:

### Difficulty: Easy
- [ ] Change color scheme
- [ ] Add password visibility toggle
- [ ] Add message timestamps
- [ ] Implement search in inbox
- [ ] Add user profile page

### Difficulty: Medium
- [ ] Add login rate limiting (prevent brute force)
- [ ] Add message read status indicator
- [ ] Implement password reset
- [ ] Add user online status
- [ ] Add message categories

### Difficulty: Hard
- [ ] Implement email verification
- [ ] Add two-factor authentication
- [ ] Implement message encryption (client-side)
- [ ] Add audit logging
- [ ] Implement role-based access control

### Difficulty: Expert
- [ ] Add end-to-end encryption
- [ ] Implement OAuth2 integration
- [ ] Add Web Application Firewall rules
- [ ] Implement security tokens
- [ ] Add multi-device session management

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| [README.md](README.md) | Complete technical documentation |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute setup guide |
| [SECURITY.md](SECURITY.md) | Security concepts deep-dive |
| Code comments | Inline security explanations |

## 🔍 Code Review Checklist

When reviewing the code, check:

- [ ] All passwords are hashed (never plaintext)
- [ ] All SQL uses parameterized queries
- [ ] Session has secure cookie flags
- [ ] Authentication middleware protects routes
- [ ] Input is validated before processing
- [ ] Errors don't expose system details
- [ ] Database has foreign key constraints
- [ ] No credentials in version control
- [ ] Security headers are set
- [ ] Redirects are to expected locations

## 🚀 Deployment (Reference Only)

**This is educational - DO NOT deploy to production as-is!**

For production, you would need:

1. PostgreSQL instead of SQLite
2. HTTPS/TLS certificates
3. Environment-specific configuration
4. Login rate limiting
5. Password reset functionality
6. Email verification
7. Audit logging
8. Security monitoring
9. Regular backups
10. Security updates

## 📞 Troubleshooting

### The app won't start
```bash
# Make sure dependencies are installed
npm install

# Check port isn't in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Can't login
- Email is case-insensitive, verify spelling
- Password is case-sensitive, verify exact password
- Make sure account exists (register first)
- Try clearing browser cookies

### Database issues
```bash
# Delete corrupted database and restart
rm app.db
npm start
```

### Need to modify code
- Make changes
- Use `npm run dev` for auto-reload
- Restart if changes to server.js don't load

## 🎓 Teaching Tips

- **Start with the login flow** - students can see authentication in action
- **Trace a message** - follow code from sending to storage to retrieval
- **Try to break it** - intentional security testing teaches lessons
- **Compare good vs bad code** - show SECURITY.md examples of bad practices
- **Discuss trade-offs** - security vs performance, features vs simplicity
- **Real world context** - connect to recent security breaches

## 📊 Code Statistics

- **Lines of Code**: ~500 (intentionally concise for learning)
- **Files**: 12 main files
- **Database Tables**: 2 (users, messages)
- **Routes**: 7 protected endpoints
- **Security Features**: 10+ implemented

## 🏆 Learning Outcomes

After working with this code, students will understand:

✅ How password hashing works and why it's important
✅ How to prevent SQL injection attacks
✅ How sessions maintain authentication state
✅ How cookies should be configured securely
✅ Why input validation prevents vulnerabilities
✅ How parameterized queries protect databases
✅ Why XSS attacks can happen and how to prevent them
✅ How CSRF works and how to prevent it
✅ What HTTP security headers do
✅ Basic web application security principles

## 📜 License

MIT - Educational Use

---

**This is course material designed to teach secure web development practices.**

For questions or improvements, refer to the inline code comments and documentation files.

**Ready to start? → [QUICKSTART.md](QUICKSTART.md)**
