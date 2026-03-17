document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = 'http://127.0.0.1:8080';
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const token = localStorage.getItem('authToken');

    const welcomeHeading = document.getElementById('welcome-heading');
    const modalUserName = document.getElementById('modalUserName');
    const modalUserEmail = document.getElementById('modalUserEmail');
    const accountDetailsBody = document.querySelector('#account-details .card-body');
    const ordersCardBody = document.querySelector('#orders .card-body');
    const profileLogoutBtn = document.getElementById('profileLogoutBtn');

    if (!loggedInUser || !token) {
        window.location.href = 'login.html';
        return;
    }

    // --- Populate Profile Data ---
    welcomeHeading.textContent = `Welcome, ${loggedInUser.fullName || 'User'}!`;
    if (modalUserName) modalUserName.textContent = loggedInUser.fullName || 'User';
    if (modalUserEmail) modalUserEmail.textContent = loggedInUser.email;

    if (accountDetailsBody) {
        accountDetailsBody.innerHTML = `
            <form id="profileForm">
                <div class="mb-3">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-control" value="${loggedInUser.fullName || ''}" readonly>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email address</label>
                    <input type="email" class="form-control" value="${loggedInUser.email}" readonly>
                </div>
                <p class="text-muted small">Account management features are coming soon!</p>
            </form>
        `;
    }

    // --- Fetch and Render Orders ---
    async function fetchOrders() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/orders/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const orders = await response.json();
                renderOrders(orders);
            } else {
                ordersCardBody.innerHTML = '<p class="text-danger">Failed to load orders. Please try again.</p>';
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            ordersCardBody.innerHTML = '<p class="text-danger">Offline: Could not reach the server.</p>';
        }
    }

    function renderOrders(orders) {
        if (!orders || orders.length === 0) {
            ordersCardBody.innerHTML = `
                <p class="lead text-muted">You haven't placed any orders yet.</p>
                <a href="products.html" class="btn btn-primary">Start Shopping</a>
            `;
            return;
        }

        ordersCardBody.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>#ORD-${order.id}</td>
                                <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>Rs. ${order.total.toFixed(2)}</td>
                                <td><span class="badge bg-success">Confirmed</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // --- Logout ---
    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }

    fetchOrders();
});