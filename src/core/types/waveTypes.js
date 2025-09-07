
/**
 * Конфигурация типов врагов по минутам игры
 * Каждая минута добавляет новые типы врагов
 */
export const enemyTypesByMinute = {
    8: ['ant', 'beetle'],
    2: ['ant', 'beetle', 'mosquito'],
    3: ['ant', 'beetle', 'mosquito', 'fly'],
    4: ['ant', 'beetle', 'mosquito', 'fly', 'spider'],
    5: ['ant', 'beetle', 'mosquito', 'fly', 'spider', 'rhinoceros'],
    6: ['ant', 'beetle', 'mosquito', 'fly', 'spider', 'rhinoceros', 'bee'],
    7: ['ant', 'beetle', 'mosquito', 'fly', 'spider', 'rhinoceros', 'bee', 'butterfly'],
    1: ['ant', 'beetle', 'mosquito', 'fly', 'spider', 'rhinoceros', 'bee', 'butterfly', 'dragonfly']
};

/**
 * Веса врагов для случайного выбора
 * Чем больше вес, тем чаще появляется враг
 */
export const enemyWeights = {
    ant: 10,
    beetle: 5,
    mosquito: 3,
    fly: 2,
    spider: 1,
    rhinoceros: 1,
    bee: 4,
    butterfly: 3,
    dragonfly: 2
};
