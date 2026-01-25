# BlueMind v5 - Secure Authentication and Messaging App

## Overview
BlueMind v5 is a Node.js Express application designed as a reference implementation for a web programming course. It demonstrates secure user authentication with password hashing using `bcryptjs` and user-to-user messaging capabilities. The application features a clean, corporate design with a dark blue theme and a centered login panel.

## Features
- **Secure Login**: User passwords are hashed using `bcryptjs` for secure storage.
- **Session Management**: Uses `express-session` to manage user sessions, with different cookie expiration based on whether the computer is private or public.
- **User-to-User Messaging**: Allows logged-in users to send and view messages from other users.
- **SQLite Database**: Stores user data and messages in a lightweight SQLite database.
- **Responsive Design**: Styled with CSS for a modern, professional look.

## Setup
1. **Install Dependencies**: Run `npm install` to install the required packages.
2. **Run the Application**: Start the server with `node app.js`.
3. **Access the App**: Open a browser and navigate to `http://localhost:3000`.

## Usage
- **Login**: Use the login form to access the dashboard. You can register a new user by sending a POST request to `/register` with `username` and `password`.
- **Dashboard**: View received messages and send new messages to other users.
- **Logout**: Click the logout link to end your session.

## Project Structure
- `app.js`: Main application file with server setup, routes, and database configuration.
- `views/`: Contains EJS templates for login and dashboard pages.
- `public/css/`: CSS styles for the application.
- `bluemind.db`: SQLite database file (created on first run).

## Security Notes
- Passwords are securely hashed using `bcryptjs`.
- Session cookies are configured with different expiration times based on computer type.
- Ensure to change the session secret in production for added security.

## License
This project is for educational purposes and is not licensed for commercial use.
