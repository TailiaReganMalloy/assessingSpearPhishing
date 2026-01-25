# 📝 Student Assignment Template

Use this template to document your work with the SecureMsg application.

---

## Assignment Information

**Student Name**: ___________________________

**Date**: ___________________________

**Assignment Title**: _______________________________

**Grade**: ___________________________

---

## Part 1: Setup & Exploration (10 points)

### 1.1 Installation
- [ ] Installed Node.js (version: ______)
- [ ] Ran `npm install` successfully
- [ ] Started server with `npm start`
- [ ] Application running at `http://localhost:3000`

**Evidence**: Screenshot of running server
```
[Paste screenshot here]
```

### 1.2 Account Creation
- [ ] Created account as User A (email: ____________)
- [ ] Created account as User B (email: ____________)
- [ ] Both accounts created successfully

**Notes**: 
```
[Your observations about the registration process]
```

### 1.3 Basic Functionality
- [ ] Logged in as User A
- [ ] Navigated to inbox (empty)
- [ ] Composed message to User B
- [ ] Logged out
- [ ] Logged in as User B
- [ ] Received message from User A
- [ ] Read the message

**Screenshots**:
```
[Paste screenshots of key steps]
```

---

## Part 2: Security Analysis (20 points)

### 2.1 Password Security

**Question**: Where are passwords stored in this application?

**Answer**:
```
[Your answer here]
```

**Question**: What algorithm is used to hash passwords?

**Answer**:
```
[Your answer here]
```

**Finding in Code**: Find and copy the hashing function from [db/auth.js](db/auth.js):

```javascript
[Copy the hashPassword function here]
```

**Analysis**: Why is this approach more secure than storing plain-text passwords?

```
[Your analysis here]
```

### 2.2 SQL Injection Prevention

**Question**: How does this application prevent SQL injection attacks?

**Answer**:
```
[Your answer here]
```

**Finding in Code**: Find an example SQL query from [db/database.js](db/database.js):

```javascript
[Copy an example parameterized query here]
```

**Comparison**: Show what would happen with a vulnerable approach:

```javascript
// VULNERABLE (DON'T USE):
const query = `SELECT * FROM users WHERE email = '${email}'`;

// SECURE (CORRECT):
db.get('SELECT * FROM users WHERE email = ?', [email], ...);
```

**Explanation**:
```
[Explain why the second approach is safer]
```

### 2.3 Session Security

**Question**: How are sessions configured to be secure?

**Answer**:
```
[Your answer here]
```

**Finding in Code**: From [server.js](server.js), copy the session configuration:

```javascript
[Copy session configuration here]
```

**Explain Each Setting**:
- `httpOnly: true` → ___________________________________________
- `sameSite: 'strict'` → ___________________________________________
- `secure: true` (production) → ___________________________________________
- `maxAge: 24 * 60 * 60 * 1000` → ___________________________________________

---

## Part 3: Security Testing (30 points)

### 3.1 Test Case 1: Weak Password

**Objective**: Verify that weak passwords are rejected.

**Steps**:
1. Go to registration page
2. Try to register with password: `short`
3. Observe the response

**Result**: 
- [ ] Rejected - Show screenshot
- [ ] Accepted - Explain why (unexpected)

**Screenshot**:
```
[Paste screenshot here]
```

**Analysis**: Why is this security requirement important?
```
[Your analysis]
```

### 3.2 Test Case 2: SQL Injection

**Objective**: Verify that SQL injection is prevented.

**Steps**:
1. Go to login page
2. Enter email: `' OR '1'='1`
3. Enter password: `anything`
4. Try to login

**Result**:
- [ ] Login failed (expected)
- [ ] Login succeeded (unexpected - security issue!)

**Screenshot**:
```
[Paste screenshot here]
```

**Analysis**: What happened and why?
```
[Your analysis]
```

### 3.3 Test Case 3: XSS Attack

**Objective**: Verify that XSS attacks are prevented.

**Steps**:
1. Login as User A
2. Compose message with content:
   ```html
   <script>alert('XSS Attack')</script>
   ```
3. Send to User B
4. Login as User B and view the message

**Result**:
- [ ] Script didn't execute (expected)
- [ ] Script executed (unexpected - security issue!)

**Screenshot**:
```
[Paste screenshot here]
```

**Analysis**: How does the application prevent this?
```
[Your analysis]
```

### 3.4 Test Case 4: Accessing Protected Routes

**Objective**: Verify that authentication is required.

**Steps**:
1. Logout
2. Try to directly access `http://localhost:3000/messages`
3. Observe what happens

**Result**:
- [ ] Redirected to login (expected)
- [ ] Accessed without login (unexpected - security issue!)

**Screenshot**:
```
[Paste screenshot here]
```

**Code**: Find the middleware that protects this route:

```javascript
[Copy the isAuthenticated middleware here]
```

### 3.5 Additional Security Tests

Test these and document results:

- [ ] **CSRF Protection**: Try sending form from different domain
- [ ] **Password Case-Sensitivity**: Test login with wrong password case
- [ ] **Email Case-Sensitivity**: Test login with different email case
- [ ] **Session Timeout**: Wait 24+ hours and check if still logged in
- [ ] **Cookie Inspection**: Check browser cookies in DevTools
- [ ] **Rate Limiting**: Make many failed login attempts (observe behavior)

