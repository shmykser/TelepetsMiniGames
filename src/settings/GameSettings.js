/**
 * Игровые константы и настройки
 * Все настройки Phaser и игрового процесса
 */


// ========== НАСТРОЙКИ PHASER ==========

// Основные настройки приложения Phaser
export const PHASER_SETTINGS = {
    width: 360,
    height: 640,
    backgroundColor: 0x0b1221,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    responsive: {
        minWidth: 320,
        minHeight: 480,
        maxWidth: 800,
        maxHeight: 1200
    }
};

// ========== НАСТРОЙКИ ИГРЫ ==========


// Настройки фона
export const BACKGROUND_SETTINGS = {
    tileSize: 64,
    animate: true,
    animation: {
        speedX: 8,
        speedY: 4,
        duration: 20000
    }
};


// ========== КОНСТАНТЫ ==========

// Физические константы
export const PHYSICS_CONSTANTS = {
    // Размеры объектов
    DEFAULT_TEXTURE_SIZE: 32,
    BASE_ENEMY_SIZE: 10,
    EGG_SIZE: 20,
    
    // Сопротивление для яйца
    EGG_DRAG: 1000,
    EGG_BOUNCE: 0.1,
    
    // Размеры для HealthBar
    HEALTH_BAR_OFFSET: 5,
    EGG_HEALTH_BAR_OFFSET: 15,
    
    // Константы для врагов
    ENEMY_BOUNCE: 0.1,
    ENEMY_DRAG_X: 50,
    ENEMY_DRAG_Y: 50,
    ENEMY_ATTACK_RANGE_DEFAULT: 40,
    
    // Базовые константы для всех объектов
    DEFAULT_BOUNCE: 0.2,
    DEFAULT_DRAG: 100
};

// Цвета
export const COLORS = {
    // Цвета здоровья
    HEALTH_GREEN: 0x00ff00,
    HEALTH_YELLOW: 0xffff00,
    HEALTH_RED: 0xff0000,
    
    // Базовые цвета
    WHITE: 0xffffff,
    BLACK: 0x000000,
    GRAY: 0x6b7280,
    DARK_GRAY: 0x374151,
    YELLOW: 0xfbbf24,
    RED: 0xdc2626,
    GREEN: 0x16a34a
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




