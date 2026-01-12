# BlueMind v5 - Secure Messaging Application

This is a Node.js web application that demonstrates secure user authentication and private messaging functionality. It serves as an educational example for students learning web development with security considerations.

## Features

- User registration and authentication
- Secure password storage using bcrypt
- Private messaging between users
- Session management
- Clean, professional UI matching the BlueMind v5 design

## Technologies Used

- Node.js
- Express.js
- MongoDB/Mongoose
- EJS templating
- Passport.js for authentication
- Bcrypt for password hashing
- JSON Web Tokens (JWT)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (either local installation or cloud Atlas)

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on the `.env.example` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/bluemind
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   JWT_SECRET=your-jwt-secret-key-change-this-in-production
   NODE_ENV=development
   ```
5. Start the application:
   ```bash
   npm start
   ```
6. Visit `http://localhost:3000` in your browser

### Development Mode

To run in development mode with automatic restart on file changes:
```bash
npm run dev
```

## Security Features

- Passwords are hashed using bcrypt before storing in the database
- Session management with secure session cookies
- Input validation and sanitization
- Protection against common web vulnerabilities
- Proper authentication middleware on protected routes

## Project Structure

```
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
├── views/             # EJS templates
│   ├── login.ejs      # Login page
│   ├── register.ejs   # Registration page
│   ├── dashboard.ejs  # User dashboard
│   ├── compose.ejs    # Compose message page
│   └── message.ejs    # Message detail page
└── public/            # Static assets
    └── css/
        └── style.css  # Additional styles
```

## Educational Objectives

This application demonstrates several important concepts for students:

1. **Authentication**: How to securely register and authenticate users
2. **Database Design**: Proper schema design for users and messages
3. **Security**: Password hashing, session management, and input validation
4. **Routing**: Organizing application endpoints
5. **Templating**: Using EJS to render dynamic content
6. **API Design**: Creating RESTful endpoints for messaging

## Assignment Ideas

Students can extend this application by implementing:

- Message encryption
- User profiles and avatars
- Group messaging
- Message threading
- Email notifications
- Advanced user permissions
- Message search functionality
- Message deletion
- Read receipts
- File attachments

## Important Security Notes

For production use, ensure you:
- Use HTTPS
- Implement rate limiting
- Add CSRF protection
- Sanitize all user inputs
- Regularly update dependencies
- Use environment variables for sensitive data
- Implement proper error handling
- Add input validation middleware

## Troubleshooting

If you encounter issues with MongoDB:
- Make sure MongoDB is installed and running locally
- Or set up a MongoDB Atlas account and update the connection string
- Check that the connection string in `.env` is correct

For any other issues, check the console for error messages and ensure all dependencies are properly installed.