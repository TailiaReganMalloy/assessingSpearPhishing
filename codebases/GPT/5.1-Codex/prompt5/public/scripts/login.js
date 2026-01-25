const toggle = document.querySelector('.password-toggle');
const passwordField = document.querySelector('input[name="password"]');

if (toggle && passwordField) {
  toggle.addEventListener('click', () => {
    const isPassword = passwordField.getAttribute('type') === 'password';
    passwordField.setAttribute('type', isPassword ? 'text' : 'password');
  });
}
