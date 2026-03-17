document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.querySelector('form');
    const checkoutCartContainer = document.getElementById('checkout-cart-items');
    const cartBadge = document.querySelector('.summary-card .badge');

    const BACKEND_URL = 'http://127.0.0.1:8080';

    // Load cart from localStorage
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    function renderCheckoutSummary() {
        if (!checkoutCartContainer) return;
        checkoutCartContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            checkoutCartContainer.innerHTML = '<li class="list-group-item bg-transparent border-0 px-0">Your selection is empty</li>';
            return 0;
        }

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            const li = document.createElement('li');
            li.className = 'list-group-item bg-transparent border-0 px-0 d-flex justify-content-between align-items-center mb-3';
            li.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.image}" class="rounded me-3" style="width: 50px; height: 50px; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=100'">
                    <div>
                        <h6 class="my-0 extra-small fw-600">${item.name}</h6>
                        <small class="text-muted extra-small">Qty: ${item.quantity}</small>
                    </div>
                </div>
                <span class="text-dark fw-600 extra-small">Rs. ${(item.price * item.quantity).toFixed(2)}</span>
            `;
            checkoutCartContainer.appendChild(li);
        });

        const shipping = cart.length > 0 ? 50.00 : 0;
        const total = subtotal + shipping;

        // Update individual summary elements
        const subtotalEl = document.getElementById('checkout-subtotal');
        const shippingEl = document.getElementById('checkout-shipping');
        const totalEl = document.getElementById('checkout-total');

        if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = `Rs. ${shipping.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `Rs. ${total.toFixed(2)}`;

        if (cartBadge) cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        return total;
    }

    async function startRazorpayFlow(totalAmount) {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!token || !user) {
            alert('Please login to place an order.');
            window.location.href = 'login.html?redirect=checkout.html';
            return;
        }

        try {
            console.log('Initiating payment for amount:', totalAmount);
            const response = await fetch(`${BACKEND_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: totalAmount })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    alert('Your session has expired or the database was reset. Please login again.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('loggedInUser');
                    window.location.href = 'login.html';
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Forbidden or Server Error' }));
                    alert('Server Error: ' + (errorData.message || 'Unknown error'));
                }
                return;
            }

            let razorpayOrder = await response.json();

            // 🛡️ DEMO MODE CHECK
            if (razorpayOrder.id && razorpayOrder.id.startsWith('order_mock_')) {
                console.log('--- DEMO MODE ACTIVATED ---');
                if (confirm('Demo Mode: Razorpay keys are not set. Would you like to simulate a successful payment?')) {
                    await verifyAndPlaceOrder({
                        razorpay_order_id: razorpayOrder.id,
                        razorpay_payment_id: "pay_mock_" + Date.now(),
                        razorpay_signature: "mock_sig_123"
                    });
                }
                return;
            }

            const options = {
                "key": "rzp_test_StyoraDevKey",
                "amount": razorpayOrder.amount,
                "currency": "INR",
                "name": "Styora E-Commerce",
                "description": "Purchase Transaction",
                "order_id": razorpayOrder.id,
                "handler": async function (response) {
                    await verifyAndPlaceOrder(response);
                },
                "prefill": {
                    "name": user.fullName || user.username || "Customer",
                    "email": user.email || ""
                },
                "theme": { "color": "#0d6efd" }
            };

            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
            });
            rzp.open();

        } catch (err) {
            console.error('Payment initialization error:', err);
            alert('Payment system error: ' + err.message);
        }
    }

    async function verifyAndPlaceOrder(paymentResponse) {
        const token = localStorage.getItem('authToken');
        const address = document.getElementById('address').value;
        const state = document.getElementById('state').value;
        const zip = document.getElementById('zip').value;

        if (!address || !state || !zip) {
            alert('Please fill in your shipping address details first!');
            return;
        }

        try {
            const verifyRes = await fetch(`${BACKEND_URL}/api/payment/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(paymentResponse)
            });

            if (verifyRes.ok) {
                const orderRes = await fetch(`${BACKEND_URL}/api/orders/place`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ address: `${address}, ${state} - ${zip}` })
                });

                if (orderRes.ok) {
                    alert('Order and Payment Successful!');
                    localStorage.removeItem('shoppingCart');
                    window.location.href = 'profile.html';
                } else {
                    alert('Payment successful, but failed to record order.');
                }
            } else {
                alert('Payment verification failed!');
            }
        } catch (err) {
            console.error('Finalization error:', err);
            alert('Something went wrong during order finalization.');
        }
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const total = renderCheckoutSummary();
            if (total > 0) {
                startRazorpayFlow(total);
            } else {
                alert('Your cart is empty.');
            }
        });
    }

    renderCheckoutSummary();
});
