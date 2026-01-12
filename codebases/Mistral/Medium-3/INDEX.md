# BlueMind - Secure Web Application Reference Implementation

A complete, educational reference implementation of a secure messaging web application built with Node.js. Perfect for teaching web development, authentication, and security best practices.

## 📁 Project Structure

```
BlueMind/
├── server.js                  # Main application server (Express.js)
├── package.json              # Project dependencies
├── test.js                   # Automated test suite
├── public/                   # Frontend files
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── dashboard.html       # Main application interface
│   └── styles.css           # All styling
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── README.md               # Complete documentation
├── QUICKSTART.md           # 5-minute setup guide
├── SECURITY.md             # Security concepts & implementation
├── ASSIGNMENTS.md          # 20 extension ideas for students
└── INSTRUCTOR_GUIDE.md     # Teaching guide with curriculum
```

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open browser
# Navigate to http://localhost:3000

# 4. Create test accounts
# alice@example.com / SecurePass123
# bob@example.com / SecurePass456

# 5. Test messaging
# Send a message from alice to bob
```

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

## 📚 Documentation

### For Everyone
- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
- **[README.md](README.md)** - Complete feature and API documentation

### For Students
- **[SECURITY.md](SECURITY.md)** - Security concepts with code examples
  - Password hashing explained
  - SQL injection prevention
  - Session management
  - Input validation
  - And much more...
- **[ASSIGNMENTS.md](ASSIGNMENTS.md)** - 20 extension ideas organized by difficulty
  - Level 1: Basic (user profiles, search, folders)
  - Level 2: Intermediate (2FA, encryption, email)
  - Level 3: Advanced (real-time, WebSockets, scaling)
  - Level 4: Production (Docker, deployment, monitoring)

### For Instructors
- **[INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md)** - Complete teaching guide
  - 8-week curriculum outline
  - 4 assignment ideas with rubrics
  - Code review checklist
  - Demo scenarios and lab exercises
  - Assessment ideas
  - Discussion questions

## ✨ Key Features

### ✅ Authentication
- User registration with validation
- Secure password hashing (bcryptjs)
- Session-based authentication
- Configurable session timeouts
- Secure logout

### ✅ Messaging
- Send messages between users
- Receive and view messages
- Mark messages as read/unread
- Message persistence in database
- User discovery

### ✅ Security
- Password hashing, never plain text
- Parameterized SQL queries (no SQL injection)
- Input validation (server-side)
- Protected API endpoints
- HTTP-only cookies
- Generic error messages (no info leakage)
- CSRF protection through sessions

### ✅ User Experience
- Clean, professional UI (matches BlueMind mockup)
- Responsive design (works on mobile)
- Form validation with helpful messages
- Smooth messaging experience
- Account-specific session management

## 🔒 Security Features Demonstrated

1. **Password Security** - bcryptjs with automatic salting
2. **Session Management** - Server-side sessions with HTTP-only cookies
3. **SQL Injection Prevention** - Parameterized queries throughout
4. **Input Validation** - Both client-side and server-side
5. **Authentication Checks** - All protected routes verified
6. **Error Handling** - Generic messages, no info disclosure
7. **Database Design** - Foreign keys, unique constraints, indexes

## 🧪 Testing

Run the automated test suite:

```bash
# Make sure server is running first
npm start

