/**
 * Типы жестов и действий
 */

// Типы жестов
export const GESTURE_TYPES = {
    TAP: 'tap',
    DOUBLE_TAP: 'doubleTap', 
    LONG_TAP: 'longTap',
    SWIPE: 'swipe'
};

// Типы целей
export const TARGET_TYPES = {
    ENEMY: 'enemy',
    EGG: 'egg',
    FIELD: 'field',
    DEFENCE: 'defence',
    ITEM: 'item'
};

// Направления свайпа
export const SWIPE_DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right'
};

// Действия по жестам
export const GESTURE_ACTIONS = {
    // Тап по врагу - нанести урон
    'tap_enemy': {
        name: 'damage_enemy',
        description: 'Нанести урон врагу',
        damage: 10
    },
    
    // Тап по яйцу - защитить
    'tap_egg': {
        name: 'protect_egg',
        description: 'Защитить яйцо',
        shield: 5
    },
    
    // Тап по предмету - собрать
    'tap_item': {
        name: 'collect_item',
        description: 'Собрать предмет'
    },
    
    // Тап по полю - создать защиту
    'tap_field': {
        name: 'place_defence',
        description: 'Установить защиту',
        defenceType: 'barrier'
    },
    
    // Двойной тап по врагу - критический урон
    'doubleTap_enemy': {
        name: 'critical_damage',
        description: 'Критический урон врагу',
        damage: 25,
        critical: true
    },
    
    // Двойной тап по яйцу - лечение
    'doubleTap_egg': {
        name: 'heal_egg',
        description: 'Лечить яйцо',
        heal: 20
    },
    
    // Двойной тап по полю - взрыв
    'doubleTap_field': {
        name: 'explosion',
        description: 'Взрыв в области',
        radius: 100,
        damage: 15
    },
    
    // Долгий тап по врагу - заморозка
    'longTap_enemy': {
        name: 'freeze_enemy',
        description: 'Заморозить врага',
        freezeDuration: 2000
    },
    
    // Долгий тап по яйцу - щит
    'longTap_egg': {
        name: 'shield_egg',
        description: 'Создать щит для яйца',
        shieldDuration: 5000,
        shieldStrength: 50
    },
    
    // Долгий тап по полю - стена
    'longTap_field': {
        name: 'create_wall',
        description: 'Создать стену',
        wallType: 'barrier'
    },
    
    // Свайп влево - волна урона
    'swipe_left': {
        name: 'damage_wave',
        description: 'Волна урона влево',
        direction: 'left',
        damage: 8,
        range: 150
    },
    
    // Свайп вправо - волна урона
    'swipe_right': {
        name: 'damage_wave',
        description: 'Волна урона вправо',
        direction: 'right',
        damage: 8,
        range: 150
    },
    
    // Свайп вверх - подъем
    'swipe_up': {
        name: 'lift_effect',
        description: 'Поднять врагов',
        direction: 'up',
        force: 200
    },
    
    // Свайп вниз - придавить
    'swipe_down': {
        name: 'crush_effect',
        description: 'Придавить врагов',
        direction: 'down',
        damage: 12,
        slow: 0.5
    }
};

// Настройки жестов
export const GESTURE_SETTINGS = {
    tap: {
        maxDuration: 200,
        maxDistance: 10,
        damage: 10
    },
    doubleTap: {
        maxInterval: 300,
        maxDistance: 20,
        damage: 25,
        critical: true
    },
    longTap: {
        minDuration: 500,
        maxDistance: 10,
        specialEffect: true
    },
    swipe: {
        minDistance: 50,
        maxDuration: 300,
        minVelocity: 0.3,
        areaEffect: true
    }
};

// Настройки целей
export const TARGET_SETTINGS = {
    enemy: {
        hitRadius: 50,
        priority: 1
    },
    egg: {
        hitRadius: 30,
        priority: 2
    },
    field: {
        hitRadius: 0,
        priority: 0
    },
    defence: {
        hitRadius: 40,
        priority: 1
    }
};
