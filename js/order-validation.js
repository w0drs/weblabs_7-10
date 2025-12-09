class OrderValidation {
    constructor() {
        this.orderManager = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Обработчик для кнопки "Перейти к оформлению" на странице lunch.html
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('order-link')) {
                e.preventDefault();
                this.validateAndNavigate(e.target.href);
            }
        });

        // Обработчик для формы на странице order.html
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('order-form')) {
                this.validateOrderForm(e);
            }
        });
    }
    
    setOrderManager(orderManager) {
        this.orderManager = orderManager;
    }
    
    validateAndNavigate(url) {
        if (!this.orderManager) {
            console.error('OrderManager not initialized');
            return;
        }

        const validationResult = this.checkLunchCombination(this.orderManager.selectedDishes);
        
        if (validationResult.isValid) {
            window.location.href = url;
        } else {
            this.showNotification(validationResult.message, validationResult.type);
        }
    }

    validateOrderForm(e) {
        if (!this.orderManager) {
            console.error('OrderManager not initialized');
            return;
        }

        const validationResult = this.checkLunchCombination(this.orderManager.selectedDishes);
        
        if (!validationResult.isValid) {
            e.preventDefault();
            this.showNotification(validationResult.message, validationResult.type);
            return;
        }

        // Дополнительная проверка формы
        const form = e.target;
        if (!form.checkValidity()) {
            e.preventDefault();
            this.showFormValidationErrors(form);
            return;
        }

        // Если все проверки пройдены, форма отправится
        console.log('Форма валидна, отправляем заказ...');
    }
    
    checkLunchCombination(selectedDishes) {
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

    showFormValidationErrors(form) {
        const invalidFields = form.querySelectorAll(':invalid');
        if (invalidFields.length > 0) {
            const firstInvalid = invalidFields[0];
            const fieldName = firstInvalid.labels ? firstInvalid.labels[0].textContent : 'поле';
            this.showNotification(`Пожалуйста, заполните корректно поле: ${fieldName}`, 'form');
        }
    }
    
    showNotification(message, type) {
        // Удаляем существующие уведомления
        const existingNotification = document.querySelector('.notification-overlay');
        if (existingNotification) {
            document.body.removeChild(existingNotification);
        }

        const notification = document.createElement('div');
        notification.className = 'notification-overlay';
        
        const imageSrc = this.getNotificationImage(type);
        
        notification.innerHTML = `
            <div class="notification">
                <div class="notification-content">
                    <img src="${imageSrc}" alt="${type}" class="notification-image">
                    <p class="notification-message">${message}</p>
                    <button class="notification-btn">Окей</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(notification);
        });
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.backgroundColor = '#ff4422';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.backgroundColor = 'tomato';
        });

        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }
    
    getNotificationImage(type) {
        const images = {
            'nothing': 'images/icons/nothing.png',
            'drink': 'images/icons/drink.png',
            'main_salad': 'images/icons/main_salad.png',
            'soup_main': 'images/icons/soup_main.png',
            'main': 'images/icons/main.png',
            'form': 'images/icons/form.png'
        };
        
        return images[type] || 'images/icons/default.png';
    }

    // Метод для проверки доступности кнопки оформления заказа
    updateOrderButtonState() {
        if (!this.orderManager) return;

        const orderLink = document.querySelector('.order-link');
        if (!orderLink) return;

        const validationResult = this.checkLunchCombination(this.orderManager.selectedDishes);
        const totalPrice = this.orderManager.getTotalPrice();

        if (totalPrice > 0) {
            orderLink.style.opacity = validationResult.isValid ? '1' : '0.5';
            orderLink.style.pointerEvents = validationResult.isValid ? 'auto' : 'none';
            
            if (!validationResult.isValid) {
                orderLink.title = this.getValidationTooltip(validationResult);
            } else {
                orderLink.title = 'Перейти к оформлению заказа';
            }
        }
    }

    getValidationTooltip(validationResult) {
        const tooltips = {
            'nothing': 'Выберите блюда для заказа',
            'drink': 'Добавьте напиток для завершения заказа',
            'main_salad': 'Добавьте главное блюдо или салат',
            'soup_main': 'Добавьте суп или главное блюдо',
            'main': 'Добавьте главное блюдо'
        };
        
        return tooltips[validationResult.type] || 'Заказ не соответствует доступным комбинациям';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const validation = new OrderValidation();
    
    // Ждем инициализации OrderManager
    const initValidation = () => {
        const orderManager = window.orderManager;
        if (orderManager) {
            validation.setOrderManager(orderManager);
            
            // Обновляем состояние кнопки при изменениях
            if (orderManager.updateOrderPanel) {
                const originalUpdate = orderManager.updateOrderPanel;
                orderManager.updateOrderPanel = function() {
                    originalUpdate.call(this);
                    validation.updateOrderButtonState();
                };
            }
            
            // Первоначальное обновление состояния кнопки
            validation.updateOrderButtonState();
        } else {
            setTimeout(initValidation, 100);
        }
    };
    
    setTimeout(initValidation, 100);
});