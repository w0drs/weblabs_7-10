const dishes = [
    // Супы (6 блюд)
    {
        keyword: 'gaspacho',
        name: 'Гаспачо',
        price: 195,
        category: 'soup',
        kind: 'veg',
        count: '350 г',
        image: 'images/soups/gazpacho.jpg'
    },
    {
        keyword: 'mushroom_soup',
        name: 'Грибной суп-пюре',
        price: 185,
        category: 'soup',
        kind: 'veg',
        count: '330 г',
        image: 'images/soups/mushroom_soup.jpg'
    },
    {
        keyword: 'norwegian_soup',
        name: 'Норвежский суп',
        price: 270,
        category: 'soup',
        kind: 'fish',
        count: '330 г',
        image: 'images/soups/norwegian_soup.jpg'
    },
    {
        keyword: 'chicken_soup',
        name: 'Куриный суп',
        price: 220,
        category: 'soup',
        kind: 'meat',
        count: '400 г',
        image: 'images/soups/chicken.jpg'
    },
    {
        keyword: 'borscht',
        name: 'Тоуум',
        price: 240,
        category: 'soup',
        kind: 'meat',
        count: '380 г',
        image: 'images/soups/tomyum.jpg'
    },
    {
        keyword: 'ramen',
        name: 'Рамен',
        price: 290,
        category: 'soup',
        kind: 'fish',
        count: '350 г',
        image: 'images/soups/ramen.jpg'
    },

    // Главные блюда (6 блюд)
    {
        keyword: 'fried_potato',
        name: 'Жареная картошка с грибами',
        price: 150,
        category: 'main',
        kind: 'veg',
        count: '250 г',
        image: 'images/main_course/friedpotatoeswithmushrooms1.jpg'
    },
    {
        keyword: 'lasagna',
        name: 'Лазанья',
        price: 385,
        category: 'main',
        kind: 'meat',
        count: '310 г',
        image: 'images/main_course/lasagna.jpg'
    },
    {
        keyword: 'chicken_cutlets',
        name: 'Котлеты из курицы с картофельным пюре',
        price: 225,
        category: 'main',
        kind: 'meat',
        count: '280 г',
        image: 'images/main_course/chickencutletsandmashedpotatoes.jpg'
    },
    {
        keyword: 'fish',
        name: 'Фишрайз',
        price: 420,
        category: 'main',
        kind: 'fish',
        count: '300 г',
        image: 'images/main_course/fishrice.jpg'
    },
    {
        keyword: 'pizza',
        name: 'Пицца',
        price: 180,
        category: 'main',
        kind: 'veg',
        count: '320 г',
        image: 'images/main_course/pizza.jpg'
    },
    {
        keyword: 'pasta',
        name: 'Паста',
        price: 350,
        category: 'main',
        kind: 'fish',
        count: '280 г',
        image: 'images/main_course/shrimppasta.jpg'
    },

    // Салаты и стартеры (6 блюд)
    {
        keyword: 'caesar_salad',
        name: 'Салат Цезарь',
        price: 320,
        category: 'salad',
        kind: 'meat',
        count: '280 г',
        image: 'images/salads/caesar.jpg'
    },
    {
        keyword: 'caprese',
        name: 'Цапрессе',
        price: 280,
        category: 'salad',
        kind: 'veg',
        count: '300 г',
        image: 'images/salads/caprese.jpg'
    },
    {
        keyword: 'fries1',
        name: 'ФренчФаерс',
        price: 380,
        category: 'salad',
        kind: 'fish',
        count: '250 г',
        image: 'images/salads/frenchfries1.jpg'
    },
    {
        keyword: 'freis2',
        name: 'Картошка фри 2',
        price: 190,
        category: 'salad',
        kind: 'veg',
        count: '270 г',
        image: 'images/salads/frenchfries2.jpg'
    },
    {
        keyword: 'egg',
        name: 'Салат с яйцами',
        price: 210,
        category: 'salad',
        kind: 'veg',
        count: '260 г',
        image: 'images/salads/saladwithegg.jpg'
    },
    {
        keyword: 'tuna',
        name: 'Туна',
        price: 240,
        category: 'salad',
        kind: 'veg',
        count: '290 г',
        image: 'images/salads/tunasalad.jpg'
    },

    // Напитки (6 блюд)
    {
        keyword: 'orange_juice',
        name: 'Апельсиновый сок',
        price: 120,
        category: 'drink',
        kind: 'cold',
        count: '300 мл',
        image: 'images/beverages/orangejuice.jpg'
    },
    {
        keyword: 'apple_juice',
        name: 'Яблочный сок',
        price: 90,
        category: 'drink',
        kind: 'cold',
        count: '300 мл',
        image: 'images/beverages/applejuice.jpg'
    },
    {
        keyword: 'carrot_juice',
        name: 'Морковный сок',
        price: 110,
        category: 'drink',
        kind: 'cold',
        count: '300 мл',
        image: 'images/beverages/carrotjuice.jpg'
    },
    {
        keyword: 'cappucino',
        name: 'Кофе',
        price: 150,
        category: 'drink',
        kind: 'hot',
        count: '200 мл',
        image: 'images/beverages/cappuccino.jpg'
    },
    {
        keyword: 'tea',
        name: 'Чай',
        price: 100,
        category: 'drink',
        kind: 'hot',
        count: '250 мл',
        image: 'images/beverages/tea.jpg'
    },
    {
        keyword: 'green_tea',
        name: 'чай зеленый',
        price: 180,
        category: 'drink',
        kind: 'hot',
        count: '220 мл',
        image: 'images/beverages/greentea.jpg'
    },

    // Десерты (6 блюд)
    {
        keyword: 'baklava',
        name: 'баклава',
        price: 280,
        category: 'dessert',
        kind: 'small',
        count: '150 г',
        image: 'images/desserts/baklava.jpg'
    },
    {
        keyword: 'donuts2',
        name: '3 пончика',
        price: 320,
        category: 'dessert',
        kind: 'small',
        count: '180 г',
        image: 'images/desserts/donuts2.jpg'
    },
    {
        keyword: 'donuts',
        name: '6 пончиков',
        price: 600,
        category: 'dessert',
        kind: 'small',
        count: '360 г',
        image: 'images/desserts/donuts.jpg'
    },
    {
        keyword: 'chocolatecake',
        name: 'Шоколадный торт',
        price: 400,
        category: 'dessert',
        kind: 'medium',
        count: '250 г',
        image: 'images/desserts/chocolatecake.jpg'
    },
    {
        keyword: 'chocolatecheesecake',
        name: 'Шоколадный чизкейк',
        price: 350,
        category: 'dessert',
        kind: 'medium',
        count: '220 г',
        image: 'images/desserts/chocolatecheesecake.jpg'
    },
    {
        keyword: 'checheesecake',
        name: 'Большой чизкейк',
        price: 600,
        category: 'dessert',
        kind: 'large',
        count: '600 г',
        image: 'images/desserts/checheesecake.jpg'
    }
];