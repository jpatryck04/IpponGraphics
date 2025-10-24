document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close');

    const API_URL = '/api/products';

    // Fetch and display products
    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL);
            const products = await response.json();
            productGrid.innerHTML = '';
            if (products.length === 0) {
                productGrid.innerHTML = '<p>No products available at the moment. Please check back later.</p>';
                return;
            }
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'card';
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="card-content">
                        <h3>${product.name}</h3>
                        <p class="price">$${product.price}</p>
                    </div>
                `;
                productCard.addEventListener('click', () => openModal(product));
                productGrid.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = '<p>There was an error loading the products. Please try again later.</p>';
        }
    };

    // Open modal with product details
    const openModal = (product) => {
        modalBody.innerHTML = `
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px;">
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Tags:</strong> ${product.tags.join(', ')}</p>
            <p class="price"><strong>Price:</strong> $${product.price}</p>
        `;
        modal.style.display = 'block';
    };

    // Close modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initial fetch
    fetchProducts();
});
