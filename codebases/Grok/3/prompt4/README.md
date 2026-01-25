# BlueMind v5

A secure web application for user authentication and messaging built with Node.js, Express, Passport.js, bcrypt, MongoDB, and Tailwind CSS.

## Features
- Secure user login with password hashing
- User-to-user messaging system
- Modern UI with dark blue theme

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Ensure MongoDB is running locally or update the `MONGODB_URI` in `.env`.
3. Start the server:
   ```bash
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Usage
- Access the application at `http://localhost:3000`.
- Register or login to send and view messages.

## Project Structure
- `server.js` - Main application file
- `views/` - EJS templates for UI
- `public/` - Static assets
- `.env` - Environment variables
