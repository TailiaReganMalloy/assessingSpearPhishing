# Secure Login and Messaging Web Application

This project demonstrates a secure web application with user authentication, safe password storage, and inter-user messaging features.

## Features

- User Registration
- Secure Login (with password hashing using bcrypt)
- Session Management (using express-session)
- Inter-user Messaging (in-memory storage for demonstration)
- Basic UI based on the provided design template

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd secure-login-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the application:**
    ```bash
    npm start
    ```
    The application will be accessible at `http://localhost:3000`.

## Usage

1.  Open your browser and navigate to `http://localhost:3000`.
2.  Register a new user account.
3.  Log in with your newly created credentials.
4.  Send and receive messages with other registered users.

## Project Structure

- `index.js`: Main application file, handles routes, authentication, and messaging logic.
- `package.json`: Project dependencies and scripts.
- `views/`: Contains EJS template files (`login.ejs`, `register.ejs`, `dashboard.ejs`).
- `public/`: Static assets like CSS (`public/css/style.css`) and images (`public/images/`).

## Important Notes

- **Placeholder Images:** The `public/images/` directory contains placeholder image files. Please replace them with actual images for a complete visual experience.
- **In-Memory Storage:** For demonstration purposes, user and message data are stored in memory and will be lost when the server restarts. In a real application, a database (e.g., MongoDB, PostgreSQL) would be used for persistent storage.
- **Session Secret:** The `secret` for `express-session` (`your_secret_key`) should be a strong, randomly generated string stored in environment variables for production environments.
- **Security:** While basic security measures like password hashing are implemented, a production application would require more robust security considerations (e.g., input validation, rate limiting, comprehensive error handling, HTTPS, etc.).
