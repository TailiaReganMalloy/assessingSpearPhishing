// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
}

// Show error message
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

// Show info message
function showInfo(message) {
    const infoEl = document.getElementById('infoMessage');
    infoEl.textContent = message;
    infoEl.style.display = 'block';
    setTimeout(() => {
        infoEl.style.display = 'none';
    }, 5000);
}

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Connecting...';
    
    const formData = new FormData(e.target);
    const rememberMe = formData.get('rememberMe') === 'true';
    
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        rememberMe: rememberMe
    };
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showInfo('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            showError(data.error || 'Login failed');
            if (data.remainingAttempts !== undefined && data.remainingAttempts > 0) {
                showError(`${data.error} (${data.remainingAttempts} attempts remaining)`);
            }
        }
    } catch (error) {
        showError('Network error. Please try again.');
        console.error('Login error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Connect';
    }
});

// Check if already authenticated on page load
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
            // If authenticated and on login page, redirect to dashboard
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                window.location.href = '/dashboard';
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});