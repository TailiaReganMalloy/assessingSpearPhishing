# Secure Messaging System

## Installation
1. Clone repository
2. Install dependencies: `npm install`
3. Create .env file from .env.example
4. Add MongoDB connection string
5. Generate JWT secret

## Run
```bash
npm run dev
```

## Features
- User registration with bcrypt password hashing
- JWT authentication
- Send/receive encrypted messages
- Message history storage

## Security Notes
- Passwords stored with bcrypt + salt
- Uses HTTPS-only cookies in production
- JWT expiration and validation
- Input validation on all endpoints