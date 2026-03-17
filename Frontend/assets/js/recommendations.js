document.addEventListener('DOMContentLoaded', () => {
    const recommendationsSection = document.getElementById('ai-recommendations');
    const container = document.getElementById('recommendations-container');
    const BACKEND_URL = 'http://127.0.0.1:8080';

    async function fetchAIRecommendations() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const user = JSON.parse(localStorage.getItem('loggedInUser'));

        let context = "The user is browsing fashion and accessories.";
        if (cart.length > 0) {
            const itemNames = cart.map(item => item.name).join(', ');
            context = `The user currently has these items in their cart: [${itemNames}]. Recommend complementary or similar products.`;
        } else if (user) {
            context = `The user ${user.fullName} is logged in. They appreciate quality fashion. Recommend some trending products from the catalog.`;
        }

        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            const token = localStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${BACKEND_URL}/api/ai/recommendations`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ context: context })
            });

            if (response.ok) {
                const products = await response.json();
                if (products && products.length > 0) {
                    renderRecommendations(products);
                }
            }
        } catch (err) {
            console.error('❌ Failed to fetch AI recommendations:', err);
        }
    }

    function renderRecommendations(products) {
        recommendationsSection.style.display = 'block';
        container.innerHTML = products.map(product => `
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 shadow-sm border-0 recommendation-card">
                    <div class="position-relative overflow-hidden rounded-top">
                        <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" style="height: 250px; object-fit: cover;">
                        <span class="position-absolute top-0 end-0 m-2 badge bg-primary">AI Signature</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <p class="text-muted extra-small text-uppercase mb-1">${product.category}</p>
                        <h6 class="card-title fw-bold mb-1">${product.name}</h6>
                        <p class="price-tag mb-3">Rs. ${product.price}</p>
                        <button class="btn btn-outline-primary btn-sm mt-auto" onclick="quickAddToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            <i class="fa-solid fa-bag-shopping me-1"></i> Add to Bag
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Global function for the "Add" button in recommendations
    window.quickAddToCart = (product) => {
        if (typeof window.addToCart === 'function') {
            window.addToCart(product);
        } else {
            console.error('addToCart function not found on window. Ensure script.js is loaded.');
        }
    };

    fetchAIRecommendations();
});
