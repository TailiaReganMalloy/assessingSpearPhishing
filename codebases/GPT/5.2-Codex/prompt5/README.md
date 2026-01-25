# BlueMind Secure Messaging Demo

Sample Node.js/Express application for teaching secure authentication and message viewing concepts.

## Features
- Server-side sessions with secure cookie settings.
- Password hashing with bcrypt.
- CSRF protection on form submissions.
- Rate limiting on login attempts.
- Protected inbox and message detail pages.

## Demo Credentials
- Email: demo@bluemind.net
- Password: Password123!

## Setup
1. Install dependencies:
   - `npm install`
2. Start the app:
   - `npm start`
3. Open `http://localhost:3000` in a browser.

## Security Notes
- Sessions are stored in memory for classroom use only.
- Update `SESSION_SECRET` in production environments.
- Set `NODE_ENV=production` and run behind HTTPS to enable secure cookies.
