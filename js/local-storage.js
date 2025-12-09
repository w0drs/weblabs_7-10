// local-storage.js - управление localStorage для заказа
class LocalStorageManager {
    constructor() {
        this.storageKey = 'foodConstructOrder';
    }

    // Получить текущий заказ из localStorage
    getOrder() {
        try {
            const orderData = localStorage.getItem(this.storageKey);
            return orderData ? JSON.parse(orderData) : {};
        } catch (error) {
            console.error('Ошибка при чтении из localStorage:', error);
            return {};
        }
    }

    // Сохранить заказ в localStorage
    saveOrder(order) {
        try {
            // Сохраняем только ID блюд
            const simplifiedOrder = {};
            Object.keys(order).forEach(category => {
                if (order[category]) {
                    simplifiedOrder[category] = order[category].id;
                }
            });
            localStorage.setItem(this.storageKey, JSON.stringify(simplifiedOrder));
        } catch (error) {
            console.error('Ошибка при сохранении в localStorage:', error);
        }
    }

    // Очистить заказ
    clearOrder() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Ошибка при очистке localStorage:', error);
        }
    }

    // Получить полные данные блюд из ID
    getFullOrderData(dishes) {
        const orderIds = this.getOrder();
        const fullOrder = {};
        
        Object.keys(orderIds).forEach(category => {
            const dishId = orderIds[category];
            const dish = dishes.find(d => d.id === dishId);
            if (dish) {
                fullOrder[category] = dish;
            }
        });
        
        return fullOrder;
    }
}

// Создаем глобальный экземпляр
const storageManager = new LocalStorageManager();
window.storageManager = storageManager;