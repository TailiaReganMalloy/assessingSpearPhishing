// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    // Change eye icon
    const svg = togglePassword.querySelector('svg');
    if (type === 'text') {
        svg.innerHTML = `
            <circle cx="10" cy="10" r="3" stroke="#666" stroke-width="2"/>
            <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z" stroke="#666" stroke-width="2"/>
            <line x1="3" y1="3" x2="17" y2="17" stroke="#666" stroke-width="2"/>
        `;
    } else {
        svg.innerHTML = `
            <circle cx="10" cy="10" r="3" stroke="#666" stroke-width="2"/>
            <path d="M2 10C2 10 5 4 10 4C15 4 18 10 18 10C18 10 15 16 10 16C5 16 2 10 2 10Z" stroke="#666" stroke-width="2"/>
        `;
    }
});

// Handle login form submission
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.querySelector('input[name="rememberMe"]:checked').value === 'true';
    
    // Clear previous error messages
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    
    // Disable submit button
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Connecting...';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                rememberMe
            }),
            credentials: 'include' // Important for cookies
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Successful login - redirect to dashboard
            window.location.href = '/dashboard';
        } else {
            // Show error message
            errorMessage.textContent = data.error || 'Login failed. Please try again.';
            errorMessage.classList.add('show');
            
            // Clear password field for security
            passwordInput.value = '';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Network error. Please check your connection.';
        errorMessage.classList.add('show');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Connect';
    }
});

// Check if user is already authenticated
(async () => {
    try {
        const response = await fetch('/api/auth/status', {
            credentials: 'include'
        });
        
        if (response.ok) {
            // User is already authenticated, redirect to dashboard
            window.location.href = '/dashboard';
        }
    } catch (error) {
        // User is not authenticated, stay on login page
    }
})();

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}