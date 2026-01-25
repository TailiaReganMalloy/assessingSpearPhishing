# BlueMind v5 Authentication System

A secure Node.js application demonstrating authentication with password hashing and user-to-user messaging capabilities.

## Features

- Secure user authentication with JWT tokens
- Password hashing using bcrypt
- User-to-user messaging system
- Clean, professional UI with BlueMind v5 branding
- Responsive design
- Input validation and sanitization
- Protection against common security vulnerabilities

## Technologies Used

- Node.js
- Express.js
- MongoDB/Mongoose
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- EJS (templating engine)
- HTML/CSS/JavaScript (frontend)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/bluemind_auth
   JWT_SECRET=your_super_secret_jwt_key_here_replace_with_strong_random_value
   SESSION_SECRET=your_session_secret_key_here_replace_with_strong_random_value
   ```
4. Run the application:
   ```bash
   npm start
   ```

## Security Measures Implemented

1. **Password Security**: All passwords are hashed using bcrypt with salt rounds
2. **Authentication**: JWT tokens for session management
3. **Input Validation**: Using express-validator to sanitize inputs
4. **Security Headers**: Helmet.js for setting security HTTP headers
5. **Rate Limiting**: Protection against brute force attacks
6. **CORS Policy**: Configured to prevent cross-origin attacks

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user and return JWT token
- `GET /api/auth/verify` - Verify JWT token

### Messaging
- `POST /api/messages/send` - Send a message to another user
- `GET /api/messages/received` - Get messages received by the authenticated user
- `GET /api/messages/sent` - Get messages sent by the authenticated user
- `PATCH /api/messages/read/:id` - Mark a message as read
- `DELETE /api/messages/:id` - Delete a message

## Project Structure

```
BlueMindAuth/
├── models/
│   ├── User.js       # User model with password hashing
│   └── Message.js    # Message model for user communication
├── routes/
│   ├── auth.js       # Authentication routes
│   └── messages.js   # Messaging routes
├── views/
│   ├── login.ejs     # Login page with BlueMind v5 design
│   └── dashboard.ejs # User dashboard for messaging
├── utils/
│   └── auth.js       # Authentication utilities
├── public/           # Static assets
├── .env              # Environment variables
├── server.js         # Main application entry point
└── package.json      # Dependencies and scripts
```

## Usage

1. Navigate to `http://localhost:3000` to access the login page
2. Register a new account or use an existing one
3. Once logged in, you can:
   - View received messages
   - View sent messages
   - Compose new messages to other users
   - Mark messages as read
   - Delete messages

## Educational Value

This project demonstrates:
- Secure authentication practices
- Proper password handling and storage
- JWT token implementation
- User authorization and permissions
- Secure messaging system
- Frontend-backend communication
- Input validation and sanitization
- Protection against common web vulnerabilities