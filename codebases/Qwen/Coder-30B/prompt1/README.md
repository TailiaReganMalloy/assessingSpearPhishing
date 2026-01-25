# BlueMind v5 - Secure Messaging Application

This is a secure web application that demonstrates user authentication and messaging functionality. Students can use this as a reference for their programming assignments.

## Features

- Secure user login with password hashing
- Session management
- Message system for users to send/receive messages
- Responsive design with security best practices
- Rate limiting to prevent brute force attacks

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- bcrypt for password hashing
- Helmet.js for security headers
- Express-rate-limit for protection

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running

### Installation

1. Clone or copy this project to your local machine
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Make sure MongoDB is running
2. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

### Setup Sample Data

To create sample users and messages for testing:
```bash
curl http://localhost:3000/setup
```

### Accessing the Application

1. Open your browser and go to `http://localhost:3000/login`
2. Use one of the sample users:
   - Username: alice, Password: password123
   - Username: bob, Password: password123
   - Username: charlie, Password: password123

## Security Features Implemented

1. **Password Hashing**: Passwords are hashed using bcrypt before storing in the database
2. **Session Management**: Secure sessions with proper cookie settings
3. **Rate Limiting**: Prevents brute force login attempts
4. **Security Headers**: Helmet.js adds security headers to responses
5. **Input Validation**: Basic validation on form inputs

## Project Structure

```
.
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Key Components Explained

### 1. User Authentication
- Users can register/login with username/password
- Passwords are securely hashed using bcrypt
- Sessions are managed using express-session

### 2. Message System
- Users can receive messages from other users
- Messages are stored in MongoDB
- Only messages intended for the logged-in user are displayed

### 3. Security Measures
- HTTPS-ready session cookies
- Rate limiting for login attempts
- Security headers for XSS and CSRF protection
- Input sanitization

## For Students

This example demonstrates:
- How to implement secure authentication
- How to store sensitive data securely
- How to manage user sessions
- How to create a basic messaging system
- How to apply security best practices in web applications

Students should focus on:
1. Understanding how passwords are hashed and verified
2. How sessions are managed and secured
3. The structure of the database models
4. How security measures protect the application
5. How to extend this system with additional features

## Important Notes

- This is a simplified example for educational purposes
- In production, you'd want additional security measures
- Always use environment variables for sensitive data
- Implement proper error handling and logging
- Add more comprehensive input validation