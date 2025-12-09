// orders.js - управление страницей заказов
class OrdersManager {
    constructor() {
        this.orders = [];
        this.currentOrderId = null;
        this.apiKey = '466c3ff5-62a5-4417-9faa-d283e3c760a7';
        this.API_BASE = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadOrders();
    }

    setupEventListeners() {
        // Кнопка повторной загрузки
        document.getElementById('retry-loading')?.addEventListener('click', () => {
            this.loadOrders();
        });

        // Закрытие модальных окон
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeAllModals();
            });
        });

        // Кнопки модальных окон
        document.getElementById('close-details-btn')?.addEventListener('click', () => {
            this.closeAllModals();
        });

        document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
            this.closeAllModals();
        });

        document.getElementById('cancel-delete-btn')?.addEventListener('click', () => {
            this.closeAllModals();
        });

        document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
            this.deleteOrder();
        });

        // Форма редактирования
        document.getElementById('edit-order-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateOrder();
        });

        // Закрытие модальных окон по клику на фон
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
    }

    async loadOrders() {
        this.showLoadingState();
        
        try {
            console.log('Загрузка заказов...');
            const response = await fetch(`${this.API_BASE}/orders?api_key=${this.apiKey}`);
            
            console.log('Статус ответа:', response.status);
            
            if (!response.ok) {
                let errorText;
                try {
                    const errorData = await response.json();
                    errorText = errorData.error || JSON.stringify(errorData);
                } catch (e) {
                    errorText = await response.text();
                }
                throw new Error(`Ошибка сервера: ${response.status}. ${errorText}`);
            }
            
            const orders = await response.json();
            console.log('Получены заказы:', orders);
            
            if (!Array.isArray(orders)) {
                throw new Error('Некорректный формат данных - ожидался массив');
            }
            
            // Сортируем заказы по дате (новые сначала)
            this.orders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            this.displayOrders();
            
        } catch (error) {
            console.error('Ошибка при загрузке заказов:', error);
            this.showErrorState(error.message);
        }
    }

    displayOrders() {
        const ordersList = document.getElementById('orders-list');
        const loadingElement = document.getElementById('orders-loading');
        const emptyElement = document.getElementById('orders-empty');
        const errorElement = document.getElementById('orders-error');

        // Скрываем все состояния
        loadingElement.style.display = 'none';
        emptyElement.style.display = 'none';
        errorElement.style.display = 'none';
        ordersList.style.display = 'none';

        if (this.orders.length === 0) {
            emptyElement.style.display = 'block';
            return;
        }

        ordersList.style.display = 'block';
        ordersList.innerHTML = '';

        this.orders.forEach((order, index) => {
            const orderElement = this.createOrderElement(order, index + 1);
            ordersList.appendChild(orderElement);
        });
    }

    createOrderElement(order, index) {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-card';
        orderElement.dataset.orderId = order.id;

        // Форматируем дату
        const orderDate = new Date(order.created_at).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Получаем названия блюд
        const dishNames = this.getOrderDishNames(order);
        
        // Форматируем время доставки
        const deliveryTime = order.delivery_type === 'by_time' && order.delivery_time
            ? order.delivery_time 
            : 'Как можно скорее (с 7:00 до 23:00)';

        // Рассчитываем общую стоимость
        const totalPrice = this.calculateOrderTotal(order);

        orderElement.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-number">Заказ #${index}</div>
                    <div class="order-date">${orderDate}</div>
                </div>
            </div>
            <div class="order-content">
                <div class="order-dishes">${dishNames}</div>
                <div class="order-price">${totalPrice}Р</div>
                <div class="order-delivery-time">${deliveryTime}</div>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary view-order-btn" data-order-id="${order.id}">
                    <i class="bi bi-eye"></i> Подробнее
                </button>
                <button class="btn btn-secondary edit-order-btn" data-order-id="${order.id}">
                    <i class="bi bi-pencil"></i> Редактирование
                </button>
                <button class="btn btn-danger delete-order-btn" data-order-id="${order.id}">
                    <i class="bi bi-trash"></i> Удаление
                </button>
            </div>
        `;

        // Добавляем обработчики событий для кнопок
        orderElement.querySelector('.view-order-btn').addEventListener('click', (e) => {
            this.showOrderDetails(order.id);
        });

        orderElement.querySelector('.edit-order-btn').addEventListener('click', (e) => {
            this.showEditOrderForm(order.id);
        });

        orderElement.querySelector('.delete-order-btn').addEventListener('click', (e) => {
            this.showDeleteConfirmation(order.id);
        });

        return orderElement;
    }

    getOrderDishNames(order) {
        const dishes = [];
        
        const dishTypes = [
            { id: order.soup_id, name: 'soup' },
            { id: order.main_course_id, name: 'main' },
            { id: order.salad_id, name: 'salad' },
            { id: order.drink_id, name: 'drink' },
            { id: order.dessert_id, name: 'dessert' }
        ];

        dishTypes.forEach(dishType => {
            if (dishType.id) {
                const dish = window.dishes?.find(d => d.id === dishType.id);
                if (dish) {
                    dishes.push(dish.name);
                } else {
                    dishes.push(`Блюдо #${dishType.id}`);
                }
            }
        });

        return dishes.length > 0 ? dishes.join(', ') : 'Блюда не выбраны';
    }

    calculateOrderTotal(order) {
        let total = 0;
        
        const dishTypes = [
            { id: order.soup_id },
            { id: order.main_course_id },
            { id: order.salad_id },
            { id: order.drink_id },
            { id: order.dessert_id }
        ];

        dishTypes.forEach(dishType => {
            if (dishType.id) {
                const dish = window.dishes?.find(d => d.id === dishType.id);
                if (dish && dish.price) {
                    total += dish.price;
                }
            }
        });

        return total;
    }

    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showNotification('Заказ не найден', 'error');
            return;
        }

        const modal = document.getElementById('order-details-modal');
        const content = document.getElementById('order-details-content');

        // Форматируем даты
        const createdDate = new Date(order.created_at).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const updatedDate = new Date(order.updated_at).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Получаем информацию о блюдах
        const dishesInfo = this.getOrderDishesInfo(order);

        content.innerHTML = `
            <div class="order-detail">
                <strong>ID заказа:</strong>
                <span>${order.id}</span>
            </div>
            <div class="order-detail">
                <strong>Дата оформления:</strong>
                <span>${createdDate}</span>
            </div>
            <div class="order-detail">
                <strong>Последнее обновление:</strong>
                <span>${updatedDate}</span>
            </div>
            <div class="order-detail">
                <strong>Состав заказа:</strong>
                <ul class="order-dishes-list">
                    ${dishesInfo.map(dish => `<li>${dish}</li>`).join('')}
                </ul>
            </div>
            <div class="order-detail">
                <strong>Общая стоимость:</strong>
                <span>${this.calculateOrderTotal(order)}Р</span>
            </div>
            <div class="order-detail">
                <strong>Тип доставки:</strong>
                <span>${order.delivery_type === 'by_time' ? 'Ко времени' : 'Как можно скорее'}</span>
            </div>
            ${order.delivery_type === 'by_time' && order.delivery_time ? `
            <div class="order-detail">
                <strong>Время доставки:</strong>
                <span>${order.delivery_time}</span>
            </div>
            ` : ''}
            <div class="order-detail">
                <strong>Имя:</strong>
                <span>${order.full_name || 'Не указано'}</span>
            </div>
            <div class="order-detail">
                <strong>Email:</strong>
                <span>${order.email || 'Не указан'}</span>
            </div>
            <div class="order-detail">
                <strong>Телефон:</strong>
                <span>${order.phone || 'Не указан'}</span>
            </div>
            <div class="order-detail">
                <strong>Адрес доставки:</strong>
                <span>${order.delivery_address || 'Не указан'}</span>
            </div>
            ${order.comment ? `
            <div class="order-detail">
                <strong>Комментарий:</strong>
                <span>${order.comment}</span>
            </div>
            ` : ''}
            <div class="order-detail">
                <strong>Рассылка:</strong>
                <span>${order.subscribe ? 'Подписан' : 'Не подписан'}</span>
            </div>
        `;

        this.showModal(modal);
    }

    getOrderDishesInfo(order) {
        const dishes = [];
        
        const categories = [
            { id: order.soup_id, name: 'Суп' },
            { id: order.main_course_id, name: 'Главное блюдо' },
            { id: order.salad_id, name: 'Салат' },
            { id: order.drink_id, name: 'Напиток' },
            { id: order.dessert_id, name: 'Десерт' }
        ];

        categories.forEach(cat => {
            if (cat.id) {
                const dish = window.dishes?.find(d => d.id === cat.id);
                if (dish) {
                    dishes.push(`${cat.name}: ${dish.name} - ${dish.price}Р`);
                } else {
                    dishes.push(`${cat.name}: Блюдо #${cat.id} - цена неизвестна`);
                }
            }
        });

        return dishes.length > 0 ? dishes : ['Блюда не выбраны'];
    }

    showEditOrderForm(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showNotification('Заказ не найден', 'error');
            return;
        }

        this.currentOrderId = orderId;
        const modal = document.getElementById('order-edit-modal');
        const form = document.getElementById('edit-order-form');

        // Подготавливаем значения для формы
        const subscribeValue = order.subscribe === true || order.subscribe === 1 || order.subscribe === '1';
        const deliveryType = order.delivery_type || 'now';

        form.innerHTML = `
            <div class="form-group">
                <label for="edit-full_name">Имя *</label>
                <input type="text" id="edit-full_name" name="full_name" value="${order.full_name || ''}" required>
            </div>
            <div class="form-group">
                <label for="edit-email">Email *</label>
                <input type="email" id="edit-email" name="email" value="${order.email || ''}" required>
            </div>
            <div class="form-group checkbox-group">
                <input type="checkbox" id="edit-subscribe" name="subscribe" ${subscribeValue ? 'checked' : ''}>
                <label for="edit-subscribe">Подписаться на рассылку</label>
            </div>
            <div class="form-group">
                <label for="edit-phone">Телефон *</label>
                <input type="tel" id="edit-phone" name="phone" value="${order.phone || ''}" required>
            </div>
            <div class="form-group">
                <label for="edit-delivery_address">Адрес доставки *</label>
                <input type="text" id="edit-delivery_address" name="delivery_address" value="${order.delivery_address || ''}" required>
            </div>
            <div class="form-group">
                <label>Тип доставки *</label>
                <div class="radio-group">
                    <div class="radio-option">
                        <input type="radio" id="edit-delivery_type_now" name="delivery_type" value="now" ${deliveryType === 'now' ? 'checked' : ''} required>
                        <label for="edit-delivery_type_now">Как можно скорее</label>
                    </div>
                    <div class="radio-option">
                        <input type="radio" id="edit-delivery_type_by_time" name="delivery_type" value="by_time" ${deliveryType === 'by_time' ? 'checked' : ''}>
                        <label for="edit-delivery_type_by_time">Ко времени</label>
                    </div>
                </div>
            </div>
            <div class="form-group" id="edit-delivery-time-group" style="${deliveryType === 'by_time' ? '' : 'display: none;'}">
                <label for="edit-delivery_time">Время доставки *</label>
                <input type="time" id="edit-delivery_time" name="delivery_time" value="${order.delivery_time || ''}" min="07:00" max="23:00" step="300" ${deliveryType === 'by_time' ? 'required' : ''}>
            </div>
            <div class="form-group">
                <label for="edit-comment">Комментарий</label>
                <textarea id="edit-comment" name="comment">${order.comment || ''}</textarea>
            </div>
        `;

        // Обработчик изменения типа доставки
        form.querySelectorAll('input[name="delivery_type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const timeGroup = document.getElementById('edit-delivery-time-group');
                const timeInput = document.getElementById('edit-delivery_time');
                
                if (e.target.value === 'by_time') {
                    timeGroup.style.display = 'block';
                    timeInput.setAttribute('required', 'required');
                } else {
                    timeGroup.style.display = 'none';
                    timeInput.removeAttribute('required');
                }
            });
        });

        this.showModal(modal);
    }

    showDeleteConfirmation(orderId) {
        this.currentOrderId = orderId;
        const modal = document.getElementById('order-delete-modal');
        this.showModal(modal);
    }

    async updateOrder() {
        // Сохраняем orderId перед выполнением запроса
        const orderId = this.currentOrderId;
        
        if (!orderId) {
            this.showNotification('ID заказа не указан', 'error');
            return;
        }

        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            this.showNotification('Заказ не найден', 'error');
            return;
        }

        const form = document.getElementById('edit-order-form');
        const formData = new FormData(form);
        
        // Проверяем обязательные поля
        if (!this.validateForm(formData)) {
            this.showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        // Проверяем время доставки для типа "ко времени"
        if (formData.get('delivery_type') === 'by_time' && !formData.get('delivery_time')) {
            this.showNotification('Для доставки ко времени необходимо указать время', 'error');
            return;
        }

        // Подготавливаем данные для отправки - ВАЖНО: включаем ID блюд!
        const orderData = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            subscribe: formData.get('subscribe') ? 1 : 0,
            phone: formData.get('phone'),
            delivery_address: formData.get('delivery_address'),
            delivery_type: formData.get('delivery_type'),
            comment: formData.get('comment') || '',
            // ВАЖНО: передаем ID блюд из исходного заказа
            soup_id: order.soup_id || null,
            main_course_id: order.main_course_id || null,
            salad_id: order.salad_id || null,
            drink_id: order.drink_id || null,
            dessert_id: order.dessert_id || null
        };

        // Добавляем время доставки только если выбран соответствующий тип
        if (formData.get('delivery_type') === 'by_time') {
            orderData.delivery_time = formData.get('delivery_time');
        } else {
            // Для типа "now" не отправляем delivery_time
            delete orderData.delivery_time;
        }

        console.log('Отправляемые данные для обновления:', orderData);
        console.log('URL:', `${this.API_BASE}/orders/${orderId}?api_key=${this.apiKey}`);

        try {
            const response = await fetch(`${this.API_BASE}/orders/${orderId}?api_key=${this.apiKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            console.log('Статус ответа при обновлении:', response.status);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: await response.text() };
                }
                console.error('Ошибка от сервера:', errorData);
                throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
            }

            const updatedOrder = await response.json();
            console.log('Обновленный заказ:', updatedOrder);
            
            // Обновляем заказ в списке
            const orderIndex = this.orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                this.orders[orderIndex] = { ...this.orders[orderIndex], ...updatedOrder };
                this.showNotification('Заказ успешно изменён', 'success');
            }

            this.closeAllModals();
            this.displayOrders();

        } catch (error) {
            console.error('Ошибка при обновлении заказа:', error);
            this.showNotification(error.message || 'Произошла ошибка при изменении заказа', 'error');
        }
    }

    async deleteOrder() {
        // Сохраняем orderId перед выполнением запроса
        const orderId = this.currentOrderId;
        
        if (!orderId) {
            this.showNotification('ID заказа не указан', 'error');
            return;
        }

        console.log('Удаление заказа ID:', orderId);
        console.log('URL:', `${this.API_BASE}/orders/${orderId}?api_key=${this.apiKey}`);

        try {
            const response = await fetch(`${this.API_BASE}/orders/${orderId}?api_key=${this.apiKey}`, {
                method: 'DELETE'
            });

            console.log('Статус ответа при удалении:', response.status);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: await response.text() };
                }
                console.error('Ошибка от сервера:', errorData);
                throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
            }

            // Удаляем заказ из списка
            this.orders = this.orders.filter(order => order.id !== orderId);

            this.closeAllModals();
            this.displayOrders();
            this.showNotification('Заказ успешно удалён', 'success');

        } catch (error) {
            console.error('Ошибка при удалении заказа:', error);
            this.showNotification(error.message || 'Произошла ошибка при удалении заказа', 'error');
        }
    }

    validateForm(formData) {
        const requiredFields = ['full_name', 'email', 'phone', 'delivery_address', 'delivery_type'];
        
        for (let field of requiredFields) {
            const value = formData.get(field);
            if (!value || value.trim() === '') {
                console.error('Не заполнено обязательное поле:', field);
                return false;
            }
        }
        
        // Дополнительная проверка для времени доставки
        if (formData.get('delivery_type') === 'by_time') {
            const deliveryTime = formData.get('delivery_time');
            if (!deliveryTime || deliveryTime.trim() === '') {
                console.error('Не указано время доставки для типа "ко времени"');
                return false;
            }
        }
        
        return true;
    }

    showModal(modal) {
        this.closeAllModals();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
        // НЕ сбрасываем currentOrderId здесь!
    }

    showLoadingState() {
        document.getElementById('orders-loading').style.display = 'block';
        document.getElementById('orders-empty').style.display = 'none';
        document.getElementById('orders-error').style.display = 'none';
        document.getElementById('orders-list').style.display = 'none';
    }

    showErrorState(message) {
        document.getElementById('orders-loading').style.display = 'none';
        document.getElementById('orders-empty').style.display = 'none';
        document.getElementById('orders-error').style.display = 'block';
        document.getElementById('orders-list').style.display = 'none';
        
        const errorElement = document.getElementById('orders-error');
        const errorText = errorElement.querySelector('p');
        if (errorText) {
            errorText.textContent = message || 'Не удалось загрузить ваши заказы. Пожалуйста, попробуйте позже.';
        }
    }

    showNotification(message, type = 'info') {
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const waitForDishes = () => {
        if (typeof dishes !== 'undefined' && dishes.length > 0) {
            new OrdersManager();
        } else {
            setTimeout(waitForDishes, 100);
        }
    };
    
    waitForDishes();
});