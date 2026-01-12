# Secure Login & Messaging System - Educational Reference

This is a complete Node.js example application designed for teaching students how to build secure web applications with user authentication and messaging capabilities.

## Features

✅ **Secure User Authentication**
- Password hashing using bcrypt (never store plain-text passwords!)
- Server-side session management
- Protected routes requiring authentication

✅ **User Messaging System**
- Send messages between users
- Inbox with unread message tracking
- Message read/unread status
- Delete messages

✅ **Security Best Practices**
- HTTPOnly session cookies (prevents XSS attacks)
- CSRF protection ready
- Proper password validation
- Input validation and sanitization
- Error messages that don't leak user information

## Project Structure

```
├── server.js                 # Main Express server
├── db.js                     # Database initialization and helpers
├── routes/
│   ├── auth.js             # Authentication endpoints (login, register, logout)
│   └── messages.js         # Messaging endpoints (send, inbox, delete)
├── public/
│   ├── index.html          # Login/Registration page
│   └── messages.html       # Messages inbox interface
├── app.db                  # SQLite database (created on first run)
└── package.json            # Project dependencies
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Steps

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

## Security Lessons for Students

### 1. Password Hashing (bcryptjs)
**Location:** `routes/auth.js`

✅ **DO:**
```javascript
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
const passwordMatches = await bcrypt.compare(password, user.password_hash);
```

❌ **DON'T:**
```javascript
// Never store passwords in plain text!
db.insert('INSERT INTO users (password) VALUES (?)', password);
```

### 2. Session Management
**Location:** `server.js`

✅ **DO:**
```javascript
cookie: {
  secure: false,        // Set to true in production with HTTPS
  httpOnly: true,       // Prevents client-side JS from accessing cookie
  maxAge: 24 * 60 * 60 * 1000
}
```

This prevents XSS attacks from stealing session cookies.

### 3. Input Validation
**Location:** `routes/auth.js`, `routes/messages.js`

✅ Always validate and sanitize user input:
```javascript
if (!email || !password) {
  return res.status(400).json({ error: 'Email and password required' });
}
if (password.length < 8) {
  return res.status(400).json({ error: 'Password must be at least 8 characters' });
}
```

### 4. Authentication Middleware
**Location:** `routes/messages.js`

✅ Protect routes that require authentication:
```javascript
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}
```

### 5. Information Disclosure
**Location:** `routes/auth.js`

✅ **DO:** Generic error messages during login
```javascript
// Don't reveal which email exists
return res.status(401).json({ error: 'Invalid email or password' });
```

❌ **DON'T:**
```javascript
// Reveals user enumeration information
if (!user) {
  return res.status(404).json({ error: 'Email not found' });
}
```

### 6. Database Relationships
**Location:** `db.js`

Ensures only users can see/modify their own messages:
```javascript
// In messages.js - Mark message as read (only recipient can mark it)
WHERE m.id = ? AND m.recipient_id = ?
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/register` | Create new user account |
| POST   | `/api/auth/login` | Authenticate user |
| POST   | `/api/auth/logout` | Destroy session |
| GET    | `/api/auth/me` | Get current user info |

**Register Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "isPrivateComputer": true
}
```

### Messaging

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/messages/send` | Send a message |
| GET    | `/api/messages/inbox` | Get unread messages |
| GET    | `/api/messages/all` | Get all messages |
| PUT    | `/api/messages/:id/read` | Mark message as read |
| DELETE | `/api/messages/:id` | Delete a message |
| GET    | `/api/messages/users/all` | List all users |

**Send Message Request:**
```json
{
  "recipientEmail": "recipient@example.com",
  "subject": "Hello",
  "body": "This is my message content"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
)
```

## Testing the Application

### Create Test Users

1. Open http://localhost:3000
2. Click "Register" and create an account with:
   - Email: `alice@example.com`
   - Password: `password123`

3. Create another account:
   - Email: `bob@example.com`
   - Password: `password456`

### Send a Test Message

1. Log in as Alice
2. Click "Compose"
3. Select Bob as recipient
4. Send a message
5. Log out and log in as Bob
6. See the unread message in inbox

## Common Modifications for Assignments

Students can extend this project by:

1. **Add user profiles** - Store additional user information
2. **Message attachments** - Add file upload support
3. **Message search** - Implement full-text search
4. **User blocking** - Prevent messages from blocked users
5. **Message encryption** - Encrypt messages end-to-end
6. **Two-factor authentication** - Add 2FA for login
7. **Message expiration** - Auto-delete old messages
8. **Reply to messages** - Message threading
9. **Real-time updates** - Use WebSockets for live notifications
10. **Rate limiting** - Prevent spam/abuse

## Production Deployment Checklist

⚠️ **Before deploying to production:**

- [ ] Set `cookie.secure: true` (requires HTTPS)
- [ ] Change the session secret to a strong random value
- [ ] Use PostgreSQL instead of SQLite for production
- [ ] Add HTTPS/SSL certificate
- [ ] Set up rate limiting and CORS properly
- [ ] Add CSRF token validation
- [ ] Implement input validation and sanitization
- [ ] Add comprehensive error logging
- [ ] Set up database backups
- [ ] Use environment variables for sensitive config
- [ ] Add monitoring and alerting

## Environment Variables

Create a `.env` file (optional):
```
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secret-key-here
```

## Troubleshooting

**Port already in use:**
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Database locked:**
Delete `app.db` and restart the server to reset the database.

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## References & Resources

- [Express.js Documentation](https://expressjs.com/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## License

MIT - Educational Use
