# Secure Messaging Demo - Educational Web Application

A comprehensive Node.js demonstration application showcasing secure login mechanisms, password storage best practices, and inter-user messaging features. Built for software engineering curriculum and security education.

## 🎓 Educational Objectives

This application demonstrates:

### 🔐 Secure Authentication
- **bcrypt Password Hashing**: Industry-standard password hashing with salt rounds
- **JWT Token Management**: Stateless authentication with JSON Web Tokens
- **Session Security**: Secure session cookies with HttpOnly and SameSite attributes
- **Account Lockout**: Protection against brute force attacks
- **Rate Limiting**: Login attempt restrictions per IP address

### 🛡️ Security Best Practices
- **Input Validation**: Server-side validation with express-validator
- **SQL Injection Prevention**: Parameterized queries with SQLite
- **XSS Protection**: Input sanitization and content security policies
- **CSRF Protection**: Cross-site request forgery prevention
- **Security Headers**: Comprehensive HTTP security headers via Helmet.js

### 💬 Messaging System
- **Inter-user Communication**: Secure message exchange between authenticated users
- **Message Threading**: Reply functionality with conversation context
- **Read Status Tracking**: Unread message notifications
- **Soft Delete**: Message deletion with data preservation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone or download the project files**
   ```bash
   cd /path/to/project/directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database and create demo users**
   ```bash
   npm run init-db
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open your browser and navigate to: `http://localhost:3000`
   - The login page will appear with the BlueMind v5 interface

### Demo Accounts

The following demo accounts are created automatically:

| Email | Password | Name |
|-------|----------|------|
| `alice@bluemind.net` | `SecurePass123!` | Alice Johnson |
| `bob@bluemind.net` | `SecurePass456!` | Bob Smith |
| `carol@bluemind.net` | `SecurePass789!` | Carol Davis |
| `demo@bluemind.net` | `DemoUser2024!` | Demo User |

## 🏗️ Architecture Overview

### Project Structure
```
├── models/
│   ├── database.js      # SQLite database connection and schema
│   ├── User.js          # User model with authentication methods
│   └── Message.js       # Message model for inter-user communication
├── middleware/
│   ├── auth.js          # Authentication and security middleware
│   └── validation.js    # Input validation rules
├── routes/
│   ├── auth.js          # Authentication endpoints
│   ├── messages.js      # Messaging API endpoints
│   └── users.js         # User management endpoints
├── public/
│   ├── css/             # Stylesheets (BlueMind v5 inspired)
│   ├── js/              # Client-side JavaScript
│   ├── login.html       # Login interface
│   └── dashboard.html   # Main application interface
├── scripts/
│   └── initDatabase.js  # Database initialization script
├── server.js            # Main application server
└── package.json         # Project configuration
```

### Database Schema

**Users Table:**
- Secure password hashing with bcrypt
- Account lockout mechanism
- Login attempt tracking
- User profile information

**Messages Table:**
- Sender/recipient relationships
- Read status tracking
- Soft delete functionality
- Timestamp management

**Sessions Table:**
- JWT token storage
- Session expiration
- User association

## 🔒 Security Features Implemented

### Password Security
- **Minimum Requirements**: 8 characters, uppercase, lowercase, number, special character
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Account Lockout**: 5 failed attempts = 15-minute lockout
- **Rate Limiting**: 5 login attempts per IP per 15 minutes

### Session Management
- **JWT Tokens**: 24-hour expiration
- **Secure Cookies**: HttpOnly, Secure (HTTPS), SameSite=strict
- **Device Tracking**: Different session lengths for private vs. public computers
- **Session Validation**: Automatic cleanup of expired sessions

### Input Security
- **Server-side Validation**: All inputs validated with express-validator
- **Parameterized Queries**: SQL injection protection
- **Input Sanitization**: XSS prevention through content filtering
- **Content Security Policy**: Strict CSP headers

### HTTP Security
- **Helmet.js**: Comprehensive security headers
- **HTTPS Enforcement**: Strict transport security (production)
- **CORS Protection**: Cross-origin request restrictions
- **Frame Options**: Clickjacking prevention

## 🖥️ User Interface

The interface replicates the BlueMind v5 design shown in the reference image:

### Login Page
- Gradient blue background matching the original design
- Clean white form container with rounded corners
- BlueMind branding with version indicator
- Email and password fields with proper labeling
- Private/Public computer radio options
- Responsive design for mobile devices

### Dashboard
- Header with user info and unread message count
- Sidebar navigation (Inbox, Compose, Sent, Security Info)
- Message list with read/unread status
- Compose form with recipient selection
- Modal message viewer with reply/delete options
- Security information panel explaining implemented features

## 📚 Educational Value

### For Students
- **Real-world Security**: Industry-standard implementations
- **Best Practices**: Following OWASP guidelines
- **Code Quality**: Clean, documented, maintainable code
- **Architecture**: Proper separation of concerns

### For Instructors
- **Comprehensive Example**: End-to-end secure application
- **Discussion Points**: Each security feature can be examined
- **Modification Exercises**: Students can enhance features
- **Security Analysis**: Identify and discuss potential improvements

## 🔧 Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run init-db    # Initialize database and create demo users
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-super-secure-session-secret
```

## 🚨 Security Considerations

### For Educational Use
This application is designed for educational purposes and includes:
- Demo accounts with known passwords
- Simplified configuration for learning
- Detailed security explanations

### Production Deployment
Before deploying to production:
- [ ] Change all default secrets and keys
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure proper environment variables
- [ ] Set up database backups
- [ ] Implement proper logging and monitoring
- [ ] Review and test all security configurations

## 📝 Learning Exercises

### Basic Exercises
1. Log in with different demo accounts and test the messaging system
2. Examine the password hashing process in the User model
3. Test account lockout by entering wrong passwords
4. Analyze the JWT token structure and expiration

### Advanced Exercises
1. Add two-factor authentication
2. Implement password reset functionality
3. Add message encryption for enhanced privacy
4. Implement audit logging for security events
5. Add file attachment capabilities with security scanning

## 🤝 Contributing

This is an educational project. Contributions that enhance the learning experience are welcome:
- Additional security features
- Better documentation
- Code improvements
- Bug fixes
- Educational exercises

## 📄 License

This project is created for educational purposes. Feel free to use, modify, and distribute for educational use.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Re-initialize the database
npm run init-db
```

**Port Already in Use:**
```bash
# Change port in server.js or stop conflicting process
lsof -ti:3000 | xargs kill
```

**Session Issues:**
```bash
# Clear browser cookies and localStorage
# Restart the application
```

### Support

For questions or issues related to this educational demo:
1. Check the console logs for detailed error messages
2. Verify all dependencies are installed correctly
3. Ensure the database has been initialized
4. Check that the required ports are available

---

**Built for educational purposes** • **Demonstrates security best practices** • **Node.js + Express + SQLite**