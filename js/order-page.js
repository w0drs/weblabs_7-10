// order-page.js - логика для страницы оформления заказа
class OrderPage {
    constructor() {
        this.orderManager = null;
        this.apiKey = '466c3ff5-62a5-4417-9faa-d283e3c760a7';
        this.API_BASE = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
        this.init();
    }

    init() {
        this.waitForDishes().then(() => {
            this.setupOrderManager();
            this.loadOrderData();
            this.setupEventListeners();
        });
    }

    waitForDishes() {
        return new Promise((resolve) => {
            const checkDishes = () => {
                if (typeof dishes !== 'undefined' && dishes.length > 0) {
                    resolve();
                } else {
                    setTimeout(checkDishes, 100);
                }
            };
            checkDishes();
        });
    }

    setupOrderManager() {
        this.orderManager = new OrderManager();
        
        // Переопределяем метод сохранения для страницы заказа
        this.orderManager.selectDish = (dishKeyword) => {
            // На странице заказа эта функция не используется
            console.log('Функция selectDish не используется на этой странице');
        };
    }

    loadOrderData() {
        if (typeof storageManager !== 'undefined') {
            const orderData = storageManager.getFullOrderData(dishes);
            this.orderManager.selectedDishes = { ...this.orderManager.selectedDishes, ...orderData };
            this.displayOrderDishes();
            this.updateOrderSummary();
        }
    }

