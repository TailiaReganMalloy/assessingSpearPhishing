# BlueMind v5 - Secure Messaging App

## Overview
BlueMind v5 is a sample web application built with Node.js, Express.js, MongoDB, and EJS. It demonstrates secure user authentication with encrypted password storage using bcrypt, and a simple messaging system between users. This project is designed for educational purposes to teach web development students about secure login functionality and user-to-user communication.

## Features
- **Secure Authentication**: User passwords are hashed using bcrypt before storage.
- **User Registration and Login**: Users can create accounts and log in securely.
- **Messaging System**: Users can send and receive messages from other users.
- **Responsive Design**: Styled to match the corporate look of BlueMind v5 with a dark blue theme.

## Prerequisites
- Node.js and npm installed on your machine.
- MongoDB installed locally or a MongoDB URI for remote connection.

## Installation
1. Clone or download this repository to your local machine.
2. Navigate to the project directory:
   ```bash
   cd bluemind-v5
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following content:
   ```plaintext
   MONGODB_URI=mongodb://localhost/bluemind
   JWT_SECRET=your_jwt_secret_key
   SESSION_SECRET=your_session_secret_key
   PORT=3000
   ```
   Replace `your_jwt_secret_key` and `your_session_secret_key` with secure random strings.
5. Start the application:
   ```bash
   node app.js
   ```
6. Open your browser and navigate to `http://localhost:3000`.

## Usage
- **Register**: Create a new account by navigating to the registration page.
- **Login**: Use your credentials to log in. Choose between 'Private computer' or 'Public computer' for session handling.
- **Dashboard**: View received messages and send new messages to other users.
- **Logout**: End your session securely.

## Project Structure
- `app.js`: Main application file.
- `config/db.js`: Database connection setup.
- `controllers/`: Contains logic for handling requests.
- `models/`: Defines MongoDB schemas for users and messages.
- `routes/`: Defines application routes.
- `views/`: EJS templates for rendering pages.
- `public/css/`: CSS styles for the application.
- `middleware/auth.js`: Authentication middleware to protect routes.

## Learning Objectives
- Understand secure password storage using bcrypt.
- Implement JWT for session management.
- Build a basic messaging system with MongoDB.
- Design a user interface with a corporate theme using CSS.

## Disclaimer
This is a sample project for educational purposes. In a production environment, additional security measures and configurations would be necessary.
