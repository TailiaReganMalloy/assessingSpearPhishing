# Secure Messaging Application - Educational Project

A Node.js web application demonstrating secure user authentication with encrypted password storage and a messaging system between users. Built for web development students to study security best practices.

## Features

### Security Features
- **Bcrypt Password Hashing**: Passwords are hashed with 10 salt rounds, making them secure against dictionary and brute-force attacks
- **Input Validation**: All user inputs are validated using express-validator to prevent injection attacks
- **Session Management**: Secure session cookies with httpOnly and sameSite flags
- **CSRF Protection**: Via session management
- **SQL Injection Prevention**: Parameterized queries throughout the application
- **XSS Protection**: Output escaping and Content Security Headers via Helmet

### Application Features
- User registration and login
- Secure password storage with bcryptjs
- Send messages to other users
- Receive and read messages
- View message history (inbox and sent)
- Unread message counter
- User-friendly interface matching BlueMind design

## Project Structure

```
project/
├── server.js              # Express server setup
├── package.json           # Project dependencies
├── db/
│   └── database.js        # SQLite database initialization and helpers
├── routes/
│   ├── auth.js           # Authentication endpoints
│   └── messages.js       # Messaging endpoints
└── public/
    ├── index.html        # HTML markup
    ├── styles.css        # Styling
    └── app.js            # Client-side JavaScript
```

## Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Password Security**: bcryptjs
- **Security Middleware**: Helmet
- **Input Validation**: express-validator
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user info
- `GET /api/auth/users` - Get all users (except current)

### Messages
- `POST /api/messages/send` - Send a message
- `GET /api/messages/inbox` - Get received messages
- `GET /api/messages/sent` - Get sent messages
- `GET /api/messages/:id` - Get single message
- `GET /api/messages/count/unread` - Get unread count
- `DELETE /api/messages/:id` - Delete a message

## Security Considerations for Students

### Password Storage
- Passwords are never stored in plaintext
- Bcryptjs hashes passwords with salt rounds (10 is the default)
- Even identical passwords produce different hashes due to salt

### Session Security
- Sessions are stored server-side
- Cookies are httpOnly (prevent JavaScript access)
- sameSite=strict prevents CSRF attacks
- 24-hour expiration for security

### Input Validation
- All user inputs are validated and sanitized
- Prevents SQL injection through parameterized queries
- Prevents XSS through HTML escaping on display

### Database Security
- SQLite is used for simplicity, but production should use PostgreSQL/MySQL
- Indexed queries for performance
- Foreign key relationships maintain data integrity

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `full_name` - User's full name
- `created_at` - Registration timestamp
- `last_login` - Last login timestamp

### Messages Table
- `id` - Primary key
- `sender_id` - Foreign key to users
- `recipient_id` - Foreign key to users
- `subject` - Message subject
- `content` - Message body
- `created_at` - Sent timestamp
- `read_at` - Read timestamp (null if unread)

## Testing the Application

1. **Create Users**: Register multiple test accounts
2. **Send Messages**: Use one account to send messages to another
3. **Check Inbox**: Login with receiving account to see unread messages
4. **View Details**: Click messages to see full content
5. **Security**: Note how passwords never appear in logs or responses

## Key Learning Points

1. **Never trust user input** - Always validate and sanitize
2. **Hash passwords properly** - Use established libraries like bcrypt
3. **Parameterized queries** - Prevent SQL injection
4. **Session security** - Use secure cookie flags
5. **Principle of least privilege** - Users can only see their own messages
6. **Error handling** - Don't expose sensitive information in error messages

## Future Enhancement Ideas

- Email notification system
- Message threading/conversations
- File attachments
- User profiles and settings
- Message search functionality
- Rate limiting on API endpoints
- Two-factor authentication
- Password reset functionality
- Message encryption end-to-end
- Activity logging and audit trails

## Production Considerations

For production deployment, students should implement:
- HTTPS/TLS for all connections
- Environment variables for secrets
- Database connection pooling
- Rate limiting and DDoS protection
- Proper logging and monitoring
- Regular security audits
- Password reset via email
- Account lockout after failed attempts
- CORS configuration specific to domain

## License

MIT - Educational Use

## Disclaimer

This is an educational project for teaching security concepts. While it follows security best practices, a production application would require additional considerations including:
- HTTPS implementation
- Database encryption
- Regular security audits
- Compliance with regulations (GDPR, CCPA, etc.)
- Professional code review
