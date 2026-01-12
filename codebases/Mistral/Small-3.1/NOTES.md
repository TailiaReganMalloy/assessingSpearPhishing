# Project Notes

## Installation & Setup

To get started with this educational reference application:

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or with auto-reload for development
npm run dev
```

The application will be available at `http://localhost:3000`

## Initial Test Users

For testing purposes, you can create these accounts:

| Email | Password | Purpose |
|-------|----------|---------|
| alice@example.com | Alice123! | Test sender |
| bob@example.com | Bob123! | Test receiver |

## Key Implementation Details

### Password Security
- Implemented with bcrypt (10 salt rounds)
- Passwords are hashed before storage
- Never logged or exposed in debug output

### Database
- SQLite for simplicity (can be replaced with PostgreSQL, MySQL for production)
- Database file created at: `messaging.db`
- Schema includes proper foreign keys and timestamps

### Session Management
- Uses `express-session` with HTTP-only cookies
- Cookie-based sessions are secure against XSS
- Sessions expire after 24 hours

### API Design
- RESTful endpoints following best practices
- Proper HTTP status codes
- JSON request/response format

## Files Structure Explanation

### Backend
- `server.js` - Main application entry point and configuration
- `models/database.js` - All database operations
- `routes/auth.js` - Authentication endpoints (login, register, logout)
- `routes/messages.js` - Messaging endpoints (send, receive, read)
- `middleware/auth.js` - Authentication middleware for protecting routes

### Frontend
- `public/login.html` - Login and registration UI
- `public/dashboard.html` - Main application interface
- `public/js/auth.js` - Login/registration form handling
- `public/js/dashboard.js` - Dashboard and messaging functionality
- `public/css/style.css` - All styling

## Student Learning Path

1. **Start with**: `README.md` - Understand the project purpose
2. **Then review**: `server.js` - Main app configuration
3. **Study**: `models/database.js` - Data persistence
4. **Learn**: `routes/auth.js` - Authentication flow
5. **Explore**: `routes/messages.js` - Business logic
6. **Practice**: Modify frontend to add new features

## Common Tasks for Students

### Task 1: Add a new user field (e.g., username)
1. Modify `models/database.js` - Add username column
2. Update `routes/auth.js` - Accept username in registration
3. Update `login.html` - Add username field

### Task 2: Add message delete functionality
1. Add DELETE endpoint in `routes/messages.js`
2. Add delete button in `dashboard.html`
3. Implement delete in `public/js/dashboard.js`

### Task 3: Add password strength indicator
1. Add validation function in `public/js/auth.js`
2. Add visual feedback in `login.html`
3. Update styles in `public/css/style.css`

## Security Checklist for Students

When extending this application, ensure you:
- [ ] Validate all user inputs
- [ ] Use parameterized queries (already done in database.js)
- [ ] Hash passwords before storage (already done)
- [ ] Use HTTPS in production
- [ ] Implement CSRF tokens for forms
- [ ] Add rate limiting to prevent brute force
- [ ] Never expose sensitive data in errors
- [ ] Log security events
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets

---
Created as an educational reference for secure web application development.
