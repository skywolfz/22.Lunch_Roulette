document.addEventListener('DOMContentLoaded', function() {
    const restaurantInput = document.getElementById('restaurantInput');
    const categoryInput = document.getElementById('categoryInput');
    const addBtn = document.getElementById('addBtn');
    const goBtn = document.getElementById('goBtn');
    const restaurantsList = document.getElementById('restaurantsList');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const resultContainer = document.getElementById('resultContainer');
    
    let allCategories = [];
    let categoryCheckboxes = {};
    
    // Load initial data
    loadCategories();
    loadRestaurants();
    
    // Event listeners
    addBtn.addEventListener('click', addRestaurant);
    goBtn.addEventListener('click', spinRoulette);
    selectAllCheckbox.addEventListener('change', toggleSelectAll);
    
    restaurantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRestaurant();
    });
    
    categoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRestaurant();
    });
    
    async function loadCategories() {
        try {
            const response = await fetch('/api/categories');
            allCategories = await response.json();
            renderCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    function renderCategories() {
        categoriesContainer.innerHTML = '';
        categoryCheckboxes = {};
        
        allCategories.forEach(category => {
            const label = document.createElement('label');
            label.className = 'checkbox-container';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.categoryId = category.id;
            checkbox.checked = true; // Default: all selected
            checkbox.addEventListener('change', updateSelectAllState);
            
            const span = document.createElement('span');
            span.textContent = category.name;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            categoriesContainer.appendChild(label);
            
            categoryCheckboxes[category.id] = checkbox;
        });
        
        updateSelectAllState();
    }
    
    function updateSelectAllState() {
        const allChecked = Object.values(categoryCheckboxes).every(cb => cb.checked);
        selectAllCheckbox.checked = allChecked;
    }
    
    function toggleSelectAll() {
        const isChecked = selectAllCheckbox.checked;
        Object.values(categoryCheckboxes).forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    }
    
    async function addRestaurant() {
        const name = restaurantInput.value.trim();
        const category = categoryInput.value.trim();
        
        if (!name) {
            alert('Please enter a restaurant name');
            return;
        }
        
        try {
            const response = await fetch('/api/restaurants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    category: category || 'unknown'
                })
            });
            
            if (response.ok) {
                restaurantInput.value = '';
                categoryInput.value = '';
                restaurantInput.focus();
                loadCategories();
                loadRestaurants();
            } else {
                alert('Error adding restaurant');
            }
        } catch (error) {
            console.error('Error adding restaurant:', error);
        }
    }
    
    async function loadRestaurants() {
        try {
            const response = await fetch('/api/restaurants');
            const restaurants = await response.json();
            renderRestaurants(restaurants);
        } catch (error) {
            console.error('Error loading restaurants:', error);
        }
    }
    
    function renderRestaurants(restaurants) {
        restaurantsList.innerHTML = '';
        
        if (restaurants.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No restaurants added yet';
            li.style.color = '#a0aec0';
            restaurantsList.appendChild(li);
            return;
        }
        
        restaurants.forEach(restaurant => {
            const li = document.createElement('li');
            li.className = 'restaurant-item';
            
            const info = document.createElement('div');
            info.className = 'restaurant-info';
            
            const name = document.createElement('div');
            name.className = 'restaurant-name';
            name.textContent = restaurant.name;
            
            const catSpan = document.createElement('div');
            catSpan.className = 'restaurant-category';
            catSpan.textContent = `Category: ${restaurant.category}`;
            
            info.appendChild(name);
            info.appendChild(catSpan);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'restaurant-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteRestaurant(restaurant.id));
            
            li.appendChild(info);
            li.appendChild(deleteBtn);
            restaurantsList.appendChild(li);
        });
    }
    
    async function deleteRestaurant(restaurantId) {
        if (!confirm('Delete this restaurant?')) return;
        
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadRestaurants();
            }
        } catch (error) {
            console.error('Error deleting restaurant:', error);
        }
    }
    
    async function spinRoulette() {
        const selectedCategoryIds = Object.entries(categoryCheckboxes)
            .filter(([, checkbox]) => checkbox.checked)
            .map(([categoryId]) => parseInt(categoryId));
        
        if (selectedCategoryIds.length === 0) {
            alert('Please select at least one category');
            return;
        }
        
        try {
            const response = await fetch('/api/spin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category_ids: selectedCategoryIds
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                resultContainer.innerHTML = result.name;
                resultContainer.classList.remove('empty');
            } else {
                const error = await response.json();
                resultContainer.innerHTML = error.error || 'Error getting result';
                resultContainer.classList.add('empty');
            }
        } catch (error) {
            console.error('Error spinning:', error);
            resultContainer.innerHTML = 'Error getting result';
            resultContainer.classList.add('empty');
        }
    }
});
