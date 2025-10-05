// In assets/script.js

document.addEventListener('DOMContentLoaded', () => {

    const cartCountElement = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const shippingPriceElement = document.getElementById('shipping-price'); // <-- FIX #1: This line was missing

    // Load cart from localStorage or initialize an empty array
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // --- Core Functions ---

    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        if (!cartCountElement) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        animateCartIcon();
    }
    
    function animateCartIcon() {
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if(cartIcon) {
            cartIcon.classList.add('fa-bounce');
            setTimeout(() => cartIcon.classList.remove('fa-bounce'), 1000);
        }
    }
    
    function renderCartItems() {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-muted">Your cart is empty.</p>';
        } else {
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'row mb-4 d-flex align-items-center cart-item';
                itemElement.innerHTML = `
                    <div class="col-md-2"><img src="${item.image}" class="img-fluid rounded" alt="${item.name}"></div>
                    <div class="col-md-3"><h5 class="mb-0">${item.name}</h5></div>
                    <div class="col-md-2"><input type="number" value="${item.quantity}" min="1" class="form-control quantity-input" data-id="${item.id}"></div>
                    <div class="col-md-3 text-end"><p class="fw-bold mb-0">Rs. ${(item.price * item.quantity).toFixed(2)}</p></div>
                    <div class="col-md-2 text-end"><button class="btn btn-link text-danger remove-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button></div>
                    <hr class="my-3">
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        updateOrderSummary();
    }

    /**
     * Recalculates and updates the subtotal, shipping, and total prices on the cart page.
     */
    function updateOrderSummary() {
        // <-- FIX #2: Check for shipping element is now included
        if (!subtotalPriceElement || !totalPriceElement || !shippingPriceElement) return;

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = cart.length > 0 ? 50.00 : 0;
        const total = subtotal + shipping;

        subtotalPriceElement.textContent = `Rs. ${subtotal.toFixed(2)}`;
        shippingPriceElement.textContent = `Rs. ${shipping.toFixed(2)}`; // <-- FIX #3: This line updates the shipping cost on the page
        totalPriceElement.textContent = `Rs. ${total.toFixed(2)}`;
    }

    // --- Event Listeners (No changes below this line) ---

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if(card) {
                const product = {
                    id: card.dataset.id,
                    name: card.dataset.name,
                    price: parseFloat(card.dataset.price),
                    image: card.dataset.image,
                };
                addToCart(product);
            }
        });
    });

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
    
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if(cart.length > 0) {
                alert('Proceeding to checkout! (This is where payment integration would begin)');
                cart = [];
                saveCart();
                renderCartItems();
            } else {
                alert('Your cart is empty. Please add items before checking out.');
            }
        });
    }

    // --- Initial Page Load ---
    updateCartCount();
    if (window.location.pathname.endsWith('cart.html')) {
        renderCartItems();
    }
});