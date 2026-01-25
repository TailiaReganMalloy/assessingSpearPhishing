document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // const computerType = document.querySelector('input[name="computer-type"]:checked').value; // Not used in backend for now

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            // Store token and redirect to messages page
            localStorage.setItem('token', data.token);
            window.location.href = '/messages';
        } else {
            alert('Login failed: ' + (data.msg || 'Unknown error'));
        }
    } catch (err) {
        alert('An error occurred: ' + err.message);
    }
});