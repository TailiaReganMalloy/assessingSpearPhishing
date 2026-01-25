// Toggle between login and registration forms
function showRegister() {
    document.getElementById('loginForm').parentElement.style.display = 'none';
    document.getElementById('registerBox').style.display = 'block';
    clearMessages();
}

function showLogin() {
    document.getElementById('registerBox').style.display = 'none';
    document.getElementById('loginForm').parentElement.style.display = 'block';
    clearMessages();
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

// Clear error/success messages
function clearMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    const successMessages = document.querySelectorAll('.success-message');
    errorMessages.forEach(msg => {
        msg.classList.remove('show');
        msg.textContent = '';
    });
    successMessages.forEach(msg => {
        msg.classList.remove('show');
        msg.textContent = '';
    });
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.add('show');
}

// Show success message
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.add('show');
}

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('successMessage', 'Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showError('errorMessage', data.error || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        showError('errorMessage', 'An error occurred. Please try again.');
        console.error('Login error:', error);
    }
});

// Registration form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Client-side validation
    if (password !== confirmPassword) {
        showError('registerErrorMessage', 'Passwords do not match.');
        return;
    }
    
    if (password.length < 8) {
        showError('registerErrorMessage', 'Password must be at least 8 characters long.');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('registerSuccessMessage', 'Registration successful! You can now log in.');
            setTimeout(() => {
                showLogin();
                document.getElementById('email').value = email;
            }, 2000);
        } else {
            showError('registerErrorMessage', data.error || 'Registration failed. Please try again.');
        }
    } catch (error) {
        showError('registerErrorMessage', 'An error occurred. Please try again.');
        console.error('Registration error:', error);
    }
});
