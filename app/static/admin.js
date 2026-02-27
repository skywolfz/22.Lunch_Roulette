document.addEventListener('DOMContentLoaded', function() {
    const restaurantInput = document.getElementById('restaurantInput');
    const categoryInput = document.getElementById('categoryInput');
    const noteInput = document.getElementById('noteInput');
    const addBtn = document.getElementById('addBtn');
    const restaurantsList = document.getElementById('restaurantsList');

    loadRestaurants();

    addBtn.addEventListener('click', addRestaurant);
    restaurantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRestaurant();
    });
    categoryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRestaurant();
    });
    noteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addRestaurant();
    });

    document.getElementById('deleteAllBtn').addEventListener('click', deleteAllRestaurants);
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', importData);

    async function loadRestaurants() {
        try {
            const response = await fetch('/api/restaurants');
            const restaurants = await response.json();
            renderRestaurants(restaurants);
        } catch (error) {
            console.error('Error loading restaurants:', error);
        }
    }

    async function loadCategories() {
        try {
            const resp = await fetch('/api/categories');
            const cats = await resp.json();
            const datalist = document.getElementById('categoryList');
            datalist.innerHTML = '';
            cats.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name;
                datalist.appendChild(opt);
            });            populateCategoryManager(cats);        } catch (err) {
            console.error('Error loading categories for datalist', err);
        }
    }

    // populate datalist and manager before first use
    loadCategories();

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
            catSpan.innerHTML = `<span class="category-label">${restaurant.category}</span><span class="category-edit-icon">▼</span>`;
            catSpan.addEventListener('click', () => editField(restaurant, 'category', catSpan));

            const noteSpan = document.createElement('div');
            noteSpan.className = 'restaurant-note';
            if (restaurant.note) {
                if (/^https?:\/\//.test(restaurant.note)) {
                    noteSpan.innerHTML = `<a href="${restaurant.note}" target="_blank">${restaurant.note}</a>`;
                } else {
                    noteSpan.textContent = restaurant.note;
                }
            }
            noteSpan.addEventListener('click', () => editField(restaurant, 'note', noteSpan));

            info.appendChild(name);
            info.appendChild(catSpan);
            info.appendChild(noteSpan);

            li.appendChild(info);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'restaurant-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteRestaurant(restaurant.id));

            li.appendChild(deleteBtn);
            restaurantsList.appendChild(li);
        });
    }

    async function addRestaurant() {
        const name = restaurantInput.value.trim();
        const category = categoryInput.value.trim();
        const note = noteInput.value.trim();
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
                body: JSON.stringify({ name, category: category || 'unknown', note })
            });
            if (response.ok) {
                restaurantInput.value = '';
                categoryInput.value = '';
                noteInput.value = '';
                restaurantInput.focus();
                // show confirmation message
                const confirmDiv = document.getElementById('addConfirmation');
                confirmDiv.textContent = `✓ ${name} has been created!`;
                setTimeout(() => {
                    confirmDiv.textContent = '';
                }, 4000);
                loadRestaurants();
            } else {
                alert('Error adding restaurant');
            }
        } catch (error) {
            console.error('Error adding restaurant:', error);
        }
    }

    async function deleteRestaurant(id) {
        if (!confirm('Delete this restaurant?')) return;
        try {
            const resp = await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
            if (resp.ok) loadRestaurants();
        } catch (e) {
            console.error('delete error', e);
        }
    }

    async function deleteAllRestaurants() {
        if (!confirm('Delete ALL restaurants? This cannot be undone.')) return;
        try {
            const resp = await fetch('/api/restaurants', { method: 'DELETE' });
            if (resp.ok) loadRestaurants();
        } catch (e) {
            console.error('delete all error', e);
        }
    }

    async function exportData() {
        try {
            const resp = await fetch('/api/export');
            const data = await resp.json();
            const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'restaurants_export.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            console.error('export error', e);
        }
    }

    function importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const json = JSON.parse(reader.result);
                const resp = await fetch('/api/import', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(json)
                });
                const result = await resp.json();
                if (!resp.ok) {
                    console.error('import failed', result);
                    alert('Import error: ' + (result.error || resp.statusText));
                } else {
                    alert('Imported ' + result.imported + ' restaurants');
                }
                loadRestaurants();
                loadCategories();
            } catch (err) {
                console.error('import error', err);
                alert('Failed to import: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    function populateCategoryManager(cats) {
        const container = document.getElementById('categoriesManager');
        container.innerHTML = '';
        cats.forEach(c => {
            const label = document.createElement('label');
            label.className = 'checkbox-container';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.categoryId = c.id;
            const span = document.createElement('span');
            span.textContent = c.name;
            label.appendChild(checkbox);
            label.appendChild(span);
            container.appendChild(label);
        });
    }

    document.getElementById('deleteCategoriesBtn').addEventListener('click', async () => {
        const checks = Array.from(document.querySelectorAll('#categoriesManager input[type=checkbox]'));
        const ids = checks.filter(c=>c.checked).map(c=>parseInt(c.dataset.categoryId));
        if (ids.length === 0) return alert('Select categories to delete');
        if (!confirm('Delete selected categories? All restaurants in them will be removed.')) return;
        try {
            const resp = await fetch('/api/categories', {
                method:'DELETE',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({category_ids: ids})
            });
            if (resp.ok) {
                loadRestaurants();
                loadCategories();
            }
        } catch (e) {
            console.error('category delete error', e);
        }
    });

    function editField(restaurant, field, span) {
        if (field === 'category') {
            // Category edit with dropdown
            const select = document.createElement('select');
            select.className = 'category-dropdown-edit';
            // constrain width to current label, but don't exceed max
            const maxWidth = 150; // pixels
            const computed = Math.min(span.offsetWidth, maxWidth);
            select.style.width = computed + 'px';
            
            // Get the actual category text from the label element
            const categoryLabel = span.querySelector('.category-label')?.textContent || span.textContent;
            
            // Add empty option
            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = '-- Select Category --';
            select.appendChild(emptyOpt);
            
            // Add all categories
            const categories = document.querySelectorAll('#categoryList option');
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.value;
                opt.textContent = cat.value;
                if (cat.value === categoryLabel) {
                    opt.selected = true;
                }
                select.appendChild(opt);
            });
            
            span.replaceWith(select);
            select.focus();
            
            // Auto-save on selection
            select.addEventListener('change', async () => {
                const newVal = select.value.trim();
                if (newVal && newVal !== categoryLabel) {
                    const payload = { category: newVal };
                    await fetch(`/api/restaurants/${restaurant.id}`, {
                        method: 'PUT',
                        headers: {'Content-Type':'application/json'},
                        body: JSON.stringify(payload)
                    });
                    loadRestaurants();
                    loadCategories();
                } else {
                    // Cancel - reload to show original
                    loadRestaurants();
                    loadCategories();
                }
            });
            
            // Escape key to cancel
            select.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    loadRestaurants();
                    loadCategories();
                }
            });
        } else {
            // Note edit (original inline edit)
            const input = document.createElement('input');
            input.value = span.textContent;
            // limit width so it doesn't overflow page
            const maxW = 150;
            input.style.width = Math.min(span.offsetWidth, maxW) + 'px';
            span.replaceWith(input);
            input.focus();
            input.addEventListener('blur', async () => {
                const newVal = input.value.trim();
                if (newVal && newVal !== span.textContent) {
                    const payload = {};
                    payload[field] = newVal;
                    await fetch(`/api/restaurants/${restaurant.id}`, {
                        method: 'PUT',
                        headers: {'Content-Type':'application/json'},
                        body: JSON.stringify(payload)
                    });
                }
                loadRestaurants();
                loadCategories();
            });
        }
    }
});
