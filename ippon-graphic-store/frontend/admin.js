document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('product-list');
    const imagePreview = document.getElementById('image-preview');
    const imageInput = document.getElementById('image');
    const productIdInput = document.getElementById('product-id');
    const cancelEditButton = document.getElementById('cancel-edit');
    const notification = document.getElementById('notification');

    const API_URL = '/api/products';

    // Show notification
    const showNotification = (message) => {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };

    // Fetch and display products
    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL);
            const products = await response.json();
            productList.innerHTML = '';
            if (products.length === 0) {
                productList.innerHTML = '<p>No products found. Add one using the form above.</p>';
                return;
            }
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'card';
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="card-content">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="price">$${product.price}</p>
                        <button onclick="editProduct('${product.id}')">Edit</button>
                        <button onclick="deleteProduct('${product.id}')">Delete</button>
                    </div>
                `;
                productList.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            showNotification('Error fetching products.');
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
                cancelEditButton.style.display = 'none';
                fetchProducts();
            } else {
                const errorData = await response.json();
                showNotification(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            showNotification('Error saving product.');
        }
    });

    // Cancel edit
    cancelEditButton.addEventListener('click', () => {
        productForm.reset();
        imagePreview.style.display = 'none';
        productIdInput.value = '';
        cancelEditButton.style.display = 'none';
    });

    // Edit product
    window.editProduct = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            const product = await response.json();
            productIdInput.value = product.id;
            document.getElementById('name').value = product.name;
            document.getElementById('description').value = product.description;
            document.getElementById('price').value = product.price;
            document.getElementById('category').value = product.category;
            document.getElementById('tags').value = product.tags.join(', ');
            imagePreview.src = product.image;
            imagePreview.style.display = 'block';
            cancelEditButton.style.display = 'inline-block';
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error fetching product for editing:', error);
            showNotification('Error fetching product for editing.');
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
                    const errorData = await response.json();
                    showNotification(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('Error deleting product.');
            }
        }
    };

    // Initial fetch
    fetchProducts();
});
