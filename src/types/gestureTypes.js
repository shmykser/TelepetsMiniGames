/**
 * Типы жестов и действий
 */
import { DAMAGE_CONSTANTS, EFFECT_CONSTANTS, GESTURE_CONSTANTS } from '../constants/GameConstants.js';

// Типы целей
export const TARGET_TYPES = {
    ENEMY: 'enemy',
    EGG: 'egg',
    FIELD: 'field',
    DEFENSE: 'defense',
    ITEM: 'item'
};

// Действия по жестам
export const GESTURE_ACTIONS = {
    // Тап по врагу - нанести урон
    'tap_enemy': {
        name: 'damage_enemy',
        description: 'Нанести урон врагу',
        damage: DAMAGE_CONSTANTS.TAP_DAMAGE
    },
    
    // Тап по яйцу - защитить
    'tap_egg': {
        name: 'protect_egg',
        description: 'Защитить яйцо',
        shield: GESTURE_CONSTANTS.EGG_PROTECTION.SHIELD_AMOUNT
    },
    
    // Тап по предмету - собрать
    'tap_item': {
        name: 'collect_item',
        description: 'Собрать предмет'
    },
    
    // Тап по полю - создать защиту
    'tap_field': {
        name: 'place_defense',
        description: 'Установить защиту',
        defenseType: 'barrier'
    },
    
    // Двойной тап по врагу - критический урон
    'doubleTap_enemy': {
        name: 'critical_damage',
        description: 'Критический урон врагу',
        damage: DAMAGE_CONSTANTS.CRITICAL_DAMAGE,
        critical: true
    },
    
    // Двойной тап по яйцу - лечение
    'doubleTap_egg': {
        name: 'heal_egg',
        description: 'Лечить яйцо',
        heal: GESTURE_CONSTANTS.EGG_HEALING.HEAL_AMOUNT
    },
    
    // Двойной тап по полю - взрыв
    'doubleTap_field': {
        name: 'explosion',
        description: 'Взрыв в области',
        radius: EFFECT_CONSTANTS.EXPLOSION_RADIUS,
        damage: DAMAGE_CONSTANTS.EXPLOSION_DAMAGE
    },
    
    // Долгий тап по врагу - заморозка
    'longTap_enemy': {
        name: 'freeze_enemy',
        description: 'Заморозить врага',
        freezeDuration: EFFECT_CONSTANTS.FREEZE_DURATION
    },
    
    // Долгий тап по яйцу - щит
    'longTap_egg': {
        name: 'shield_egg',
        description: 'Создать щит для яйца',
        shieldDuration: EFFECT_CONSTANTS.SHIELD_DURATION,
        shieldStrength: EFFECT_CONSTANTS.SHIELD_STRENGTH
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
        damage: DAMAGE_CONSTANTS.WAVE_DAMAGE,
        range: EFFECT_CONSTANTS.WAVE_RANGE
    },
    
    // Свайп вправо - волна урона
    'swipe_right': {
        name: 'damage_wave',
        description: 'Волна урона вправо',
        direction: 'right',
        damage: DAMAGE_CONSTANTS.WAVE_DAMAGE,
        range: EFFECT_CONSTANTS.WAVE_RANGE
    },
    
    // Свайп вверх - подъем
    'swipe_up': {
        name: 'lift_effect',
        description: 'Поднять врагов',
        direction: 'up',
        force: EFFECT_CONSTANTS.LIFT_FORCE
    },
    
    // Свайп вниз - придавить
    'swipe_down': {
        name: 'crush_effect',
        description: 'Придавить врагов',
        direction: 'down',
        damage: DAMAGE_CONSTANTS.CRUSH_DAMAGE,
        slow: EFFECT_CONSTANTS.CRUSH_SLOW
    }
};

// Настройки целей
export const TARGET_SETTINGS = {
    enemy: {
        missTolerance: 10,           // Максимальный промах в пикселях
        priority: 1
    },
    egg: {
        missTolerance: 10,           // Максимальный промах в пикселях
        priority: 2
    },
    field: {
        missTolerance: 0,            // Нет толерантности для поля
        priority: 0
    },
    defense: {
        missTolerance: 10,           // Максимальный промах в пикселях
        priority: 1
    },
    item: {
        missTolerance: 25,           // Максимальный промах в пикселях
        priority: 3
    }
};
