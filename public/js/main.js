// FoodShare Client-side JavaScript Helpers

document.addEventListener('DOMContentLoaded', () => {
  // Auto dismiss alert notifications after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach((alert) => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.5s ease';
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });

  // Client-side confirmation for destructive actions
  const cancelButtons = document.querySelectorAll('.js-confirm-cancel');
  cancelButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (!confirm('Are you sure you want to cancel this donation post?')) {
        e.preventDefault();
      }
    });
  });

  const toggleButtons = document.querySelectorAll('.js-confirm-toggle');
  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const action = btn.getAttribute('data-action') || 'change status of';
      const name = btn.getAttribute('data-name') || 'this user';
      if (!confirm(`Are you sure you want to ${action} ${name}?`)) {
        e.preventDefault();
      }
    });
  });

  // Password confirmation check on signup form
  const signupForm = document.querySelector('#signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      const pass = document.querySelector('#password').value;
      const confirmPass = document.querySelector('#confirmPassword').value;
      if (pass !== confirmPass) {
        e.preventDefault();
        alert('Passwords do not match. Please re-enter passwords.');
      }
    });
  }
});
