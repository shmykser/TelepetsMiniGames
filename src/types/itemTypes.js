/**
 * Типы предметов и их свойства
 */

// Типы предметов
export const ITEM_TYPES = {
    HEART: 'heart',
    CLOVER: 'clover',
    PATCH: 'patch',
    DOUBLEPATCH: 'doublepatch',
    SHOVEL: 'shovel',
    ALOE: 'aloe',
    HONEY: 'honey'
};

// Свойства предметов
export const ITEMS = {
    heart: {
        name: 'Сердце',
        description: 'Увеличивает максимальное здоровье яйца',
        increase: 20, // Количество лечения
        dropChance: 0.1, // 15% - редкий предмет
        texture: '❤️', // Эмодзи сердца
        spriteKey: 'heart', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (1 = 32x32px)
    },
    patch: {
        name: 'Пластырь',
        description: 'Восстанавливает текущее здоровье яйца',
        increase: 25, // Количество лечения
        dropChance: 0.1, // 80% - обычный предмет
        texture: '🩹', // Эмодзи пластыря (fallback)
        spriteKey: 'patch', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (1 = 32x32px)
    },
    doublepatch: {
        name: 'Двойной пластырь',
        description: 'Восстанавливает текущее здоровье яйца (усиленный)',
        increase: 50, // В два раза больше обычного пластыря (25 * 2)
        dropChance: 0.1, // 40% - средняя редкость
        texture: '🩹', // Эмодзи пластыря (fallback)
        spriteKey: 'doublepatch', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (2 = 64x64px)
    },
    clover: {
        name: 'Клевер',
        description: 'Увеличивает везение',
        increase: 5, // Количество увеличения удачи
        dropChance: 0.1, // 20% - зависит от удачи
        texture: '🍀', // Эмодзи клевера (fallback)
        spriteKey: 'clover', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (1 = 32x32px)
    },
    shovel: {
        name: 'Лопата',
        description: 'Копает яму и увеличивает ее размер',
        increase: 1,
        dropChance: 0.1, // 50% - редкий инструмент
        texture: '🪓', // Эмодзи лопаты (fallback)
        spriteKey: 'shovel', // Ключ для загрузки спрайта
        size: 2 // Размер объекта (1 = 32x32px)
    },
    pepper: { //не реализовано
        name: 'Перец',
        description: 'поджигает всех врагов в радиусе действия',
        increase: 1, // не используется
        dropChance: 0.1,
        texture: '🌶️', // Эмодзи лопаты (fallback)
        spriteKey: 'pepper', // Ключ для загрузки спрайта
        size: 2 // Размер объекта (1 = 32x32px)
    },
    seed: {//не реализовано
        name: 'Семена',
        description: 'Дает возможность посадить куст',
        increase: 1, // не используется
        dropChance: 0.1,
        texture: '🌱', 
        spriteKey: 'seed', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (1 = 32x32px)
    },
    aloe: {
        name: 'Алоэ',
        description: 'Регенерация в секунду здоровье яйца',
        increase: 1,
        dropChance: 0.1,
        texture: '🌿', 
        spriteKey: 'aloe', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (1 = 32x32px)
    },
    honey: {
        name: 'Мёд', //не дропаем ни у одного врага, плохая реализация замедления
        description: 'Замедляет всех врагов на 5 секунд',
        effect: 'slowEnemies',
        duration: 10000, 
        dropChance: 0.1,
        texture: '🍯', 
        spriteKey: 'honey', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (1 = 32x32px)
    }
};

// Константы для предметов (перенесено из GameSettings.js)
export const ITEM_CONSTANTS = {
    ITEM_SCALE: 0.8,
    ITEM_BODY_SCALE: 0.8,
    AUTO_REMOVE_DELAY: 15000        // Автоудаление предмета через 10 секунд
};

// Модификаторы дропа для врагов
export const ENEMY_DROP_MODIFIERS = {
    butterfly: 0.5,    // Редкий дроп
    mosquito: 0.7,     // Маленький вредный
    flea: 0.8,         // Маленький вредный
    fly: 0.8,          // Маленький вредный
    ant: 1.0,          // Стандартный
    slug: 1.0,         // Стандартный
    snail: 1.2,        // Увеличенный
    beetle: 1.2,       // Увеличенный
    bee: 1.1,          // Слегка увеличенный
    dragonfly: 1.3,    // Высокий
    wasp: 1.0,         // Стандартный
    mole: 1.4,         // Высокий
    spider: 1.8,       // Очень высокий
    rhinoceros: 2.0,   // Максимальный
    projectile: 0.0,   // Не дропает
    unknown: 0.0       // Не дропает
};

