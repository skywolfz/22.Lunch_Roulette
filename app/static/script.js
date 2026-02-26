document.addEventListener('DOMContentLoaded', function() {
    const goBtn = document.getElementById('goBtn');
    const restaurantsList = document.getElementById('restaurantsList');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const resultContainer = document.getElementById('resultContainer');
    
    let allCategories = [];
    let categoryCheckboxes = {};
    let latestRestaurants = [];
    
    // Load initial data
    loadCategories();
    loadRestaurants();
    
    // Event listeners
    goBtn.addEventListener('click', spinRoulette);
    selectAllCheckbox.addEventListener('change', toggleSelectAll);

    
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
        latestRestaurants = restaurants; // keep copy for animation
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
            
            li.appendChild(info);
            restaurantsList.appendChild(li);
        });
    }
    
    
    async function spinRoulette() {
        const selectedCategoryIds = Object.entries(categoryCheckboxes)
            .filter(([, checkbox]) => checkbox.checked)
            .map(([categoryId]) => parseInt(categoryId));
        
        // request result (server handles empty selection as all)
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
                playAnimation(result.name, selectedCategoryIds);
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

    function playAnimation(winner, selectedCategoryIds) {
        const names = latestRestaurants
            .filter(r => {
                if (!selectedCategoryIds || selectedCategoryIds.length === 0) return true;
                return selectedCategoryIds.includes(r.category_id);
            })
            .map(r => r.name);
        if (names.length === 0) names.push(winner);
        let idx = 0;
        let delay = 50;
        resultContainer.classList.remove('empty');
        const step = () => {
            if (delay > 500) {
                resultContainer.innerHTML = winner;
                return;
            }
            resultContainer.innerHTML = names[idx % names.length];
            idx++;
            delay *= 1.08; // slow down gradually
            setTimeout(step, delay);
        };
        step();
    }
});
