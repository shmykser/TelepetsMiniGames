import { GESTURE_ACTIONS, TARGET_TYPES, TARGET_SETTINGS } from '../../core/types/gestureTypes';
import { ITEM_TYPES } from '../../core/types/itemTypes';
import { DAMAGE_CONSTANTS, EFFECT_CONSTANTS } from '../../core/constants/GameConstants.js';
import { GeometryUtils } from '../../utils/GeometryUtils.js';
import { AnimationLibrary } from '../../animations/AnimationLibrary.js';

/**
 * Менеджер действий по жестам
 */
export class ActionManager {
    constructor(scene, enemies, defences, egg = null, itemDropManager = null) {
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
        Object.defineProperty(this, "defences", {
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
        Object.defineProperty(this, "itemDropManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.scene = scene;
        this.enemies = enemies;
        this.defences = defences;
        this.egg = egg;
        this.itemDropManager = itemDropManager;
    }
    
    /**
     * Обрабатывает жест
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
     * Определяет цель жеста
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
                break; // Найден первый враг в радиусе
            }
        }
        const enemy = foundEnemy;
        if (enemy) {
            return {
                type: TARGET_TYPES.ENEMY,
                object: enemy,
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
        
        // Проверяем предметы (приоритет 3)
        if (this.itemDropManager) {
            const item = GeometryUtils.findFirstObjectInRadius(
                this.itemDropManager.items, 
                x, y, 
                0, // радиус будет определен в фильтре
                (item) => {
                    if (!item || item.isCollected || !item.body) return false;
                    const itemHitRadius = GeometryUtils.calculateHitRadius(item, 'item', TARGET_SETTINGS);
                    return GeometryUtils.isInRadius(x, y, item.x, item.y, itemHitRadius);
                }
            );
            if (item) {
                return {
                    type: TARGET_TYPES.ITEM,
                    object: item,
                    x: x,
                    y: y
                };
            }
        }
        
        // Проверяем защиту (приоритет 1)
        const defence = GeometryUtils.findFirstObjectInRadius(
            this.defences, x, y, 
            0, // радиус будет определен в фильтре
            (defence) => {
                const defenceHitRadius = GeometryUtils.calculateHitRadius(defence, 'defence', TARGET_SETTINGS);
                return GeometryUtils.isInRadius(x, y, defence.x, defence.y, defenceHitRadius);
            }
        );
        if (defence) {
            return {
                type: TARGET_TYPES.DEFENCE,
                object: defence,
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
     * Выполняет действие
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
                    
                case 'place_defence':
                    return this.placeDefence(target.x, target.y, action.defenceType);
                    
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
                    return this.collectItem(target.object);
                    
            default:
                    return false;
            }
        } catch (error) {
                return false;
        }
    }
    /**
     * Наносит урон врагу
     */
    damageEnemy(enemy, damage = DAMAGE_CONSTANTS.TAP_DAMAGE) {
        if (!enemy || !enemy.isAlive) {
            return false;
        }
        
        enemy.takeDamage(damage);
        
        if (!enemy.isAlive) {
            this.showDeathEffect(enemy);
        }
        return true;
    }
    
    /**
     * Критический урон врагу
     */
    criticalDamageEnemy(enemy, damage = DAMAGE_CONSTANTS.CRITICAL_DAMAGE) {
        if (!enemy || !enemy.isAlive) {
            return false;
        }
        
        enemy.takeDamage(damage);
        
        // Эффект критического урона
        this.showCriticalEffect(enemy);
        
        if (!enemy.isAlive) {
            this.showDeathEffect(enemy);
        }
        return true;
    }
    
    /**
     * Замораживает врага
     */
    freezeEnemy(enemy, duration = 2000) {
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
     */
    protectEgg(shield = 5) {
        if (!this.egg || !this.egg.isAlive) {
            return false;
        }
        
        // Здесь можно добавить логику защиты яйца
        return true;
    }
    
    /**
     * Лечит яйцо
     */
    healEgg(heal = 20) {
        if (!this.egg || !this.egg.isAlive) {
            return false;
        }
        
        // Здесь можно добавить логику лечения яйца
        return true;
    }
    
    /**
     * Создает щит для яйца
     */
    shieldEgg(duration = 5000, strength = 50) {
        if (!this.egg || !this.egg.isAlive) {
            return false;
        }
        
        // Здесь можно добавить логику щита
        return true;
    }
    
    /**
     * Устанавливает защиту
     */
    placeDefence(x, y, defenceType = 'barrier') {
        // Здесь можно добавить логику установки защиты
        return true;
    }
    
    /**
     * Создает стену
     */
    createWall(x, y, wallType = 'barrier') {
        // Здесь можно добавить логику создания стены
        return true;
    }
    
    /**
     * Взрыв в области
     */
    explosion(x, y, radius = EFFECT_CONSTANTS.EXPLOSION_RADIUS, damage = DAMAGE_CONSTANTS.EXPLOSION_DAMAGE) {
        
        // Находим врагов в радиусе взрыва
        const enemiesInRange = GeometryUtils.findObjectsInRadius(this.enemies, x, y, radius, (enemy) => enemy.isAlive);
        enemiesInRange.forEach(enemy => {
            this.damageEnemy(enemy, damage);
        });
        
        // Визуальный эффект взрыва
        this.showExplosionEffect(x, y, radius);
        
        return true;
    }
    
    /**
     * Волна урона
     */
    damageWave(x, y, direction, damage = DAMAGE_CONSTANTS.WAVE_DAMAGE, range = EFFECT_CONSTANTS.WAVE_RANGE) {
        
        // Находим врагов в направлении волны
        const enemiesInWave = GeometryUtils.findObjectsInDirection(this.enemies, x, y, direction, range, (enemy) => enemy.isAlive);
        enemiesInWave.forEach(enemy => {
            this.damageEnemy(enemy, damage);
        });
        
        // Визуальный эффект волны
        this.showWaveEffect(x, y, direction, range);
        
        return true;
    }
    
    /**
     * Эффект подъема
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
     * Показывает эффект смерти
     */
    showDeathEffect(enemy) {
        // Эффект исчезновения через AnimationLibrary
        AnimationLibrary.createDisappearEffect(this.scene, enemy, {
            duration: 500,
            ease: 'Power2',
            onComplete: () => enemy.destroy()
        });
    }
    
    /**
     * Показывает эффект критического урона
     */
    showCriticalEffect(enemy) {
        // Эффект вспышки через AnimationLibrary
        AnimationLibrary.createFlashEffect(this.scene, enemy, {
            scale: { to: 1.2 },
            duration: 100,
            yoyo: true,
            repeat: 2,
            ease: 'Power2'
        });
        
        // Эффект тряски через AnimationLibrary
        AnimationLibrary.createShakeEffect(this.scene, enemy, {
            intensity: 5,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Power2'
        });
    }
    
    /**
     * Показывает эффект взрыва
     */
    showExplosionEffect(x, y, radius) {
        // Создаем основной круг взрыва с начальным радиусом 5
        const explosion = this.scene.add.circle(x, y, 5, 0xff0000, 0.8);
        
        // Создаем внешний круг для эффекта волны
        const wave = this.scene.add.circle(x, y, 5, 0xffaa00, 0.6);
        
        // Анимация основного взрыва - масштабируем до точного радиуса
        AnimationLibrary.createExplosionEffect(this.scene, explosion, {
            scale: { to: radius / 5 }, // 5 - начальный радиус, radius - конечный
            duration: 300,
            ease: 'Power2',
            onComplete: () => explosion.destroy()
        });
        
        // Анимация волны - тоже до точного радиуса
        this.scene.time.delayedCall(50, () => {
            AnimationLibrary.createExplosionEffect(this.scene, wave, {
                scale: { to: radius / 5 }, // Исправлено: было radius / 3
                duration: 400,
                ease: 'Power2',
                onComplete: () => wave.destroy()
            });
        });
        
        // Создаем частицы взрыва - разлетаются точно до края радиуса
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * GeometryUtils.TWO_PI;
            const particlePos = GeometryUtils.calculateCircularPosition(x, y, 10, angle);
            const particleX = particlePos.x;
            const particleY = particlePos.y;
            
            const particle = this.scene.add.circle(particleX, particleY, 2, 0xffff00, 0.9);
            
            this.scene.tweens.add({
                targets: particle,
                x: particleX + (particlePos.x - x) * (radius - 10) / 10, // Исправлено: было radius * 0.8
                y: particleY + (particlePos.y - y) * (radius - 10) / 10, // Исправлено: было radius * 0.8
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    /**
     * Показывает эффект волны
     */
    showWaveEffect(x, y, direction, range) {
        // Создаем линию волны
        const wave = this.scene.add.rectangle(x, y, 0, 10, 0x00ffff, 0.7);
        
        let targetX = x;
        let targetY = y;
        let targetWidth = 0;
        let targetHeight = 0;
        
        switch (direction) {
            case 'left':
                targetX = x - range;
                targetWidth = range;
                targetHeight = 20;
                break;
            case 'right':
                targetX = x + range/2;
                targetWidth = range;
                targetHeight = 20;
                break;
            case 'up':
                targetY = y - range;
                targetWidth = 20;
                targetHeight = range;
                break;
            case 'down':
                targetY = y + range/2;
                targetWidth = 20;
                targetHeight = range;
                break;
        }
        
        // Используем AnimationLibrary для эффекта волны
        AnimationLibrary.createWaveEffect(this.scene, wave, {
            x: targetX,
            y: targetY,
            duration: 200,
            ease: 'Power2',
            onComplete: () => wave.destroy()
        });
    }
    
    /**
     * Собирает предмет
     */
    collectItem(item) {
        if (!item || !this.itemDropManager) {
            return false;
        }
        
        return this.itemDropManager.collectItem(item);
    }
    
    /**
     * Обновляет списки объектов
     */
    updateObjects(enemies, defences) {
        this.enemies = enemies;
        this.defences = defences;
    }
}
