// Theme management
document.addEventListener('DOMContentLoaded', function() {
    const themeSelector = document.getElementById('themeSelector');
    if (!themeSelector) return;
    
    // Load available themes
    loadThemes();
    
    // Restore saved theme preference
    const savedTheme = localStorage.getItem('preferredTheme') || 'light';
    applyTheme(savedTheme);
    themeSelector.value = savedTheme;
    
    // Listen for theme changes
    themeSelector.addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        applyTheme(selectedTheme);
        localStorage.setItem('preferredTheme', selectedTheme);
    });
    
    async function loadThemes() {
        try {
            const response = await fetch('/api/themes');
            const themes = await response.json();
            themeSelector.innerHTML = '';
            themes.forEach(theme => {
                const option = document.createElement('option');
                option.value = theme.name;
                option.textContent = theme.display_name;
                themeSelector.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading themes:', error);
        }
    }
    
    function applyTheme(themeName) {
        // Remove all theme classes
        document.body.classList.remove('theme-light', 'theme-dark', 'theme-nord', 'theme-dracula', 'theme-solarized', 'theme-ocean');
        
        // Add the selected theme class (if not light, which is default)
        if (themeName && themeName !== 'light') {
            document.body.classList.add(`theme-${themeName}`);
        }
    }
});
