# BlueMind v5 - Secure Web Application Example

This is an educational example of a secure web application that demonstrates:
- Secure user authentication
- Password hashing with bcrypt
- Session management
- Message system between users
- Security best practices

## Features

### 🔐 Security Features
- **Password Hashing**: Passwords are hashed using bcrypt with automatic salt generation
- **Session Management**: Secure sessions with different timeouts for private/public computers
- **Rate Limiting**: Protection against brute force attacks (5 attempts per 15 minutes)
- **Input Validation**: Server-side validation and sanitization
- **Security Headers**: Helmet.js for additional security headers
- **SQL Injection Protection**: Parameterized queries with SQLite

### 📧 Messaging System
- Send messages between users
- View inbox with unread message indicators
- Message reading status tracking
- Real-time message refresh

### 🎨 User Interface
- Responsive design similar to BlueMind interface
- Clean, modern UI with smooth animations
- Mobile-friendly navigation
- Accessibility considerations

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Demo Accounts
- **Email**: demo@bluemind.net / **Password**: password123
- **Email**: admin@bluemind.net / **Password**: password123

## Project Structure

```
bluemind-mailer/
├── server.js              # Main server file with Express.js setup
├── package.json           # Dependencies and scripts
├── database.db           # SQLite database (auto-created)
└── public/               # Client-side files
    ├── index.html        # Login page
    ├── dashboard.html    # Main dashboard
    ├── styles.css        # Login page styles
    ├── dashboard.css     # Dashboard styles
    ├── login.js          # Login functionality
    └── dashboard.js      # Dashboard functionality
```

## Key Learning Points

### 1. Password Security
```javascript
// Passwords are hashed with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// Verification
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 2. Session Management
```javascript
// Configure sessions with security options
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### 3. Rate Limiting
```javascript
// Prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.'
});
```

### 4. Database Security
```javascript
// Use parameterized queries to prevent SQL injection
db.get('SELECT * FROM users WHERE email = ?', [email], callback);
```

## Security Considerations for Production

### ⚠️ Important Notes for Students:

1. **Secret Keys**: Change the session secret in production
2. **HTTPS**: Enable secure cookies when using HTTPS
3. **Database**: Use a production database (PostgreSQL, MySQL) instead of SQLite
4. **Environment Variables**: Store secrets in environment variables
5. **Logging**: Implement proper logging and monitoring
6. **Input Validation**: Add more comprehensive validation
7. **CSRF Protection**: Implement CSRF tokens
8. **Content Security Policy**: Add CSP headers

## API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/` | Login page | No |
| POST | `/login` | User authentication | No |
| GET | `/dashboard` | Main dashboard | Required |
| GET | `/api/messages` | Get user messages | Required |
| POST | `/api/messages/:id/read` | Mark message as read | Required |
| POST | `/api/send-message` | Send new message | Required |
| GET | `/api/user` | Get user info | Required |
| POST | `/logout` | Logout user | Required |

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    recipient_id INTEGER,
    subject TEXT,
    body TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (recipient_id) REFERENCES users (id)
);
```

## Assignment Extensions

Students can extend this project by:

1. **Email Verification**: Add email verification for new accounts
2. **Password Reset**: Implement password reset functionality  
3. **File Attachments**: Allow file uploads in messages
4. **Message Folders**: Organize messages into folders
5. **Real-time Notifications**: Use WebSockets for live updates
6. **Two-Factor Authentication**: Add 2FA support
7. **Message Encryption**: Encrypt message contents
8. **Admin Panel**: Create admin interface for user management

## Common Security Vulnerabilities to Discuss

1. **SQL Injection**: Show how parameterized queries prevent this
2. **Cross-Site Scripting (XSS)**: Demonstrate input sanitization
3. **Session Fixation**: Explain session regeneration
4. **Brute Force**: Show rate limiting effectiveness
5. **Password Storage**: Compare hashing vs encryption vs plain text
6. **CSRF**: Discuss token-based protection
7. **Clickjacking**: Explain X-Frame-Options header

## License

This project is for educational purposes only.