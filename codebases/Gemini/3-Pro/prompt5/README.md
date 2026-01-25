# Secure Messaging Web Application

This is a demonstration Node.js web application designed for educational purposes. It illustrates secure login mechanisms, password hashing, and a basic inter-user messaging system.

## Features

- **Secure Authentication**: Uses `bcrypt` for password hashing.
- **Session Management**: Uses `express-session` for maintaining user sessions.
- **Messaging System**: Users can send and receive messages from other registered users.
- **BlueMind UI**: Frontend design mimics a specific login interface for visual reference.

## Prerequisites

- Node.js installed on your machine.

## Setup

1.  Navigate to the project directory.
2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

1.  Start the server:
    ```bash
    node server.js
    ```
    Or use the VS Code task: `Run Server`.

2.  Open your browser and navigate to `http://localhost:3000`.

3.  **Register Users**:
    - Go to `/register` (or click "Create an account" on login page).
    - Create at least two accounts to test messaging (e.g., `alice@test.com` and `bob@test.com`).

4.  **Login**:
    - Use the credentials you just created.

5.  **Send Messages**:
    - Go to "Compose" to send a message to another registered email.
    - Check the "Inbox" (Dashboard) of the recipient to view the message.

## Technologies Used

- **Node.js**: Runtime environment.
- **Express**: Web framework.
- **SQLite3**: Database.
- **Bcrypt.js**: Password hashing.
- **EJS**: Templating engine.
