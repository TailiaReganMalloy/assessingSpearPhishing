# BlueMind v5 - Secure Authentication and Messaging System

## Project Overview

This project demonstrates a secure user authentication and messaging system built with Node.js. It includes:

1. **Secure Login System**:
   - Password encryption using bcrypt
   - JWT token-based authentication
   - Session management
   - CSRF protection
   - Rate limiting

2. **Messaging System**:
   - Message retrieval functionality
   - Message composition interface
   - User-to-user communication simulation

3. **Security Features**:
   - Helmet.js for security headers
   - CORS configuration
   - Input validation
   - Secure session handling

## Technical Implementation

### Core Technologies Used

- **Express.js**: Web application framework
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **express-session**: Session management
- **connect-mongo**: MongoDB session store
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: Request rate limiting

### Directory Structure

```
bluemind-v5/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── views/                 # HTML templates
│   ├── login.html         # Login page
│   ├── dashboard.html     # User dashboard
│   └── messages.html      # Messaging interface
├── public/                # Static assets
├── config/                # Configuration files
│   └── app.config.js      # Application configuration
├── middleware/            # Custom middleware
│   └── auth.js            # Authentication middleware
├── services/              # Business logic
│   └── auth-service.js    # User and message services
└── .env.example           # Environment variables example
```

### Security Features Implemented

1. **Password Security**:
   - Passwords are hashed using bcrypt with 12 salt rounds
   - No plaintext passwords stored or transmitted

2. **Authentication**:
   - JWT tokens for stateless authentication
   - Session management with secure cookies
   - Token expiration (24 hours)

3. **Input Protection**:
   - Rate limiting to prevent brute force attacks
   - Security headers via Helmet.js
   - CORS configuration

4. **Session Management**:
   - Secure session cookies
   - Session store in MongoDB
   - Session timeout

### How to Run

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

3. Start the server:
   ```
   npm start
   ```

4. Access the application at `http://localhost:3000`

### Educational Value for Students

This implementation demonstrates:

1. **Secure Authentication Patterns**:
   - Proper password handling
   - Token-based authentication
   - Session management

2. **Web Security Principles**:
   - Protection against common vulnerabilities
   - Secure data transmission
   - Input validation

3. **Modern Web Development Practices**:
   - RESTful API design
   - Modular code organization
   - Separation of concerns

### Sample Credentials

For demonstration purposes, you can use:
- **Username**: student
- **Password**: password123

### Important Notes

1. This is a simplified educational example. In production, you would:
   - Connect to a real database
   - Implement proper user registration
   - Add more robust error handling
   - Include comprehensive testing
   - Implement additional security measures

2. The JWT secret and session secret should be changed in production.

3. The application uses simulated data. In a real implementation, you would connect to a database for user and message storage.