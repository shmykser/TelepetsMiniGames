/**
 * Игровые константы
 * Все магические числа должны быть вынесены сюда
 */

// Физические константы
export const PHYSICS_CONSTANTS = {
    // Базовые скорости
    BASE_SPEED: 10,
    BASE_DRAG: 100,
    BASE_BOUNCE: 0.2,
    
    // Размеры объектов
    DEFAULT_TEXTURE_SIZE: 32,
    BASE_ENEMY_SIZE: 10,
    EGG_SIZE: 20,
    
    // Сопротивление для разных объектов
    EGG_DRAG: 1000,
    EGG_BOUNCE: 0.1,
    ENEMY_DRAG: 100,
    
    // Размеры для HealthBar
    HEALTH_BAR_HEIGHT: 6,
    HEALTH_BAR_OFFSET: 5,
    EGG_HEALTH_BAR_OFFSET: 15,
    
    // Константы для врагов
    ENEMY_BOUNCE: 0.1,
    ENEMY_DRAG_X: 50,
    ENEMY_DRAG_Y: 50,
    ENEMY_CHASE_TIMEOUT: 3000, // 3 секунды в миллисекундах
    ENEMY_DETECTION_RANGE: 150, // радиус обнаружения игрока
    ENEMY_ATTACK_RANGE_DEFAULT: 40, // радиус атаки по умолчанию
    
    // Базовые константы для всех объектов
    DEFAULT_ATTACK_RANGE: 50,
    DEFAULT_BOUNCE: 0.2,
    DEFAULT_DRAG: 100
};

// Цвета
export const COLORS = {
    // Цвета здоровья
    HEALTH_GREEN: 0x00ff00,
    HEALTH_YELLOW: 0xffff00,
    HEALTH_RED: 0xff0000,
    
    // Цвета урона
    DAMAGE_RED: 0xff0000,
    DAMAGE_WHITE: 0xffffff,
    
    // Цвета предметов
    HEART_COLOR: 0xff69b4,
    CLOVER_COLOR: 0x00ff00,
    
    // Цвета волн
    WAVE_GREEN: 0x00ff00,
    WAVE_ORANGE: 0xffaa00,
    WAVE_DARK_ORANGE: 0xff6600,
    WAVE_RED: 0xff0000,
    
    // Цвета таймера
    TIMER_GREEN: '#00ff00',
    TIMER_ORANGE: '#ffaa00',
    TIMER_RED: '#ff0000',
    
    // Базовые цвета
    WHITE: 0xffffff,
    BLACK: 0x000000,
    GRAY: 0x6b7280,
    DARK_GRAY: 0x374151,
    YELLOW: 0xfbbf24,
    RED: 0xdc2626,
    GREEN: 0x16a34a
};


// Настройки урона
export const DAMAGE_CONSTANTS = {
    TAP_DAMAGE: 5,
    CRITICAL_DAMAGE: 25,
    EXPLOSION_DAMAGE: 15,
    WAVE_DAMAGE: 8,
    CRUSH_DAMAGE: 12
};

// Настройки эффектов
export const EFFECT_CONSTANTS = {
    EXPLOSION_RADIUS: 100,
    WAVE_RANGE: 150,
    CRUSH_SLOW: 0.5,
    LIFT_FORCE: 200,
    FREEZE_DURATION: 2000,
    SHIELD_DURATION: 5000,
    SHIELD_STRENGTH: 50
};

// Настройки предметов
export const ITEM_CONSTANTS = {
    DROP_BASE_LUCK: 5,
    DROP_MAX_LUCK: 25,
    DROP_LUCK_INCREASE: 5,
    ITEM_DEPTH: 1000,
    ITEM_SCALE: 0.8,
    ITEM_BODY_SCALE: 0.8,
    PARTICLE_COUNT: 8,
    PARTICLE_SIZE: 3,
    PARTICLE_SPREAD: 20,
    PARTICLE_DURATION: 500,
    // Настройки для ItemDropSystem
    AUTO_REMOVE_DELAY: 10000,        // Автоудаление предмета через 10 секунд
    HEART_HEAL_AMOUNT: 20,           // Количество лечения от сердца
    LUCK_TEXT_X: 200,                // X позиция текста удачи
    LUCK_TEXT_Y: 50,                 // Y позиция текста удачи
    EFFECT_TEXT_Y: 100               // Y позиция текста эффекта
};

