/**
 * BlueMind v5 - Client-Side Script
 * 
 * Handles:
 * - Form submission and validation
 * - Login/Registration toggle
 * - Session management
 * - User feedback
 */

document.addEventListener('DOMContentLoaded', function () {
  // Get references to DOM elements
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const registerLink = document.getElementById('registerLink');
  const loginLink = document.getElementById('loginLink');
  const loginPanel = document.querySelector('.login-panel:not(.registration-panel)');
  const registrationPanel = document.getElementById('registrationPanel');
  const errorMessage = document.getElementById('errorMessage');
  const registerErrorMessage = document.getElementById('registerErrorMessage');

  /**
   * Toggle between login and registration forms
   */
  registerLink.addEventListener('click', function (e) {
    e.preventDefault();
    loginPanel.style.display = 'none';
    registrationPanel.style.display = 'block';
    clearMessages();
  });

  loginLink.addEventListener('click', function (e) {
    e.preventDefault();
    registrationPanel.style.display = 'none';
    loginPanel.style.display = 'block';
    clearMessages();
  });

  /**
   * Handle login form submission
   */
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form values
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;
    const computerType = document.querySelector('input[name="computerType"]:checked').value;

    // Validate input
    if (!login || !password) {
      showError('Please fill in all fields', errorMessage);
      return;
    }

    // Disable button during submission
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.classList.add('loading');

    try {
      // Send login request
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login,
          password,
          computerType
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        showSuccess('Login successful. Redirecting...', errorMessage);
        setTimeout(() => {
          window.location.href = data.redirectUrl;
        }, 500);
      } else {
        // Login failed
        showError(data.error || 'Login failed. Please try again.', errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('An error occurred during login. Please try again.', errorMessage);
    } finally {
      // Re-enable button
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
    }
  });

  /**
   * Handle registration form submission
   */
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get form values
    const login = document.getElementById('registerLogin').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate input
    if (!login || !password || !confirmPassword) {
      showError('Please fill in all fields', registerErrorMessage);
      return;
    }

    // Validate password requirements
    if (password.length < 6) {
      showError('Password must be at least 6 characters long', registerErrorMessage);
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      showError('Passwords do not match', registerErrorMessage);
      return;
    }

    // Validate login format
    if (login.length < 3) {
      showError('Login must be at least 3 characters long', registerErrorMessage);
      return;
    }

    // Disable button during submission
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.classList.add('loading');

    try {
      // Send registration request
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        showSuccess('Account created successfully! You can now log in.', registerErrorMessage);
        
        // Clear form and switch to login
        registerForm.reset();
        setTimeout(() => {
          registrationPanel.style.display = 'none';
          loginPanel.style.display = 'block';
          document.getElementById('login').value = login;
          document.getElementById('password').focus();
        }, 1500);
      } else {
        // Registration failed
        showError(data.error || 'Registration failed. Please try again.', registerErrorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('An error occurred during registration. Please try again.', registerErrorMessage);
    } finally {
      // Re-enable button
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
    }
  });

  /**
   * Show error message
   */
  function showError(message, messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    messageElement.className = 'error-message';
  }

  /**
   * Show success message
   */
  function showSuccess(message, messageElement) {
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    messageElement.className = 'success-message';
  }

  /**
   * Clear all messages
   */
  function clearMessages() {
    errorMessage.style.display = 'none';
    registerErrorMessage.style.display = 'none';
  }

  /**
   * Check if user is already logged in
   */
  async function checkAuth() {
    try {
      const response = await fetch('/auth/check');
      const data = await response.json();

      if (data.authenticated) {
        window.location.href = '/dashboard.html';
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }

  // Check authentication on page load
  checkAuth();
});
