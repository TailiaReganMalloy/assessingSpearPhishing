# Educational Project: Secure Login and Messaging Website

This project is a reference implementation for students learning how to build secure websites with Node.js, Express, and SQLite.

## Features
- **Secure Authentication**: Uses `bcryptjs` for password hashing and `express-session` for session management.
- **Database Integration**: Uses `sqlite3` to store users and messages securely.
- **User Interface**: Designed to resemble the BlueMind v5 identification page.
- **Messaging System**: Allows logged-in users to send and receive messages.

## Prerequisites
- Node.js (v14 or higher)
- npm

## Setup Instructions
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run the Server**:
    ```bash
    npm start
    ```
3.  **Access the Website**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Accounts
The database is pre-populated with the following test accounts:
- **Instructor**: `instructor@bluemind.net` / `password123`
- **Student**: `student@bluemind.net` / `password456`

## Key Implementation Details
- **Password Hashing**: Check [db.js](db.js) to see how passwords are hashed before being stored.
- **Session Security**: Check [app.js](app.js) for session middleware configuration.
- **Authentication Routes**: See the `/login` and `/logout` routes in [app.js](app.js).
- **Protected Routes**: Notice how the `isAuthenticated` middleware is used to protect the `/dashboard` and `/send-message` routes.
