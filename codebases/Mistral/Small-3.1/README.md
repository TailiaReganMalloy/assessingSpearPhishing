# SecureMail - Educational Reference Application

A Node.js reference application demonstrating secure user authentication and messaging system design for educational purposes.

## Overview

This application showcases best practices for:
- **Secure Password Storage** using bcrypt hashing
- **User Authentication** with session management
- **SQL Database** design with proper schema
- **RESTful API** design
- **Frontend-Backend** integration
- **Input Validation** and security considerations

## Project Structure

```
├── server.js                 # Main Express application
├── package.json             # Dependencies
├── models/
│   └── database.js          # SQLite database setup & queries
├── routes/
│   ├── auth.js              # Authentication endpoints
│   └── messages.js          # Messaging endpoints
├── middleware/
│   └── auth.js              # Authentication middleware
└── public/
    ├── login.html           # Login page
    ├── dashboard.html       # Main dashboard
    ├── css/
    │   └── style.css        # Styling
    └── js/
        ├── auth.js          # Login/registration logic
        └── dashboard.js     # Dashboard functionality
```

## Installation

### Requirements
- Node.js (v14 or higher)
- npm

### Setup Steps

1. **Navigate to project directory**
   ```bash
   cd /Users/tailia.malloy/Documents/Code/assessingSpearPhishing/codebases/Mistral/Small-3.1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Features

### User Authentication
- **Registration**: Create new account with email and password
- **Login**: Secure login with session management
- **Password Security**: Passwords hashed with bcrypt (10 salt rounds)
- **Session Management**: Secure HTTP-only cookies

### Messaging System
- **Send Messages**: Compose and send messages to other users
- **View Inbox**: See all received messages
- **Mark as Read**: Track which messages have been read
- **User Directory**: View available users to message

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
)
```

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body**: `{ email, password, confirmPassword }`
- **Response**: `{ message, userId }`

#### Login User
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ message, userId, email }`

#### Get Current User
- **GET** `/api/auth/user`
- **Response**: `{ id, email, created_at }`

#### Get All Users
- **GET** `/api/auth/users`
- **Response**: Array of users (excluding current user)

#### Logout
- **POST** `/api/auth/logout`
- **Response**: `{ message }`

### Messages

#### Get User's Messages
- **GET** `/api/messages`
- **Response**: Array of messages

#### Send Message
- **POST** `/api/messages`
- **Body**: `{ recipientId, subject, body }`
- **Response**: `{ message, messageId }`

#### Mark as Read
- **PUT** `/api/messages/:id/read`
- **Response**: `{ message }`

## Key Security Features for Discussion

### ✅ Implemented

1. **Password Hashing**
   - Uses bcrypt with 10 salt rounds
   - Never stores plain-text passwords
   - See: [routes/auth.js](routes/auth.js) - Lines 15-30

2. **Session Management**
   - HTTP-only cookies prevent XSS attacks
   - Secure session configuration
   - See: [server.js](server.js) - Lines 14-25

3. **Input Validation**
   - Email format validation
   - Password strength requirements
   - Checks for required fields
   - See: [routes/auth.js](routes/auth.js) - Lines 48-56

4. **User Enumeration Prevention**
   - Generic error messages for login failures
   - Doesn't reveal if email exists
   - See: [routes/auth.js](routes/auth.js) - Line 113

5. **CSRF Protection Consideration**
   - Session-based authentication reduces CSRF risk
   - Should implement CSRF tokens in production
   - See: [server.js](server.js) - Line 19

### ⚠️ For Production Improvement

1. **HTTPS/TLS**
   - Must use HTTPS in production
   - Change `secure: false` to `secure: true` in session config
   - Redirect HTTP to HTTPS

2. **CSRF Tokens**
   - Add `express-csurf` middleware
   - Include tokens in all forms

3. **Rate Limiting**
   - Add `express-rate-limit` to prevent brute force attacks
   - Especially on login and registration endpoints

4. **Input Sanitization**
   - Use `sanitize-html` to prevent HTML injection
   - Further XSS protection

5. **Database Prepared Statements**
   - Already implemented with parameterized queries
   - Prevents SQL injection

6. **Environment Variables**
   - Move secrets to `.env` file
   - Use `dotenv` package
   - Never hardcode secrets

7. **Logging & Monitoring**
   - Add comprehensive logging
   - Monitor authentication attempts
   - Alert on suspicious activity

8. **Password Requirements**
   - Enforce stronger password policies
   - Consider 2FA/MFA

## Testing the Application

### Create Test Accounts
1. Navigate to login page
2. Click "Create one here"
3. Register with:
   - Email: `student1@example.com`
   - Password: `SecurePass123`

4. Register another account:
   - Email: `student2@example.com`
   - Password: `SecurePass456`

### Send Test Messages
1. Login with one account
2. Click "Compose"
3. Select another user as recipient
4. Write a message and send
5. Logout and login with second account
6. Check inbox to see the message

## Code Comments for Students

The codebase includes detailed comments explaining:
- Why certain security practices are used
- Common vulnerabilities and how they're prevented
- Best practices for each feature
- Areas that need improvement for production

## Learning Outcomes

After studying this code, students should understand:
- ✅ How to hash passwords securely
- ✅ How to implement user sessions
- ✅ How to design database schemas
- ✅ How to build RESTful APIs
- ✅ Common web security vulnerabilities
- ✅ Frontend-backend communication
- ✅ Form validation and error handling
- ✅ File structure best practices

## Common Issues & Solutions

### Database Not Found
```
Error: database is not open
```
**Solution**: Database is created automatically on first run. Check file permissions.

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change PORT or kill process using port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution**: Run `npm install` to install dependencies

## Assignment Ideas for Students

1. **Add Password Reset Feature**
   - Implement email-based password reset
   - Use JWT tokens for reset links

2. **Add User Profiles**
   - Create user profile page
   - Allow profile customization

3. **Add Message Search**
   - Implement full-text search
   - Filter by sender, date, etc.

4. **Add Message Attachments**
   - Store file uploads
   - Serve files securely

5. **Add Two-Factor Authentication**
   - TOTP-based 2FA
   - SMS verification

6. **Add Rate Limiting**
   - Prevent brute force attacks
   - Limit API requests per user

7. **Add Audit Logging**
   - Log all authentication events
   - Log message access

8. **Add Email Notifications**
   - Notify users of new messages
   - Use nodemailer for emails

## Resources for Further Learning

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

## License

MIT License - This is educational reference material.

## Support

For questions or issues, review the code comments first. They contain explanations of design decisions and security considerations.

---

**Last Updated**: January 12, 2026  
**Version**: 1.0.0  
**Educational Purpose**: Teaching secure web application development
