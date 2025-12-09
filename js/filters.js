class FilterManager {
    constructor() {
        this.activeFilters = {};
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.handleFilterClick(e.target);
            }
        });
    }
    
    handleFilterClick(button) {
        const section = button.closest('section');
        const category = this.getCategoryBySectionId(section.id);
        const kind = button.getAttribute('data-kind');
        
        const isActive = button.classList.contains('active');
        
        section.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (!isActive) {
            button.classList.add('active');
            this.activeFilters[category] = kind;
        } else {
            delete this.activeFilters[category];
        }
        
        this.applyFilters();
    }
    
    getCategoryBySectionId(sectionId) {
        const mapping = {
            'soups': 'soup',
            'main-dishes': 'main',
            'salads': 'salad',
            'drinks': 'drink',
            'desserts': 'dessert'
        };
        return mapping[sectionId];
    }
    
    applyFilters() {
        Object.keys(this.activeFilters).forEach(category => {
            const kind = this.activeFilters[category];
            this.filterCategory(category, kind);
        });
        
        const allCategories = ['soup', 'main', 'salad', 'drink', 'dessert'];
        allCategories.forEach(category => {
            if (!this.activeFilters[category]) {
                this.filterCategory(category, null);
            }
        });
    }
    
    filterCategory(category, kind) {
        // Сортируем блюда по алфавиту
        const sortedDishes = [...dishes].sort((a, b) => a.name.localeCompare(b.name));
        let filteredDishes = sortedDishes.filter(dish => dish.category === category);
        
        if (kind) {
            filteredDishes = filteredDishes.filter(dish => dish.kind === kind);
        }
        
        const sectionId = this.getSectionIdByCategory(category);
        // ИСПРАВЛЕНО: используем .menu-container вместо .dishes-grid
        const container = document.querySelector(`#${sectionId} .menu-container`);
        
        if (!container) return;
        
        container.innerHTML = '';
        
        filteredDishes.forEach(dish => {
            const dishCard = createDishCard(dish);
            container.appendChild(dishCard);
        });
        
        if (filteredDishes.length === 0) {
            container.innerHTML = '<p class="no-dishes">Блюда не найдены</p>';
        }
    }
    
    getSectionIdByCategory(category) {
        const mapping = {
            'soup': 'soups',
            'main': 'main-dishes',
            'salad': 'salads',
            'drink': 'drinks',
            'dessert': 'desserts'
        };
        return mapping[category];
    }
}

// Инициализация менеджера фильтров
document.addEventListener('DOMContentLoaded', () => {
    new FilterManager();
});