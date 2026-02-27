document.addEventListener('DOMContentLoaded', () => {
    const CART_KEY = 'tecnolotgia-cart';

    function getCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        } catch (_) {
            return [];
        }
    }

    function saveCart(items) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(items));
        } catch (_) {}
    }

    function showAddedToCartPopup(productName) {
        let pop = document.getElementById('add-to-cart-popup');
        if (!pop) {
            pop = document.createElement('div');
            pop.id = 'add-to-cart-popup';
            pop.className = 'add-to-cart-popup';
            document.body.appendChild(pop);
        }
        pop.textContent = 'Se ha agregado al carrito';
        pop.classList.add('add-to-cart-popup-visible');
        clearTimeout(pop._t);
        pop._t = setTimeout(() => {
            pop.classList.remove('add-to-cart-popup-visible');
        }, 2200);
    }

    function getCartIconSvg() {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
        `;
    }

    function enhanceProductCards() {
        const allCards = document.querySelectorAll('.producto-card');
        if (!allCards.length) return;

        allCards.forEach((card) => {
            const footer = card.querySelector('.producto-precio');
            if (!footer) return;
            if (footer.querySelector('.add-to-cart-btn')) return;

            const priceText = (footer.textContent || '').trim();
            if (!priceText) return;

            const img = card.querySelector('img');
            const name = ((img && img.getAttribute('alt')) || 'Juego').trim() || 'Juego';

            const left = document.createElement('div');
            left.className = 'producto-precio-left';

            const nameEl = document.createElement('span');
            nameEl.className = 'producto-nombre';
            nameEl.textContent = name;

            const priceEl = document.createElement('span');
            priceEl.className = 'producto-precio-valor';
            priceEl.textContent = priceText;

            left.appendChild(nameEl);
            left.appendChild(priceEl);

            const btn = document.createElement('button');
            btn.className = 'add-to-cart-btn';
            btn.type = 'button';
            btn.setAttribute('aria-label', `Agregar ${name} al carrito`);
            btn.innerHTML = getCartIconSvg();

            btn.addEventListener('click', () => {
                btn.animate(
                    [
                        { transform: 'scale(1)' },
                        { transform: 'scale(1.08)' },
                        { transform: 'scale(1)' }
                    ],
                    { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' }
                );
                const cart = getCart();
                cart.push({ name, price: priceText, src: (img && img.getAttribute('src')) || '' });
                saveCart(cart);
                showAddedToCartPopup(name);
            });

            footer.textContent = '';
            footer.appendChild(left);
            footer.appendChild(btn);
        });
    }

    function collectGames() {
        const cards = Array.from(document.querySelectorAll('.producto-card'));
        return cards
            .map((card) => {
                const img = card.querySelector('img');
                const name = ((img && img.getAttribute('alt')) || '').trim();

                const summaryEl = card.querySelector('.producto-resumen');
                const summary = ((summaryEl && summaryEl.textContent) || '').trim();

                const priceEl = card.querySelector('.producto-precio-valor');
                const footer = card.querySelector('.producto-precio');
                const price = ((priceEl && priceEl.textContent) || (footer && footer.textContent) || '').trim();

                const src = (img && img.getAttribute('src')) || '';

                return { name, summary, price, src };
            })
            .filter((g) => g.name && g.price && g.src);
    }

    function animateCardsIn(container) {
        const cards = Array.from(container.querySelectorAll('.producto-card'));
        cards.forEach((card, i) => {
            card.animate(
                [
                    { opacity: 0, transform: 'translateY(10px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                { duration: 260, delay: Math.min(i * 18, 180), easing: 'cubic-bezier(.2,.8,.2,1)' }
            );
        });
    }

    enhanceProductCards();

    const searchInput = document.querySelector('.search-bar input[type="search"]');
    const mainEl = document.querySelector('main');
    const resultsSection = document.querySelector('.search-results-section');
    const resultsGrid = document.querySelector('.search-results-grid');
    const resultsEmpty = document.querySelector('.search-results-empty');

    const allGames = collectGames();

    function renderResults(items) {
        if (!resultsGrid || !resultsSection || !mainEl || !resultsEmpty) return;

        resultsGrid.innerHTML = '';

        if (items.length === 0) {
            resultsEmpty.hidden = false;
            return;
        }

        resultsEmpty.hidden = true;

        items.forEach((g) => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            card.innerHTML = `
                <div class="producto-imagen-wrap">
                    <img src="${g.src}" alt="${g.name}">
                    <div class="producto-resumen">${g.summary || ''}</div>
                </div>
                <div class="producto-precio">${g.price}</div>
            `;
            resultsGrid.appendChild(card);
        });

        enhanceProductCards();
        animateCardsIn(resultsGrid);
    }

    function setSearching(isSearching) {
        if (!resultsSection || !mainEl) return;
        mainEl.classList.toggle('is-searching', isSearching);
        resultsSection.hidden = !isSearching;
        if (!isSearching && resultsGrid) resultsGrid.innerHTML = '';
        if (!isSearching && resultsEmpty) resultsEmpty.hidden = true;
    }

    let searchT = null;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = (searchInput.value || '').trim().toLowerCase();

            if (searchT) window.clearTimeout(searchT);
            searchT = window.setTimeout(() => {
                if (!q) {
                    setSearching(false);
                    return;
                }

                setSearching(true);
                const filtered = allGames.filter((g) => {
                    const hay = `${g.name} ${g.summary} ${g.price}`.toLowerCase();
                    return hay.includes(q);
                });
                renderResults(filtered);
            }, 120);
        });
    }

    const producto = document.querySelector('.producto');
    const hamburger = document.querySelector('.hamburger-menu');
    const sideMenu = document.querySelector('.side-menu');

    function setMenuOpen(isOpen) {
        if (!hamburger || !sideMenu) return;
        hamburger.classList.toggle('is-open', isOpen);
        sideMenu.classList.toggle('is-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        sideMenu.setAttribute('aria-hidden', String(!isOpen));
    }

    if (hamburger && sideMenu) {
        hamburger.addEventListener('click', () => {
            const isNowOpen = !hamburger.classList.contains('is-open');
            setMenuOpen(isNowOpen);
        });

        document.addEventListener('click', (e) => {
            if (!sideMenu.classList.contains('is-open')) return;
            if (sideMenu.contains(e.target) || hamburger.contains(e.target)) return;
            setMenuOpen(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sideMenu.classList.contains('is-open')) {
                setMenuOpen(false);
            }
        });
    }

    if (!producto) return;

    const track = producto.querySelector('.slider-track');
    const btnLeft = producto.querySelector('.slider-btn-left');
    const btnRight = producto.querySelector('.slider-btn-right');
    const viewToggleBtn = document.querySelector('.view-toggle-btn');

    if (!track || !btnLeft || !btnRight) return;

    const cards = track.querySelectorAll('.producto-card');
    if (cards.length === 0) return;

    function getStep() {
        const firstCard = cards[0];
        const style = getComputedStyle(track);
        const gap = parseFloat(style.gap) || 20;
        return firstCard.offsetWidth + gap;
    }

    btnLeft.addEventListener('click', (e) => {
        e.preventDefault();
        const step = getStep();
        const newScroll = Math.max(0, track.scrollLeft - step);
        track.scrollTo({
            left: newScroll,
            behavior: 'smooth'
        });
    });

    btnRight.addEventListener('click', (e) => {
        e.preventDefault();
        const step = getStep();
        const maxScroll = track.scrollWidth - track.clientWidth;
        const newScroll = Math.min(maxScroll, track.scrollLeft + step);
        track.scrollTo({
            left: newScroll,
            behavior: 'smooth'
        });
    });

    function animateViewChange() {
        track.animate(
            [
                { opacity: 0, transform: 'translateY(6px) scale(0.99)' },
                { opacity: 1, transform: 'translateY(0) scale(1)' }
            ],
            { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' }
        );

        cards.forEach((card, i) => {
            card.animate(
                [
                    { opacity: 0, transform: 'translateY(10px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ],
                { duration: 260, delay: Math.min(i * 22, 180), easing: 'cubic-bezier(.2,.8,.2,1)' }
            );
        });
    }

    function setView(nextView) {
        const isGrid = nextView === 'grid';
        producto.classList.toggle('is-grid', isGrid);

        if (isGrid) track.scrollLeft = 0;

        if (viewToggleBtn) {
            viewToggleBtn.dataset.view = isGrid ? 'grid' : 'carousel';
            viewToggleBtn.setAttribute('aria-pressed', String(isGrid));
            viewToggleBtn.textContent = isGrid ? 'Ver carrusel' : 'Ver en grid';
        }

        animateViewChange();
    }

    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', () => {
            const current = viewToggleBtn.dataset.view || 'carousel';
            setView(current === 'grid' ? 'carousel' : 'grid');
        });
    }
});
