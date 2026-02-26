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

            const noteSpan = document.createElement('div');
            noteSpan.className = 'restaurant-note';
            if (restaurant.note) {
                // if note looks like url, make anchor
                if (/^https?:\/\//.test(restaurant.note)) {
                    noteSpan.innerHTML = `<a href="${restaurant.note}" target="_blank">${restaurant.note}</a>`;
                } else {
                    noteSpan.textContent = restaurant.note;
                }
            }

            info.appendChild(name);
            info.appendChild(catSpan);
            info.appendChild(noteSpan);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'restaurant-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteRestaurant(restaurant.id));

            li.appendChild(info);
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
});
