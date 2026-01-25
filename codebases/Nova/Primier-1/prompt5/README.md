# Secure Authentication System

This example demonstrates a secure user authentication system with:
- JWT authentication
- Password hashing (bcryptjs)
- Email verification
- Rate limiting
- Secure HTTP headers

## Security Features
- Passwords stored with bcrypt (12 salt rounds)
- Email verification required
- JWT tokens with 1 hour expiry
- Secure cookie flags (HttpOnly, Secure, SameSite)
- Rate limiting on auth endpoints

## Installation
1. Clone repository
2. Create `.env` file from `.env.example`
3. Install dependencies: `npm install`
4. Start server: `node server.js`

## Environment Variables
Required variables in `.env`:
- MONGO_URI
- JWT_SECRET
- SENDGRID_USER
- SENDGRID_KEY

## Password Requirements
- Minimum 8 characters
- Uses OWASP password guidelines

## Email Configuration
Uses SendGrid for transactional emails. Configure:
- Verification emails
- Password reset emails

## Security Headers
- Content Security Policy
- X-Content-Type-Options
- X-Frame-Options
- Referrer Policy
