# Secure Mailer - Pre-Class Checklist for Instructors

## Before First Class ✅

### Setup (15 minutes)
- [ ] Install Node.js (https://nodejs.org/)
- [ ] Clone/download the Secure Mailer application
- [ ] Navigate to Claude-Haiku-4.5 folder
- [ ] Run `npm install`
- [ ] Run `npm start`
- [ ] Verify server starts on http://localhost:3000
- [ ] Test registration with sample email
- [ ] Test login with that email
- [ ] Test sending a message between two accounts
- [ ] Test viewing message and deleting it

### Preparation (30 minutes)
- [ ] Read README.md completely
- [ ] Read STUDENT_GUIDE.md completely
- [ ] Read INSTRUCTOR_GUIDE.md completely
- [ ] Review PROJECT_SUMMARY.md
- [ ] Open server.js and understand the main flow
- [ ] Open db.js and understand database operations
- [ ] Review the security features in the code
- [ ] Prepare 2-3 demo scenarios
- [ ] Create demo user accounts for demonstration
- [ ] Take screenshots for slides/documentation

### Demo Preparation (20 minutes)
- [ ] Write down 3 key security principles to highlight
- [ ] Plan demo flow:
  1. Registration
  2. Login
  3. Send message
  4. View inbox
  5. Show authorization (try accessing another user's message)
- [ ] Prepare questions for students
- [ ] Identify code sections to point out

## Before Each Class 📋

### 5 Minutes Before
- [ ] Start the server: `npm start`
- [ ] Test that server is running on port 3000
- [ ] Create fresh test user accounts
- [ ] Open Firefox/Chrome Developer Tools
- [ ] Have all documentation open in editor
- [ ] Have Visual Studio Code open with code ready to show

### During Class Preparation
- [ ] Have server running in background
- [ ] Keep three browser tabs open:
  1. Application (logged in as User A)
  2. Application (logged in as User B - incognito window)
  3. This checklist
- [ ] Keep VS Code open with code visible
- [ ] Have presentation slides ready if using them

## Demo Scenarios Ready ✅

### Demo 1: Registration & Login (5 min)
- [ ] Fresh browser, navigate to localhost:3000
- [ ] Show login page
- [ ] Click "Register here"
- [ ] Fill in email and password
- [ ] Show successful login
- [ ] Highlight the session cookie in DevTools

### Demo 2: Sending Messages (5 min)
- [ ] Log in as User A
- [ ] Click "Compose"
- [ ] Send message to User B
- [ ] Logout
- [ ] Log in as User B
- [ ] Show message in inbox
- [ ] Click to view message
- [ ] Show delete functionality

### Demo 3: Security Authorization (5 min)
- [ ] Have two windows open (User A and User B logged in)
- [ ] In User A's message, check message ID in URL
- [ ] Try to access User B's message with User A (explain URL manipulation)
- [ ] Show "Unauthorized" error
- [ ] Explain the authorization check in code

### Demo 4: Input Validation (3 min)
- [ ] Try registering with invalid email (show.com instead of example.com)
- [ ] Try password less than 6 characters
- [ ] Show validation error messages
- [ ] Explain server-side validation in code

### Demo 5: Password Hashing (3 min)
- [ ] Open mailer.db in database viewer
- [ ] Show users table
- [ ] Point out password field is hashed, not readable
- [ ] Explain bcryptjs and why this is important
- [ ] Show code in server.js that does the hashing

## Teaching Points to Emphasize 🎓

### Week 1: Authentication
- [ ] Registration process and validation
- [ ] Why passwords must be hashed
- [ ] bcryptjs and salt rounds
- [ ] Login verification process
- [ ] Session creation and management
- [ ] HttpOnly cookies importance

### Week 2: Authorization & Access Control
- [ ] Authentication ≠ Authorization
- [ ] Authorization checks on every protected route
- [ ] How to verify user owns the resource
- [ ] What happens if you skip authorization
- [ ] Testing with DevTools and URL manipulation

### Week 3: Input Validation & SQL Safety
- [ ] Client-side validation (UX) vs server-side (security)
- [ ] express-validator syntax and usage
- [ ] Parameterized queries and SQL injection
- [ ] How string concatenation is dangerous
- [ ] Email format validation

### Week 4: Security in Depth
- [ ] Multiple layers of defense
- [ ] Helmet and HTTP headers
- [ ] CSRF protection concepts
- [ ] Error message design (don't leak information)
- [ ] Logging and monitoring

## Assessment Ideas 📊

### Code Review Assignment
- [ ] Give students server.js to review
- [ ] Ask them to identify security features
- [ ] Have them add comments explaining each feature
- [ ] Ask where else authentication is needed

### Security Audit Project
- [ ] What if we removed authorization check?
- [ ] What if we used string concatenation for SQL?
- [ ] What if we stored plain text passwords?
- [ ] What if we removed input validation?
- [ ] Have students write report

### Implementation Assignment
- [ ] Students implement their own version
- [ ] Checklist of features required:
  - [ ] Registration with validation
  - [ ] Login with hashed passwords
  - [ ] Send/receive messages
  - [ ] View only own messages
  - [ ] Delete messages
  - [ ] Logout
- [ ] Code review by instructor
- [ ] Demo to class

## Presentation Tips 💡

### For Code Display
- [ ] Use large font size (18pt minimum)
- [ ] Use VS Code with dark theme
- [ ] Highlight key lines with comments
- [ ] Pause and explain code blocks
- [ ] Don't read code word-for-word, explain concepts

### For Live Demo
- [ ] Use incognito windows for multiple users
- [ ] Keep navigation slow and deliberate
- [ ] Narrate what you're doing
- [ ] Show both UI and DevTools
- [ ] Have backup accounts ready
- [ ] Keep database fresh (delete old test data)

### For Questions
- [ ] "What would happen if...?" questions work well
- [ ] Use whiteboard to draw concepts
- [ ] Reference code line numbers
- [ ] Ask students to predict outcomes
- [ ] Encourage hands-on experimentation

## Troubleshooting During Class 🔧

### If Server Won't Start
- [ ] Check if port 3000 is already in use
- [ ] Run `npm install` again
- [ ] Delete node_modules and reinstall
- [ ] Check for typos in package.json
- [ ] Restart terminal

### If Database is Corrupted
- [ ] Delete mailer.db file
- [ ] Restart server (creates fresh database)
- [ ] Create new test users

### If Features Don't Work
- [ ] Check browser console for errors
- [ ] Verify session is working in DevTools
- [ ] Check that JavaScript is enabled
- [ ] Try in different browser
- [ ] Clear browser cache

### If Students Can't Follow Along
- [ ] Slow down your pace
- [ ] Repeat each step
- [ ] Use the slides/documentation
- [ ] Pair struggling students with helpers
- [ ] Provide pre-recorded video demo

## Materials Checklist 📚

### Documentation
- [ ] README.md (printed or digital)
- [ ] STUDENT_GUIDE.md (for students)
- [ ] INSTRUCTOR_GUIDE.md (for reference)
- [ ] PROJECT_SUMMARY.md (overview)
- [ ] OWASP resources printed/bookmarked

### Code Files
- [ ] server.js (with comments)
- [ ] db.js (with comments)
- [ ] Views folder (all templates)
- [ ] styles.css (styling)
- [ ] package.json (dependencies)

### Presentation Materials
- [ ] Slides about security concepts
- [ ] Diagram of authentication flow
- [ ] Diagram of authorization check
- [ ] SQL injection example
- [ ] bcryptjs explanation visual

### Demo Data
- [ ] Test user accounts created
- [ ] Sample messages ready to send
- [ ] Screenshots of each page
- [ ] Video recording (optional)

## Post-Class 📝

### After Each Class
- [ ] Collect student questions
- [ ] Note any technical issues
- [ ] Update slides based on what confused students
- [ ] Clean up test user accounts
- [ ] Delete old test messages from database
- [ ] Back up database if needed

### Weekly Review
- [ ] Check if students have questions in forum
- [ ] Review submitted code assignments
- [ ] Provide feedback on student implementations
- [ ] Answer "What would happen if..." questions
- [ ] Share common mistakes with class

### End of Unit
- [ ] Collect all student implementations
- [ ] Grade based on security features
- [ ] Provide comprehensive feedback
- [ ] Share best implementations (with permission)
- [ ] Plan improvements for next semester

## Resources to Bookmarks 🔗

- [ ] https://owasp.org/www-project-top-ten/
- [ ] https://nodejs.org/en/docs/guides/security/
- [ ] https://expressjs.com/en/advanced/best-practice-security.html
- [ ] https://portswigger.net/web-security
- [ ] https://www.npmjs.com/package/bcryptjs
- [ ] https://express-validator.github.io/

## Quick Reference During Class 🚀

### Start Server
```bash
cd Claude-Haiku-4.5
npm start
```

### Reset Database
```bash
rm mailer.db
# Restart server
```

### Create Sample Users
```bash
node seed.js
```

### Check for Errors
- Open browser DevTools (F12)
- Check Console tab for JS errors
- Check Network tab for failed requests
- Check Application/Storage for cookies

---

**Remember**: The goal is not just to show students a working application, but to help them understand the security principles behind it. Encourage them to read the code, ask questions, and think about what could go wrong.

Good teaching! 🎓
