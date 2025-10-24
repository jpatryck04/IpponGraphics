document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    const modalProductName = document.getElementById('modal-product-name');
    const closeModal = document.querySelector('.close-modal');

    const API_URL = '/api/products';

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL);
            const products = await response.json();
            productGrid.innerHTML = '';
            if (products.length === 0) {
                productGrid.innerHTML = '<p class="no-products">No hay productos disponibles en este momento. Por favor, vuelve más tarde.</p>';
                return;
            }
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'producto';
                productCard.innerHTML = `
                    <img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-description">${product.description}</p>
                    <p class="product-price">$${product.price}</p>
                    <button class="btn-primary">Ver Detalles</button>
                `;
                productCard.addEventListener('click', () => openModal(product));
                productGrid.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            productGrid.innerHTML = '<p class="no-products">Hubo un error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>';
        }
    };

    const openModal = (product) => {
        modalProductName.textContent = product.name;
        modalBody.innerHTML = `
            <div class="cart-items-container" style="padding: 2rem;">
                 <img src="${product.image || 'https://via.placeholder.com/600x400'}" alt="${product.name}" style="width: 100%; border-radius: 12px; margin-bottom: 1.5rem;">
                 <h2>${product.name}</h2>
                 <p><strong>Descripción:</strong> ${product.description}</p>
                 <p><strong>Categoría:</strong> ${product.category}</p>
                 <p><strong>Tags:</strong> ${product.tags.join(', ')}</p>
                 <p class="product-price" style="font-size: 1.8rem;"><strong>Precio:</strong> $${product.price}</p>
            </div>
        `;
        modal.classList.add('active');
    };

    const closeTheModal = () => {
        modal.classList.remove('active');
    };

    closeModal.addEventListener('click', closeTheModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeTheModal();
        }
    });

    fetchProducts();
});
