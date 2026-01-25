# Secure Authentication and Messaging System

This is a reference implementation for a Node.js application demonstrating secure authentication and user-to-user messaging.

## Features
- User registration and login with password hashing
- Session management
- User-to-user messaging
- Secure storage of user data

## Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure the environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/secure_auth_messaging
   SESSION_SECRET=your_session_secret_here
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Usage
- Access the application at `http://localhost:3000`.
- Register a new user or log in with existing credentials.
- Send and view messages from other users.

## Project Structure
- `controllers/`: Handles business logic
- `models/`: Defines data models
- `routes/`: Manages API routes
- `views/`: Contains EJS templates
- `public/`: Stores static assets

## Dependencies
- Express.js
- Mongoose
- Bcrypt
- EJS
- Dotenv
- Express-session
- Connect-mongo