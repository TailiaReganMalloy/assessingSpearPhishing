# Project Custom Instructions

## Overview
This project is a Node.js application for secure user authentication and messaging, designed for educational purposes. It includes:
- User authentication with JWT.
- Secure password management.
- Messaging functionality between registered users.

## Project Structure
```
- /src
  - /auth
    - authRoutes.js
    - authController.js
  - /messages
    - messageRoutes.js
    - messageController.js
  - /models
    - User.js
    - Message.js
  - /middleware
    - authMiddleware.js
  - app.js
  - server.js
- /public
  - /css
    - style.css
  - index.html
- /views
  - login.ejs
- package.json
- README.md
```

## Dependencies
- **Node.js**
- **Express.js**
- **MongoDB** (with Mongoose)
- **bcrypt** (for password hashing)
- **jsonwebtoken** (for JWT authentication)
- **EJS** (for templating)
- **dotenv** (for environment variables)

## Setup Instructions
1. **Install Dependencies**:
   ```bash
   npm install express mongoose bcrypt jsonwebtoken ejs dotenv
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory with the following:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/websecurity
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Run the Application**:
   ```bash
   node server.js
   ```

## Custom Instructions
- Use **bcrypt** for securely hashing passwords.
- Implement **JWT** for user authentication.
- Ensure **input validation** for all user inputs.
- Use **EJS** for templating the login page.
- Follow **secure coding practices** for handling user sessions and data.

## Next Steps
- Implement the database schema for users and messages.
- Develop the authentication routes and middleware.
- Create the UI for the login page.
- Implement message viewing functionality.

## Notes
- This project is for educational purposes only.
- Ensure all sensitive data is handled securely.
- Follow best practices for web security.