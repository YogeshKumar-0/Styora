document.addEventListener('DOMContentLoaded', () => {
    const profileDropdown = document.getElementById('profileDropdownMenu');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        // If user is logged in, show account and logout links
        profileDropdown.innerHTML = `
            <li><a class="dropdown-item" href="profile.html">My Account</a></li>
            <li><a class="dropdown-item" href="profile.html#orders">My Orders</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
        `;

        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });

    } else {
        // If user is not logged in, show login and signup links
        profileDropdown.innerHTML = `
            <li><a class="dropdown-item" href="login.html">Login</a></li>
            <li><a class="dropdown-item" href="signup.html">Sign Up</a></li>
        `;
    }
});