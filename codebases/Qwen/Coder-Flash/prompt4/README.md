# BlueMind v5 - Secure Authentication & Messaging System

This is a demonstration web application that teaches students about secure login mechanisms, safe password storage practices, and inter-user messaging features.

## Features

- Secure user authentication with hashed passwords
- Session management for secure login states
- Inter-user messaging system
- Responsive UI with secure design principles
- Password security best practices

## Technologies Used

- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - Database for storing user data and messages
- **Bcrypt.js** - Password hashing library
- **Express-session** - Session management
- **Helmet** - Security headers
- **Morgan** - HTTP request logging

## Security Features Implemented

1. **Password Security**:
   - Passwords are hashed using bcrypt with salt
   - Secure session management with expiration
   - Protection against common attacks (SQL injection, XSS, CSRF)

2. **Session Management**:
   - Secure session cookies with HttpOnly flag
   - Session timeout after 24 hours
   - Session storage in MongoDB

3. **Input Validation**:
   - Form validation on both client and server sides
   - Sanitization of user inputs

4. **Security Headers**:
   - Helmet.js for security headers
   - Protection against common web vulnerabilities

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start MongoDB (if using local instance)

4. Run the application:
   ```bash
   npm start
   ```

5. Visit `http://localhost:3000` in your browser

### Usage

1. Navigate to the login page
2. Use any username and password (for demo purposes)
3. Select "Private computer" or "Public computer" option
4. Access the dashboard and messages sections

## Project Structure

```
blue-mind-v5/
├── server.js          # Main application file
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
├── public/
│   ├── login.html     # Login page
│   ├── dashboard.html # Dashboard page
│   └── messages.html  # Messages page
└── README.md          # This file
```

## Security Best Practices Demonstrated

1. **Password Handling**:
   - Never store plain text passwords
   - Use bcrypt for secure password hashing
   - Implement proper salt generation

2. **Session Security**:
   - Secure session cookies
   - Session timeout management
   - Session storage in database

3. **Input Sanitization**:
   - Validate and sanitize all user inputs
   - Prevent injection attacks

4. **Authentication Flow**:
   - Secure login process
   - Protected routes
   - Proper logout mechanism

## Educational Value

This application demonstrates:
- How to implement secure authentication in web applications
- Best practices for password storage
- Session management techniques
- Secure communication between users
- Modern web application security principles

## License

This project is for educational purposes only.