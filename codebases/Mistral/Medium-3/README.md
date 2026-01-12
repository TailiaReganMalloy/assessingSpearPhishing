# BlueMind Secure Messaging Application

A reference implementation of a secure web application demonstrating proper authentication and messaging practices for educational purposes.

## Features

- **User Registration & Authentication**: Secure password hashing with bcryptjs
- **Session Management**: Session-based authentication with configurable timeouts
- **Encrypted Password Storage**: Passwords never stored in plain text
- **User-to-User Messaging**: Send and receive messages with other users
- **Message Status Tracking**: Track read/unread status of messages
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
├── server.js              # Express server and API routes
├── package.json           # Project dependencies
├── public/
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # Main application interface
│   └── styles.css         # Styling for all pages
└── app.db                 # SQLite database (auto-created)
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

3. **For development with auto-reload:**
   ```bash
   npm run dev
   ```

## Key Security Features Demonstrated

### 1. Password Hashing (bcryptjs)
- Passwords are never stored in plain text
- Uses bcryptjs with salt rounds for secure hashing
- Comparison during login is done securely

### 2. Session Management
- Uses express-session for server-side session management
- Sessions stored in memory (for production, use a session store)
- HTTP-only cookies to prevent XSS attacks
- Configurable session timeout based on computer type

### 3. Input Validation
- Email validation on both client and server
- Password strength requirements
- Message content validation
- CSRF protection through session-based authentication

### 4. SQL Injection Prevention
- Uses parameterized queries with SQLite
- No string concatenation in SQL statements

### 5. Authentication Checks
- Protected routes require authentication
- Session validation on API endpoints
- Secure logout functionality

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
)
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user

### User Info
- `GET /api/user` - Get current logged-in user info

### Messages
- `GET /api/messages` - Get all messages for current user
- `GET /api/users` - Get list of all users (except self)
- `POST /api/messages` - Send a new message
- `POST /api/messages/:id/read` - Mark message as read

## Teaching Points

### For Students to Understand:

1. **Never trust user input** - Always validate on both client and server
2. **Hash passwords, never store plain text** - Use appropriate hashing algorithms
3. **Use sessions properly** - Server-side sessions are more secure than relying on client-side tokens alone
4. **Secure database queries** - Use parameterized queries to prevent SQL injection
5. **HTTP-only cookies** - Prevent JavaScript access to sensitive cookies
6. **Sensitive data handling** - Never expose error messages that reveal user information
7. **HTTPS in production** - Always use HTTPS for authentication

## Configuration

To change the secret key for sessions (IMPORTANT for production):
Edit `server.js` line 24:
```javascript
secret: 'your-secret-key-change-this-in-production',
```

## Improving for Production

When deploying to production, students should:

1. Use environment variables for sensitive configuration
2. Enable HTTPS and set `secure: true` in session cookie options
3. Use a proper session store (Redis, MongoDB, etc.) instead of memory
4. Add rate limiting to prevent brute force attacks
5. Implement CSRF tokens for state-changing operations
6. Add input sanitization for XSS prevention
7. Use prepared statements (already done with SQLite)
8. Add logging and monitoring
9. Implement proper error handling without exposing sensitive info
10. Add email verification for user registration
11. Implement password recovery functionality
12. Add two-factor authentication (2FA)
13. Set proper database constraints and indexes
14. Use environment-based configuration

## Common Vulnerabilities & How This App Prevents Them

### 1. SQL Injection
**Protection:** Uses SQLite parameterized queries with placeholders (?)

### 2. Cross-Site Scripting (XSS)
**Protection:** 
- HTML content is not dynamically inserted
- Input is properly escaped
- HTTP-only cookies prevent direct JS access

### 3. Brute Force Attacks
**To Add:** Implement rate limiting on login endpoint

### 4. Session Hijacking
**Protection:**
- HTTP-only cookies
- Session timeout
- Server-side session management

### 5. Password Weak Storage
**Protection:** bcryptjs with automatic salt generation

## Testing the Application

### Create Test Users:
1. Navigate to `/register`
2. Create user: `user1@example.com` / `password123`
3. Create user: `user2@example.com` / `password123`

### Test Messaging:
1. Login as `user1@example.com`
2. Go to Compose tab
3. Select `user2@example.com` as recipient
4. Send a message
5. Logout
6. Login as `user2@example.com`
7. View the message in Inbox

## Troubleshooting

**Port already in use:**
- Change PORT in server.js or kill the process using port 3000

**Database locked error:**
- Close any other instances of the app and delete app.db to reset

**Cannot find module errors:**
- Run `npm install` to install all dependencies

## License

This is an educational reference implementation.

## Next Steps for Students

After understanding this example, students should:
1. Add email verification
2. Implement password reset functionality
3. Add profile management
4. Implement message search
5. Add message categories/folders
6. Implement user blocking
7. Add notification system
8. Implement two-factor authentication
9. Add encryption for message content
10. Set up proper logging and monitoring