**Findings**:
```
[Document what you found for each test]
```

---

## Part 4: Code Review (20 points)

### 4.1 Security Checklist

Review the code and verify these security practices:

- [ ] All passwords are hashed (check db/auth.js)
- [ ] All SQL uses parameterized queries (check db/*.js)
- [ ] Session cookies have httpOnly flag
- [ ] Protected routes use authentication middleware
- [ ] Input is validated (check routes/*.js)
- [ ] No hardcoded credentials
- [ ] Error messages don't expose system info

**Findings**:
```
[Document what you found]
```

### 4.2 Code Walkthrough

Trace the complete flow for logging in:

1. User fills form on [login.ejs](views/login.ejs)
   - What fields are collected? ___________
   
2. Form POSTs to [routes/auth.js](routes/auth.js)
   - What validation happens? ___________
   
3. Calls [db/auth.js](db/auth.js) authenticateUser function
   - What query is executed? ___________
   - How is password verified? ___________
   
4. Session is created in [server.js](server.js)
   - What data is stored? ___________
   
5. Redirects to [messages.ejs](views/messages.ejs)
   - What variables are needed? ___________

**Complete Flow Diagram**:
```
[Draw or describe the complete authentication flow]
```

### 4.3 Vulnerability Analysis

Examine this code (intentionally vulnerable):

```javascript
// VULNERABLE CODE - DO NOT USE
app.post('/vulnerable-login', (req, res) => {
  const query = `SELECT * FROM users WHERE email = '${req.body.email}' AND password = '${req.body.password}'`;
  db.get(query, (err, user) => {
    if (user) {
      res.send('Welcome ' + req.body.email);
    }
  });
});
```

**Identify Vulnerabilities**:
1. Vulnerability #1: ___________
   - Risk: ___________
   - Fix: ___________

2. Vulnerability #2: ___________
   - Risk: ___________
   - Fix: ___________

3. Vulnerability #3: ___________
   - Risk: ___________
   - Fix: ___________

---

## Part 5: Enhancement Assignment (20 points)

### Choose One Enhancement to Implement

Choose from:

**Option A: Login Rate Limiting**
- Prevent brute force attacks
- Block after 5 failed attempts
- Implement 15-minute cooldown

**Option B: Password Reset Functionality**
- Send reset email (mock in terminal)
- Create reset token
- Verify token for password change

**Option C: User Profile Page**
- Display user information
- Allow password change
- Show account creation date

**Option D: Message Encryption**
- Encrypt message body
- Decrypt when viewing
- Use simple encryption (learning purposes)

**Option E: Your Own Idea**
- Propose something creative
- Must be security-related
- Get approval first

### Implementation Plan

**Enhancement Name**: ___________________________

**Why I chose this**: 
```
[Your reasoning]
```

**Technical Plan**:
1. Files to modify: ___________
2. New files needed: ___________
3. Database changes: ___________
4. Security considerations: ___________

### Implementation

**Code Changes**:
```javascript
[Paste your code changes here]
```

**Testing**:
```
[Document how you tested this feature]
```

**Security Review**:
```
[How does your implementation maintain security?]
```

---

## Part 6: Reflection (10 points)

### 6.1 Key Learnings

What are the three most important security concepts you learned?

1. **Concept**: ___________________________
   
   **Explanation**: 
   ```
   [Your explanation]
   ```

2. **Concept**: ___________________________
   
   **Explanation**: 
   ```
   [Your explanation]
   ```

3. **Concept**: ___________________________
   
   **Explanation**: 
   ```
   [Your explanation]
   ```

### 6.2 Real-World Application

How would you apply these concepts in production?

```
[Your answer]
```

### 6.3 Future Improvements

What additional security measures would you add?

```
[Your suggestions]
```

### 6.4 Questions & Challenges

What questions do you still have?

```
[Your questions]
```

---

## Part 7: Submission

### Files to Submit

- [ ] This completed assignment document
- [ ] Screenshots as referenced
- [ ] Any code modifications (if applicable)
- [ ] README of enhancements (if applicable)

### Checklist

- [ ] All parts completed
- [ ] Code runs without errors
- [ ] Security tests documented
- [ ] Enhancements tested
- [ ] Reflection thoughtful and complete
- [ ] All screenshots included
- [ ] Submitted by deadline

### Bonus Opportunities

- [ ] Implement additional security feature (+5 points)
- [ ] Find undocumented vulnerability (+5 points)
- [ ] Create security testing guide (+5 points)
- [ ] Present findings to class (+10 points)

---

## Grading Rubric

| Component | Points | Score |
|-----------|--------|-------|
| Part 1: Setup | 10 | ____ |
| Part 2: Security Analysis | 20 | ____ |
| Part 3: Security Testing | 30 | ____ |
| Part 4: Code Review | 20 | ____ |
| Part 5: Enhancement | 20 | ____ |
| Part 6: Reflection | 10 | ____ |
| Bonuses | +15 | ____ |
| **TOTAL** | **110** | **____** |

---

## Instructor Feedback

[To be filled by instructor]

```
[Feedback goes here]
```

**Suggestions for Improvement**:
```
[Improvement suggestions]
```

**Grade**: _________ / 100

**Signature**: _________________________ **Date**: _________

---

**Thank you for completing this assignment!**

Remember: Security is a process, not a product. Keep learning and stay curious about how systems can be broken... so you can build them better.
