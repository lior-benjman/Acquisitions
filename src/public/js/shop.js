/* eslint-env browser */

(() => {
  const navContainer = document.querySelector('[data-nav-user]');
  const loginForm = document.querySelector('[data-admin-login]');
  const productForm = document.querySelector('[data-product-form]');
  const adminStatus = document.querySelector('[data-admin-status]');
  const adminFeedback = document.querySelector('[data-admin-feedback]');
  const logoutBtn = document.querySelector('[data-admin-logout]');
  const productCount = document.querySelector('[data-admin-product-count]');
  const productGrids = {
    beauty: document.querySelector('[data-product-grid="beauty"]'),
    supplement: document.querySelector('[data-product-grid="supplement"]'),
  };
  const emptyStates = {
    beauty: document.querySelector('[data-empty-state="beauty"]'),
    supplement: document.querySelector('[data-empty-state="supplement"]'),
  };

  const badgeCopy = {
    beauty: 'Beauty ritual',
    supplement: 'Supplement pick',
  };

  const state = {
    user: null,
    products: [],
  };

  const setFeedback = (message = '', tone = 'neutral') => {
    if (!adminFeedback) return;

    adminFeedback.textContent = message;
    adminFeedback.classList.remove('success', 'error');

    if (tone === 'success') {
      adminFeedback.classList.add('success');
    } else if (tone === 'error') {
      adminFeedback.classList.add('error');
    }
  };

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

  const performSignOut = async () => {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
    } catch (error) {
      console.error('Failed to sign out', error);
    } finally {
      state.user = null;
      renderNav();
      updateAdminPanel();
      renderProducts();
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
    signOutBtn.addEventListener('click', performSignOut);

    navContainer.append(nameEl, signOutBtn);
  };

  const renderNav = () => {
    if (state.user?.name) {
      renderUserNav(state.user);
    } else {
      renderGuestNav();
    }
  };

  const updateProductCount = () => {
    if (!productCount) return;
    if (state.products.length === 0) {
      productCount.textContent = 'No picks yet';
    } else {
      productCount.textContent = `${state.products.length} curated pick${state.products.length > 1 ? 's' : ''}`;
    }
  };

  const updateAdminPanel = () => {
    const isAdmin = state.user?.role === 'admin';

    if (adminStatus) {
      adminStatus.textContent = isAdmin
        ? `Signed in as ${state.user.name}. Drop a new item whenever something earns a spot.`
        : 'Sign in with your admin account to add a new beauty or supplement feature.';
    }

    if (loginForm) {
      loginForm.hidden = isAdmin;
    }

    if (productForm) {
      productForm.hidden = !isAdmin;
    }

    if (logoutBtn) {
      logoutBtn.hidden = !isAdmin;
      if (!logoutBtn.dataset.bound) {
        logoutBtn.addEventListener('click', performSignOut);
        logoutBtn.dataset.bound = 'true';
      }
    }
  };

  const buildProductCard = product => {
    const card = document.createElement('article');
    card.className = 'product-card';

    const link = document.createElement('a');
    link.href = product.linkUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'product-card__link';
    link.setAttribute(
      'aria-label',
      `${product.name} - opens store page in a new tab`
    );

    const badge = document.createElement('span');
    badge.className = 'product-card__badge';
    badge.textContent = badgeCopy[product.category] || 'Featured pick';

    const figure = document.createElement('figure');
    figure.className = 'product-card__image';
    const img = document.createElement('img');
    img.src = product.imageUrl;
    img.alt = product.name;
    img.loading = 'lazy';
    figure.appendChild(img);

    const body = document.createElement('div');
    body.className = 'product-card__body';
    const title = document.createElement('h3');
    title.textContent = product.name;
    const copy = document.createElement('p');
    copy.textContent = 'Tap to shop ->';
    body.append(title, copy);

    link.append(badge, figure, body);
    card.appendChild(link);

    if (state.user?.role === 'admin') {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'product-card__remove';
      removeBtn.textContent = 'Remove';
      removeBtn.dataset.removeProduct = product.id;
      card.appendChild(removeBtn);
    }

    return card;
  };

  const renderProducts = () => {
    Object.entries(productGrids).forEach(([category, grid]) => {
      if (!grid) return;

      grid.innerHTML = '';
      const items = state.products.filter(
        product => product.category === category
      );

      if (items.length === 0) {
        emptyStates[category]?.classList.remove('hidden');
        return;
      }

      emptyStates[category]?.classList.add('hidden');

      items.forEach(product => {
        grid.appendChild(buildProductCard(product));
      });
    });
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to load products');
      }

      const data = await response.json();
      state.products = Array.isArray(data.products) ? data.products : [];
      renderProducts();
      updateProductCount();
      updateAdminPanel();
    } catch (error) {
      console.error(error);
      state.products = [];
      renderProducts();
      updateProductCount();
      setFeedback('Unable to load shop items right now.', 'error');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const data = await response.json();
      state.user = data?.user || null;
    } catch (error) {
      console.warn('Unable to fetch current user', error);
      state.user = null;
    } finally {
      renderNav();
      updateAdminPanel();
      renderProducts();
    }
  };

  const handleAdminLogin = async event => {
    event.preventDefault();
    if (!loginForm) return;

    const formData = new FormData(loginForm);
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    if (!payload.email || !payload.password) {
      setFeedback('Email and password are required.', 'error');
      return;
    }

    setFeedback('Signing you in...');

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.error || data?.message || 'Unable to sign in right now.';
        setFeedback(message, 'error');
        return;
      }

      if (data.user?.role !== 'admin') {
        setFeedback('Only admin accounts can manage the shop.', 'error');
        await performSignOut();
        return;
      }

      state.user = data.user;
      loginForm.reset();
      renderNav();
      updateAdminPanel();
      renderProducts();
      setFeedback('Admin access unlocked. Add a product below.', 'success');
    } catch (error) {
      console.error(error);
      setFeedback(
        'We could not reach the server. Check your connection and try again.',
        'error'
      );
    }
  };

  const handleProductSubmit = async event => {
    event.preventDefault();
    if (!productForm) return;

    const formData = new FormData(productForm);
    const payload = {
      name: formData.get('name')?.trim(),
      category: formData.get('category'),
      imageUrl: formData.get('imageUrl')?.trim(),
      linkUrl: formData.get('linkUrl')?.trim(),
    };

    if (!payload.name || !payload.imageUrl || !payload.linkUrl) {
      setFeedback('All fields are required to publish a product.', 'error');
      return;
    }

    setFeedback('Publishing product...');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.error ||
          data?.details ||
          data?.message ||
          'Unable to save the product.';
        setFeedback(message, 'error');
        return;
      }

      productForm.reset();
      setFeedback('Product published successfully.', 'success');
      await fetchProducts();
    } catch (error) {
      console.error(error);
      setFeedback('Unable to reach the server.', 'error');
    }
  };

  const handleProductDelete = async productId => {
    if (!productId) return;
    setFeedback('Removing product...');

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          data?.error || data?.message || 'Unable to remove the product.';
        setFeedback(message, 'error');
        return;
      }

      setFeedback('Product removed.', 'success');
      await fetchProducts();
    } catch (error) {
      console.error(error);
      setFeedback('Unable to reach the server.', 'error');
    }
  };

  const bindGridEvents = () => {
    Object.values(productGrids).forEach(grid => {
      if (!grid) return;
      grid.addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const removeBtn = target.closest('[data-remove-product]');
        if (!removeBtn) return;
        const productId = Number(removeBtn.dataset.removeProduct);
        if (Number.isNaN(productId)) return;
        handleProductDelete(productId);
      });
    });
  };

  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }

  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }

  bindGridEvents();
  fetchCurrentUser();
  fetchProducts();
})();
