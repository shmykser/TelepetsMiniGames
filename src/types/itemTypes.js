/**
 * Типы предметов и их свойства
 */

// Типы предметов
export const ITEM_TYPES = {
    HEART: 'heart',
    CLOVER: 'clover',
    PATCH: 'patch',
    DOUBLEPATCH: 'doublepatch',
    SHOVEL: 'shovel'
};

// Свойства предметов
export const ITEMS = {
    heart: {
        name: 'Сердце',
        description: 'Увеличивает максимальное здоровье яйца',
        increase: 20, // Количество лечения
        texture: '❤️', // Эмодзи сердца
        spriteKey: 'heart', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (1 = 32x32px)
    },
    patch: {
        name: 'Пластырь',
        description: 'Восстанавливает текущее здоровье яйца',
        increase: 25, // Количество лечения
        texture: '🩹', // Эмодзи пластыря (fallback)
        spriteKey: 'patch', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (1 = 32x32px)
    },
    doublepatch: {
        name: 'Двойной пластырь',
        description: 'Восстанавливает текущее здоровье яйца (усиленный)',
        increase: 50, // В два раза больше обычного пластыря (25 * 2)
        texture: '🩹', // Эмодзи пластыря (fallback)
        spriteKey: 'doublepatch', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (2 = 64x64px)
    },
    clover: {
        name: 'Клевер',
        description: 'Увеличивает везение',
        increase: 5, // Количество увеличения удачи
        texture: '🍀', // Эмодзи клевера (fallback)
        spriteKey: 'clover', // Ключ для загрузки спрайта
        size: 1 // Размер объекта (1 = 32x32px)
    },
    shovel: {
        name: 'Лопата',
        description: 'Копает яму и увеличивает ее размер',
        increase: 1,
        texture: '🪓', // Эмодзи лопаты (fallback)
        spriteKey: 'shovel', // Ключ для загрузки спрайта
        size: 2 // Размер объекта (1 = 32x32px)
    }
};

// Константы для предметов (перенесено из GameSettings.js)
export const ITEM_CONSTANTS = {
    ITEM_SCALE: 0.8,
    ITEM_BODY_SCALE: 0.8,
    AUTO_REMOVE_DELAY: 10000        // Автоудаление предмета через 10 секунд
};

