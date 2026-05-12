import API_CONFIG from "./config.js";
const BASE_URL = API_CONFIG.BASE_URL;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Local Storage se data uthao
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const profileDropdownParent = document.getElementById("profileDropdown");
  const profileDropdownMenu = document.getElementById("profileDropdownMenu");

  // 2. Logic: User Logged In hai ya nahi?
  if (loggedInUser && loggedInUser.fullName) {
    // ✅ USER LOGGED IN
    if (profileDropdownParent) {
      // Hum Navbar par User ka First Name dikhayenge
      const firstName = loggedInUser.fullName.split(" ")[0];

      // Navbar icon section ko update karo
      profileDropdownParent.parentElement.innerHTML = `
                <div class="dropdown">
                    <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-user-circle fs-5"></i>
                        <span class="fw-500 d-none d-md-inline">${firstName}</span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2 anim-fade-up" aria-labelledby="userDropdown">
                        <li class="px-3 py-2 text-muted extra-small border-bottom mb-1">Welcome, ${firstName}</li>
                        <li><a class="dropdown-item py-2" href="profile.html"><i class="fas fa-id-card me-2"></i>My Profile</a></li>
                        <li><a class="dropdown-item py-2" href="profile.html#orders"><i class="fas fa-shopping-bag me-2"></i>My Orders</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item py-2 text-danger" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                    </ul>
                </div>
            `;

      // Logout Logic
      document.getElementById("logoutBtn").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("authToken");
        // Cart clear nahi kar rahe taaki next login pe sync ho sake,
        // par agar session fresh chahiye toh localStorage.clear() use karo.
        window.location.href = "index.html";
      });
    }
  } else {
    // ✅ USER NOT LOGGED IN
    const loginSignupHtml = `
            <div class="d-flex align-items-center gap-2 me-3">
                <a href="login.html" class="btn btn-outline-primary btn-navbar">Login</a>
                <a href="signup.html" class="btn btn-primary btn-navbar">Sign Up</a>
            </div>
        `;

    if (profileDropdownParent) {
      profileDropdownParent.parentElement.innerHTML = loginSignupHtml;
    }
  }

  // 3. Global Cart Count Sync (Har page pe count update rahega)
  const updateCartDisplay = () => {
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
      const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCountElement.textContent = totalItems;
    }
  };

  updateCartDisplay();
});
