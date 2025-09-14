import { GESTURE_ACTIONS, TARGET_TYPES, TARGET_SETTINGS } from '../types/gestureTypes';
import { DAMAGE_CONSTANTS, EFFECT_CONSTANTS } from '../constants/GameConstants.js';
import { GeometryUtils } from '../utils/GeometryUtils.js';

/**
 * Система обработки жестов и выполнения действий
 * Следует принципу Single Responsibility Principle
 */
export class GestureActionSystem {
    constructor(scene, enemies, defenses, egg = null) {
        Object.defineProperty(this, "scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "enemies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "defenses", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "egg", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.scene = scene;
        this.enemies = enemies;
        this.defenses = defenses;
        this.egg = egg;
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
        
        // Формируем ключ действия
        const actionKey = `${gesture.type}_${target.type}`;
        const action = GESTURE_ACTIONS[actionKey];
        
        if (!action) {
            return false;
        }
        
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
        // Проверяем врагов (приоритет 1)
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
        
        // Проверяем яйцо (приоритет 2)
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
        
        // Предметы больше не обрабатываются здесь - они обрабатываются в Enemy
        
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
                    return this.criticalDamageEnemy(target.object, action.damage);
                    
                case 'freeze_enemy':
                    return this.freezeEnemy(target.object, action.freezeDuration);
                    
                case 'protect_egg':
                    return this.protectEgg(action.shield);
                    
                case 'heal_egg':
                    return this.healEgg(action.heal);
                    
                case 'shield_egg':
                    return this.shieldEgg(action.shieldDuration, action.shieldStrength);
                    
                case 'place_defense':
                    return this.placeDefense(target.x, target.y, action.defenseType);
                    
                case 'create_wall':
                    return this.createWall(target.x, target.y, action.wallType);
                    
                case 'explosion':
                    return this.explosion(target.x, target.y, action.radius, action.damage);
                    
                case 'damage_wave':
                    return this.damageWave(target.x, target.y, action.direction, action.damage, action.range);
                    
                case 'lift_effect':
                    return this.liftEffect(target.x, target.y, action.force);
                    
                case 'crush_effect':
                    return this.crushEffect(target.x, target.y, action.damage, action.slow);
                    
                case 'collect_item':
                    // Сбор предметов больше не обрабатывается здесь
                    return false;
                    
                default:
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
     * Наносит критический урон врагу
     * @param {Object} enemy - Объект врага
     * @param {number} damage - Количество урона
     * @returns {boolean} Успешность атаки
     */
    criticalDamageEnemy(enemy, damage = DAMAGE_CONSTANTS.CRITICAL_DAMAGE) {
        if (!enemy || !enemy.isAlive) {
            return false;
        }
        
        enemy.takeDamage(damage);
        return true;
    }
    
    /**
     * Замораживает врага
     * @param {Object} enemy - Объект врага
     * @param {number} duration - Длительность заморозки в миллисекундах
     * @returns {boolean} Успешность заморозки
     */
    freezeEnemy(enemy, duration = EFFECT_CONSTANTS.FREEZE_DURATION) {
        if (!enemy || !enemy.isAlive) {
            return false;
        }
        
        // Останавливаем движение
        if (enemy.body) {
            enemy.body.setVelocity(0, 0);
        }
        
        // Визуальный эффект заморозки
        enemy.setTint(0x00ffff);
        
        // Таймер разморозки
        this.scene.time.delayedCall(duration, () => {
            if (enemy && enemy.isAlive) {
                enemy.clearTint();
            }
        });
        
        return true;
    }
    
    /**
     * Защищает яйцо
     * @param {number} shield - Количество защиты
     * @returns {boolean} Успешность защиты
     */
    protectEgg(shield = 5) {
        if (!this.egg || !this.egg.isAlive) {
            return false;
        }
        
        // Базовая логика защиты яйца
        return true;
    }
    
    /**
     * Лечит яйцо
     * @param {number} heal - Количество лечения
     * @returns {boolean} Успешность лечения
     */
    healEgg(heal = 20) {
        if (!this.egg || !this.egg.isAlive) {
            return false;
        }
        
        // Базовая логика лечения яйца
        return true;
    }
    
    /**
     * Создает щит для яйца
     * @param {number} duration - Длительность щита в миллисекундах
     * @param {number} strength - Сила щита
     * @returns {boolean} Успешность создания щита
     */
    shieldEgg(duration = EFFECT_CONSTANTS.SHIELD_DURATION, strength = EFFECT_CONSTANTS.SHIELD_STRENGTH) {
        if (!this.egg || !this.egg.isAlive) {
            return false;
        }
        
        // Базовая логика щита
        return true;
    }
    
    /**
     * Устанавливает защиту
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @param {string} defenseType - Тип защиты
     * @returns {boolean} Успешность установки
     */
    placeDefense(x, y, defenseType = 'barrier') {
        // Базовая логика установки защиты
        return true;
    }
    
    /**
     * Создает стену
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @param {string} wallType - Тип стены
     * @returns {boolean} Успешность создания
     */
    createWall(x, y, wallType = 'barrier') {
        // Базовая логика создания стены
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
     * Волна урона
     * @param {number} x - X координата волны
     * @param {number} y - Y координата волны
     * @param {string} direction - Направление волны
     * @param {number} damage - Урон от волны
     * @param {number} range - Дальность волны
     * @returns {boolean} Успешность волны
     */
    damageWave(x, y, direction, damage = DAMAGE_CONSTANTS.WAVE_DAMAGE, range = EFFECT_CONSTANTS.WAVE_RANGE) {
        // Находим врагов в направлении волны
        const enemiesInWave = GeometryUtils.findObjectsInDirection(this.enemies, x, y, direction, range, (enemy) => enemy.isAlive);
        enemiesInWave.forEach(enemy => {
            this.damageEnemy(enemy, damage);
        });
        
        return true;
    }
    
    /**
     * Эффект подъема
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @param {number} force - Сила подъема
     * @returns {boolean} Успешность эффекта
     */
    liftEffect(x, y, force = EFFECT_CONSTANTS.LIFT_FORCE) {
        // Находим врагов в области
        const enemiesInArea = GeometryUtils.findObjectsInRadius(this.enemies, x, y, EFFECT_CONSTANTS.EXPLOSION_RADIUS, (enemy) => enemy.isAlive);
        enemiesInArea.forEach(enemy => {
            if (enemy.body) {
                enemy.body.setVelocityY(-force);
            }
        });
        
        return true;
    }
    
    /**
     * Эффект придавливания
     * @param {number} x - X координата
     * @param {number} y - Y координата
     * @param {number} damage - Урон
     * @param {number} slow - Замедление
     * @returns {boolean} Успешность эффекта
     */
    crushEffect(x, y, damage = DAMAGE_CONSTANTS.CRUSH_DAMAGE, slow = EFFECT_CONSTANTS.CRUSH_SLOW) {
        // Находим врагов в области
        const enemiesInArea = GeometryUtils.findObjectsInRadius(this.enemies, x, y, EFFECT_CONSTANTS.EXPLOSION_RADIUS, (enemy) => enemy.isAlive);
        enemiesInArea.forEach(enemy => {
            this.damageEnemy(enemy, damage);
            // Замедляем врага
            if (enemy.body) {
                enemy.body.setDrag(slow);
            }
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
