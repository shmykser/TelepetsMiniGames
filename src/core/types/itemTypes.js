/**
 * Типы предметов и их свойства
 */

// Типы предметов
export const ITEM_TYPES = {
    HEART: 'heart',
    CLOVER: 'clover'
};

// Свойства предметов
export const ITEMS = {
    heart: {
        name: 'Сердце',
        description: 'Восстанавливает 20 HP яйца',
        heal: 20,
        texture: 'heart',
        rarity: 'common'
    },
    clover: {
        name: 'Клевер',
        description: 'Увеличивает везение на 10',
        luckBonus: 10,
        texture: 'clover',
        rarity: 'rare'
    }
};

// Настройки дропа
export const DROP_SETTINGS = {
    baseLuck: 10,        // Начальное везение (%)
    maxLuck: 50,         // Максимальное везение (%)
    luckIncrease: 10,    // Увеличение везения от клевера
    cloverMaxLuck: 10    // Максимальное везение для выпадения клевера
};
