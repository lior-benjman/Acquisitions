/* eslint-env browser */

(() => {
  const form = document.querySelector('#newsletter-form');
  const feedback = document.querySelector('#newsletter-feedback');
  const navContainer = document.querySelector('[data-nav-user]');
  const frogToggle = document.querySelector('#froggy-toggle');
  const frogAudio = document.querySelector('#frog-audio');
  const alienToggle = document.querySelector('#alien-toggle');
  const alienAudio = document.querySelector('#alien-audio');
  const body = document.body;
  const yearEl = document.getElementById('year');

  let frogField;
  let alienField;
  let frogsInitialized = false;
  let aliensInitialized = false;

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

  const ensureFrogField = () => {
    if (frogsInitialized) return;

    frogField = document.createElement('div');
    frogField.className = 'frog-field';
    frogField.setAttribute('aria-hidden', 'true');
    body.appendChild(frogField);

    const totalFrogs = 14;
    const clamp = value => Math.min(92, Math.max(8, value));

    for (let i = 0; i < totalFrogs; i += 1) {
      const sprite = document.createElement('img');
      sprite.src = '/Media/froggies.png';
      sprite.alt = '';
      sprite.loading = 'lazy';
      sprite.className = 'frog-field__sprite';

      const startYVal = Math.random() * 70 + 15; // 15-85 vh
      const midYVal = startYVal + (Math.random() * 50 - 25);
      const endYVal = startYVal + (Math.random() * 60 - 30);

      const startY = `${clamp(startYVal)}vh`;
      const midY = `${clamp(midYVal)}vh`;
      const endY = `${clamp(endYVal)}vh`;

      sprite.style.top = startY;
      sprite.style.setProperty('--start-y', startY);
      sprite.style.setProperty('--mid-y', midY);
      sprite.style.setProperty('--end-y', endY);

      const flyDuration = Math.random() * 3 + 4.6; // 4.6s - 7.6s
      const driftDuration = Math.random() * 1.3 + 1.6;
      const spinDuration = Math.random() * 1 + 1.1;

      sprite.style.setProperty('--fly-duration', `${flyDuration.toFixed(2)}s`);
      sprite.style.setProperty(
        '--drift-duration',
        `${driftDuration.toFixed(2)}s`
      );
      sprite.style.setProperty(
        '--spin-duration',
        `${spinDuration.toFixed(2)}s`
      );

      const flyDelay = -Math.random() * flyDuration;
      const driftDelay = (Math.random() - 0.5) * 2.5;
      const spinDelay = (Math.random() - 0.5) * 2;

      sprite.style.setProperty('--fly-delay', `${flyDelay.toFixed(2)}s`);
      sprite.style.setProperty('--drift-delay', `${driftDelay.toFixed(2)}s`);
      sprite.style.setProperty('--spin-delay', `${spinDelay.toFixed(2)}s`);

      const reverseDirection = Math.random() > 0.5;
      sprite.style.left = reverseDirection ? '112vw' : '-12vw';
      sprite.style.setProperty(
        '--fly-animation',
        reverseDirection ? 'flyAcrossReverse' : 'flyAcross'
      );
      sprite.style.setProperty(
        '--spin-animation',
        reverseDirection ? 'spinReverse' : 'spin'
      );

      if (Math.random() > 0.55) {
        sprite.classList.add('frog-field__sprite--tiny');
      }
      if (Math.random() > 0.7) {
        sprite.classList.add('frog-field__sprite--slow');
      }

      sprite.style.opacity = `${0.65 + Math.random() * 0.35}`;

      frogField.appendChild(sprite);
    }

    frogsInitialized = true;
  };

  const ensureAlienField = () => {
    if (aliensInitialized) return;

    alienField = document.querySelector('.alien-field');

    if (!alienField) {
      alienField = document.createElement('div');
      alienField.className = 'alien-field';
      alienField.setAttribute('aria-hidden', 'true');
      body.appendChild(alienField);
    }

    const totalAliens = 12;
    const clamp = value => Math.min(92, Math.max(8, value));

    for (let i = 0; i < totalAliens; i += 1) {
      const sprite = document.createElement('img');
      sprite.src = '/Media/alien-spinning.jpg';
      sprite.alt = '';
      sprite.loading = 'lazy';
      sprite.className = 'alien-field__sprite';

      const startYVal = Math.random() * 70 + 12;
      const midYVal = startYVal + (Math.random() * 60 - 30);
      const endYVal = startYVal + (Math.random() * 70 - 35);

      const startY = `${clamp(startYVal)}vh`;
      const midY = `${clamp(midYVal)}vh`;
      const endY = `${clamp(endYVal)}vh`;

      sprite.style.top = startY;
      sprite.style.setProperty('--start-y', startY);
      sprite.style.setProperty('--mid-y', midY);
      sprite.style.setProperty('--end-y', endY);

      const flyDuration = Math.random() * 2.8 + 3.6;
      const driftDuration = Math.random() * 1 + 1.4;
      const spinDuration = Math.random() * 0.8 + 1;

      sprite.style.setProperty('--fly-duration', `${flyDuration.toFixed(2)}s`);
      sprite.style.setProperty(
        '--drift-duration',
        `${driftDuration.toFixed(2)}s`
      );
      sprite.style.setProperty(
        '--spin-duration',
        `${spinDuration.toFixed(2)}s`
      );

      const flyDelay = -Math.random() * flyDuration;
      const driftDelay = (Math.random() - 0.5) * 1.8;
      const spinDelay = (Math.random() - 0.5) * 1.6;

      sprite.style.setProperty('--fly-delay', `${flyDelay.toFixed(2)}s`);
      sprite.style.setProperty('--drift-delay', `${driftDelay.toFixed(2)}s`);
      sprite.style.setProperty('--spin-delay', `${spinDelay.toFixed(2)}s`);

      const reverseDirection = Math.random() > 0.5;
      sprite.style.left = reverseDirection ? '112vw' : '-12vw';
      sprite.style.setProperty(
        '--fly-animation',
        reverseDirection ? 'flyAcrossReverse' : 'flyAcross'
      );
      sprite.style.setProperty(
        '--spin-animation',
        reverseDirection ? 'spinReverse' : 'spin'
      );

      if (Math.random() > 0.6) {
        sprite.classList.add('alien-field__sprite--tiny');
      }
      if (Math.random() > 0.75) {
        sprite.classList.add('alien-field__sprite--slow');
      }

      sprite.style.opacity = `${0.7 + Math.random() * 0.25}`;

      alienField.appendChild(sprite);
    }

    aliensInitialized = true;
  };

  const enableFroggyMode = async () => {
    ensureFrogField();
    body.classList.add('froggy-mode');
    body.classList.remove('alien-mode');
    frogToggle?.setAttribute('aria-pressed', 'true');
    alienToggle?.setAttribute('aria-pressed', 'false');
    const labelSpan = frogToggle?.querySelector('span');
    if (labelSpan) {
      labelSpan.textContent = 'Back to normal view';
    }
    const alienLabel = alienToggle?.querySelector('span');
    if (alienLabel) {
      alienLabel.textContent = 'View with Alien-style';
    }

    if (frogAudio) {
      try {
        frogAudio.volume = 0.4;
        frogAudio.loop = true;
        await frogAudio.play();
      } catch (error) {
        console.error('Unable to play frog soundtrack', error);
      }
    }
  };

  const disableFroggyMode = () => {
    body.classList.remove('froggy-mode');
    frogToggle?.setAttribute('aria-pressed', 'false');
    const labelSpan = frogToggle?.querySelector('span');
    if (labelSpan) {
      labelSpan.textContent = 'View with Froggy-style';
    }

    if (frogAudio) {
      frogAudio.pause();
      frogAudio.currentTime = 0;
    }
  };

  const enableAlienMode = async () => {
    ensureAlienField();
    body.classList.add('alien-mode');
    body.classList.remove('froggy-mode');
    alienToggle?.setAttribute('aria-pressed', 'true');
    frogToggle?.setAttribute('aria-pressed', 'false');

    const alienLabel = alienToggle?.querySelector('span');
    if (alienLabel) {
      alienLabel.textContent = 'Back to normal view';
    }
    const frogLabel = frogToggle?.querySelector('span');
    if (frogLabel) {
      frogLabel.textContent = 'View with Froggy-style';
    }

    if (alienAudio) {
      try {
        alienAudio.volume = 0.3;
        alienAudio.loop = true;
        await alienAudio.play();
      } catch (error) {
        console.error('Unable to play alien soundtrack', error);
      }
    }

    if (frogAudio) {
      frogAudio.pause();
      frogAudio.currentTime = 0;
    }
  };

  const disableAlienMode = () => {
    body.classList.remove('alien-mode');
    alienToggle?.setAttribute('aria-pressed', 'false');

    const alienLabel = alienToggle?.querySelector('span');
    if (alienLabel) {
      alienLabel.textContent = 'View with Alien-style';
    }

    if (alienAudio) {
      alienAudio.pause();
      alienAudio.currentTime = 0;
    }
  };

  if (frogToggle) {
    frogToggle.addEventListener('click', () => {
      if (body.classList.contains('froggy-mode')) {
        disableFroggyMode();
      } else {
        enableFroggyMode();
        disableAlienMode();
      }
    });
  }

  if (alienToggle) {
    alienToggle.addEventListener('click', () => {
      if (body.classList.contains('alien-mode')) {
        disableAlienMode();
      } else {
        enableAlienMode();
        disableFroggyMode();
      }
    });
  }

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
