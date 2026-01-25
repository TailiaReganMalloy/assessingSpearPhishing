# BlueMind Clone - Secure Authentication & Messaging

This is a sample project for a Web Development class demonstrating secure user authentication and a messaging system using Node.js, Express, and SQLite.

## Features

- **Secure Login**: User authentication using hashed passwords (bcrypt).
- **Session Management**: Secure session handling with `express-session`.
- **Messaging System**: Users can send and receive messages from other registered users.
- **Responsive Design**: Clean interface matching the BlueMind reference design.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm

## Setup & Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Server:**
    ```bash
    npm start
    ```
    Or use the VS Code Task "Run Server".

3.  **Access the Application:**
    Open your browser and navigate to `http://localhost:3000`.

## Demo Credentials

The database receives two default users on first run:

- **User**: `alice@bluemind.net`
- **Password**: `password123`

- **User**: `bob@bluemind.net`
- **Password**: `securepass`

You can also register new users via the "Register" link on the login page (for demo purposes only).

## Project Structure

- `app.js`: Main server application entry point.
- `database.js`: SQLite database configuration and initialization.
- `views/`: EJS templates for the frontend.
- `public/`: Static files (CSS, images).
- `package.json`: Project dependencies and scripts.

## Security Considerations

- Passwords are hashed using `bcrypt` before storage.
- Session IDs are used to manage user state.
- Input is handled via parameterized queries in SQLite to prevent SQL injection.
