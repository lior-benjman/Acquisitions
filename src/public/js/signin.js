(() => {
    const form = document.querySelector('#sign-in-form');
    const feedback = document.querySelector('#feedback');

    if (!form || !feedback) {
        return;
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        feedback.textContent = 'Signing you in...';
        feedback.style.color = 'rgba(226, 232, 240, 0.8)';

        const formData = new FormData(form);
        const payload = {
            email: formData.get('email'),
            password: formData.get('password'),
        };

        if (!payload.email || !payload.password) {
            feedback.textContent = 'Email and password are required.';
            feedback.style.color = 'var(--error)';
            return;
        }

        try {
            const response = await fetch('/api/auth/sign-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const message =
                    data?.error || data?.message || 'Unable to sign in. Please try again.';
                feedback.textContent = message;
                feedback.style.color = 'var(--error)';
                return;
            }

            feedback.textContent = `Welcome back, ${data.user.name}! Redirecting to the homepage...`;
            feedback.style.color = 'var(--accent)';
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
