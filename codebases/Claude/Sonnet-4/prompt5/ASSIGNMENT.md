# BlueMind Security Demo - Assignment Instructions

## Overview
This assignment will help you understand web security concepts through hands-on exploration of a Node.js application. You'll analyze security implementations, test vulnerabilities, and propose improvements.

## Assignment Objectives
By completing this assignment, you will:
- Understand secure authentication mechanisms
- Learn about common web vulnerabilities and their prevention
- Practice security testing techniques
- Analyze code for security best practices

## Part 1: Application Exploration (20 points)

### 1.1 Setup and Login (5 points)
1. Start the application by running `npm start`
2. Access the application at `http://localhost:3000`
3. Test all three demo accounts:
   - `demo@bluemind.net` / `SecurePass123!`
   - `student@bluemind.net` / `StudentPass456!`
   - `teacher@bluemind.net` / `TeacherPass789!`
4. Document the login process and note any security features you observe

### 1.2 Feature Testing (10 points)
1. **Session Management**: Test both "Private" and "Public" computer options during login
   - What differences do you notice in session behavior?
   - How does this relate to security best practices?

2. **Messaging System**: 
   - Send messages between different accounts
   - Mark messages as read/unread
   - Test input validation with various message contents

3. **User Interface Security**:
   - Examine the password visibility toggle feature
   - Test form validation on both client and server side

### 1.3 Security Information Analysis (5 points)
1. Visit `/security-info` endpoint
2. Review the JSON response listing security features
3. Cross-reference these features with the actual code implementation

## Part 2: Code Analysis (25 points)

### 2.1 Authentication Security (10 points)
**File to examine:** [server.js](server.js)

1. **Password Hashing**: 
   - Locate the password hashing implementation
   - Explain why bcrypt is used with 12 salt rounds
   - What would happen with fewer salt rounds?

2. **Session Security**:
   - Find the session configuration
   - Explain each security setting and its purpose
   - What could go wrong with improper session management?

### 2.2 Input Validation and CSRF Protection (10 points)
1. **Input Validation**:
   - Identify all input validation implementations
   - Explain the difference between client-side and server-side validation
   - Find examples of input sanitization

2. **CSRF Protection**:
   - Locate the CSRF token implementation
   - Trace how CSRF tokens are generated, sent, and verified
   - Explain why CSRF protection is necessary

### 2.3 Rate Limiting and Error Handling (5 points)
1. **Rate Limiting**:
   - Find the rate limiting configuration for login attempts
   - Test the rate limiting by making multiple failed login attempts
   - Document the behavior you observe

2. **Error Handling**:
   - Examine how errors are handled throughout the application
   - Note how error messages are designed to prevent information disclosure

## Part 3: Security Testing (25 points)

### 3.1 Authentication Testing (10 points)
1. **Brute Force Testing**:
   - Attempt multiple failed logins to trigger rate limiting
   - Document the rate limiting behavior
   - Suggest improvements to the rate limiting strategy

2. **Session Testing**:
   - Test session timeout with different computer types
   - Try to access protected routes without authentication
   - Test session persistence across browser restarts

### 3.2 Input Security Testing (10 points)
1. **XSS Testing**:
   - Try to inject JavaScript in message content: `<script>alert('XSS')</script>`
   - Test in message subjects and recipient fields
   - Document how the application prevents XSS

2. **Input Validation Testing**:
   - Test with extremely long inputs
   - Test with special characters and SQL-like syntax
   - Try submitting forms without CSRF tokens

### 3.3 CSRF Testing (5 points)
1. Create a simple HTML page with a form that targets the application
2. Try to submit messages without proper CSRF tokens
3. Document the protection mechanisms that prevent this attack

## Part 4: Vulnerability Assessment and Recommendations (20 points)

### 4.1 Security Analysis (15 points)
Write a comprehensive security analysis covering:

1. **Strengths**: What security measures are implemented well?
2. **Weaknesses**: What potential vulnerabilities exist?
3. **Missing Features**: What additional security measures could be implemented?

Consider these areas:
- Authentication and authorization
- Session management
- Input validation and sanitization
- CSRF and XSS protection
- Rate limiting and DoS protection
- Error handling and information disclosure
- Logging and monitoring

### 4.2 Improvement Recommendations (5 points)
Propose specific improvements:
1. **High Priority**: Critical security enhancements
2. **Medium Priority**: Important but not critical improvements
3. **Low Priority**: Nice-to-have security features

For each recommendation, include:
- Description of the improvement
- Why it's important for security
- How to implement it (if known)

## Part 5: Reflection (10 points)

### 5.1 Learning Reflection (10 points)
Write a reflection addressing:
1. What were the most important security concepts you learned?
2. Which vulnerabilities do you think are most dangerous in web applications?
3. How has this assignment changed your understanding of web security?
4. What would you do differently if you were building a production application?

## Deliverables

Submit the following:
1. **Security Analysis Report** (PDF, 5-8 pages) covering Parts 1-4
2. **Code Annotations** (commented version of key files showing your understanding)
3. **Test Results** (screenshots/documentation of your security testing)
4. **Reflection Essay** (2-3 pages) covering Part 5

## Evaluation Criteria

### Excellent (A)
- Comprehensive analysis of all security features
- Thorough testing with detailed documentation
- Insightful recommendations for improvements
- Clear understanding of security concepts demonstrated

### Good (B)
- Good coverage of most security features
- Adequate testing with some documentation
- Some useful recommendations
- Basic understanding of security concepts

### Satisfactory (C)
- Basic analysis of main security features
- Limited testing documentation
- Few recommendations
- Minimal understanding demonstrated

### Needs Improvement (D/F)
- Incomplete analysis
- Insufficient testing
- No meaningful recommendations
- Poor understanding of concepts

## Resources

### Documentation
- [SECURITY.md](SECURITY.md) - Detailed security implementation guide
- [README.md](README.md) - Application setup and overview
- OWASP Top 10 Web Application Security Risks
- Node.js Security Best Practices

### Tools for Testing
- Browser Developer Tools
- Burp Suite Community Edition
- OWASP ZAP
- Postman (for API testing)

## Academic Integrity

This is an individual assignment. While you may discuss concepts with classmates, all analysis and testing must be your own work. Cite any external resources you use for research.

## Submission Deadline

**Due Date**: [Instructor to fill in]
**Submission Method**: [Instructor to specify - Canvas, email, etc.]

## Questions?

If you have questions about the assignment:
1. First, refer to the documentation files
2. Check the `/security-info` endpoint for implementation details
3. Review the course materials on web security
4. Contact the instructor during office hours

---

**Good luck with your security analysis!** Remember: understanding how security works is the first step to building secure applications.