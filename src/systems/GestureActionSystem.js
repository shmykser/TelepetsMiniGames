import { GESTURE_ACTIONS, TARGET_TYPES, TARGET_SETTINGS } from '../types/gestureTypes';
import { DAMAGE_CONSTANTS, EFFECT_CONSTANTS } from '../constants/GameConstants.js';
import { GeometryUtils } from '../utils/GeometryUtils.js';

/**
 * Система обработки жестов и выполнения действий
 * Следует принципу Single Responsibility Principle
 */
export class GestureActionSystem {
    constructor(scene, enemies, defenses, egg = null, itemDropSystem = null) {
        this.scene = scene;
        this.enemies = enemies;
        this.defenses = defenses;
        this.egg = egg;
        this.itemDropSystem = itemDropSystem;
    }
    
    /**
     * Обрабатывает жест и выполняет соответствующее действие
     * @param {Object} gesture - Объект жеста от GestureSystem
     * @returns {boolean} Успешность выполнения действия
     */
    handleGesture(gesture) {
        // Определяем цель жеста
        const target = this.detectTarget(gesture.x, gesture.y);
        gesture.target = target;
        
        console.log(`🎯 Жест ${gesture.type} в точке (${gesture.x}, ${gesture.y}) → цель: ${target.type}`);
        
        // Формируем ключ действия
        const actionKey = `${gesture.type}_${target.type}`;
        const action = GESTURE_ACTIONS[actionKey];
        
        if (!action) {
            console.log(`❌ Действие ${actionKey} не найдено`);
            return false;
        }
        
        console.log(`✅ Найдено действие: ${actionKey} → ${action.name}`);
        
        // Выполняем действие
        return this.executeAction(action, gesture, target);
    }
    
