# BlueMind v5 - Secure Messaging Application

This is a demonstration application for teaching students about secure web development with Node.js. The application implements user authentication, secure session management, and encrypted password storage.

## Features

1. **Secure User Authentication**
   - Password hashing with bcrypt
   - CSRF protection
   - Session management with secure cookies
   - Helmet.js for HTTP security headers

2. **Login System**
   - Clean, corporate-style login interface
   - Support for private/public computer selection
   - Different session timeouts based on computer type

3. **Messaging System**
   - View messages from other users
   - Send messages to other users
   - Timestamped messages with sender information

## Security Measures Implemented

- **Password Storage**: Passwords are hashed using bcrypt with a cost factor of 12
- **Session Management**: Secure session cookies with appropriate expiration
- **CSRF Protection**: All forms protected against Cross-Site Request Forgery
- **Rate Limiting**: API rate limiting to prevent abuse and brute-force attacks
- **HTTP Headers**: Security headers set using Helmet.js
- **Input Validation**: Server-side validation of all user inputs
- **XSS Prevention**: Proper escaping of user data in templates

## Setup Instructions

1. Install Node.js (version 14 or higher)
2. Clone or download this repository
3. Run `npm install` to install dependencies
4. Run `npm start` to start the server
5. Visit `http://localhost:3000` in your browser

## Demo Credentials

A demo user is automatically created for testing:
- Username: `demo`
- Password: `password123`

## Project Structure

```
├── server.js              # Main application server
├── package.json           # Project dependencies
├── .env                   # Environment variables
├── .gitignore             # Files to ignore in git
├── views/                 # EJS templates
│   ├── login.ejs          # Login page
│   ├── dashboard.ejs      # User dashboard
│   ├── register.ejs       # Registration page
│   └── registration-success.ejs
├── public/                # Static assets
│   ├── css/
│   │   └── style.css      # Application styles
│   └── js/
│       └── dashboard.js   # Client-side JavaScript
└── README.md              # This file
```

## Learning Objectives

Students can learn about:
1. Express.js routing and middleware
2. Secure password handling with bcrypt
3. Session management with express-session
4. CSRF protection implementation
5. Rate limiting to prevent abuse
6. HTTP security headers with Helmet.js
7. Template rendering with EJS
8. Client-server communication with AJAX
9. Environment variable management with dotenv

## Important Notes for Students

1. This is a demonstration application for educational purposes
2. In a production environment, you would use a database instead of in-memory storage
3. The SESSION_SECRET in .env should be a truly random secret in production
4. HTTPS should be used in production (currently disabled for local development)
5. Additional validation and error handling would be needed in a production application

## Assignment Ideas

1. Implement a database backend using MongoDB or PostgreSQL
2. Add user profile management features
3. Implement message encryption
4. Add real-time messaging with WebSockets
5. Enhance the UI with a frontend framework like React