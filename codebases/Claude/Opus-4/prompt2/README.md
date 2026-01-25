# Secure Messaging Application - BlueMind Clone

This is an educational example of a secure messaging web application built with Node.js, demonstrating best practices for user authentication and data protection.

## Security Features Implemented

### 1. Password Security
- **Bcrypt hashing**: Passwords are hashed using bcrypt with a cost factor of 12
- **Salting**: Each password gets a unique salt automatically
- **No plain text storage**: Passwords are never stored in plain text

### 2. Authentication & Session Management
- **Secure sessions**: Express-session with httpOnly cookies
- **Session timeout**: 2-hour session expiration
- **Proper logout**: Sessions are properly destroyed on logout

### 3. Input Validation & Sanitization
- **Email validation**: Using express-validator for email format checking
- **Password requirements**: Minimum 8 characters enforced
- **XSS protection**: All user inputs are escaped and sanitized
- **SQL injection prevention**: Using parameterized queries with SQLite

### 4. CSRF Protection
- **CSRF tokens**: Every form includes a CSRF token
- **Token validation**: All POST requests verify the CSRF token

### 5. Security Headers
- **Helmet.js**: Implements various security headers including:
  - Content Security Policy (CSP)
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security (in production with HTTPS)

### 6. Rate Limiting
- **Login attempts**: Limited to 5 attempts per 15 minutes per IP
- **Prevents brute force attacks**

### 7. Database Security
- **Parameterized queries**: Prevents SQL injection
- **Indexed queries**: Better performance and security
- **Foreign key constraints**: Data integrity

## Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Run the application:**
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

3. **Access the application:**
Open your browser and go to: `http://localhost:3000`

## Project Structure

```
├── server.js           # Main application server
├── database/
│   └── db.js          # Database operations and queries
├── views/
│   ├── login.ejs      # Login page
│   ├── register.ejs   # Registration page
│   ├── dashboard.ejs  # User inbox/dashboard
│   └── compose.ejs    # Compose message page
├── public/
│   └── css/
│       └── style.css  # Application styles
├── package.json       # Dependencies
└── README.md         # This file
```

## Usage Instructions

1. **Register a new account:**
   - Navigate to the registration page
   - Enter an email and password (min 8 characters)
   - Passwords are hashed before storage

2. **Login:**
   - Use your registered email and password
   - Failed attempts are rate-limited
   - Sessions expire after 2 hours

3. **Send messages:**
   - Click "Compose Message" from the dashboard
   - Enter recipient email (must be a registered user)
   - Subject and message are sanitized for security

4. **View messages:**
   - All received messages appear in your inbox
   - Messages show sender, subject, date, and content

## Security Considerations for Students

When studying this code, pay attention to:

1. **Never trust user input**: All inputs are validated and sanitized
2. **Defense in depth**: Multiple security layers (CSRF, CSP, rate limiting)
3. **Secure defaults**: Sessions are httpOnly, passwords have minimum requirements
4. **Error handling**: Generic error messages prevent information leakage
5. **Separation of concerns**: Database logic is separated from routes

## Important Notes

- **Change the session secret**: In production, use environment variables
- **Enable HTTPS**: Set `cookie.secure = true` in production
- **Database**: SQLite is used for simplicity; consider PostgreSQL/MySQL for production
- **Environment variables**: Use .env files for sensitive configuration

## Testing Security Features

1. **Test XSS protection**: Try entering `<script>alert('XSS')</script>` in messages
2. **Test SQL injection**: Try entering `' OR '1'='1` in email fields
3. **Test CSRF**: Try submitting forms without valid tokens
4. **Test rate limiting**: Attempt multiple failed logins

## Educational Purpose

This application is designed for educational purposes to demonstrate:
- Secure authentication patterns
- Proper password handling
- Protection against common web vulnerabilities
- Best practices for Node.js web applications

Students should analyze the code to understand how each security feature is implemented and why it's important.