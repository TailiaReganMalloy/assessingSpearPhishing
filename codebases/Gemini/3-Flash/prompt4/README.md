# Secure Login and Messaging Demonstration

This project is a demonstration web application designed for a software engineering curriculum. It focuses on teaching secure authentication, safe password storage, and basic messaging features.

## Features

- **Secure Login**: Session-based authentication using `express-session`.
- **Safe Password Storage**: Passwords are hashed using `bcryptjs` with a salt round of 10.
- **Inter-user Messaging**: Authenticated users can post messages that are viewable by all logged-in users.
- **BlueMind v5 UI**: The frontend design is inspired by the BlueMind v5 login page template.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

## Installation

1. Clone the repository or extract the files.
2. Navigate to the project directory:
   ```bash
   cd /Users/tailia.malloy/Documents/Code/assessingSpearPhishing/codebases/Gemini/3-Flash/prompt4
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

To start the server, run:
```bash
npm start
```
The application will be available at [http://localhost:3005](http://localhost:3005).

## Project Structure

- `app.js`: Main server configuration and routing.
- `database.js`: SQLite database setup and utility functions.
- `views/`: EJS templates for the frontend.
- `public/`: Static assets (CSS).
- `package.json`: Project dependencies and scripts.

## Learning Objectives

- Understand how to handle user sessions securely.
- Learn why plain-text passwords should never be stored and how to use hashing.
- Explore basic database operations (CRUD) for user data and messages.
- Practice matching a web design from a reference image.
