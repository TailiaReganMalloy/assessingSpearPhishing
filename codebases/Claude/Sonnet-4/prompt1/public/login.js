document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    const connectBtn = document.querySelector('.connect-btn');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            computerType: formData.get('computerType')
        };

        // Show loading state
        connectBtn.disabled = true;
        connectBtn.classList.add('loading');
        connectBtn.textContent = 'Connecting...';
        hideError();

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = result.redirect;
            } else {
                showError(result.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            connectBtn.disabled = false;
            connectBtn.classList.remove('loading');
            connectBtn.textContent = 'Connect';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    // Clear error when user starts typing
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', hideError);
    });
});

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showPasswordBtn = document.querySelector('.show-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPasswordBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        showPasswordBtn.textContent = '👁️';
    }
}