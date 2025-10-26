/* eslint-env browser */

(() => {
  const form = document.querySelector('#newsletter-form');
  const feedback = document.querySelector('#newsletter-feedback');
  const navContainer = document.querySelector('[data-nav-user]');
  const yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const renderGuestNav = () => {
    if (!navContainer) return;
    navContainer.innerHTML = '';
    const link = document.createElement('a');
    link.id = 'nav-auth-link';
    link.href = '/sign-in';
    link.textContent = 'Sign In';
    link.className = 'nav-link';
    navContainer.appendChild(link);
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
    } catch (e) {
      console.error('Sign out failed', e);
    } finally {
      renderGuestNav();
    }
  };

  const renderUserNav = user => {
    if (!navContainer) return;

    navContainer.innerHTML = '';

    const nameEl = document.createElement('span');
    nameEl.className = 'nav-username';
    nameEl.textContent = `Hi, ${user.name}`;

    const signOutBtn = document.createElement('button');
    signOutBtn.type = 'button';
    signOutBtn.className = 'nav-signout';
    signOutBtn.textContent = 'Sign Out';
    signOutBtn.addEventListener('click', handleSignOut, { once: false });

    navContainer.append(nameEl, signOutBtn);
  };

  const loadCurrentUser = async () => {
    if (!navContainer) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        renderGuestNav();
        return;
      }

      const data = await response.json();
      if (data?.user?.name) {
        renderUserNav(data.user);
      } else {
        renderGuestNav();
      }
    } catch (error) {
      console.error('Failed to load current user', error);
      renderGuestNav();
    }
  };

  loadCurrentUser();

  if (form && feedback) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(form);
      const email = formData.get('email');

      feedback.textContent = '';

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        feedback.textContent = 'Please provide a valid email to join the list.';
        feedback.style.color = '#f97316';
        return;
      }

      feedback.textContent = 'Thanks! We will keep you looped in soon.';
      feedback.style.color = 'var(--accent)';
      form.reset();
    });
  }
})();
