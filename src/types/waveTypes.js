
/**
 * Конфигурация типов врагов по минутам игры
 * Каждая минута добавляет новые типы врагов
 */
export const enemyTypesByMinute = {
    1: ['ant', 'beetle'],
    2: ['ant', 'beetle', 'mosquito'],
    3: ['ant', 'beetle', 'mosquito', 'fly'],
    4: ['ant', 'beetle', 'mosquito', 'fly', 'spider'],
    5: ['ant', 'beetle', 'mosquito', 'fly', 'spider', 'rhinoceros'],
    6: ['ant', 'beetle', 'mosquito', 'fly', 'spider', 'rhinoceros', 'bee'],
    7: ['ant', 'beetle', 'mosquito', 'fly', 'spider', 'rhinoceros', 'bee', 'butterfly'],
    8: ['ant', 'beetle', 'mosquito', 'fly', 'spider', 'rhinoceros', 'bee', 'butterfly', 'dragonfly']
};

/**
 * Веса врагов для случайного выбора
 * Чем больше вес, тем чаще появляется враг
 */
export const enemyWeights = {
    ant: 20,
    beetle: 10,
    mosquito: 6,
    fly: 4,
    spider: 2,
    rhinoceros: 2,
    bee: 8,
    butterfly: 6,
    dragonfly: 4
};

/**
 * Константы для спавна врагов
 */
export const SPAWN_CONSTANTS = {
    RETRY_DELAY: 500,                    // Задержка при достижении лимита врагов
    SPAWN_MARGIN: 50,                    // Отступ от края экрана для спавна
    SPAWN_SIDES: 3,                      // Количество сторон для спавна (0-3)
    SPAWN_RATE_MULTIPLIER: 10,           // Множитель для ускорения спавна
    HEALTH_MULTIPLIER: 5,                // Множитель для здоровья врагов
    DAMAGE_MULTIPLIER: 4,                // Множитель для урона врагов
    SPEED_MULTIPLIER: 3                  // Множитель для скорости врагов
};

/**
 * Константы для системы усиления врагов
 */
export const ENHANCEMENT_CONSTANTS = {
    // Временные интервалы (в миллисекундах)
    MINUTE_MS: 60000,                    // 1 минута в миллисекундах
    
    // Вероятности усиления (в процентах)
    EARLY_GAME_WEIGHTS: { normal: 95, elite: 5, champion: 0 },      // 0-2 минуты
    MID_GAME_WEIGHTS: { normal: 80, elite: 15, champion: 5 },       // 2-5 минут
    LATE_GAME_WEIGHTS: { normal: 70, elite: 20, champion: 10 },     // 5+ минут
    
    // Цвета тинтов удалены (визуальные эффекты не используются)
    
    // Множители усиления
    MULTIPLIERS: {
        NORMAL: 1,
        ELITE: 2,
        CHAMPION: 3
    },
    
    // Веса для случайного выбора
    WEIGHTS: {
        NORMAL: 70,
        ELITE: 25,
        CHAMPION: 5
    },
    
    // Максимальное значение для случайности
    RANDOM_MAX: 100
};
