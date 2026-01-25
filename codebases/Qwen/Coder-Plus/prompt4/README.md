# BlueMind v5 - Secure Messaging Application

This is a secure login and messaging web application built with Node.js for educational purposes. It demonstrates secure login mechanisms, safe password storage practices, and inter-user messaging features.

## Features

- **Secure Authentication**: Implements secure login with JWT tokens
- **Password Security**: Uses bcrypt for secure password hashing
- **Device Type Handling**: Different token expiration based on device type (private/public)
- **Inter-User Messaging**: Allows users to send and receive messages
- **Responsive UI**: Clean, professional interface with the requested design
- **Input Validation**: Comprehensive validation for all inputs
- **Security Headers**: Includes Helmet.js for security best practices
- **Rate Limiting**: Prevents brute force attacks

## Security Measures Implemented

1. **Password Storage**: All passwords are hashed using bcrypt with 12 salt rounds
2. **JWT Authentication**: Secure token-based authentication with configurable expiration
3. **SQL Injection Prevention**: Using Sequelize ORM prevents SQL injection
4. **XSS Protection**: Helmet.js adds security headers to prevent XSS attacks
5. **Rate Limiting**: Prevents brute force attacks on authentication endpoints
6. **Input Validation**: All inputs are validated before processing

## UI Design

The application implements the requested login page design:
- Dark blue background with navy header
- White login panel with rounded corners
- "BlueMind" logo with hexagon icon
- Form fields for Login and Password
- Radio buttons for "Private computer" and "Public computer"
- Prominent "Connect" button in bright blue
- Clean, centered layout with corporate aesthetic

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the application: `npm start`
4. Access the application at `http://localhost:3000`

## Usage

1. Visit the homepage to see the login screen
2. Register a new account using the registration link
3. Log in with your credentials
4. Access the dashboard to send and receive messages

## Project Structure

```
├── server.js              # Main server file
├── config/
│   └── database.js        # Database configuration
├── models/
│   ├── User.js           # User model with secure password handling
│   └── Message.js        # Message model
├── routes/
│   ├── auth.js           # Authentication routes
│   └── messages.js       # Message routes
├── public/
│   ├── index.html        # Login page
│   ├── dashboard.html    # Main dashboard
│   ├── styles.css        # Styling
│   ├── script.js         # Login page JavaScript
│   └── dashboard.js      # Dashboard JavaScript
└── database.sqlite       # SQLite database file
```

## Educational Value

This application serves as a practical example for teaching:
- Secure authentication mechanisms
- Proper password storage techniques
- Input validation and sanitization
- JWT token handling
- Database security
- Client-server communication
- Security best practices in web development