document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const errorMessage = document.getElementById('errorMessage');
    const loginButton = document.querySelector('.login-button');
    const buttonText = document.getElementById('buttonText');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Password visibility toggle
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            eyeIcon.innerHTML = `
                <path d="M8 3C4.5 3 1.73 5.11 1 8C1.73 10.89 4.5 13 8 13C11.5 13 14.27 10.89 15 8C14.27 5.11 11.5 3 8 3Z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M1 1L15 15" stroke="currentColor" stroke-width="1.5"/>
            `;
        } else {
            eyeIcon.innerHTML = `
                <path d="M8 3C4.5 3 1.73 5.11 1 8C1.73 10.89 4.5 13 8 13C11.5 13 14.27 10.89 15 8C14.27 5.11 11.5 3 8 3Z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.5"/>
            `;
        }
    });

    // Form validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        return password.length >= 8;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            buttonText.style.display = 'none';
            loadingSpinner.style.display = 'block';
            loginButton.disabled = true;
        } else {
            buttonText.style.display = 'block';
            loadingSpinner.style.display = 'none';
            loginButton.disabled = false;
        }
    }

    // Real-time validation
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            this.style.borderColor = '#e53e3e';
        } else {
            this.style.borderColor = '#e2e8f0';
        }
    });

    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        if (password && !validatePassword(password)) {
            this.style.borderColor = '#e53e3e';
        } else {
            this.style.borderColor = '#e2e8f0';
        }
    });

    // Reset border color on input
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = '#e2e8f0';
            hideError();
        });
    });

    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideError();

        const formData = new FormData(loginForm);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const computerType = formData.get('computerType');

        // Client-side validation
        if (!email) {
            showError('Email address is required');
            emailInput.focus();
            return;
        }

        if (!validateEmail(email)) {
            showError('Please enter a valid email address');
            emailInput.focus();
            return;
        }

        if (!password) {
            showError('Password is required');
            passwordInput.focus();
            return;
        }

        if (!validatePassword(password)) {
            showError('Password must be at least 8 characters long');
            passwordInput.focus();
            return;
        }

        setLoadingState(true);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    computerType: computerType
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Success - redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                // Handle error
                if (response.status === 429) {
                    showError('Too many login attempts. Please try again later.');
                } else {
                    showError(result.message || 'Login failed. Please check your credentials.');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please check your internet connection and try again.');
        } finally {
            setLoadingState(false);
        }
    });

    // Demo credential quick-fill functionality
    document.querySelectorAll('.credential').forEach(credentialDiv => {
        credentialDiv.addEventListener('click', function() {
            const text = this.textContent;
            const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            const passwordMatch = text.match(/(\w+!\w*)/);
            
            if (emailMatch && passwordMatch) {
                emailInput.value = emailMatch[0];
                passwordInput.value = passwordMatch[0];
                hideError();
                
                // Visual feedback
                this.style.backgroundColor = '#e6fffa';
                setTimeout(() => {
                    this.style.backgroundColor = '';
                }, 500);
            }
        });
    });

    // Auto-focus email input on page load
    emailInput.focus();

    // Handle browser back button
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            // Page was loaded from cache
            setLoadingState(false);
            hideError();
        }
    });

    // Security tip tooltip for computer type selection
    const privateRadio = document.getElementById('private');
    const publicRadio = document.getElementById('public');
    
    privateRadio.addEventListener('change', function() {
        if (this.checked) {
            console.log('Security: Session will last 24 hours on private computer');
        }
    });
    
    publicRadio.addEventListener('change', function() {
        if (this.checked) {
            console.log('Security: Session will last 30 minutes on public computer');
        }
    });
});