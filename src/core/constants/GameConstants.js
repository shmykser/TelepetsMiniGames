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
    ENEMY_DRAG: 100,
    
    // Размеры для HealthBar
    HEALTH_BAR_HEIGHT: 6,
    HEALTH_BAR_OFFSET: 5,
    EGG_HEALTH_BAR_OFFSET: 15
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
    BLACK: 0x000000
};

// Настройки жестов
export const GESTURE_CONSTANTS = {
    TAP: {
        MAX_DURATION: 200,
        MAX_DISTANCE: 10
    },
    DOUBLE_TAP: {
        MAX_INTERVAL: 300,
        MAX_DISTANCE: 20
    },
    LONG_TAP: {
        MIN_DURATION: 500,
        MAX_DISTANCE: 10
    },
    SWIPE: {
        MIN_DISTANCE: 50,
        MAX_DURATION: 300,
        MIN_VELOCITY: 0.3
    }
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
    ITEM_DEPTH: 1000
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

// Настройки UI
export const UI_CONSTANTS = {
    DAMAGE_INDICATOR: {
        DEFAULT_DURATION: 1000,
        DEFAULT_DRIFT: 50,
        DEFAULT_FONT_SIZE: 24,
        DEFAULT_COLOR: 0xff0000,
        DEFAULT_STROKE: 0x000000,
        DEFAULT_STROKE_THICKNESS: 2
    }
};