// Константы для UI компонентов
export const UI_CONSTANTS = {
    BUTTON: {
        DEFAULT_WIDTH: 200,
        DEFAULT_HEIGHT: 50,
        DEFAULT_FONT_SIZE: '16px',
        DEFAULT_FONT_FAMILY: 'Arial',
        DEFAULT_BORDER_RADIUS: 5,
        DEFAULT_PADDING: 10,
        DEFAULT_HOVER_SCALE: 1.05,
        DEFAULT_CLICK_SCALE: 0.95,
        DEFAULT_BACKGROUND_COLOR: 0x4a4a4a,
        DEFAULT_TEXT_COLOR: '#ffffff'
    },
    DAMAGE_INDICATOR: {
        DEFAULT_DURATION: 1000,
        DEFAULT_DRIFT_DISTANCE: 50,
        DEFAULT_FONT_SIZE: '18px',
        DEFAULT_COLOR: '#ff0000',
        DEFAULT_STROKE_COLOR: '#ffffff',
        DEFAULT_STROKE_THICKNESS: 2,
        DEFAULT_FONT_FAMILY: 'Arial',
        DEFAULT_FONT_STYLE: 'bold',
        DEFAULT_APPEAR_DURATION: 200,
        DEFAULT_PULSE_DURATION: 150,
        DEFAULT_PULSE_REPEAT: 2
    },
    GAME_TIMER: {
        DEFAULT_UPDATE_INTERVAL: 100,
        DEFAULT_WARNING_TIME: 60000,  // 1 минута
        DEFAULT_CRITICAL_TIME: 30000, // 30 секунд
        DEFAULT_PADDING_X: 15,
        DEFAULT_PADDING_Y: 8
    }
};

// Настройки таймера
export const TIMER_CONSTANTS = {
    UPDATE_INTERVAL: 100,
    WARNING_TIME: 60000,
    CRITICAL_TIME: 30000
};

// Настройки движения
export const MOVEMENT_CONSTANTS = {
    BASE_SPEED: 10,
    ENERGY: 100,
    AGGRESSION: 0,
    SEASON_DURATION: 10000,
    SEASONAL_INTENSITY: [0.2, 0.8, 0.5, 0.1] // весна, лето, осень, зима
};

// Настройки врагов
export const ENEMY_CONSTANTS = {
    RHINOCEROS: {
        CHARGE_COOLDOWN: 4000,
        CHARGE_SPEED: 15.0,
        RAMMING_POWER: 2.0
    }
};

// Настройки жестов
export const GESTURE_CONSTANTS = {
    TAP: {
        MAX_DURATION: 200,      // Максимальная длительность тапа (мс)
        MAX_DISTANCE: 10        // Максимальное расстояние для тапа (пиксели)
    },
    DOUBLE_TAP: {
        MAX_INTERVAL: 300,      // Максимальный интервал между тапами (мс)
        MAX_DISTANCE: 20        // Максимальное расстояние между тапами (пиксели)
    },
    LONG_TAP: {
        MIN_DURATION: 500,      // Минимальная длительность долгого тапа (мс)
        MAX_DISTANCE: 10        // Максимальное расстояние для долгого тапа (пиксели)
    },
    SWIPE: {
        MIN_DISTANCE: 50,       // Минимальное расстояние для свайпа (пиксели)
        MAX_DURATION: 300,      // Максимальная длительность свайпа (мс)
        MIN_VELOCITY: 0.3       // Минимальная скорость для свайпа (пиксели/мс)
    },
    // Дополнительные константы для действий
    EGG_PROTECTION: {
        SHIELD_AMOUNT: 5        // Количество защиты для яйца
    },
    EGG_HEALING: {
        HEAL_AMOUNT: 20         // Количество лечения для яйца
    }
};

// Визуальные эффекты для игровых объектов
export const VISUAL_EFFECTS = {
    DAMAGE_INDICATOR: {
        DURATION: 1500,
        DRIFT_DISTANCE: 60,
        FONT_SIZE: 28,
        COLOR: 0xff0000,
        STROKE_COLOR: 0xffffff,
        STROKE_THICKNESS: 3
    },
    DEATH_ANIMATION: {
        ALPHA: 0.3,
        SCALE: 0.5,
        TINT: 0x666666,
        DURATION: 500
    },
    SHAKE: {
        DURATION: 200,
        INTENSITY: 5
    },
    PULSE: {
        SCALE: 1.2,
        DURATION: 300
    },
    DAMAGE_TINT: {
        COLOR: 0xff0000,
        DURATION: 100
    }
};