# In another terminal, run tests
node test.js
```

Tests cover:
- User registration
- Authentication
- SQL injection prevention
- Session management
- Messaging functionality
- Access control

## 📖 How to Use This

### As a Learning Reference
```
1. Read QUICKSTART.md and get it running
2. Explore the code in server.js
3. Read SECURITY.md to understand each security feature
4. Test the app and trace through code execution
5. Study the database schema
```

### As a Teaching Resource
```
1. Use INSTRUCTOR_GUIDE.md to plan your curriculum
2. Run demo scenarios from the guide
3. Assign extensions from ASSIGNMENTS.md
4. Use code review checklist for grading
5. Run test.js to verify student deployments
```

### As a Starting Point for Your Own Project
```
1. Fork this repository
2. Add your own features
3. Extend with ideas from ASSIGNMENTS.md
4. Deploy to production with security hardening
5. Use test.js to verify functionality
```

## 🏗️ Technology Stack

- **Backend:** Node.js + Express.js
- **Database:** SQLite3
- **Authentication:** bcryptjs (password hashing) + express-session
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **Testing:** Node.js built-in assertions

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user info

### Messaging
- `GET /api/messages` - Get user's messages
- `GET /api/users` - Get all users
- `POST /api/messages` - Send message
- `POST /api/messages/:id/read` - Mark as read

See [README.md](README.md) for detailed API documentation.

## 🎓 Learning Outcomes

After studying this project, students will understand:

- How to build secure user authentication systems
- Why passwords must be hashed, not encrypted
- How sessions work and why they're secure
- How to prevent SQL injection and XSS attacks
- Proper input validation techniques
- How to structure a full-stack web application
- Database design and relationships
- Client-server communication
- RESTful API design
- Security best practices

## 📋 Deployment Checklist

Before deploying to production:

- [ ] Change SESSION_SECRET to random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/TLS
- [ ] Configure environment variables
- [ ] Set up database backups
- [ ] Implement logging and monitoring
- [ ] Enable rate limiting
- [ ] Run security tests
- [ ] Review all dependencies for vulnerabilities
- [ ] Implement CSRF protection

## 🐛 Troubleshooting

**Port already in use:**
```bash
lsof -i :3000  # Find what's using port 3000
kill -9 <PID>  # Kill the process
```

**Database errors:**
```bash
rm app.db      # Delete database
npm start      # Restart (fresh database created)
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

See [QUICKSTART.md](QUICKSTART.md) for more troubleshooting.

## 🚨 Security Warnings

**This is an educational reference, not production-ready as-is:**

1. ⚠️ Change the SESSION_SECRET before deploying
2. ⚠️ Enable HTTPS in production
3. ⚠️ Use a proper session store (Redis, not memory)
4. ⚠️ Add rate limiting to prevent brute force
5. ⚠️ Implement CSRF tokens
6. ⚠️ Add Content Security Policy headers
7. ⚠️ Set up proper logging and monitoring
8. ⚠️ Regularly update dependencies

## 📚 Further Reading

### Security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security: https://nodejs.org/en/docs/guides/nodejs-security/
- Express.js Best Practices: https://expressjs.com/en/advanced/best-practice-security.html

### Web Development
- MDN Web Docs: https://developer.mozilla.org/
- Express.js Guide: https://expressjs.com/
- SQLite Documentation: https://www.sqlite.org/

### Testing & Deployment
- Jest Testing: https://jestjs.io/
- Docker: https://www.docker.com/
- Heroku Deployment: https://heroku.com/

## 📄 File Guide

| File | Purpose |
|------|---------|
| `server.js` | Main Express app, all API routes and database logic |
| `public/login.html` | Login page UI |
| `public/register.html` | Registration page UI |
| `public/dashboard.html` | Main messaging interface |
| `public/styles.css` | All styling for the application |
| `package.json` | Dependencies and scripts |
| `test.js` | Automated test suite |
| `README.md` | Complete documentation |
| `QUICKSTART.md` | 5-minute setup guide |
| `SECURITY.md` | Security concepts explained |
| `ASSIGNMENTS.md` | 20 extension ideas |
| `INSTRUCTOR_GUIDE.md` | Teaching guide |

## 💡 Quick Tips for Students

1. **Understand the database** - Open app.db in SQLite viewer
2. **Trace requests** - Use browser DevTools Network tab
3. **Read error messages** - Check server console for details
4. **Test edge cases** - Try empty fields, wrong passwords, etc.
5. **Study the code** - Comments explain the why, not just what

## 🤝 Getting Help

1. **Code won't run?** Check [QUICKSTART.md](QUICKSTART.md) troubleshooting
2. **Don't understand security?** Read [SECURITY.md](SECURITY.md)
3. **Want to add features?** See [ASSIGNMENTS.md](ASSIGNMENTS.md)
4. **Teaching this?** Check [INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md)
5. **Want to test?** Run `node test.js`

## 📝 License

This is an educational reference implementation. Feel free to use, modify, and learn from it.

## 🎯 Next Steps

**For Students:**
1. Run the application locally
2. Create test accounts
3. Send messages between users
4. Read the code and trace execution
5. Choose an extension from ASSIGNMENTS.md
6. Implement your own feature

**For Instructors:**
1. Review INSTRUCTOR_GUIDE.md
2. Plan your curriculum
3. Try the demo scenarios
4. Customize assignments for your class
5. Use the code review checklist for grading

---

**Happy Learning! 🚀**

Start with [QUICKSTART.md](QUICKSTART.md) to get up and running in 5 minutes.
