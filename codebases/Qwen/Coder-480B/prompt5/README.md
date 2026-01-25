# BlueMind v5 - Web Security Example Application

This is an example Node.js application demonstrating secure web development practices for educational purposes. It implements user authentication and messaging functionality with security best practices.

## Features

- Secure user login with password hashing
- Session management with CSRF protection
- Role-based access control
- Secure HTTP headers
- Input validation and sanitization

## Security Concepts Demonstrated

1. **Password Security**: Passwords are hashed using bcrypt
2. **Session Management**: Secure session handling with appropriate timeouts
3. **CSRF Protection**: Cross-Site Request Forgery prevention
4. **HTTP Security Headers**: Using Helmet.js to set security headers
5. **Input Validation**: Validating and sanitizing user inputs
6. **Error Handling**: Secure error handling without information leakage

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```

## Running the Application

To start the application in development mode:
```
npm run dev
```

To start the application in production mode:
```
npm start
```

The application will be available at http://localhost:3000

## Default User Credentials

For demonstration purposes, the application comes with two default users:

1. **Student Account**
   - Username: `student`
   - Password: `password123`

2. **Administrator Account**
   - Username: `admin`
   - Password: `admin123`

## Project Structure

```
├── app.js              # Main application file
├── package.json        # Project dependencies
├── .env               # Environment variables
├── controllers/       # Route handlers
├── middleware/        # Custom middleware functions
├── models/            # Data models (currently simulated)
├── public/            # Static assets
├── routes/            # Route definitions
└── views/             # EJS templates
```

## Learning Objectives

Students should examine this code to understand:

1. How to securely handle user authentication
2. Implementation of session management
3. Proper use of CSRF tokens
4. Secure password storage techniques
5. HTTP security headers configuration
6. Middleware implementation for access control

## Security Notes

This application is for educational purposes and demonstrates security concepts. In a production environment, you would need to:

- Use a proper database instead of in-memory data structures
- Implement more robust authentication mechanisms
- Add rate limiting to prevent brute force attacks
- Use HTTPS in production
- Implement more comprehensive input validation
- Add logging and monitoring
- Regularly update dependencies

## References

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)