# BlueMind Security Demo - Testing Guide

This guide provides test scenarios to demonstrate the security features implemented in the application.

## 🧪 Test Scenarios

### 1. User Registration Tests

#### Test Strong Password Requirements
```
Email: student1@example.com
Password: weak123 ❌ (Missing uppercase, special character)
Password: WeakPass ❌ (Missing number, special character)
Password: StrongPass123! ✅ (Meets all requirements)
```

#### Test Email Validation
```
Email: invalid-email ❌
Email: test@invalid ❌
Email: student@university.edu ✅
```

#### Test Duplicate Registration
1. Register with: student1@example.com
2. Try to register again with same email ❌ (Should fail)

### 2. Authentication Security Tests

#### Test Rate Limiting
1. Make 6 rapid login attempts with wrong password
2. Should see rate limiting message after 5 attempts
3. Wait 15 minutes or restart server to reset

#### Test Account Lockout
1. Make 5 failed login attempts with correct email but wrong password
2. Account should be temporarily locked
3. Even correct password should fail during lockout period

#### Test Session Duration by Computer Type
1. Login with "Private Computer" selected
   - Session should last 24 hours
2. Login with "Public Computer" selected  
   - Session should expire after 30 minutes of inactivity

### 3. Security Monitoring Tests

#### Test Login Attempt Logging
1. Make various login attempts (successful and failed)
2. Visit `/security-logs` to view attempt history
3. Check IP addresses, timestamps, and success status

#### Test Suspicious Activity Detection
1. Open browser developer tools
2. Check console for security event logs
3. Try rapid keystrokes in password field
4. Right-click on page elements
5. Copy/paste in password fields

### 4. Messaging System Tests

#### Test Inter-User Messaging
1. Create two user accounts:
   - teacher@school.edu / TeacherPass123!
   - student@school.edu / StudentPass123!
2. Login as teacher, send message to student
3. Login as student, view received message
4. Reply to teacher from student account

#### Test Real-Time Notifications
1. Open two browser windows
2. Login as different users in each window
3. Send message from one user to another
4. Verify real-time notification appears

### 5. Session Management Tests

#### Test Session Timeout
1. Login and remain inactive for 20 minutes
2. Should see warning about session expiration
3. Continue activity or session will expire at 25 minutes

#### Test Secure Logout
1. Login and navigate to dashboard
2. Click logout button
3. Try to access `/dashboard` directly
4. Should be redirected to login page

### 6. Input Validation Tests

#### Test SQL Injection Prevention
```
Email: admin'; DROP TABLE users; --
Password: anything
```
Should be safely handled without affecting database.

#### Test XSS Prevention
```
Subject: <script>alert('XSS')</script>
Content: <img src="x" onerror="alert('XSS')">
```
Should be safely stored and displayed without executing scripts.

## 📊 Expected Security Features in Action

### Password Security
- ✅ bcrypt hashing with 12 salt rounds
- ✅ Password never stored in plain text
- ✅ Strong password requirements enforced
- ✅ Real-time password validation feedback

### Authentication Protection
- ✅ Rate limiting: 5 attempts per 15 minutes per IP
- ✅ Account lockout: 5 failed attempts = 15 minute lockout
- ✅ Login attempt logging with IP and timestamp
- ✅ Session management with appropriate timeouts

### Input Security
- ✅ SQL injection prevention via parameterized queries
- ✅ XSS prevention through input validation
- ✅ CSRF protection with Helmet.js security headers
- ✅ Input sanitization and validation

### Session Security  
- ✅ httpOnly session cookies
- ✅ Session timeout based on computer type
- ✅ Secure session storage in SQLite
- ✅ Automatic session cleanup

### Security Monitoring
- ✅ All login attempts logged
- ✅ Failed attempt tracking and statistics
- ✅ Real-time suspicious activity detection
- ✅ Client-side security event logging

## 🎯 Educational Learning Points

### For Students
1. **Password Security**: Experience strong password requirements
2. **Session Management**: See different timeouts for public vs private computers
3. **Rate Limiting**: Understand how systems prevent brute force attacks
4. **Security Monitoring**: View how systems track and log security events
5. **Secure Communication**: Send encrypted messages between users

### For Instructors
1. Demonstrate common web application vulnerabilities
2. Show implementation of security best practices
3. Explain the importance of logging and monitoring
4. Compare secure vs insecure coding practices
5. Use as a reference for security implementation

## 🔧 Customization for Advanced Testing

### Add More Users for Testing
Use the registration form to create multiple test accounts:
- instructor@university.edu
- student1@university.edu  
- student2@university.edu
- admin@university.edu

### Simulate Different Attack Scenarios
1. **Credential Stuffing**: Try common password lists
2. **Session Hijacking**: Examine session tokens (educational only)
3. **CSRF Attacks**: Attempt cross-site request forgery
4. **XSS Injection**: Try various script injection techniques

### Monitor Security Events
Check the browser console for security event logs and observe how the application detects and responds to various activities.

## 🚨 Important Notes

- This is an educational application - do not use in production without additional hardening
- Some security features are demonstrated in the browser console for learning purposes
- The application includes intentional logging for educational demonstration
- All data is stored locally in SQLite for easy setup and testing

## 📝 Test Documentation Template

For each test, document:
1. **Test Case**: What you're testing
2. **Steps**: How to reproduce
3. **Expected Result**: What should happen
4. **Actual Result**: What actually happened
5. **Security Lesson**: What this demonstrates about web security

This systematic approach helps students understand both the technical implementation and the security rationale behind each feature.