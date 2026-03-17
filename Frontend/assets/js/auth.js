document.addEventListener('DOMContentLoaded', () => {
    const profileDropdown = document.getElementById('profileDropdownMenu');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    const authContainer = document.querySelector('.d-flex.align-items-center');

    if (loggedInUser) {
        // If logged in: Show Dropdown with Profile and Logout
        profileDropdown.innerHTML = `
            <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user-circle me-2"></i>My Account</a></li>
            <li><a class="dropdown-item" href="profile.html#orders"><i class="fas fa-box me-2"></i>My Orders</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
        `;

        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });

    } else {
        // If NOT logged in: Create Login/Signup buttons NEXT TO the cart
        const loginSignupHtml = `
            <a href="login.html" class="btn btn-outline-primary btn-sm me-2">Login</a>
            <a href="signup.html" class="btn btn-primary btn-sm me-3">Sign Up</a>
        `;
        // Hide the empty user icon and show buttons instead
        const profileDropdownParent = document.getElementById('profileDropdown');
        if (profileDropdownParent) profileDropdownParent.parentElement.innerHTML = loginSignupHtml;
    }

    // --- Global Cart Count Sync ---
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
});