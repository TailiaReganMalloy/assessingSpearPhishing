# 🚀 Quick Start Guide - Get Running in 2 Minutes

## For Students

### Step 1: Install Node.js
Download from https://nodejs.org/ (choose LTS version)

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Server
```bash
npm start
```

### Step 4: Open in Browser
Visit: http://localhost:3000

### Step 5: Register & Test
- Click "Register" 
- Create account with: alice@example.com / password123
- Click "Register" again with: bob@example.com / password456
- Log in as Alice
- Click "Compose"
- Send message to Bob
- Log out (top right)
- Log in as Bob
- View message in Inbox ✅

---

## For Instructors

### Quickest Start (1 minute)
```bash
npm install
npm start
# Open http://localhost:3000
```

### With Sample Data (2 minutes)
```bash
npm install
npm start
# In another terminal:
node seed.js
# Sample users ready to test
```

### Reset Database
```bash
rm mailer.db
npm start
# Fresh database created automatically
```

---

## Most Important Files to Review

### Code Files (in order)
1. **[server.js](server.js)** - Main application logic (read first)
2. **[db.js](db.js)** - Database operations (read second)
3. **[views/login.ejs](views/login.ejs)** - Login interface
4. **[public/styles.css](public/styles.css)** - Styling

### Documentation (in order)
1. **[README.md](README.md)** - Full documentation
2. **[STUDENT_GUIDE.md](STUDENT_GUIDE.md)** - For students doing assignment
3. **[INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md)** - For instructors
4. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Overview

### Checklists
- **[CLASSROOM_CHECKLIST.md](CLASSROOM_CHECKLIST.md)** - Before class prep

---

## Common Issues & Fixes

### "Cannot find module express"
```bash
npm install
```

### Port 3000 already in use
```bash
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Can't login after registration
- Delete mailer.db file
- Restart server
- Register again

### Database locked error
- Stop the server
- Delete mailer.db
- Restart server

---

## Key Security Features You'll See

✅ **Passwords are hashed** - Never stored in plain text  
✅ **Sessions keep you logged in** - Secure cookie management  
✅ **Authorization checks** - Users can only see their own messages  
✅ **Input validation** - Prevents malicious data  
✅ **SQL injection prevention** - Parameterized queries  

---

## What This Application Teaches

### Beginner Level
- User registration and login
- Creating forms
- Rendering HTML templates
- Basic database usage

### Intermediate Level
- Password hashing with bcryptjs
- Session management
- Authentication middleware
- Template variables and loops

### Advanced Level
- Authorization checks
- SQL injection prevention
- Input validation and sanitization
- Security best practices
- OWASP principles

---

## Ways to Use This

### As a Reference
- Study the code to understand each feature
- See real-world implementation patterns
- Learn security best practices

### As a Learning Tool
- Follow along with the code
- Create your own version
- Add your own features
- Understand each line

### As a Starting Point
- Use the structure for your assignment
- Implement features step by step
- Reference the code when stuck
- Add your own functionality

---

## Questions? 

### Check These First
1. Does npm install work? → Check Node.js installation
2. Does server start? → Check if port 3000 is free
3. Can you register? → Check browser console (F12)
4. Can you login? → Make sure database wasn't deleted
5. Can't see message? → Try a different browser

### Still Stuck?
- Read the error message carefully
- Check the browser console (F12)
- Review the README.md
- Read STUDENT_GUIDE.md section "Common Mistakes"
- Look at INSTRUCTOR_GUIDE.md for troubleshooting

---

## Next Steps

### For Students
1. ✅ Get it running (you're here!)
2. 📖 Read server.js and db.js
3. 🔍 Identify all security features
4. 💻 Create your own version
5. 🚀 Add your own features

### For Instructors
1. ✅ Get it running (you're here!)
2. 🎓 Read INSTRUCTOR_GUIDE.md
3. 📋 Check CLASSROOM_CHECKLIST.md
4. 🎬 Do a demo for students
5. 📊 Assign implementation project

---

**Ready to go? Run this command:**

```bash
npm install && npm start
```

Then open: http://localhost:3000

Enjoy learning secure web development! 🎓
