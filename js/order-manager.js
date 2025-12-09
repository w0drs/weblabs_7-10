class OrderManager {
    constructor() {
        this.selectedDishes = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
        this.init();
    }
    
    init() {
        this.loadOrderFromStorage();
        this.setupEventListeners();
        this.updateOrderSummary();
        this.updateOrderPanel();
        window.orderManager = this;
    }
    
    setupEventListeners() {
        // Обработчик кликов на кнопки "Добавить"
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.textContent === 'Добавить') {
                const dishCard = e.target.closest('.dish-card');
                if (dishCard) {
                    const dishKeyword = dishCard.getAttribute('data-dish');
                    this.selectDish(dishKeyword);
                }
            }
        });
    }

    // Загрузить заказ из localStorage
    loadOrderFromStorage() {
        if (typeof storageManager !== 'undefined') {
            const savedOrder = storageManager.getFullOrderData(dishes);
            this.selectedDishes = { ...this.selectedDishes, ...savedOrder };
            this.updateDishCardsSelection();
        }
    }

    // Обновить выделение карточек блюд
    updateDishCardsSelection() {
        document.querySelectorAll('.dish-card').forEach(card => {
            const dishKeyword = card.getAttribute('data-dish');
            const dish = dishes.find(d => d.keyword === dishKeyword);
            
            if (dish && this.selectedDishes[dish.category] && 
                this.selectedDishes[dish.category].id === dish.id) {
                card.classList.add('selected');
                const button = card.querySelector('.dish-button');
                if (button) {
                    button.textContent = 'Добавлено';
                    button.style.backgroundColor = '#4CAF50';
                }
            } else {
                card.classList.remove('selected');
                const button = card.querySelector('.dish-button');
                if (button) {
                    button.textContent = 'Добавить';
                    button.style.backgroundColor = '#f1eee9';
                }
            }
        });
    }
    
    selectDish(dishKeyword) {
        // Ищем блюдо в загруженных данных
        const dish = dishes.find(d => d.keyword === dishKeyword);
        if (!dish) {
            console.error('Блюдо не найдено:', dishKeyword);
            return;
        }
        
        // Если блюдо уже выбрано - снимаем выбор
        if (this.selectedDishes[dish.category] && 
            this.selectedDishes[dish.category].id === dish.id) {
            this.selectedDishes[dish.category] = null;
        } else {
            this.selectedDishes[dish.category] = dish;
        }
        
        // Сохраняем в localStorage
        if (typeof storageManager !== 'undefined') {
            storageManager.saveOrder(this.selectedDishes);
        }
        
        this.updateOrderSummary();
        this.updateOrderPanel();
        this.updateDishCardsSelection();
    }

    // Удалить блюдо из заказа
    removeDish(category) {
        this.selectedDishes[category] = null;
        
        // Сохраняем в localStorage
        if (typeof storageManager !== 'undefined') {
            storageManager.saveOrder(this.selectedDishes);
        }
        
        this.updateOrderSummary();
        this.updateOrderPanel();
        this.updateDishCardsSelection();
    }
    
    updateOrderSummary() {
        const selectedDishesContainer = document.querySelector('.selected-dishes');
        const totalPriceElement = document.querySelector('.total-price');
        const priceAmount = document.querySelector('.price-amount');
        
        if (!selectedDishesContainer) return;
        
        const hasSelectedDishes = Object.values(this.selectedDishes).some(dish => dish !== null);
        
        if (!hasSelectedDishes) {
            selectedDishesContainer.innerHTML = '<p class="no-selection">Ничего не выбрано</p>';
            if (totalPriceElement) totalPriceElement.style.display = 'none';
            return;
        }
        
        let orderHTML = '';
        let totalPrice = 0;
        
        const categories = [
            { key: 'soup', name: 'Суп' },
            { key: 'main', name: 'Главное блюдо' },
            { key: 'salad', name: 'Салат или стартер' },
            { key: 'drink', name: 'Напиток' },
            { key: 'dessert', name: 'Десерт' }
        ];
        
        categories.forEach(cat => {
            if (this.selectedDishes[cat.key]) {
                orderHTML += `
                    <div class="selected-category">
                        <strong>${cat.name}</strong>
                        <p>${this.selectedDishes[cat.key].name} ${this.selectedDishes[cat.key].price}Р</p>
                    </div>
                `;
                totalPrice += this.selectedDishes[cat.key].price;
            } else {
                const notSelectedText = cat.key === 'drink' ? 'Напиток не выбран' : 'Блюдо не выбрано';
                orderHTML += `
                    <div class="selected-category">
                        <strong>${cat.name}</strong>
                        <p>${notSelectedText}</p>
                    </div>
                `;
            }
        });
        
        selectedDishesContainer.innerHTML = orderHTML;
        
        if (totalPrice > 0 && totalPriceElement && priceAmount) {
            priceAmount.textContent = `${totalPrice}Р`;
            totalPriceElement.style.display = 'block';
        } else if (totalPriceElement) {
            totalPriceElement.style.display = 'none';
        }
    }

    // Обновить панель заказа на странице "Собрать ланч"
    updateOrderPanel() {
        const orderPanel = document.querySelector('.order-panel');
        const orderTotal = document.querySelector('.order-total');
        const orderLink = document.querySelector('.order-link');
        
        if (!orderPanel || !orderTotal || !orderLink) return;
        
        const totalPrice = Object.values(this.selectedDishes)
            .filter(dish => dish !== null)
            .reduce((sum, dish) => sum + dish.price, 0);
        
        const isValidCombo = this.checkLunchCombination().isValid;
        
        orderTotal.textContent = `${totalPrice}Р`;
        
        if (totalPrice > 0) {
            orderPanel.style.display = 'block';
            orderLink.style.opacity = isValidCombo ? '1' : '0.5';
            orderLink.style.pointerEvents = isValidCombo ? 'auto' : 'none';
        } else {
            orderPanel.style.display = 'none';
        }
    }

    // Проверка комбинации (из order-validation.js)
    checkLunchCombination() {
        const selectedDishes = this.selectedDishes;
        const hasSoup = selectedDishes.soup !== null;
        const hasMain = selectedDishes.main !== null;
        const hasSalad = selectedDishes.salad !== null;
        const hasDrink = selectedDishes.drink !== null;
        const hasDessert = selectedDishes.dessert !== null;
        
        // Ничего не выбрано
        if (!hasSoup && !hasMain && !hasSalad && !hasDrink && !hasDessert) {
            return {
                isValid: false,
                message: 'Ничего не выбрано. Выберите блюда для заказа',
                type: 'nothing'
            };
        }
        
        // Валидные комбинации
        const validCombinations = [
            // Комбо 1: Суп + Главное + Салат + Напиток
            hasSoup && hasMain && hasSalad && hasDrink,
            // Комбо 2: Суп + Главное + Напиток
            hasSoup && hasMain && hasDrink && !hasSalad,
            // Комбо 3: Суп + Салат + Напиток
            hasSoup && hasSalad && hasDrink && !hasMain,
            // Комбо 4: Главное + Салат + Напиток
            hasMain && hasSalad && hasDrink && !hasSoup,
            // Комбо 5: Главное + Напиток
            hasMain && hasDrink && !hasSoup && !hasSalad
        ];
        
        if (validCombinations.some(valid => valid)) {
            return { isValid: true };
        }
        
        // Определяем какое уведомление показать
        if ((hasDrink || hasDessert) && !hasSoup && !hasMain && !hasSalad) {
            return {
                isValid: false,
                message: 'Выберите главное блюдо',
                type: 'main'
            };
        }
        
        if (hasSoup && !hasMain && !hasSalad) {
            return {
                isValid: false,
                message: 'Выберите главное блюдо/салат/стартер',
                type: 'main_salad'
            };
        }
        
        if (hasSalad && !hasSoup && !hasMain) {
            return {
                isValid: false,
                message: 'Выберите суп или главное блюдо',
                type: 'soup_main'
            };
        }
        
        // Во всех остальных случаях просим выбрать напиток
        return {
            isValid: false,
            message: 'Выберите напиток',
            type: 'drink'
        };
    }

    // Получить общую стоимость
    getTotalPrice() {
        return Object.values(this.selectedDishes)
            .filter(dish => dish !== null)
            .reduce((sum, dish) => sum + dish.price, 0);
    }
}

// Инициализация менеджера заказов
document.addEventListener('DOMContentLoaded', () => {
    new OrderManager();
});