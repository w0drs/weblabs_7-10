// api-loader.js - функция для загрузки данных с API
const apiKey = '466c3ff5-62a5-4417-9faa-d283e3c760a7';
const API_BASE = 'https://edu.std-900.ist.mospolytech.ru/labs/api';
let dishes = [];

function loadDishes() {
    return fetch(`${API_BASE}/dishes?api_key=${apiKey}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Ошибка загрузки данных: ' + res.status);
            }
            return res.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Некорректный формат данных');
            }
            return data;
        }) 
        .catch(error => {
            console.error("Ошибка при загрузке блюд: ", error);
            // Показываем сообщение об ошибке
            showErrorMessage('Не удалось загрузить меню. Пожалуйста, обновите страницу.');
            return [];
        });
}

function showErrorMessage(message) {
    const containers = document.querySelectorAll('.menu-container');
    containers.forEach(container => {
        container.innerHTML = `<p class="error-message">${message}</p>`;
    });
}

function initDishes() {
    console.log('Начинаем загрузку блюд с API...');
    
    loadDishes().then(dishesData => {
        if (!dishesData || dishesData.length === 0) {
            console.log('Нет данных для отображения');
            showErrorMessage('Блюда временно недоступны');
            return;
        }
        
        // Преобразуем данные API в формат, совместимый с вашим сайтом
        const transformedDishes = dishesData.map(dish => {
            // Преобразуем категории из API в ваши категории
            let category = dish.category;
            if (category === 'main-course') {
                category = 'main';
            }
            
            return {
                id: dish.id,
                keyword: dish.keyword,
                name: dish.name,
                price: dish.price,
                category: category,
                count: dish.count,
                image: dish.image,
                kind: dish.kind
            };
        });
        
        dishes = transformedDishes.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });

        // Сохраняем в глобальную переменную
        window.dishes = dishes;
        
        console.log('Блюда загружены:', dishes.length, 'шт.');
        
        // Запускаем отображение блюд
        if (typeof window.displayDishes === 'function') {
            window.displayDishes();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initDishes();
});

// Делаем функцию глобально доступной
window.loadDishes = loadDishes;
window.dishes = dishes;