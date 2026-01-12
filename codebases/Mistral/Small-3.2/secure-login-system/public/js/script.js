document.addEventListener('DOMContentLoaded', function() {
  // Toggle password visibility
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
      const passwordInput = this.previousElementSibling;
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye-slash');
    });
  });  

  // Handle computer type selection
  const computerTypeRadios = document.querySelectorAll('.computer-type input[type="radio"]');
  computerTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const isPrivate = this.value === 'true';
      document.querySelectorAll('.computer-type i').forEach(icon => {
        icon.classList.remove('fa-check-circle', 'fa-circle', 'fa-times-circle');
        icon.classList.add(this.checked ? (isPrivate ? 'fa-check-circle' : 'fa-times-circle') : 'fa-circle');
      });
    });
  });  
});