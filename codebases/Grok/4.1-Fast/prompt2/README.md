# Secure Messaging Demo

A sample Node.js Express application demonstrating **secure user authentication** with bcrypt password hashing and a **simple messaging system** between users. Perfect for web development class assignments.

## Features
- User registration and login with password hashing (bcryptjs)
- Session management (express-session)
- SQLite database for users and messages
- Responsive UI with Bootstrap (inspired by mailer.gov.bf login)
- Inbox to view received messages
- Send messages to other users
- Pre-seeded sample users

## Sample Users
```
student1 / password123
student2 / password123  
professor / admin123
```

## Setup & Run
1. Install dependencies:
   ```
   npm install
   ```
2. Start the server:
   ```
   npm start
   ```
   Or for development with auto-reload:
   ```
   npm run dev
   ```
3. Open http://localhost:3000
4. Register new users or use sample accounts

## Security Highlights (Study These!)
- Passwords are **never stored in plain text** - hashed with bcrypt
- Sessions for stateful auth
- Input validation & SQL injection prevention (prepared statements)
- CSRF protection can be added (exercise for students)

## Database
- `messages.db` - SQLite file auto-created
- Tables: `users`, `messages`

## Project Structure
```
.
├── app.js          # Main server
├── package.json
├── views/          # EJS templates
│   ├── login.ejs
│   ├── register.ejs
│   └── dashboard.ejs
├── public/
│   └── css/style.css
├── messages.db     # Auto-generated
└── README.md
```

**Assignment Ideas:**
1. Add message deletion/read status
2. Implement CSRF tokens
3. Add email verification
4. Use PostgreSQL instead of SQLite
5. Add file attachments
6. Deploy to Heroku/Vercel

Enjoy studying secure web development!
