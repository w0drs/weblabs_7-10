// displayDishes.js - отображение блюд
function displayDishes() {
    console.log('Начинаем отображение блюд...');
    
    if (typeof dishes === 'undefined' || dishes.length === 0) {
        console.log('Нет данных для отображения');
        return;
    }
    
    const sortedDishes = dishes.sort((a, b) => a.name.localeCompare(b.name));
    
    // Группируем блюда по категориям
    const soups = sortedDishes.filter(dish => dish.category === 'soup');
    const mains = sortedDishes.filter(dish => dish.category === 'main');
    const salads = sortedDishes.filter(dish => dish.category === 'salad');
    const drinks = sortedDishes.filter(dish => dish.category === 'drink');
    const desserts = sortedDishes.filter(dish => dish.category === 'dessert');
    
    // Отображаем супы - ИСПРАВЛЕНО: используем .menu-container
    const soupsContainer = document.querySelector('#soups .menu-container');
    if (soupsContainer) {
        soupsContainer.innerHTML = '';
        soups.forEach(soup => {
            const dishCard = createDishCard(soup);
            soupsContainer.appendChild(dishCard);
        });
    }
    
    // Отображаем главные блюда - ИСПРАВЛЕНО: используем .menu-container
    const mainsContainer = document.querySelector('#main-dishes .menu-container');
    if (mainsContainer) {
        mainsContainer.innerHTML = '';
        mains.forEach(mainDish => {
            const dishCard = createDishCard(mainDish);
            mainsContainer.appendChild(dishCard);
        });
    }
    
    // Отображаем салаты - ИСПРАВЛЕНО: используем .menu-container
    const saladsContainer = document.querySelector('#salads .menu-container');
    if (saladsContainer) {
        saladsContainer.innerHTML = '';
        salads.forEach(salad => {
            const dishCard = createDishCard(salad);
            saladsContainer.appendChild(dishCard);
        });
    }
    
    // Отображаем напитки - ИСПРАВЛЕНО: используем .menu-container
    const drinksContainer = document.querySelector('#drinks .menu-container');
    if (drinksContainer) {
        drinksContainer.innerHTML = '';
        drinks.forEach(drink => {
            const dishCard = createDishCard(drink);
            drinksContainer.appendChild(dishCard);
        });
    }
    
    // Отображаем десерты - ИСПРАВЛЕНО: используем .menu-container
    const dessertsContainer = document.querySelector('#desserts .menu-container');
    if (dessertsContainer) {
        dessertsContainer.innerHTML = '';
        desserts.forEach(dessert => {
            const dishCard = createDishCard(dessert);
            dessertsContainer.appendChild(dishCard);
        });
    }
    
    console.log('Отображение блюд завершено');
}

function createDishCard(dish) {
    const dishCard = document.createElement('div');
    dishCard.className = 'dish-card';
    dishCard.setAttribute('data-dish', dish.keyword);
    dishCard.setAttribute('data-kind', dish.kind);
    
    dishCard.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}" class="dish-image" loading="lazy">
        <p class="price">${dish.price}Р</p>
        <p class="dish-name">${dish.name}</p>
        <p class="weight">${dish.count}</p>
        <button type="button" class="dish-button">Добавить</button>
    `;
    
    return dishCard;
}

// Делаем функцию глобально доступной
window.displayDishes = displayDishes;