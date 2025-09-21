import { GESTURE_ACTIONS, TARGET_TYPES, TARGET_SETTINGS } from '../types/gestureTypes';
import { GeometryUtils } from '../utils/GeometryUtils.js';
import { Defense } from '../objects/Defense.js';

/**
 * Система обработки жестов и выполнения действий
 * Следует принципу Single Responsibility Principle
 */
export class GestureActionSystem {
    constructor(scene, enemies, defenses, egg = null, itemDropSystem = null, abilitySystem = null) {
        this.scene = scene;
        this.enemies = enemies;
        this.defenses = defenses;
        this.egg = egg;
        this.itemDropSystem = itemDropSystem;
        this.abilitySystem = abilitySystem;
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
                    // Если damage не указан в action, используем AbilitySystem
                    const damage = action.damage || this.abilitySystem?.getTapDamage() || 5;
                    return this.damageEnemy(target.object, damage);
                    
                case 'critical_damage':
                    return this.damageEnemy(target.object, this.abilitySystem?.getTapDamage() || 5);
                    
                case 'activate_egg_explosion':
                    console.log(`💥 ${gesture.type} → Активировать взрыв яйца`);
                    return this.activateEggExplosion(target.object);
                    
                case 'collect_item':
                    console.log(`💎 Распознан жест: ${gesture.type} → Собираем предмет`);
                    return this.collectItem(target.object);
                    
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
                    
                case 'create_pit':
                    return this.placePit(gesture.x, gesture.y);
                    
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
    damageEnemy(enemy, damage = null) {
        // Если урон не указан, берем из AbilitySystem или используем базовое значение
        if (damage === null) {
            damage = this.abilitySystem?.getTapDamage() || 5;
        }
        if (!enemy || !enemy.isAlive) {
            return false;
        }
        
        enemy.takeDamage(damage);
        return true;
    }
    
    
    /**
     * Активирует взрыв яйца
     * @param {Object} egg - Объект яйца
     * @returns {boolean} Успешность активации
     */
    activateEggExplosion(egg) {
        if (!egg || !egg.activateEggExplosion) {
            return false;
        }
        
        return egg.activateEggExplosion();
    }
    
    /**
     * Собирает предмет
     * @param {Object} item - Объект предмета
     * @returns {boolean} Успешность сбора
     */
    collectItem(item) {
        if (!item || item.isCollected) {
            return false;
        }
        
        // Активируем эффект предмета
        item.activate();
        
        // Собираем предмет
        return item.collect();
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
    
    /**
     * Размещает или расширяет яму по координатам
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     * @returns {boolean} Успешность операции
     */
    placePit(x, y) {
        if (!this.abilitySystem) {
            console.log(`🕳️ Нет доступа к системе способностей`);
            return false;
        }
        
        const shovelCount = this.abilitySystem.getShovelCount();
        const pitCount = this.abilitySystem.getPitCount();
        const maxPits = this.abilitySystem.abilities.PIT?.maxValue || 4;
        
        // Проверяем, есть ли лопаты
        if (shovelCount <= 0) {
            console.log(`🪓 Нет доступных лопат для копания (лопат: ${shovelCount})`);
            return false;
        }
        
        // Проверяем, есть ли уже яма в этом месте
        const existingPit = this.findPitAt(x, y);
        
        if (existingPit) {
            // Расширяем существующую яму (pitCount не изменяется)
            console.log(`🔍 Найдена существующая яма для расширения`);
            return this.expandPit(existingPit);
        } else {
            // Проверяем, можно ли выкопать новую яму
            if (pitCount >= maxPits) {
                console.log(`🕳️ Достигнуто максимальное количество ям на поле (${pitCount}/${maxPits})`);
                return false;
            }
            
            // Создаем новую яму (pitCount увеличивается)
            console.log(`🆕 Выкапываем новую яму`);
            return this.digNewPit(x, y);
        }
    }
    
    /**
     * Находит яму по координатам
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     * @returns {Object|null} Найденная яма или null
     */
    findPitAt(x, y) {
        const searchRadius = 50; // Радиус поиска в пикселях
        
        if (!this.defenses || this.defenses.length === 0) {
            return null;
        }
        
        // Используем GeometryUtils для поиска
        const pit = GeometryUtils.findFirstObjectInRadius(
            this.defenses, 
            x, y, 
            searchRadius,
            (defense) => defense && defense.defenseType === 'pit' && defense.isAlive
        );
        
        if (pit) {
            const distance = GeometryUtils.distance(x, y, pit.x, pit.y);
            console.log(`🎯 Найдена яма в радиусе ${distance.toFixed(1)}px от (${x}, ${y})`);
        } else {
            console.log(`🔍 Ям не найдено в радиусе ${searchRadius}px от (${x}, ${y})`);
        }
        
        return pit;
    }
    
    /**
     * Расширяет существующую яму
     * @param {Object} pit - Объект ямы
     * @returns {boolean} Успешность расширения
     */
    expandPit(pit) {
        try {
            const pitHealthIncrease = this.abilitySystem.getPitHealth();
            
            // Увеличиваем здоровье ямы (Defense использует прямое изменение health)
            const oldHealth = pit.health;
            const newHealth = Math.min(pit.health + pitHealthIncrease, pit.maxHealth);
            pit.health = newHealth;
            
            // Увеличиваем размер визуально
            const currentScale = pit.scaleX;
            const newScale = Math.min(currentScale * 1.2, 3.0); // Максимум в 5 раза больше
            pit.setScale(newScale);
            
            // Обновляем счетчики (только лопаты, pitCount не изменяется)
            this.abilitySystem.abilities.SHOVEL_COUNT -= 1;
            
            console.log(`🕳️ Яма расширена в (${pit.x}, ${pit.y})`);
            console.log(`💚 Здоровье: ${oldHealth} → ${newHealth} (+${pitHealthIncrease})`);
            console.log(`📏 Размер: ${currentScale.toFixed(1)} → ${newScale.toFixed(1)}`);
            console.log(`🪓 Лопат осталось: ${this.abilitySystem.getShovelCount()}`);
            
            // Взаимодействие с врагом - заглушка
            console.log(`⚔️ Взаимодействие с врагами (заглушка)`);
            
            return true;
        } catch (error) {
            console.error('Ошибка расширения ямы:', error);
            return false;
        }
    }
    
    /**
     * Выкапывает новую яму
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     * @returns {boolean} Успешность создания
     */
    digNewPit(x, y) {
        try {
            // Создаем объект ямы через Defense.createDefense
            const pit = Defense.createDefense(this.scene, 'pit', x, y);
            
            // Добавляем в массив защитных объектов сцены
            this.scene.defenses.push(pit);
            
            // Обновляем счетчики
            this.abilitySystem.abilities.PIT += 1;
            this.abilitySystem.abilities.SHOVEL_COUNT -= 1;
            
            console.log(`🕳️ Яма выкопана в (${x}, ${y}), здоровье: ${pit.health}`);
            console.log(`🕳️ Ям на поле: ${this.abilitySystem.getPitCount()}`);
            console.log(`🪓 Лопат осталось: ${this.abilitySystem.getShovelCount()}`);
            
            // Взаимодействие с врагом - заглушка
            console.log(`⚔️ Взаимодействие с врагами (заглушка)`);
            
            return true;
        } catch (error) {
            console.error('Ошибка создания ямы:', error);
            return false;
        }
    }
    
}
