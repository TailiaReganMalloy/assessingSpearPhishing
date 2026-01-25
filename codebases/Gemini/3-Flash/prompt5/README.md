# BlueMind Auth & Messaging Example

This repository contains a Node.js example application designed for teaching web security concepts, specifically authentication and secure password management.

## Features
- **Secure Authentication**: Uses `bcryptjs` for salt-hashing passwords.
- **Session Management**: Uses `express-session` for maintaining user state.
- **Themed UI**: A replica of the BlueMind v5 login interface.
- **Messaging Dashboard**: A demonstration of viewing user-specific content after login.

## Prerequisites
- Node.js installed on your machine.

## Setup Instructions
1. Navigate to the project directory:
   ```bash
   cd .
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   node index.js
   ```
4. Access the application at `http://localhost:3000`.

## Test Credentials
- **Login**: `email@bluemind.net`
- **Password**: `password123`

## Security Concepts Covered
- **Password Hashing**: Why we use `bcrypt` instead of storing plain-text passwords.
- **Input Sanitization**: Handling form data securely.
- **Session Hijacking Prevention**: The basics of using session cookies.
- **Phishing Awareness**: How visual templates (like BlueMind) can be replicated for educational purposes.
