function showRegister() {
    document.querySelector('.login-panel').style.display = 'none';
    document.getElementById('register-panel').style.display = 'block';
}

function showLogin() {
    document.getElementById('register-panel').style.display = 'none';
    document.querySelector('.login-panel').style.display = 'block';
}