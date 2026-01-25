# BlueMind v5 - Secure Authentication and Messaging System

This is a sample web application demonstrating secure user authentication and encrypted password storage along with a messaging system between users. It was created for educational purposes for a web development course.

## Features

1. **Secure User Authentication**
   - User registration with password encryption using bcrypt
   - Secure login with session management
   - Different session timeouts for private/public computers

2. **Messaging System**
   - Send messages between registered users
   - View received messages in chronological order

3. **Security Measures**
   - Password hashing with bcrypt (10 rounds)
   - Session-based authentication
   - Input validation and sanitization
   - Protection against common web vulnerabilities

## Technologies Used

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **bcryptjs** - Password hashing library
- **express-session** - Session management
- **express-validator** - Input validation
- **dotenv** - Environment variable management
- **EJS** - Embedded JavaScript templating

## Project Structure

```
├── server.js              # Entry point of the application
├── .env                   # Environment variables
├── .gitignore             # Files and directories to ignore in git
├── package.json           # Project metadata and dependencies
├── README.md              # This file
├── middleware/
│   └── auth.js            # Authentication middleware
├── models/
│   ├── User.js            # User model with password hashing
│   └── Message.js         # Message model
├── routes/
│   ├── auth.js            # Authentication routes (login, register, logout)
│   └── messages.js        # Messaging routes
└── views/
    ├── login.ejs          # Login page template
    ├── register.ejs       # Registration page template
    └── messages.ejs       # Messages dashboard template
```

## Security Implementation Details

### Password Storage
Passwords are securely hashed using bcrypt with a cost factor of 10 rounds. This makes brute-force attacks computationally expensive.

```javascript
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### Session Management
Sessions are managed using express-session with:
- Secure random secret for signing the session ID cookie
- Configurable session timeout based on computer type (public/private)
- HTTP-only cookies to prevent XSS attacks

### Input Validation
All user inputs are validated using express-validator to prevent injection attacks:

```javascript
[
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
]
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory with the following:
   ```
   PORT=3000
   SESSION_SECRET=your_secure_session_secret_here
   ```

3. **Run the Application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`

## Educational Notes

This application demonstrates several important security concepts:

1. **Never store passwords in plain text** - Always hash passwords before storing
2. **Use established libraries** - Don't implement crypto yourself; use well-tested libraries like bcrypt
3. **Validate all user inputs** - Prevent injection attacks by validating and sanitizing inputs
4. **Implement proper session management** - Use secure session configurations
5. **Separation of concerns** - Organize code into models, views, and controllers

## Limitations & Improvements for Production

This is an educational example and has some limitations for production use:

1. **In-memory storage** - Data is lost when the server restarts. Use a database like MongoDB or PostgreSQL.
2. **Basic session storage** - Use a more robust session store like Redis for production.
3. **Limited error handling** - More comprehensive error handling would be needed.
4. **No rate limiting** - Implement rate limiting to prevent brute force attacks.
5. **No CSRF protection** - Add CSRF tokens for form submissions.
6. **No HTTPS** - Always use HTTPS in production.

## License

This project is for educational purposes only.