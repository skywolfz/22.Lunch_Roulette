document.addEventListener('DOMContentLoaded', function() {
    const goBtn = document.getElementById('goBtn');
    const restaurantsList = document.getElementById('restaurantsList');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const resultContainer = document.getElementById('resultContainer');
    
    let allCategories = [];
    let categoryCheckboxes = {};
    let latestRestaurants = [];
    let animationTimer = null;
    let currentWinner = null;
    let currentWinnerResult = null;
    
    // Load initial data
    loadCategories();
    loadRestaurants();
    loadStats();
    
    // Event listeners
    goBtn.addEventListener('click', spinRoulette);
    document.getElementById('stopBtn').addEventListener('click', stopAnimation);
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
        
        // group by category
        const groups = {};
        restaurants.forEach(r => {
            if (!groups[r.category]) groups[r.category] = [];
            groups[r.category].push(r);
        });
        Object.keys(groups).sort().forEach(cat => {
            const li = document.createElement('li');
            const title = document.createElement('strong');
            title.textContent = cat;
            li.appendChild(title);
            const groupDiv = document.createElement('div');
            groupDiv.className = 'rest-group';
            groups[cat].slice(0,4).forEach(r => {
                const span = document.createElement('span');
                span.className = 'rest-item';
                span.textContent = r.name;
                groupDiv.appendChild(span);
            });
            li.appendChild(groupDiv);
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
                playAnimation(result.name, selectedCategoryIds, result);
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

    function playAnimation(winner, selectedCategoryIds, fullResult) {
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
        currentWinner = winner;
        currentWinnerResult = fullResult;
        const step = () => {
            if (delay > 500) {
                displayWinner(winner, fullResult);
                // update stats after spin
                loadStats();
                animationTimer = null;
                return;
            }
            resultContainer.innerHTML = names[idx % names.length];
            idx++;
            delay *= 1.08; // slow down gradually
            animationTimer = setTimeout(step, delay);
        };
        step();
    }

    function displayWinner(winner, fullResult) {
        // display clickable winner if note is URL
        if (fullResult.note && /^https?:\/\//.test(fullResult.note)) {
            resultContainer.innerHTML = `<a href="${fullResult.note}" id="winnerLink" target="_blank">${winner}</a>`;
        } else {
            resultContainer.innerHTML = winner;
        }
    }

    function stopAnimation() {
        if (animationTimer) {
            clearTimeout(animationTimer);
            animationTimer = null;
            // show the current winner instead of just 'Stopped'
            if (currentWinner && currentWinnerResult) {
                displayWinner(currentWinner, currentWinnerResult);
                loadStats();
            } else {
                resultContainer.innerHTML = 'Stopped';
            }
        }
    }

    async function loadStats() {
        try {
            const resp = await fetch('/api/stats');
            const s = await resp.json();
            const container = document.getElementById('statsContainer');
            container.textContent = `Restaurants: ${s.restaurants}   Spins: ${s.spins}   Page views: ${s.page_views}`;
        } catch (e) {
            console.error('stats error', e);
        }
    }
});
