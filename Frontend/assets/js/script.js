// In assets/script.js

document.addEventListener('DOMContentLoaded', () => {

    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const shippingPriceElement = document.getElementById('shipping-price');

    // Load cart from localStorage or initialize an empty array
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // Make core functions available globally
    window.saveCart = function () {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        window.updateCartCount();
    }

    window.updateCartCount = function () {
        if (!cartCountElement) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    window.addToCart = async function (product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        window.saveCart();

        // Sync with Backend if logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                await fetch('http://127.0.0.1:8080/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        productId: product.id,
                        quantity: 1
                    })
                });
            } catch (err) {
                console.error('❌ Failed to sync cart:', err);
            }
        }
    }

    function renderCartItems() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-muted py-5">Your cart is empty.</p>';
        } else {
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <div class="row align-items-center">
                        <div class="col-3 col-md-2">
                            <img src="${item.image}" class="img-fluid rounded-3" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=100'">
                        </div>
                        <div class="col-9 col-md-4">
                            <h5 class="mb-1 fw-600 fs-6">${item.name}</h5>
                            <p class="text-muted extra-small mb-0">Signature Piece</p>
                        </div>
                        <div class="col-4 col-md-2 mt-3 mt-md-0">
                            <div class="input-group input-group-sm border rounded-pill overflow-hidden">
                                <input type="number" value="${item.quantity}" min="1" class="form-control border-0 text-center quantity-input" data-id="${item.id}" style="max-width: 60px;">
                            </div>
                        </div>
                        <div class="col-4 col-md-2 mt-3 mt-md-0 text-center text-md-start">
                            <p class="fw-700 mb-0 text-primary">Rs. ${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div class="col-4 col-md-2 mt-3 mt-md-0 text-end">
                            <button class="btn btn-link text-danger remove-btn p-0" data-id="${item.id}">
                                <i class="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        updateOrderSummary();
    }

    function updateOrderSummary() {
        if (!subtotalPriceElement || !totalPriceElement || !shippingPriceElement) return;

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = cart.length > 0 ? 50.00 : 0;
        const total = subtotal + shipping;

        subtotalPriceElement.textContent = `Rs. ${subtotal.toFixed(2)}`;
        shippingPriceElement.textContent = `Rs. ${shipping.toFixed(2)}`;
        totalPriceElement.textContent = `Rs. ${total.toFixed(2)}`;
    }

    async function syncCartFromBackend() {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            // First, if there's a local cart, we should upload it to the backend so items aren't lost
            const localCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
            if (localCart.length > 0) {
                for (const item of localCart) {
                    await fetch('http://127.0.0.1:8080/api/cart/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            productId: item.id,
                            quantity: item.quantity
                        })
                    });
                }
            }

            // Now fetch the unified cart from backend
            const response = await fetch('http://127.0.0.1:8080/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const backendItems = await response.json();
                cart = backendItems.map(item => ({
                    id: item.product.id.toString(),
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.imageUrl,
                    quantity: item.quantity
                }));
                saveCart();
                if (cartItemsContainer) renderCartItems();
            }
        } catch (err) {
            console.error('❌ Failed to fetch/sync backend cart:', err);
        }
    }

    // --- Homepage Essentials Injection ---
    const essentialsContainer = document.getElementById('essentials-container');
    if (essentialsContainer) {
        fetch('http://127.0.0.1:8080/api/products')
            .then(res => res.json())
            .then(products => {
                const headliners = products.slice(0, 4);
                essentialsContainer.innerHTML = headliners.map(p => `
                    <div class="col-md-3">
                        <div class="card product-card h-100" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.imageUrl}">
                            <div class="position-relative overflow-hidden">
                                <img src="${p.imageUrl}" class="card-img-top" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600'">
                            </div>
                            <div class="card-body">
                                <p class="text-muted extra-small text-uppercase mb-1">${p.category}</p>
                                <h5 class="card-title">${p.name}</h5>
                                <p class="price-tag mb-0">Rs. ${p.price}</p>
                                <button class="btn btn-link p-0 mt-3 text-primary fw-bold text-decoration-none add-to-cart-btn">
                                    <i class="fa-solid fa-plus-circle me-1"></i> Add to Bag
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');

                essentialsContainer.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const card = this.closest('.product-card');
                        const product = {
                            id: card.getAttribute('data-id'),
                            name: card.getAttribute('data-name'),
                            price: parseFloat(card.getAttribute('data-price')),
                            image: card.getAttribute('data-image')
                        };
                        window.addToCart(product);
                    });
                });
                
                // Re-bind cursor hover events for newly injected dynamic products
                if (typeof window.rebindCursorEvents === 'function') {
                    window.rebindCursorEvents();
                }
            })
            .catch(err => {
                console.error('Error loading essentials:', err);
                essentialsContainer.innerHTML = '<p class="text-center text-muted py-5">Collections are temporarily private.</p>';
            });
    }

    // --- Global Event Listeners ---
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) {
                const button = e.target.closest('.remove-btn');
                const id = button.dataset.id;
                cart = cart.filter(item => item.id !== id);
                saveCart();
                renderCartItems();
            }
        });

        cartItemsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const input = e.target;
                const id = input.dataset.id;
                const newQuantity = parseInt(input.value);

                const itemToUpdate = cart.find(item => item.id === id);
                if (itemToUpdate && newQuantity > 0) {
                    itemToUpdate.quantity = newQuantity;
                    saveCart();
                    renderCartItems();
                }
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                alert('Your cart is empty.');
            }
        });
    }

    syncCartFromBackend();
    updateCartCount();
    if (cartItemsContainer) renderCartItems();
});