    /**
     * Определяет цель жеста по координатам
     * @param {number} x - X координата жеста
     * @param {number} y - Y координата жеста
     * @returns {Object} Объект с типом цели и самим объектом
     */
    detectTarget(x, y) {
        // Проверяем предметы (приоритет 1 - самый высокий для точного клика)
        if (this.itemDropSystem && this.itemDropSystem.items) {
            console.log(`🔍 Проверяем ${this.itemDropSystem.items.length} предметов на экране`);
            
            const item = GeometryUtils.findFirstObjectInRadius(
                this.itemDropSystem.items, x, y,
                TARGET_SETTINGS.item.missTolerance,
                (item) => {
                    const itemHitRadius = GeometryUtils.calculateHitRadius(item, 'item', TARGET_SETTINGS);
                    const inRadius = GeometryUtils.isInRadius(x, y, item.x, item.y, itemHitRadius);
                    console.log(`📦 Предмет в (${item.x}, ${item.y}), радиус: ${itemHitRadius}, попадание: ${inRadius}, собран: ${item.isCollected}`);
                    return inRadius && !item.isCollected;
                }
            );
            
            if (item) {
                console.log(`✅ Найден предмет для сбора:`, item.itemType);
                return {
                    type: TARGET_TYPES.ITEM,
                    object: item,
                    x: x,
                    y: y
                };
            }
        }
        
        // Проверяем врагов (приоритет 2)
        let foundEnemy = null;
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) {
                continue;
            }
            const hitRadius = GeometryUtils.calculateHitRadius(enemy, 'enemy', TARGET_SETTINGS);
            const isInRange = GeometryUtils.isInRadius(x, y, enemy.x, enemy.y, hitRadius);
            if (isInRange) {
                foundEnemy = enemy;
                break;
            }
        }
        
        if (foundEnemy) {
            return {
                type: TARGET_TYPES.ENEMY,
                object: foundEnemy,
                x: x,
                y: y
            };
        }
        
        // Проверяем яйцо (приоритет 3)
        if (this.egg && this.egg.isAlive) {
            const eggHitRadius = GeometryUtils.calculateHitRadius(this.egg, 'egg', TARGET_SETTINGS);
            const isEggInRange = GeometryUtils.isInRadius(x, y, this.egg.x, this.egg.y, eggHitRadius);
            if (isEggInRange) {
                return {
                    type: TARGET_TYPES.EGG,
                    object: this.egg,
                    x: x,
                    y: y
                };
            }
        }
        
        // Проверяем защиту (приоритет 4)
        const defense = GeometryUtils.findFirstObjectInRadius(
            this.defenses, x, y, 
            0,
            (defense) => {
                const defenseHitRadius = GeometryUtils.calculateHitRadius(defense, 'defense', TARGET_SETTINGS);
                return GeometryUtils.isInRadius(x, y, defense.x, defense.y, defenseHitRadius);
            }
        );
        if (defense) {
            return {
                type: TARGET_TYPES.DEFENSE,
                object: defense,
                x: x,
                y: y
            };
        }
        
        // Поле (приоритет 0)
        return {
            type: TARGET_TYPES.FIELD,
            object: null,
            x: x,
            y: y
        };
    }
    
    /**
     * Выполняет действие на основе типа
     * @param {Object} action - Конфигурация действия
     * @param {Object} gesture - Объект жеста
     * @param {Object} target - Целевой объект
     * @returns {boolean} Успешность выполнения
     */
    executeAction(action, gesture, target) {
        try {
            switch (action.name) {
                case 'damage_enemy':
                    return this.damageEnemy(target.object, action.damage);
                    
                case 'critical_damage':
                    return this.damageEnemy(target.object, DAMAGE_CONSTANTS.TAP_DAMAGE);
                    
                case 'protect_egg':
                    console.log(`🛡️ ${gesture.type} → Защитить яйцо (щит: ${action.shield})`);
                    return true;
                    
                case 'collect_item':
                    console.log(`💎 Распознан жест: ${gesture.type} → Собираем предмет`);
                    if (this.itemDropSystem) {
                        return this.itemDropSystem.collectItem(target.object);
                    }
                    return false;
                    
                case 'place_defense':
                    console.log(`🏗️ ${gesture.type} → Установить защиту (тип: ${action.defenseType})`);
                    return true;
                    
                case 'heal_egg':
                    console.log(`❤️ ${gesture.type} → Лечить яйцо (лечение: ${action.heal})`);
                    return true;
                    
                case 'explosion':
                    console.log(`💣 ${gesture.type} → Взрыв (радиус: ${action.radius}, урон: ${action.damage})`);
                    return true;
                    
                case 'freeze_enemy':
                    console.log(`🧊 ${gesture.type} → Заморозить врага (длительность: ${action.freezeDuration}мс)`);
                    return true;
                    
                case 'shield_egg':
                    console.log(`🛡️ ${gesture.type} → Щит для яйца (длительность: ${action.shieldDuration}мс, сила: ${action.shieldStrength})`);
                    return true;
                    
                case 'create_wall':
                    console.log(`🧱 ${gesture.type} → Создать стену (тип: ${action.wallType})`);
                    return true;
                    
                case 'damage_wave':
                    console.log(`🌊 ${gesture.type} → Волна урона (урон: ${action.damage}, дальность: ${action.range})`);
                    return true;
                    
                default:
                    console.log(`❓ Неизвестное действие: ${action.name} для жеста ${gesture.type}`);
                    return false;
            }
        } catch (error) {
            console.error('Ошибка выполнения действия:', error);
            return false;
        }
    }
    
    /**
     * Наносит урон врагу
     * @param {Object} enemy - Объект врага
     * @param {number} damage - Количество урона
     * @returns {boolean} Успешность атаки
     */
    damageEnemy(enemy, damage = DAMAGE_CONSTANTS.TAP_DAMAGE) {
        if (!enemy || !enemy.isAlive) {
            return false;
        }
        
        enemy.takeDamage(damage);
        return true;
    }
    
    
    /**
     * Взрыв в области
     * @param {number} x - X координата взрыва
     * @param {number} y - Y координата взрыва
     * @param {number} radius - Радиус взрыва
     * @param {number} damage - Урон от взрыва
     * @returns {boolean} Успешность взрыва
     */
    explosion(x, y, radius = EFFECT_CONSTANTS.EXPLOSION_RADIUS, damage = DAMAGE_CONSTANTS.EXPLOSION_DAMAGE) {
        // Находим врагов в радиусе взрыва
        const enemiesInRange = GeometryUtils.findObjectsInRadius(this.enemies, x, y, radius, (enemy) => enemy.isAlive);
        enemiesInRange.forEach(enemy => {
            this.damageEnemy(enemy, damage);
        });
        
        return true;
    }
    
    /**
     * Волна урона для линейных жестов
     * @param {number} x - X координата волны
     * @param {number} y - Y координата волны
     * @param {Object} gesture - Объект жеста с координатами линии
     * @param {number} damage - Урон от волны
     * @param {number} range - Дальность волны
     * @returns {boolean} Успешность волны
     */
    damageWave(x, y, gesture, damage = DAMAGE_CONSTANTS.WAVE_DAMAGE, range = EFFECT_CONSTANTS.WAVE_RANGE) {
        // Для линейных жестов используем направление линии
        let direction = 'right'; // По умолчанию
        
        if (gesture.type === 'line' && gesture.endX && gesture.endY) {
            const deltaX = gesture.endX - gesture.x;
            const deltaY = gesture.endY - gesture.y;
            
            // Определяем основное направление
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }
        }
        
        // Находим врагов в направлении волны
        const enemiesInWave = GeometryUtils.findObjectsInDirection(this.enemies, x, y, direction, range, (enemy) => enemy.isAlive);
        enemiesInWave.forEach(enemy => {
            this.damageEnemy(enemy, damage);
        });
        
        return true;
    }
    
    /**
     * Обновляет списки объектов
     * @param {Array} enemies - Массив врагов
     * @param {Array} defenses - Массив защитных объектов
     */
    updateObjects(enemies, defenses) {
        this.enemies = enemies;
        this.defenses = defenses;
    }
}
