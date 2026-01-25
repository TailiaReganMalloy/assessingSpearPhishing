// Login page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('password');
    const eyeOpen = document.getElementById('eye-open');
    const eyeClosed = document.getElementById('eye-closed');
    const radioOptions = document.querySelectorAll('.radio-option');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const loginButton = document.getElementById('login-button');

    let selectedDeviceType = 'private';

    // Password visibility toggle
    passwordToggle.addEventListener('click', function() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        eyeOpen.style.display = isPassword ? 'block' : 'none';
        eyeClosed.style.display = isPassword ? 'none' : 'block';
    });

    // Radio button functionality
    radioOptions.forEach(option => {
        option.addEventListener('click', function() {
            const optionType = this.dataset.option;
            selectedDeviceType = optionType;
            
            // Update radio button states
            radioOptions.forEach(radio => {
                const radioInput = radio.querySelector('.radio-input');
                radioInput.classList.remove('checked');
            });
            
            this.querySelector('.radio-input').classList.add('checked');
        });
    });

    // Form validation
    function validateForm(formData) {
        const errors = {};
        
        if (!formData.email || !isValidEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password || formData.password.length < 1) {
            errors.password = 'Password is required';
        }
        
        return errors;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    }

    function hideMessages() {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        
        // Hide field errors
        document.querySelectorAll('.field-error').forEach(error => {
            error.style.display = 'none';
        });
        
        // Remove error styling
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
    }

    function showFieldErrors(errors) {
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(field + '-error');
            const inputElement = document.getElementById(field);
            
            if (errorElement && inputElement) {
                errorElement.textContent = errors[field];
                errorElement.style.display = 'block';
                inputElement.classList.add('error');
            }
        });
    }

    function setLoadingState(loading) {
        if (loading) {
            loginButton.innerHTML = '<span class="loading-spinner"></span>Connecting...';
            loginButton.disabled = true;
        } else {
            loginButton.innerHTML = 'Connect';
            loginButton.disabled = false;
        }
    }

    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        hideMessages();
        setLoadingState(true);
        
        const formData = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            rememberDevice: selectedDeviceType === 'private'
        };
        
        // Client-side validation
        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            showFieldErrors(errors);
            setLoadingState(false);
            return;
        }
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                showSuccess('Login successful! Redirecting...');
                
                // Store user info in localStorage for the frontend
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
                
            } else {
                // Handle different types of errors
                if (result.details && Array.isArray(result.details)) {
                    const fieldErrors = {};
                    result.details.forEach(detail => {
                        fieldErrors[detail.field] = detail.message;
                    });
                    showFieldErrors(fieldErrors);
                } else {
                    showError(result.error || 'Login failed. Please try again.');
                }
            }
            
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please check your internet connection and try again.');
        } finally {
            setLoadingState(false);
        }
    });

    // Auto-focus email field
    document.getElementById('email').focus();

    // Handle Enter key in form
    loginForm.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // Check if user is already logged in
    checkAuthStatus();

    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                // User is already logged in, redirect to dashboard
                window.location.href = '/dashboard';
            }
        } catch (error) {
            // User is not logged in, stay on login page
            console.log('User not authenticated');
        }
    }
});