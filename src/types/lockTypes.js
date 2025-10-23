/**
 * Типы и конфигурации замков для Pet Thief
 */

// Типы замков
export const LOCK_TYPES = {
    SIMPLE: 'simple',
    MAZE: 'maze', 
    PATTERN: 'pattern'
};

// Конфигурации замков
export const LOCK_CONFIGS = {
    [LOCK_TYPES.SIMPLE]: {
        name: 'Простой замок',
        emoji: '🔓',
        description: 'Подбор пинов',
        difficulty: {
            1: {
                pins: 1,
                indicatorSpeed: 1.5,
                tolerance: 25,
                maxAttempts: 3,
                timeLimit: 0, // Без ограничения времени
                
                // НОВЫЕ МЕХАНИКИ УСЛОЖНЕНИЯ
                twoPhaseMode: false, // Двухфазные пины (зеленая + желтая зона)
                yellowTolerance: 15, // Размер желтой зоны (если twoPhaseMode = true)
                resetOnFail: false, // Сброс на первый пин при неудаче
                shrinkingZone: false, // Зона уменьшается при неудаче
                shrinkAmount: 3, // На сколько пикселей уменьшается зона
                minTolerance: 10 // Минимальный размер зоны
            },
            2: {
                pins: 2,
                indicatorSpeed: 2.0,
                tolerance: 20,
                maxAttempts: 3,
                timeLimit: 0,
                
                // Усложнение для среднего уровня
                twoPhaseMode: true, // Включаем двухфазный режим
                yellowTolerance: 12,
                resetOnFail: false, // Пока не сбрасываем
                shrinkingZone: true, // Включаем уменьшение зоны
                shrinkAmount: 3,
                minTolerance: 8
            },
            3: {
                pins: 3,
                indicatorSpeed: 2.5,
                tolerance: 15,
                maxAttempts: 4,
                timeLimit: 0,
                
                // Максимальное усложнение
                twoPhaseMode: true,
                yellowTolerance: 10,
                resetOnFail: true, // Сброс на первый пин!
                shrinkingZone: true,
                shrinkAmount: 2,
                minTolerance: 6
            }
        }
    },
    
    [LOCK_TYPES.MAZE]: {
        name: 'Лабиринт-замок',
        emoji: '🧩',
        description: 'Провести шарик через лабиринт',
        difficulty: {
            1: {
                mazeSize: 5, // 5x5
                ballSpeed: 200,
                timeLimit: 30, // 30 секунд
                maxAttempts: 3,
                
                // НОВЫЕ МЕХАНИКИ УСЛОЖНЕНИЯ
                keys: 0, // Количество ключей для сбора (0 = не нужны)
                enemies: 0, // Количество патрулирующих врагов
                enemySpeed: 80, // Скорость врагов
                portals: 0, // Количество ловушек-порталов
                portalDuration: 3000, // Время существования портала (мс)
                portalInterval: 5000, // Интервал появления новых порталов (мс)
                fogOfWar: false, // Туман войны
                fogRadius: 3 // Радиус видимости в клетках (если fogOfWar = true)
            },
            2: {
                mazeSize: 7, // 7x7
                ballSpeed: 180,
                timeLimit: 60, // Увеличил время из-за ключей
                maxAttempts: 3,
                
                // Усложнение для среднего уровня
                keys: 2, // Нужно собрать 2 ключа
                enemies: 1, // 1 враг
                enemySpeed: 70,
                portals: 2, // 2 портала (1 пара)
                portalDuration: 4000,
                portalInterval: 6000,
                fogOfWar: false, // Пока без тумана
                fogRadius: 3
            },
            3: {
                mazeSize: 9, // 9x9
                ballSpeed: 160,
                timeLimit: 90, // Увеличил время
                maxAttempts: 4,
                
                // Максимальное усложнение
                keys: 3, // 3 ключа!
                enemies: 2, // 2 врага
                enemySpeed: 60,
                portals: 2, // 2 портала (1 пары)
                portalDuration: 10000, // Порталы живут 10 секунд
                portalInterval: 12000, // Новые порталы каждые 12 секунд
                fogOfWar: false, // ТУМАН ВОЙНЫ!
                fogRadius: 2 // Маленький радиус видимости
            }
        }
    },
    
    [LOCK_TYPES.PATTERN]: {
        name: 'Паттерн-замок',
        emoji: '🎯',
        description: 'Соединить пары без пересечений',
        difficulty: {
            1: {
                gridSize: 4, // 4x4 сетка
                pairs: 3, // 3 пары точек
                timeLimit: 300, // 5 минут для тестирования
                maxAttempts: 10
            },
            2: {
                gridSize: 5, // 5x5 сетка
                pairs: 5, // 5 пар точек
                timeLimit: 300, // 5 минут для тестирования
                maxAttempts: 10
            },
            3: {
                gridSize: 7, // 7x7 сетка
                pairs: 7, // 7 пар точек
                timeLimit: 300, // 5 минут для тестирования
                maxAttempts: 10
            }
        }
    }
};

// Уровни сложности замков
export const LOCK_LEVELS = {
    EASY: 1,
    MEDIUM: 2,
    HARD: 3
};

// Стоимость взлома (в отмычках)
export const LOCK_COST = {
    [LOCK_LEVELS.EASY]: 1,
    [LOCK_LEVELS.MEDIUM]: 2,
    [LOCK_LEVELS.HARD]: 3
};

// Шансы успеха для разных типов замков
export const LOCK_SUCCESS_RATES = {
    [LOCK_TYPES.SIMPLE]: {
        [LOCK_LEVELS.EASY]: 0.8,   // 80% шанс успеха
        [LOCK_LEVELS.MEDIUM]: 0.6, // 60% шанс успеха
        [LOCK_LEVELS.HARD]: 0.4    // 40% шанс успеха
    },
    [LOCK_TYPES.MAZE]: {
        [LOCK_LEVELS.EASY]: 0.7,
        [LOCK_LEVELS.MEDIUM]: 0.5,
        [LOCK_LEVELS.HARD]: 0.3
    },
    [LOCK_TYPES.PATTERN]: {
        [LOCK_LEVELS.EASY]: 0.9,
        [LOCK_LEVELS.MEDIUM]: 0.7,
        [LOCK_LEVELS.HARD]: 0.5
    }
};

// Генерация случайного типа замка
export function getRandomLockType() {
    const types = Object.values(LOCK_TYPES);
    return types[Math.floor(Math.random() * types.length)];
}

// Генерация случайного уровня сложности
export function getRandomLockLevel() {
    const levels = Object.values(LOCK_LEVELS);
    return levels[Math.floor(Math.random() * levels.length)];
}

// Получить конфигурацию замка
export function getLockConfig(type, level) {
    return LOCK_CONFIGS[type]?.difficulty[level] || null;
}

// Получить стоимость взлома
export function getLockCost(level) {
    return LOCK_COST[level] || 1;
}

// Получить шанс успеха
export function getLockSuccessRate(type, level) {
    return LOCK_SUCCESS_RATES[type]?.[level] || 0.5;
}

