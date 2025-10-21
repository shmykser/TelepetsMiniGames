/**
 * Типы и конфигурации для открытого мира Pet Thief
 */

// Типы биомов
export const BIOME_TYPES = {
    FOREST: 'forest',
    DESERT: 'desert',
    SNOW: 'snow',
    PLAINS: 'plains'
};

// Визуальные свойства биомов
export const BIOME_VISUALS = {
    [BIOME_TYPES.FOREST]: {
        name: 'Лес',
        backgroundColor: 0x2d5016, // Темно-зеленый
        tintColor: 0x4a7c2e, // Зеленый оттенок
        grassTexture: 'grass', // Используем существующий травяной фон
        obstacleTypes: ['tree', 'bush', 'stone'],
        emoji: '🌲'
    },
    [BIOME_TYPES.DESERT]: {
        name: 'Пустыня',
        backgroundColor: 0xdaa520, // Золотисто-коричневый
        tintColor: 0xf4a460, // Песочный оттенок
        grassTexture: 'grass', // Будет затонирован
        obstacleTypes: ['cactus', 'stone', 'bones'],
        emoji: '🏜️'
    },
    [BIOME_TYPES.SNOW]: {
        name: 'Снежные равнины',
        backgroundColor: 0xe0f0ff, // Светло-голубой
        tintColor: 0xffffff, // Белый
        grassTexture: 'grass', // Будет затонирован
        obstacleTypes: ['tree', 'stone', 'snowdrift'],
        emoji: '❄️'
    },
    [BIOME_TYPES.PLAINS]: {
        name: 'Поля',
        backgroundColor: 0x7cbe54, // Светло-зеленый
        tintColor: 0x90d65f, // Яркий зеленый
        grassTexture: 'grass',
        obstacleTypes: ['bush', 'flower', 'stone'],
        emoji: '🌾'
    }
};

// Размер мира
export const WORLD_SIZE = {
    width: 3000,
    height: 3000
};

// Настройки генерации мира
export const WORLD_GENERATION = {
    // Seed генерируется на основе даты для 24-часового цикла
    getSeed: () => {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    },
    
    // Количество жилищ на карте
    HOUSES: {
        MIN: 3,
        MAX: 8
    },
    
    // Количество монет на карте
    COINS: {
        MIN: 20,
        MAX: 50
    },
    
    // Количество препятствий
    OBSTACLES: {
        MIN: 30,
        MAX: 60
    },
    
    // Минимальное расстояние между важными объектами
    MIN_DISTANCE_BETWEEN_HOUSES: 400,
    MIN_DISTANCE_FROM_PLAYER: 300,
    
    // Размер зоны игрока (безопасная зона вокруг стартовой позиции)
    PLAYER_SAFE_ZONE_RADIUS: 200
};

// Типы препятствий
export const OBSTACLE_TYPES = {
    TREE: {
        texture: '🌲',
        spriteKey: null, // Используем эмодзи
        size: 2,
        collision: true
    },
    BUSH: {
        texture: '🌳',
        spriteKey: null,
        size: 1.5,
        collision: true
    },
    STONE: {
        texture: '🪨',
        spriteKey: 'stone',
        size: 1,
        collision: true
    },
    CACTUS: {
        texture: '🌵',
        spriteKey: null,
        size: 1.5,
        collision: true
    },
    FLOWER: {
        texture: '🌻',
        spriteKey: null,
        size: 1,
        collision: false
    },
    SNOWDRIFT: {
        texture: '⛄',
        spriteKey: null,
        size: 1.5,
        collision: true
    },
    BONES: {
        texture: '🦴',
        spriteKey: null,
        size: 1,
        collision: false
    }
};

// Свойства питомца
export const PET_CONFIG = {
    DEFAULT_SPEED: 150,
    DEFAULT_HEALTH: 100,
    DEFAULT_SIZE: 2,
    TEXTURE: '🐾',
    SPRITE_KEY: 'pet',
    
    // Инвентарь по умолчанию
    DEFAULT_INVENTORY: {
        coins: 0,
        jewels: 0,
        keys: 20,
        lockpicks: 20,
        treasures: []
    },
    
    // Навыки по умолчанию
    DEFAULT_SKILLS: {
        lockpicking: 0,
        stealth: 0,
        tracking: 0
    }
};

// Константы для мира
export const WORLD_CONSTANTS = {
    // Глубина отображения (добавляем к существующим DEPTH_CONSTANTS)
    DEPTH: {
        BACKGROUND: -100,
        WORLD_OBJECTS: 0,
        OBSTACLES: 10,
        ITEMS: 15,
        HOUSES: 20,
        PET: 30,
        UI: 1000
    },
    
    // Настройки камеры
    CAMERA: {
        FOLLOW_LERP: 0.1, // Плавность следования (0-1, меньше = плавнее)
        ZOOM: 1,
        ROUND_PIXELS: false // Не округлять пиксели для плавного движения
    }
};

/**
 * Генерирует случайную позицию в мире
 * @param {number} margin - Отступ от краев
 * @returns {{x: number, y: number}}
 */
export function generateRandomPosition(margin = 100) {
    return {
        x: margin + Math.random() * (WORLD_SIZE.width - margin * 2),
        y: margin + Math.random() * (WORLD_SIZE.height - margin * 2)
    };
}

/**
 * Проверяет, достаточно ли далеко новая позиция от существующих
 * @param {{x: number, y: number}} newPos - Новая позиция
 * @param {Array<{x: number, y: number}>} existingPositions - Существующие позиции
 * @param {number} minDistance - Минимальное расстояние
 * @returns {boolean}
 */
export function isPositionValid(newPos, existingPositions, minDistance) {
    for (const pos of existingPositions) {
        const dx = newPos.x - pos.x;
        const dy = newPos.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
            return false;
        }
    }
    return true;
}

/**
 * Генерирует валидную позицию с учетом минимального расстояния
 * @param {Array<{x: number, y: number}>} existingPositions - Существующие позиции
 * @param {number} minDistance - Минимальное расстояние
 * @param {number} maxAttempts - Максимальное количество попыток
 * @returns {{x: number, y: number}|null}
 */
export function generateValidPosition(existingPositions, minDistance, maxAttempts = 100) {
    for (let i = 0; i < maxAttempts; i++) {
        const pos = generateRandomPosition();
        if (isPositionValid(pos, existingPositions, minDistance)) {
            return pos;
        }
    }
    return null;
}

