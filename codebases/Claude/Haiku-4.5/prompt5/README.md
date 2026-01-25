# SecureMsg - Educational Web Security Application

A Node.js web application demonstrating secure user authentication, password management, and inter-user messaging for teaching web security concepts.

## 🎓 Course Material Overview

This application is designed as a learning resource to teach the following web security concepts:

### Core Security Topics

1. **Secure Password Hashing**
   - Demonstrates bcrypt implementation for password hashing
   - Never stores plain text passwords
   - Uses 10 salt rounds for strong cryptography

2. **User Authentication**
   - Secure login/registration with input validation
   - Session-based authentication
   - Password strength requirements (minimum 8 characters)

3. **Secure Messaging**
   - Inter-user communication with authentication verification
   - Message history and read status tracking
   - Secure data storage

4. **Security Best Practices**
   - SQL injection prevention via parameterized queries
   - CSRF protection through secure sessions
   - HTTP security headers with Helmet.js
   - Password visibility toggle for UX security

## 🛠 Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Templating**: EJS
- **Security**:
  - bcryptjs - Password hashing
  - express-validator - Input validation
  - helmet - HTTP security headers
  - express-session - Session management

## 📦 Installation

### Prerequisites
- Node.js 14+
- npm

### Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Create environment configuration
# Edit .env file (already created with defaults)
# Change SESSION_SECRET in production

# 3. Start the application
npm start

# For development with auto-reload
npm run dev
```

The application will start at `http://localhost:3000`

## 📚 Usage

### 1. User Registration
- Navigate to `/register`
- Enter email, name, and password (minimum 8 characters)
- Password is immediately hashed using bcrypt before storage

### 2. User Login
- Navigate to `/login`
- Enter registered email and password
- Application verifies password against stored hash

### 3. Messaging
- After login, browse the inbox to view received messages
- Compose new messages to other registered users
- View sent messages history
- Messages are marked as read when viewed

## 🔐 Security Implementation Details

### Password Security

**File**: [db/auth.js](db/auth.js)

```javascript
// Bcrypt hashing with 10 salt rounds
const saltRounds = 10;
const hash = await bcrypt.hash(password, saltRounds);

// Secure password verification
const isValid = await bcrypt.compare(plainPassword, hash);
```

**Key Points**:
- Salt rounds prevent rainbow table attacks
- Bcrypt includes salt in the hash
- Never log or expose hashes
- Passwords never stored in plaintext

### Session Management

**File**: [server.js](server.js)

Security features:
- `httpOnly: true` - Prevents JavaScript access to session cookies
- `sameSite: 'strict'` - CSRF protection
- `secure: true` (production only) - HTTPS only transmission
- `maxAge: 24 * 60 * 60 * 1000` - 24-hour expiration

### Input Validation

**Files**: [routes/auth.js](routes/auth.js), [routes/messages.js](routes/messages.js)

- Email validation using express-validator
- Password strength requirements
- XSS prevention through EJS template escaping
- SQL injection prevention with parameterized queries

### Database Security

**File**: [db/database.js](db/database.js)

- All queries use parameterized statements
- No string concatenation in SQL queries
- Foreign key constraints for data integrity

### HTTP Security Headers

**File**: [server.js](server.js)

Implemented via Helmet.js:
- Content-Security-Policy
- X-Frame-Options (clickjacking prevention)
- X-Content-Type-Options (MIME sniffing prevention)
- Strict-Transport-Security (HTTPS enforcement)

## 📋 Project Structure

```
.
├── db/
│   ├── database.js        # Database initialization & schema
│   ├── auth.js            # Authentication functions
│   └── messages.js        # Message management functions
├── routes/
│   ├── auth.js            # Login/register routes
│   └── messages.js        # Messaging routes
├── views/
│   ├── login.ejs          # Login page (BlueMind style)
│   ├── register.ejs       # Registration page
│   ├── messages.ejs       # Inbox view
│   ├── sent.ejs           # Sent messages view
│   ├── compose.ejs        # Compose message form
│   ├── message-detail.ejs # Single message view
│   └── 404.ejs            # Error page
├── public/
│   └── css/
│       └── style.css      # Application styling
├── server.js              # Main application file
├── package.json           # Dependencies
└── .env                   # Configuration (git ignored)
```

## 🎯 Teaching Points

### For Students

1. **Understanding Bcrypt**
   - Why hashing is better than encryption for passwords
   - Salt and salt rounds concept
   - Time complexity trade-offs

2. **Session Security**
   - How sessions maintain user state
   - Cookie security attributes
   - Session hijacking prevention

3. **SQL Injection**
   - Why parameterized queries matter
   - Common injection techniques
   - Prevention strategies

4. **Authentication Flows**
   - Registration process security
   - Login verification steps
   - Logout cleanup

5. **Input Validation**
   - Client-side vs. server-side validation
   - Importance of server-side checks
   - Validation patterns

## ⚠️ Important Notes for Production

**This is an educational application - DO NOT use in production without modifications:**

1. **Session Secret**: Change `SESSION_SECRET` in `.env`
2. **HTTPS**: Enable `secure: true` in production
3. **Database**: Use PostgreSQL instead of SQLite
4. **Password Hashing**: Consider increasing bcrypt rounds (slower but stronger)
5. **Rate Limiting**: Add login attempt limiting
6. **Audit Logging**: Log authentication events
7. **CORS**: Configure properly for API usage
8. **Secrets Management**: Use environment-specific configuration
9. **Email Verification**: Add email confirmation for registration
10. **Password Reset**: Implement secure password recovery

## 🚀 Running the Application

### Quick Start
```bash
npm install
npm start
```

### Development Mode
```bash
npm run dev
```
Uses nodemon to auto-reload on file changes

## 📖 Learning Resources

For students studying this code, focus on:

1. **db/auth.js** - Password hashing and verification
2. **routes/auth.js** - Authentication route handlers
3. **server.js** - Middleware and security headers
4. **db/database.js** - Database schema and parameterized queries

## 🔍 Code Comments

The application includes detailed comments explaining:
- Security decisions and WHY they matter
- Potential vulnerabilities
- Best practices
- Common mistakes to avoid

## 📝 Assignment Ideas

Students could extend this application to:

1. Add password reset functionality
2. Implement message encryption
3. Add login attempt rate limiting
4. Create audit logging system
5. Add two-factor authentication
6. Implement role-based access control
7. Add message attachments
8. Create user groups/channels
9. Implement end-to-end encryption
10. Add security testing with OWASP ZAP

## 🐛 Testing

Test accounts can be created during registration. Try:

- User 1: alice@example.com / password123
- User 2: bob@example.com / password456
- User 3: charlie@example.com / password789

Message between accounts to test the full system.

## 📄 License

MIT - Educational Use

## 👨‍🏫 Instructor Notes

This application serves as:
- **Reference Implementation**: Shows correct security practices
- **Discussion Starter**: Highlight security decisions
- **Modification Platform**: Students can add features securely
- **Testing Ground**: Learn about security vulnerabilities

The code is intentionally clear with comprehensive comments to aid understanding.

---

**Created for Web Security Course Material**
