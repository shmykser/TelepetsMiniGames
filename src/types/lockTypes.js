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
                timeLimit: 0 // Без ограничения времени
            },
            2: {
                pins: 2,
                indicatorSpeed: 2.0,
                tolerance: 20,
                maxAttempts: 3,
                timeLimit: 0
            },
            3: {
                pins: 3,
                indicatorSpeed: 2.5,
                tolerance: 15,
                maxAttempts: 4,
                timeLimit: 0
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
                maxAttempts: 3
            },
            2: {
                mazeSize: 7, // 7x7
                ballSpeed: 180,
                timeLimit: 45,
                maxAttempts: 3
            },
            3: {
                mazeSize: 9, // 9x9
                ballSpeed: 160,
                timeLimit: 60,
                maxAttempts: 4
            }
        }
    },
    
    [LOCK_TYPES.PATTERN]: {
        name: 'Паттерн-замок',
        emoji: '🎯',
        description: 'Соединить точки без пересечений',
        difficulty: {
            1: {
                points: 4, // 2x2 сетка
                timeLimit: 20,
                maxAttempts: 3,
                showPattern: true // Показать правильный паттерн
            },
            2: {
                points: 6, // 2x3 сетка
                timeLimit: 30,
                maxAttempts: 3,
                showPattern: false
            },
            3: {
                points: 9, // 3x3 сетка
                timeLimit: 45,
                maxAttempts: 4,
                showPattern: false
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

