// Product Management System
class ProductManager {
    constructor() {
        this.products = [];
        this.currentView = 'list'; // 'list' or 'card'
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.searchQuery = '';
        this.editingId = null;
        this.searchTimeout = null;

        this.init();
    }

    init() {
        // Load sample data
        this.loadSampleData();

        // Event listeners
        document.getElementById('listViewBtn').addEventListener('click', () => this.setView('list'));
        document.getElementById('cardViewBtn').addEventListener('click', () => this.setView('card'));
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('productForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('cancelBtn').addEventListener('click', () => this.resetForm());

        // Initial render
        this.render();
    }

    loadSampleData() {
        this.products = [
            { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', stock: 15, description: 'High-performance laptop with 16GB RAM' },
            { id: 2, name: 'T-Shirt', price: 29.99, category: 'Clothing', stock: 50, description: 'Cotton t-shirt, comfortable fit' },
            { id: 3, name: 'Coffee', price: 12.99, category: 'Food', stock: 100, description: 'Premium coffee beans' },
            { id: 4, name: 'Book', price: 19.99, category: 'Books', stock: 25, description: 'Best-selling novel' },
            { id: 5, name: 'Table Lamp', price: 45.99, category: 'Home', stock: 30, description: 'Modern LED table lamp' },
            { id: 6, name: 'Running Shoes', price: 89.99, category: 'Sports', stock: 40, description: 'Comfortable running shoes' },
        ];
    }

    setView(view) {
        this.currentView = view;
        document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
        document.getElementById('cardViewBtn').classList.toggle('active', view === 'card');
        
        const container = document.getElementById('productsContainer');
        container.classList.remove('list-view', 'card-view');
        container.classList.add(`${view}-view`);
        
        this.render();
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        
        // Debounce: clear previous timeout
        clearTimeout(this.searchTimeout);
        
        // Set new timeout
        this.searchTimeout = setTimeout(() => {
            this.currentPage = 1; // Reset to first page on search
            this.render();
        }, 500);
    }

    getFilteredProducts() {
        if (!this.searchQuery) {
            return this.products;
        }
        return this.products.filter(product => 
            product.name.toLowerCase().includes(this.searchQuery)
        );
    }

    getPaginatedProducts() {
        const filtered = this.getFilteredProducts();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return {
            products: filtered.slice(startIndex, endIndex),
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / this.itemsPerPage)
        };
    }

    validateForm(data) {
        const errors = {};

        // Name validation
        if (!data.name || data.name.trim() === '') {
            errors.name = 'Product name is required';
        }

        // Price validation
        if (data.price === '' || data.price === null || data.price === undefined) {
            errors.price = 'Price is required';
        } else if (isNaN(data.price) || parseFloat(data.price) < 0) {
            errors.price = 'Price must be a valid positive number';
        }

        // Category validation
        if (!data.category || data.category === '') {
            errors.category = 'Category is required';
        }

        // Stock validation (optional but must be valid if provided)
        if (data.stock !== '' && data.stock !== null && data.stock !== undefined) {
            if (isNaN(data.stock) || parseInt(data.stock) < 0) {
                errors.stock = 'Stock must be a valid non-negative number';
            }
        }

        return errors;
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('productName').value,
            price: document.getElementById('productPrice').value,
            category: document.getElementById('productCategory').value,
            stock: document.getElementById('productStock').value || 0,
            description: document.getElementById('productDescription').value
        };

        // Clear previous errors
        this.clearErrors();

        // Validate
        const errors = this.validateForm(formData);
        if (Object.keys(errors).length > 0) {
            this.showErrors(errors);
            return;
        }

        // Process form data
        const productData = {
            name: formData.name.trim(),
            price: parseFloat(formData.price),
            category: formData.category,
            stock: parseInt(formData.stock) || 0,
            description: formData.description.trim()
        };

        if (this.editingId) {
            // Update existing product
            const index = this.products.findIndex(p => p.id === this.editingId);
            if (index !== -1) {
                this.products[index] = { ...this.products[index], ...productData };
            }
        } else {
            // Add new product
            const newId = this.products.length > 0 
                ? Math.max(...this.products.map(p => p.id)) + 1 
                : 1;
            this.products.push({ id: newId, ...productData });
        }

        this.resetForm();
        this.render();
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => el.textContent = '');
        
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.style.borderColor = '');
    }

    showErrors(errors) {
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}Error`);
            const inputElement = document.getElementById(`product${field.charAt(0).toUpperCase() + field.slice(1)}`);
            
            if (errorElement) {
                errorElement.textContent = errors[field];
            }
            if (inputElement) {
                inputElement.style.borderColor = '#e74c3c';
            }
        });
    }

    resetForm() {
        document.getElementById('productForm').reset();
        this.clearErrors();
        this.editingId = null;
        document.getElementById('formTitle').textContent = 'Add New Product';
        document.getElementById('submitBtn').textContent = 'Add Product';
        document.getElementById('cancelBtn').style.display = 'none';
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.editingId = id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productDescription').value = product.description || '';

        document.getElementById('formTitle').textContent = 'Edit Product';
        document.getElementById('submitBtn').textContent = 'Update Product';
        document.getElementById('cancelBtn').style.display = 'block';

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== id);
            if (this.editingId === id) {
                this.resetForm();
            }
            this.render();
        }
    }

    render() {
        const { products, total, totalPages } = this.getPaginatedProducts();
        const container = document.getElementById('productsContainer');

        if (products.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            document.getElementById('paginationContainer').innerHTML = '';
            return;
        }

        if (this.currentView === 'list') {
            container.innerHTML = this.renderListView(products);
        } else {
            container.innerHTML = this.renderCardView(products);
        }

        this.renderPagination(totalPages, total);
    }

    renderListView(products) {
        if (products.length === 0) {
            return this.getEmptyStateHTML();
        }

        const rows = products.map(product => `
            <tr>
                <td>${this.escapeHtml(product.name)}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td><span class="card-category">${this.escapeHtml(product.category)}</span></td>
                <td>${product.stock}</td>
                <td>${this.escapeHtml(product.description || 'N/A')}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="productManager.editProduct(${product.id})">Edit</button>
                    <button class="btn-delete" onclick="productManager.deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>
        `).join('');

        return `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    renderCardView(products) {
        if (products.length === 0) {
            return this.getEmptyStateHTML();
        }

        return products.map(product => `
            <div class="product-card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${this.escapeHtml(product.name)}</div>
                        <span class="card-category">${this.escapeHtml(product.category)}</span>
                    </div>
                </div>
                <div class="card-price">₹${product.price.toFixed(2)}</div>
                <div class="card-stock">Stock: ${product.stock} units</div>
                ${product.description ? `<div class="card-description">${this.escapeHtml(product.description)}</div>` : ''}
                <div class="card-actions">
                    <button class="btn-edit" onclick="productManager.editProduct(${product.id})">Edit</button>
                    <button class="btn-delete" onclick="productManager.deleteProduct(${product.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    renderPagination(totalPages, total) {
        const container = document.getElementById('paginationContainer');
        
        if (totalPages <= 1) {
            container.innerHTML = `<div class="pagination-info">Showing ${total} product(s)</div>`;
            return;
        }

        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, total);

        let paginationHTML = `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="productManager.goToPage(${this.currentPage - 1})">
                Previous
            </button>
        `;

        // Show page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || 
                i === totalPages || 
                (i >= this.currentPage - 1 && i <= this.currentPage + 1)
            ) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="productManager.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<span class="pagination-info">...</span>`;
            }
        }

        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="productManager.goToPage(${this.currentPage + 1})">
                Next
            </button>
            <div class="pagination-info">
                Showing ${startItem}-${endItem} of ${total} product(s)
            </div>
        `;

        container.innerHTML = paginationHTML;
    }

    goToPage(page) {
        const { totalPages } = this.getPaginatedProducts();
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 7h-4m-4 0H4m16 0v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7m16 0V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/>
                    <path d="M10 11v6m4-6v6"/>
                </svg>
                <h3>No products found</h3>
                <p>${this.searchQuery ? 'Try adjusting your search terms' : 'Add your first product using the form on the left'}</p>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
let productManager;
document.addEventListener('DOMContentLoaded', () => {
    productManager = new ProductManager();
});

