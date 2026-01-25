# BlueMind v5

A secure web application for teaching web security concepts including user authentication, secure password management, and messaging between registered users.

## Setup
1. Ensure you have Node.js and MongoDB installed on your system.
2. Clone this repository or download the project files.
3. Navigate to the project directory and run `npm install` to install dependencies.
4. Start MongoDB if it's not already running (`mongod` in a terminal).
5. Run `npm start` to start the application.
6. Open a browser and go to `http://localhost:3000` to access the login page.

## Features
- **User Authentication**: Secure login system using Passport.js with local strategy.
- **Secure Password Management**: Passwords are hashed using bcrypt before storage.
- **Messaging System**: Registered users can send and view messages securely.

## Security Notes
- This application uses `express-session` for session management.
- Input validation is implemented to prevent common vulnerabilities.
- Note: There is a known vulnerability in the `tar` package used by a dependency. For educational purposes, this is acknowledged but not resolved in this setup. In a production environment, ensure all dependencies are updated to non-vulnerable versions.

## Usage
- Register a new user via the 'Register here' link on the login page.
- Log in with your credentials.
- Use the messaging interface to send messages to other registered users.
- Log out when done.

This project is intended for educational purposes to demonstrate web security concepts.