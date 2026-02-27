document.addEventListener('DOMContentLoaded', () => {
    const CART_KEY = 'tecnolotgia-cart';
    const hamburger = document.querySelector('.hamburger-menu');
    const sideMenu = document.querySelector('.side-menu');
    const grid = document.getElementById('cart-items-grid');
    const emptyMsg = document.getElementById('cart-empty');
    const searchInput = document.getElementById('carrito-search');
    const cartFooter = document.getElementById('cart-footer');
    const btnConfirmar = document.getElementById('btn-confirmar-compra');
    const popupCompra = document.getElementById('popup-compra');
    const popupCerrar = document.getElementById('popup-cerrar');

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

    function removeFromCart(itemToRemove) {
        const items = getCart();
        const idx = items.findIndex(
            (i) =>
                (i.name || '') === (itemToRemove.name || '') &&
                (i.price || '') === (itemToRemove.price || '')
        );
        if (idx >= 0) {
            items.splice(idx, 1);
            saveCart(items);
        }
    }

    function renderCart(filterQuery) {
        const items = getCart();
        if (!grid) return;

        const q = (filterQuery || '').trim().toLowerCase();
        const filtered = q
            ? items.filter((item) => (item.name || '').toLowerCase().includes(q))
            : items;

        if (items.length === 0) {
            grid.innerHTML = '';
            if (emptyMsg) {
                emptyMsg.hidden = false;
                emptyMsg.textContent = 'No hay productos en el carrito.';
            }
            if (cartFooter) cartFooter.hidden = true;
            return;
        }

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (emptyMsg) {
                emptyMsg.hidden = false;
                emptyMsg.textContent = 'No se encontraron resultados.';
            }
            if (cartFooter) cartFooter.hidden = true;
            return;
        }

        if (emptyMsg) emptyMsg.hidden = true;
        if (cartFooter) cartFooter.hidden = false;

        grid.innerHTML = filtered
            .map(
                (item) => {
                    const imgSrc = item.src || '';
                    const imgHtml = imgSrc
                        ? `<img class="cart-item-img" src="${escapeHtml(imgSrc)}" alt="${escapeHtml(item.name || '')}">`
                        : '<div class="cart-item-img" style="background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.5);font-size:0.7rem;">Sin img</div>';
                    return `
            <div class="cart-item-card">
                ${imgHtml}
                <span class="cart-item-name">${escapeHtml(item.name || 'Juego')}</span>
                <span class="cart-item-price">${escapeHtml(item.price || '—')}</span>
                <button type="button" class="btn-eliminar" aria-label="Eliminar">Eliminar</button>
            </div>
        `;
                }
            )
            .join('');

        grid.querySelectorAll('.btn-eliminar').forEach((btn, i) => {
            const item = filtered[i];
            btn.addEventListener('click', () => {
                removeFromCart(item);
                renderCart(searchInput ? searchInput.value : '');
            });
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderCart();

    if (searchInput) {
        let searchT = null;
        searchInput.addEventListener('input', () => {
            if (searchT) clearTimeout(searchT);
            searchT = setTimeout(() => {
                renderCart(searchInput.value);
            }, 120);
        });
    }

    if (btnConfirmar && popupCompra && popupCerrar) {
        btnConfirmar.addEventListener('click', () => {
            popupCompra.setAttribute('data-open', 'true');
            popupCompra.removeAttribute('hidden');
        });
        popupCerrar.addEventListener('click', () => {
            popupCompra.setAttribute('data-open', 'false');
            popupCompra.setAttribute('hidden', '');
        });
        popupCompra.addEventListener('click', (e) => {
            if (e.target === popupCompra) {
                popupCompra.setAttribute('data-open', 'false');
                popupCompra.setAttribute('hidden', '');
            }
        });
    }
});
