# BlueMind v5 - Educational Reference Implementation

BlueMind v5 is a secure web application that demonstrates best practices for user authentication and messaging. This project is designed as an educational reference for students learning about secure web development.

## Features

- **Secure User Authentication**
  - Password hashing with bcrypt (10 salt rounds)
  - Secure session management with express-session
  - Protected routes requiring authentication
  
- **User Messaging System**
  - Send messages to other users
  - Inbox with message history
  - Mark messages as read
  - Secure message storage

- **Modern Web Design**
  - Clean, professional UI with BlueMind branding
  - Responsive design for mobile and desktop
  - Smooth transitions and user feedback

## Technology Stack

- **Backend**: Node.js with Express.js
- **Password Security**: bcrypt for secure password hashing
- **Session Management**: express-session
- **Frontend**: HTML5, CSS3, JavaScript
- **Data Storage**: JSON files (for educational purposes)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup Instructions

1. Navigate to the project directory:
```bash
cd BlueMind_v5
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Creating a Test Account

1. Click "Create one here" on the login page
2. Enter a username and password
3. Click "Create Account"
4. Log in with your credentials

### Demo Accounts

For testing, the following demo accounts are pre-configured:

- **Login**: `demo` | **Password**: `demo123`
- **Login**: `student` | **Password**: `student123`

### Sending Messages

1. Log in with your account
2. Click "Compose" in the sidebar
3. Enter the recipient's login and your message
4. Click "Send Message"

### Viewing Messages

1. Click "Inbox" in the sidebar
2. Click any message to view its full content
3. Messages are marked as read when viewed

## Project Structure

```
BlueMind_v5/
├── public/
│   ├── css/
│   │   ├── style.css          # Login page styles
│   │   └── dashboard.css      # Dashboard styles
│   ├── js/
│   │   ├── script.js          # Login page logic
│   │   └── dashboard.js       # Dashboard logic
│   ├── login.html             # Login/Registration page
│   └── dashboard.html         # Authenticated dashboard
├── routes/
│   ├── auth.js                # Authentication routes (login, register)
│   └── messages.js            # Messaging routes
├── middleware/
│   └── auth.js                # Authentication middleware
├── data/
│   ├── users.json             # User storage
│   └── messages.json          # Messages storage
├── server.js                  # Express server setup
├── package.json               # Project dependencies
└── README.md                  # This file
```

## Key Security Features

### 1. Password Hashing
All passwords are hashed using bcrypt with 10 salt rounds before storage:
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

### 2. Password Verification
Passwords are compared securely using bcrypt's comparison function:
```javascript
const passwordMatch = await bcrypt.compare(providedPassword, storedHash);
```

### 3. Session Management
- Sessions are stored server-side
- HTTP-only cookies prevent JavaScript access
- Session timeout after 1 hour of inactivity
- Secure session secrets (should be changed in production)

### 4. Input Validation
- All user inputs are validated
- HTML content is escaped to prevent XSS attacks
- Protected routes require valid authentication

### 5. Protected Routes
- Dashboard requires authentication
- Message endpoints require valid session
- Logout destroys session data

## Important Security Notes for Production

⚠️ **This is an educational reference implementation. The following changes are required for production use:**

1. **Change Session Secret**
   - In `server.js`, update the `secret` in the session configuration to a strong, random value
   - Never hardcode secrets; use environment variables

2. **Use HTTPS**
   - Set `secure: true` in cookie options
   - Deploy on HTTPS-enabled server

3. **Use a Real Database**
   - Replace JSON file storage with a proper database (PostgreSQL, MongoDB, etc.)
   - Implement proper database security measures

4. **Environment Variables**
   - Store sensitive configuration in `.env` files
   - Never commit secrets to version control

5. **Add Rate Limiting**
   - Implement rate limiting on login endpoints
   - Prevent brute force attacks

6. **Add CSRF Protection**
   - Implement CSRF tokens for form submissions

7. **Input Sanitization**
   - Use input sanitization libraries like `xss` or `sanitize-html`

8. **Logging and Monitoring**
   - Implement security logging
   - Monitor for suspicious activity

## Learning Objectives

This project demonstrates:

- Secure password storage using bcrypt
- Session-based authentication
- HTTP-only cookies for session management
- RESTful API design
- Frontend form validation
- Modal dialogs and dynamic content
- Responsive web design
- Error handling and user feedback

## API Endpoints

### Authentication Endpoints

- `POST /auth/register` - Create a new user account
- `POST /auth/login` - Authenticate a user
- `GET /auth/check` - Check current authentication status
- `GET /auth/logout` - Destroy session and logout

### Messaging Endpoints

- `GET /api/messages/inbox` - Retrieve all messages for the user
- `POST /api/messages/send` - Send a message to another user
- `PUT /api/messages/mark-read/:messageId` - Mark message as read

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, modify the `PORT` variable in `server.js`

### ENOENT: no such file or directory
Ensure the `data/` directory exists and the `.json` files are present

### Module not found
Run `npm install` to install all dependencies

## Contributing

As an educational project, this serves as a reference implementation. Students should:
1. Study the code structure and design patterns
2. Understand the security implementations
3. Extend the features for their assignments
4. Follow the security best practices demonstrated

## License

This educational reference implementation is provided as-is for learning purposes.

## Support

For questions about the implementation, refer to the code comments and the structure provided in each file.

---

**Last Updated**: January 2026
**Version**: 5.0.0
