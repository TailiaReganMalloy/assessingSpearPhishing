// Toggle between password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === 'password' ? 'text' : 'password';
}

// Toggle between login and registration forms
function toggleForms(e) {
    e.preventDefault();
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleBack = document.getElementById('toggleBack');
    
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
    toggleBack.classList.toggle('hidden');
    
    // Clear error/success messages
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('loginSuccess').classList.remove('show');
    document.getElementById('registerError').classList.remove('show');
    document.getElementById('registerSuccess').classList.remove('show');
}

// Handle login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const successDiv = document.getElementById('loginSuccess');
    
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successDiv.textContent = 'Login successful! Redirecting...';
            successDiv.classList.add('show');
            
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.classList.add('show');
        }
    } catch (err) {
        console.error('Error:', err);
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.classList.add('show');
    }
});

// Handle registration
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirm').value;
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');
    
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    
    // Client-side validation
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters long';
        errorDiv.classList.add('show');
        return;
    }
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.classList.add('show');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, confirmPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successDiv.textContent = 'Account created! Redirecting...';
            successDiv.classList.add('show');
            
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            errorDiv.textContent = data.error || 'Registration failed';
            errorDiv.classList.add('show');
        }
    } catch (err) {
        console.error('Error:', err);
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.classList.add('show');
    }
});
