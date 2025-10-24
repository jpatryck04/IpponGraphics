document.addEventListener('DOMContentLoaded', async () => {

    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('product-list');
    const imagePreview = document.getElementById('image-preview');
    const imageInput = document.getElementById('image');
    const productIdInput = document.getElementById('product-id');
    const cancelEditButton = document.getElementById('cancel-edit');
    const notification = document.getElementById('notification');
    const formTitle = document.getElementById('form-title');


    // Añadir botón de logout
    const logoutButton = document.createElement('a');
    logoutButton.textContent = 'Logout';
    logoutButton.href = '#';
    logoutButton.style.padding = '0.5rem 1rem';
    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login.html';
    });
    document.querySelector('.nav-links').appendChild(logoutButton);


    const API_URL = '/api/products';

    // Show notification
    const showNotification = (message, isError = false) => {
        notification.textContent = message;
        notification.className = `notification ${isError ? 'notification-error' : 'notification-success'} show`;
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };

    // Fetch and display products
    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL);
            if(response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            const products = await response.json();
            productList.innerHTML = '';
            if (products.length === 0) {
                productList.innerHTML = '<p class="no-products">No products found. Add one using the form above.</p>';
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
                    <button onclick="editProduct('${product.id}')" class="btn-primary">Edit</button>
                    <button onclick="deleteProduct('${product.id}')" class="btn-secondary" style="margin-top: 0.5rem;">Delete</button>
                `;
                productList.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            showNotification('Error fetching products.', true);
        }
    };

    // Image preview
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
        }
    });

    // Form submission
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = productIdInput.value;
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('tags', JSON.stringify(document.getElementById('tags').value.split(',').map(tag => tag.trim())));
        if (imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
        }

        try {
            const response = await fetch(id ? `${API_URL}/${id}` : API_URL, {
                method: id ? 'PUT' : 'POST',
                body: formData,
            });
            if (response.ok) {
                showNotification(`Product ${id ? 'updated' : 'created'} successfully.`);
                productForm.reset();
                imagePreview.style.display = 'none';
                productIdInput.value = '';
                formTitle.textContent = 'Añadir Nuevo Producto';
                cancelEditButton.style.display = 'none';
                fetchProducts();
            } else {
                 if(response.status === 401) {
                    window.location.href = '/login.html';
                    return;
                }
                const errorData = await response.json();
                showNotification(`Error: ${errorData.message}`, true);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            showNotification('Error saving product.', true);
        }
    });

    // Cancel edit
    cancelEditButton.addEventListener('click', () => {
        productForm.reset();
        imagePreview.style.display = 'none';
        productIdInput.value = '';
        formTitle.textContent = 'Añadir Nuevo Producto';
        cancelEditButton.style.display = 'none';
    });

    // Edit product
    window.editProduct = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            if(response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            const product = await response.json();
            productIdInput.value = product.id;
            document.getElementById('name').value = product.name;
            document.getElementById('description').value = product.description;
            document.getElementById('price').value = product.price;
            document.getElementById('category').value = product.category;
            document.getElementById('tags').value = product.tags.join(', ');
            if (product.image) {
                imagePreview.src = product.image;
                imagePreview.style.display = 'block';
            } else {
                imagePreview.style.display = 'none';
            }
            formTitle.textContent = `Editando: ${product.name}`;
            cancelEditButton.style.display = 'block';
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error fetching product for editing:', error);
            showNotification('Error fetching product for editing.', true);
        }
    };

    // Delete product
    window.deleteProduct = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    showNotification('Product deleted successfully.');
                    fetchProducts();
                } else {
                     if(response.status === 401) {
                        window.location.href = '/login.html';
                        return;
                    }
                    const errorData = await response.json();
                    showNotification(`Error: ${errorData.message}`, true);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('Error deleting product.', true);
            }
        }
    };

    // Initial fetch
    fetchProducts();
});
