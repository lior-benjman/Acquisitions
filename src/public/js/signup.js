/* eslint-env browser */

(() => {
  const form = document.querySelector('#sign-up-form');
  const feedback = document.querySelector('#feedback');

  if (!form || !feedback) {
    return;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    feedback.textContent = 'Creating your account...';
    feedback.style.color = 'rgba(226, 232, 240, 0.8)';

    const formData = new FormData(form);
    const payload = {
      name: formData.get('name')?.trim(),
      email: formData.get('email')?.trim(),
      password: formData.get('password'),
    };
    const confirmPassword = formData.get('confirmPassword');

    if (
      !payload.name ||
      !payload.email ||
      !payload.password ||
      !confirmPassword
    ) {
      feedback.textContent = 'All fields are required.';
      feedback.style.color = 'var(--error)';
      return;
    }

    if (payload.password.length < 8) {
      feedback.textContent = 'Password should be at least 8 characters long.';
      feedback.style.color = 'var(--error)';
      return;
    }

    if (payload.password !== confirmPassword) {
      feedback.textContent = 'Passwords need to match.';
      feedback.style.color = 'var(--error)';
      return;
    }

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.error ||
          data?.message ||
          'Unable to sign up. Please try again.';
        feedback.textContent = message;
        feedback.style.color = 'var(--error)';
        return;
      }

      feedback.textContent = `Welcome aboard, ${data.user.name}! Redirecting you home...`;
      feedback.style.color = 'var(--accent)';
      form.reset();
      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (error) {
      feedback.textContent =
        'We could not reach the server. Check your connection and try again.';
      feedback.style.color = 'var(--error)';
      console.error(error);
    }
  });
})();
