# 📋 Getting Started Checklist

## ✅ Before You Start

- [ ] You have Node.js installed (`node --version`)
- [ ] You have npm installed (`npm --version`)
- [ ] You're in the project directory
- [ ] You have 5 minutes to spare

## ✅ Installation (2 minutes)

```bash
# 1. Install dependencies
npm install

# You'll see packages being installed:
# - express (web framework)
# - bcryptjs (password hashing)
# - sqlite3 (database)
# - And more...
```

## ✅ Start the Application (1 minute)

```bash
# 2. Start the server
npm start

# You should see:
# ╔════════════════════════════════════════════════════════╗
# ║  Secure Messaging Application - Educational Demo      ║
# ║  Server running at http://localhost:3000                ║
# ╚════════════════════════════════════════════════════════╝
```

## ✅ Open in Browser (30 seconds)

```
http://localhost:3000
```

You'll be redirected to the login page.

## ✅ Create Your First Test Account (1 minute)

1. Click "Create one here" on the login page
2. Fill in the form:
   - **Full Name**: John Student
   - **Email**: john@example.com
   - **Password**: MySecurePassword123 (at least 8 characters)
   - **Confirm Password**: MySecurePassword123
3. Click "Create Account"
4. You'll automatically be logged in to the inbox

## ✅ Create a Second Account (1 minute)

1. Click "Logout" in the sidebar
2. Click "Create one here" again
3. Fill in:
   - **Full Name**: Alice Friend
   - **Email**: alice@example.com
   - **Password**: AnotherPassword456
4. Click "Create Account"

## ✅ Send Your First Message (1 minute)

1. You should be logged in as Alice
2. Click "Compose" in the sidebar
3. Select "John Student" as recipient
4. Add subject: "Hello!"
5. Add body: "This is my first message!"
6. Click "Send Message"
7. You'll see it in your "Sent" folder

## ✅ Receive and Read the Message (1 minute)

1. Click "Logout"
2. Login as John (john@example.com / MySecurePassword123)
3. Click "Inbox"
4. You'll see Alice's message
5. Click on it to read the full message
6. Message is automatically marked as read

## ✅ Explore the Interface

- **Inbox** - Messages you've received
- **Sent** - Messages you've sent
- **Compose** - Send a new message to another user

## ✅ What's Happening Behind the Scenes?

When you registered:
- Your password was hashed with bcrypt (not stored plain text)
- Your account was saved in the SQLite database
- A secure session was created

When you sent a message:
- Your authentication was verified
- The recipient was validated
- The message was safely stored in the database

When you viewed a message:
- Your authorization was checked
- The message content was safely displayed
- The read status was updated

## ✅ Now What?

### Option 1: Explore the Code
1. Open `db/auth.js` - See how passwords are hashed
2. Open `routes/auth.js` - See the login flow
3. Open `server.js` - See security setup
4. Read code comments - They explain security decisions

### Option 2: Learn Security Concepts
1. Open [SECURITY.md](SECURITY.md)
2. Read about password hashing, SQL injection, sessions, etc.
3. Try the exercises
4. Answer the discussion questions

### Option 3: Complete the Assignment
1. Open [ASSIGNMENT.md](ASSIGNMENT.md)
2. Work through each part
3. Document your findings
4. Submit for grading

### Option 4: Try to Break It
1. Try sending a message with `<script>alert('xss')</script>`
2. Try logging in with `' OR '1'='1`
3. Try accessing `/messages` without logging in
4. Try weak passwords like `short`
5. Observe how the app prevents these attacks

## ✅ Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| [QUICKSTART.md](QUICKSTART.md) | Setup guide | 5 min |
| [README.md](README.md) | Full documentation | 20 min |
| [SECURITY.md](SECURITY.md) | Security concepts | 30 min |
| [COURSEWORK.md](COURSEWORK.md) | Course materials | 15 min |
| [ASSIGNMENT.md](ASSIGNMENT.md) | Student work | Varies |
| [INDEX.html](INDEX.html) | Visual navigation | 2 min |

## ✅ Key Files in Code

| File | Learn About |
|------|-------------|
| `db/auth.js` | Password hashing |
| `routes/auth.js` | Login flow |
| `db/database.js` | SQL queries |
| `server.js` | Security setup |
| `views/login.ejs` | UI template |

## ✅ Common Commands

```bash
# Start normally
npm start

# Start with auto-reload (for development)
npm run dev

# Stop the server
Ctrl + C

# Reset the database
rm app.db

# Open database in SQLite
sqlite3 app.db

# Delete dependencies (if you need to reinstall)
rm -rf node_modules package-lock.json
npm install
```

## ✅ Troubleshooting

### Port 3000 already in use?
```bash
PORT=3001 npm start
```

### Dependencies not found?
```bash
npm install
```

### Database corrupted?
```bash
rm app.db
npm start
```

### Can't login?
- Check email spelling (exact match, case-insensitive)
- Check password (case-sensitive)
- Make sure you registered first

## ✅ Success Checklist

When you've completed the basics:

- [ ] Server is running at http://localhost:3000
- [ ] You can register an account
- [ ] You can login with your account
- [ ] You can send a message
- [ ] You can receive and read messages
- [ ] You logged out and back in
- [ ] You can see messages in sent folder
- [ ] You understand the basic flow
- [ ] You've read code comments
- [ ] You're ready to learn security concepts

## ✅ Ready for Next Level?

After the basics, advance to:

1. **Security Learning** → Read [SECURITY.md](SECURITY.md)
2. **Code Analysis** → Study [db/auth.js](db/auth.js)
3. **Security Testing** → Try [ASSIGNMENT.md](ASSIGNMENT.md) Part 3
4. **Code Review** → Complete [ASSIGNMENT.md](ASSIGNMENT.md) Part 4
5. **Implementation** → Add features from [ASSIGNMENT.md](ASSIGNMENT.md) Part 5

## ✅ Questions?

- **Setup questions** → See [QUICKSTART.md](QUICKSTART.md)
- **Security questions** → See [SECURITY.md](SECURITY.md)
- **Technical questions** → See [README.md](README.md)
- **Assignment questions** → See [ASSIGNMENT.md](ASSIGNMENT.md)
- **Course questions** → See [COURSEWORK.md](COURSEWORK.md)

## ✅ You're All Set!

The application is ready to use. Start with Step 1 below:

### Step 1: Install & Run (2-5 minutes)
```bash
npm install
npm start
```

### Step 2: Create Accounts & Send Messages (5 minutes)
See the steps above.

### Step 3: Learn Security Concepts (30+ minutes)
Read [SECURITY.md](SECURITY.md) and [COURSEWORK.md](COURSEWORK.md)

### Step 4: Complete Assignment (1-2 hours)
Work through [ASSIGNMENT.md](ASSIGNMENT.md)

### Step 5: Extend the Application (2-4 hours)
Implement enhancements from [ASSIGNMENT.md](ASSIGNMENT.md) Part 5

---

**Ready? Let's go!** 🚀

```bash
npm install && npm start
```

Then navigate to: **http://localhost:3000**

---

*Questions? See the documentation files or check the code comments.*

*Happy learning! 🎓*
