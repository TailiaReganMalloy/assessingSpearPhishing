const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordToggle = document.querySelector('.password-toggle');
const loginForm = document.getElementById('login-form');

passwordToggle.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    passwordToggle.textContent = type === 'password' ? '👁️' : '🙈';
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const computerType = document.querySelector('input[name="computer-type"]:checked').value;

    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Computer Type:', computerType);

    // Here you would typically send the data to the server for authentication
    // For now, we'll just log it and simulate a successful login by redirecting
    alert('Login attempt simulated. Check console for details.');
    // Example: window.location.href = '/dashboard'; 
});