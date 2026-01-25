# BlueMind v5 - Secure Authentication & Messaging System

This is a demonstration application for web development students that showcases secure user authentication and encrypted password storage along with a messaging system between users.

## Features

- Secure user authentication with bcrypt password hashing
- Session management for logged-in users
- Encrypted password storage
- User registration and login functionality
- Messaging system between users
- Responsive web interface with clean design

## Security Features

1. **Password Encryption**: Passwords are securely hashed using bcrypt before storage
2. **Session Management**: User sessions are managed securely with express-session
3. **Input Validation**: Form validation to prevent common security issues
4. **Secure Headers**: Proper HTTP headers for enhanced security

## Technical Implementation

### Backend
- Built with Node.js and Express.js
- Passwords are hashed using bcryptjs
- Sessions are managed with express-session
- EJS templating engine for views

### Frontend
- Clean, responsive design with CSS
- Follows the specified BlueMind branding with dark blue theme
- Intuitive user interface for login, registration, and messaging

## Setup Instructions

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the application:
   ```
   npm start
   ```
5. Visit `http://localhost:3000` in your browser

## Project Structure

```
.
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── views/              # EJS template files
│   ├── login.ejs       # Login page
│   ├── register.ejs    # Registration page
│   ├── dashboard.ejs   # User dashboard
│   └── send-message.ejs # Message sending page
└── public/             # Static assets
    └── styles.css      # CSS styling
```

## How to Use

1. **Registration**: New users can register with a username and password
2. **Login**: Existing users can log in with their credentials
3. **Messaging**: Logged-in users can send messages to other registered users
4. **Dashboard**: View received messages and navigate the application

## Security Notes for Students

This implementation demonstrates:
- Why password hashing is important
- How to properly store sensitive data
- Session management best practices
- Input validation techniques

In a production environment, you would also want to:
- Use HTTPS
- Implement rate limiting
- Add CSRF protection
- Use a proper database instead of in-memory storage
- Add more robust error handling