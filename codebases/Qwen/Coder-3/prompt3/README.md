# BlueMind v5 - Secure Authentication Demo

This demonstration application showcases secure login mechanisms, safe password storage practices, and inter-user messaging features for educational purposes in a software engineering curriculum.

## Features

1. **Secure Authentication**
   - Password hashing with bcrypt (industry standard)
   - Session management with express-session
   - Input validation with express-validator
   - Protection against brute force attacks

2. **Safe Password Storage**
   - All passwords are hashed using bcrypt with salt
   - No plaintext passwords are stored
   - Configurable salt rounds for hashing strength

3. **Session Security**
   - Different session timeouts for private/public computers
   - Secure session cookies
   - Proper session destruction on logout

4. **User Messaging**
   - Simple inter-user messaging system
   - Message privacy (users only see their messages)

## Security Implementation Details

### Password Security
- Passwords are hashed using bcrypt with a cost factor of 10
- Each password gets a unique salt to prevent rainbow table attacks
- Hash comparison is done with constant-time comparison to prevent timing attacks

### Session Management
- Sessions are stored server-side (memory store in this demo)
- Private computers: 24-hour session timeout
- Public computers: 30-minute session timeout
- Sessions are destroyed properly on logout

### Input Validation
- All user inputs are validated and sanitized
- Protection against injection attacks
- Clear error messaging without revealing sensitive information

## Demo Accounts

- Username: `admin`, Password: `password123`
- Username: `user1`, Password: `mypassword`

## Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Visit `http://localhost:3000` in your browser

## Educational Value

This application demonstrates several important security concepts:

1. **Why not to store plaintext passwords**: Shows the proper way to hash and store passwords
2. **Session security**: Illustrates different security considerations for private vs public computers
3. **Input validation**: Demonstrates proper validation techniques to prevent malicious input
4. **Secure coding practices**: Follows industry best practices for web application security

## Directory Structure

```
bluemind-v5/
├── server.js          # Main application server
├── package.json       # Project dependencies and metadata
├── .env               # Environment variables
├── README.md          # Project documentation
├── SECURITY.md        # Detailed security implementation
├── SUMMARY.md         # Project summary
├── views/             # EJS templates for frontend
│   ├── login.ejs      # Login page
│   └── dashboard.ejs  # User dashboard
└── public/            # Static assets (CSS, JS, images)
    └── style.css      # Shared styles
```

## Technologies Used

- Node.js with Express framework
- bcrypt.js for password hashing
- express-session for session management
- express-validator for input validation
- EJS templating engine
- dotenv for environment management

## Additional Documentation

For more detailed information about the security implementation, see:
- [SECURITY.md](SECURITY.md) - Detailed security implementation
- [SUMMARY.md](SUMMARY.md) - Project summary and learning outcomes