    displayOrderDishes() {
        const container = document.getElementById('order-dishes-container');
        const emptyMessage = document.getElementById('empty-order-message');
        
        if (!container) return;

        const hasSelectedDishes = Object.values(this.orderManager.selectedDishes)
            .some(dish => dish !== null);

        if (!hasSelectedDishes) {
            container.style.display = 'none';
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        if (emptyMessage) emptyMessage.style.display = 'none';
        container.innerHTML = '';

        Object.keys(this.orderManager.selectedDishes).forEach(category => {
            const dish = this.orderManager.selectedDishes[category];
            if (dish) {
                const dishCard = this.createOrderDishCard(dish, category);
                container.appendChild(dishCard);
            }
        });
    }

    createOrderDishCard(dish, category) {
        const dishCard = document.createElement('div');
        dishCard.className = 'dish-card';
        dishCard.setAttribute('data-dish', dish.keyword);
        dishCard.setAttribute('data-category', category);
        
        dishCard.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}" class="dish-image" loading="lazy">
            <p class="price">${dish.price}Р</p>
            <p class="dish-name">${dish.name}</p>
            <p class="weight">${dish.count}</p>
            <button type="button" class="remove-button">Удалить</button>
        `;

        // Обработчик для кнопки удаления
        const removeButton = dishCard.querySelector('.remove-button');
        removeButton.addEventListener('click', () => {
            this.removeDishFromOrder(category);
        });

        return dishCard;
    }

    removeDishFromOrder(category) {
        this.orderManager.selectedDishes[category] = null;
        
        // Сохраняем изменения в localStorage
        if (typeof storageManager !== 'undefined') {
            storageManager.saveOrder(this.orderManager.selectedDishes);
        }
        
        this.displayOrderDishes();
        this.updateOrderSummary();
    }

    updateOrderSummary() {
        const selectedDishesContainer = document.getElementById('order-summary');
        const totalPriceElement = document.querySelector('.total-price');
        const priceAmount = document.querySelector('.price-amount');
        
        if (!selectedDishesContainer) return;
        
        const hasSelectedDishes = Object.values(this.orderManager.selectedDishes)
            .some(dish => dish !== null);
        
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
            if (this.orderManager.selectedDishes[cat.key]) {
                orderHTML += `
                    <div class="selected-category">
                        <strong>${cat.name}</strong>
                        <p>${this.orderManager.selectedDishes[cat.key].name} ${this.orderManager.selectedDishes[cat.key].price}Р</p>
                    </div>
                `;
                totalPrice += this.orderManager.selectedDishes[cat.key].price;
            } else {
                const notSelectedText = cat.key === 'main' ? 'Не выбрано' : 'Не выбран';
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

    setupEventListeners() {
        // Очистка заказа
        const clearButton = document.getElementById('clear-order-btn');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите очистить заказ?')) {
                    this.clearOrder();
                }
            });
        }

        // Отправка формы
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitOrder();
            });
        }

        // Обработчик изменения типа доставки
        const deliveryTypeRadios = orderForm.querySelectorAll('input[name="delivery_time"]');
        const deliveryTimeInput = document.getElementById('delivery_time_input');
        
        deliveryTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                deliveryTimeInput.style.display = e.target.value === 'specific' ? 'block' : 'none';
            });
        });
    }

    clearOrder() {
        this.orderManager.selectedDishes = {
            soup: null,
            main: null,
            salad: null,
            drink: null,
            dessert: null
        };
        
        if (typeof storageManager !== 'undefined') {
            storageManager.clearOrder();
        }
        
        this.displayOrderDishes();
        this.updateOrderSummary();
    }

    async submitOrder() {
        // Проверяем валидность комбинации
        const validation = this.orderManager.checkLunchCombination();
        if (!validation.isValid) {
            alert(`Невозможно оформить заказ: ${validation.message}`);
            return;
        }

        // Проверяем заполненность формы
        const form = document.getElementById('order-form');
        if (!form.checkValidity()) {
            alert('Пожалуйста, заполните все обязательные поля формы');
            return;
        }

        const formData = new FormData(form);
        
        // Подготавливаем данные для отправки
        const orderData = {
            full_name: formData.get('name'),
            email: formData.get('email'),
            subscribe: formData.get('newsletter') ? 1 : 0,
            phone: formData.get('phone'),
            delivery_address: formData.get('address'),
            comment: formData.get('comment') || ''
        };

        // Обрабатываем тип доставки - ИСПРАВЛЕНО: теперь 'now' вместо 'asap'
        const deliveryType = formData.get('delivery_time');
        if (deliveryType === 'specific') {
            orderData.delivery_type = 'by_time';
            orderData.delivery_time = formData.get('delivery_time_input');
            
            // Проверяем время доставки
            if (!orderData.delivery_time) {
                alert('Пожалуйста, укажите время доставки');
                return;
            }
        } else {
            orderData.delivery_type = 'now'; // ИСПРАВЛЕНО: теперь 'now'
        }

        // Добавляем ID блюд - ВАЖНО: проверяем что ID существуют
        const selectedDishes = this.orderManager.selectedDishes;
        
        if (selectedDishes.soup && selectedDishes.soup.id) {
            orderData.soup_id = selectedDishes.soup.id;
        }
        if (selectedDishes.main && selectedDishes.main.id) {
            orderData.main_course_id = selectedDishes.main.id;
        }
        if (selectedDishes.salad && selectedDishes.salad.id) {
            orderData.salad_id = selectedDishes.salad.id;
        }
        if (selectedDishes.drink && selectedDishes.drink.id) {
            orderData.drink_id = selectedDishes.drink.id;
        } else {
            alert('Пожалуйста, выберите напиток (обязательное поле)');
            return;
        }
        if (selectedDishes.dessert && selectedDishes.dessert.id) {
            orderData.dessert_id = selectedDishes.dessert.id;
        }

        console.log('Отправляемые данные заказа:', orderData);

        try {
            // Отправляем заказ на сервер
            const response = await fetch(`${this.API_BASE}/orders?api_key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            console.log('Статус ответа при создании заказа:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Ошибка от сервера:', errorData);
                throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
            }

            const result = await response.json();
            console.log('Созданный заказ:', result);
            
            // Очищаем заказ при успешной отправке
            this.clearOrder();
            alert('Заказ успешно оформлен! Спасибо за ваш заказ.');
            form.reset();

        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            alert(error.message || 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз.');
        }
    }
}

// Инициализация страницы заказа
document.addEventListener('DOMContentLoaded', () => {
    new OrderPage();
});