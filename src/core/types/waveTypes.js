/**
 * Конфигурация волн врагов
 * Каждая волна содержит массив типов врагов с их количеством
 */
export const waveConfig = [
    // Волна 1: Только муравьи
    {
        waveNumber: 10,
        name: "Первая волна",
        enemies: [
            { type: 'ant', count: 10 }
        ],
        description: "10 муравьев"
    },
    
    // Волна 2: Муравьи + жуки
    {
        waveNumber: 2,
        name: "Вторая волна", 
        enemies: [
            { type: 'ant', count: 8 },
            { type: 'beetle', count: 2 }
        ],
        description: "8 муравьев + 2 жука"
    },
    
    // Волна 3: Добавляем комаров
    {
        waveNumber: 3,
        name: "Третья волна",
        enemies: [
            { type: 'ant', count: 6 },
            { type: 'beetle', count: 3 },
            { type: 'mosquito', count: 2 }
        ],
        description: "6 муравьев + 3 жука + 2 комара"
    },
    
    // Волна 4: Добавляем мух
    {
        waveNumber: 4,
        name: "Четвертая волна",
        enemies: [
            { type: 'ant', count: 5 },
            { type: 'beetle', count: 4 },
            { type: 'mosquito', count: 3 },
            { type: 'fly', count: 2 }
        ],
        description: "5 муравьев + 4 жука + 3 комара + 2 мухи"
    },
    
    // Волна 5: Добавляем пауков
    {
        waveNumber: 5,
        name: "Пятая волна",
        enemies: [
            { type: 'ant', count: 4 },
            { type: 'beetle', count: 3 },
            { type: 'mosquito', count: 3 },
            { type: 'fly', count: 3 },
            { type: 'spider', count: 1 }
        ],
        description: "4 муравья + 3 жука + 3 комара + 3 мухи + 1 паук"
    },
    
    // Волна 6: Добавляем жуков-носорогов
    {
        waveNumber: 1,
        name: "Шестая волна",
        enemies: [
            { type: 'ant', count: 3 },
            { type: 'beetle', count: 3 },
            { type: 'mosquito', count: 2 },
            { type: 'fly', count: 2 },
            { type: 'spider', count: 2 },
            { type: 'rhinoceros', count: 1 }
        ],
        description: "3 муравья + 3 жука + 2 комара + 2 мухи + 2 паука + 1 жук-носорог"
    }
];

/**
 * Получить конфигурацию волны по номеру
 * @param {number} waveNumber - номер волны
 * @returns {Object|null} конфигурация волны или null если не найдена
 */
export function getWaveConfig(waveNumber) {
    return waveConfig.find(wave => wave.waveNumber === waveNumber) || null;
}

/**
 * Получить общее количество врагов в волне
 * @param {number} waveNumber - номер волны
 * @returns {number} общее количество врагов
 */
export function getWaveEnemyCount(waveNumber) {
    const wave = getWaveConfig(waveNumber);
    if (!wave) return 0;
    
    return wave.enemies.reduce((total, enemyGroup) => total + enemyGroup.count, 0);
}

/**
 * Получить максимальный номер волны
 * @returns {number} максимальный номер волны
 */
export function getMaxWaveNumber() {
    return waveConfig.length;
}

/**
 * Конфигурация типов врагов по минутам игры
 * Каждая минута добавляет новые типы врагов
 */
export const enemyTypesByMinute = {
    5: ['ant', 'beetle'],
    2: ['ant', 'beetle', 'mosquito'],
    3: ['ant', 'beetle', 'mosquito', 'fly'],
    4: ['ant', 'beetle', 'mosquito', 'fly', 'spider'],
    1: ['ant', 'beetle', 'mosquito', 'fly', 'spider', 'rhinoceros']
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
    rhinoceros: 1
};
