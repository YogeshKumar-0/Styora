document.addEventListener('DOMContentLoaded', () => {
    const categoryLinks = document.querySelectorAll('.category-filter li a');
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    const productItems = document.querySelectorAll('.product-item');

    let selectedCategory = 'all';
    let maxPrice = 5000;

    function filterProducts() {
        productItems.forEach(item => {
            const itemCategory = item.dataset.category;
            const itemPrice = parseInt(item.dataset.price);

            const categoryMatch = (selectedCategory === 'all' || selectedCategory === itemCategory);
            const priceMatch = itemPrice <= maxPrice;

            if (categoryMatch && priceMatch) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    priceRange.addEventListener('input', (e) => {
        maxPrice = parseInt(e.target.value);
        priceValue.textContent = `Rs. ${maxPrice}`;
        filterProducts();
    });

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            selectedCategory = e.target.dataset.category;
            
            // Update active link style
            categoryLinks.forEach(l => l.classList.remove('fw-bold'));
            e.target.classList.add('fw-bold');

            filterProducts();
        });
    });

    // Initial filter on page load
    filterProducts();
});