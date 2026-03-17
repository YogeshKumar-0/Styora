/**
 * 🎓 LESSON: Unified Product Controller (Fixes the "Blinking")
 * 
 * I merged the filtering logic into this file. 
 * We NO LONGER need filter.js because this script handles both 
 * fetching products and filtering them by category or price.
 */
document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.querySelector('.row.g-4');
    const categoryFilters = document.querySelectorAll('.category-filter a');
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    const aiSearchInput = document.getElementById('ai-search-input');
    const aiSearchBtn = document.getElementById('ai-search-btn');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    let allProducts = []; // Stores the data locally so we don't fetch every time you slide the price range
    let selectedCategory = 'all';
    let maxPrice = 15000;

    async function initializeProducts() {
        try {
            // Fetch ALL products once
            const response = await fetch('http://127.0.0.1:8080/api/products');
            allProducts = await response.json();
            applyFilters();
        } catch (error) {
            console.error('Error fetching products:', error);
            if (productContainer) {
                productContainer.innerHTML = '<div class="col-12 text-center text-danger">Failed to load collections. Is the vault open?</div>';
            }
        }
    }

    function applyFilters() {
        if (!productContainer) return;

        const filtered = allProducts.filter(p => {
            const categoryMatch = (selectedCategory === 'all' || p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
            const priceMatch = p.price <= maxPrice;
            return categoryMatch && priceMatch;
        });

        const countDisplay = document.getElementById('product-count-display');
        if (countDisplay) countDisplay.textContent = `Showing ${filtered.length} curated pieces`;

        renderProducts(filtered);
    }

    function renderProducts(products) {
        if (products.length === 0) {
            productContainer.innerHTML = '<div class="col-12 text-center text-muted py-5">No signatures match these criteria.</div>';
            return;
        }

        productContainer.innerHTML = products.map(product => `
            <div class="col-md-6 col-lg-4 product-item">
                <div class="card product-card h-100" 
                     data-id="${product.id}" 
                     data-name="${product.name}" 
                     data-price="${product.price}" 
                     data-image="${product.imageUrl}">
                    <div class="position-relative overflow-hidden">
                        <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" 
                             onerror="this.src='https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600'">
                    </div>
                    <div class="card-body">
                        <p class="text-muted extra-small text-uppercase mb-1">${product.category}</p>
                        <h5 class="card-title">${product.name}</h5>
                        <p class="price-tag mb-0">Rs. ${product.price}</p>
                        <button class="btn btn-link p-0 mt-3 text-primary fw-bold text-decoration-none add-to-cart-btn">
                            <i class="fa-solid fa-plus-circle me-1"></i> Add to Bag
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // --- Listeners ---

    // Category Filter
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            selectedCategory = e.target.dataset.category;

            categoryFilters.forEach(f => f.classList.remove('fw-bold'));
            e.target.classList.add('fw-bold');

            applyFilters();
        });
    });

    // Price Filter
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            maxPrice = parseInt(e.target.value);
            if (priceValue) priceValue.textContent = `Rs. ${maxPrice}`;
            applyFilters();
        });
    }

    // --- AI Semantic Search ---
    async function handleAISearch() {
        const query = aiSearchInput.value.trim();
        if (!query) return;

        // UI Feedback
        aiSearchBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        aiSearchBtn.disabled = true;
        productContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">AI is analyzing your style preference...</p>
            </div>
        `;

        try {
            const response = await fetch(`http://127.0.0.1:8080/api/ai/search?q=${encodeURIComponent(query)}`);
            if (response.ok) {
                const results = await response.json();
                renderProducts(results);
                clearSearchBtn.classList.remove('d-none');
            }
        } catch (error) {
            console.error('❌ AI Search Error:', error);
            productContainer.innerHTML = '<div class="col-12 text-center text-danger">Search failed. Try a simpler query.</div>';
        } finally {
            aiSearchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
            aiSearchBtn.disabled = false;
        }
    }

    if (aiSearchBtn) {
        aiSearchBtn.addEventListener('click', handleAISearch);
        aiSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAISearch();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            aiSearchInput.value = '';
            clearSearchBtn.classList.add('d-none');
            applyFilters();
        });
    }

    // Event Delegation for "Add to Bag" buttons
    if (productContainer) {
        productContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart-btn');
            if (btn) {
                const card = btn.closest('.product-card');
                const product = {
                    id: card.getAttribute('data-id'),
                    name: card.getAttribute('data-name'),
                    price: parseFloat(card.getAttribute('data-price')),
                    image: card.getAttribute('data-image')
                };
                if (window.addToCart) {
                    window.addToCart(product);
                } else {
                    console.error('window.addToCart is not defined.');
                }
            }
        });
    }

    // Initial Load
    initializeProducts();
});
