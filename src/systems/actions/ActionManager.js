import { GESTURE_ACTIONS, TARGET_TYPES, TARGET_SETTINGS } from '../../core/types/gestureTypes';
import { ITEM_TYPES } from '../../core/types/itemTypes';

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
        console.log(`🎯 Обработка жеста: ${gesture.type} в позиции (${gesture.x}, ${gesture.y})`);
        
        // Определяем цель жеста
        const target = this.detectTarget(gesture.x, gesture.y);
        gesture.target = target;
        
        // Формируем ключ действия
        const actionKey = `${gesture.type}_${target.type}`;
        const action = GESTURE_ACTIONS[actionKey];
        
        if (!action) {
            return false;
        }
        
        console.log(`✅ Выполняется действие: ${action.name}`);
        
        // Выполняем действие
        return this.executeAction(action, gesture, target);
    }
    
    /**
     * Определяет цель жеста
     */
    detectTarget(x, y) {
        // Проверяем врагов (приоритет 1)
        const enemy = this.getEnemyAtPosition(x, y);
        if (enemy) {
            return {
                type: TARGET_TYPES.ENEMY,
                object: enemy,
                x: x,
                y: y
            };
        }
        
        // Проверяем яйцо (приоритет 2)
        if (this.egg && this.isPointInEgg(x, y)) {
            return {
                type: TARGET_TYPES.EGG,
                object: this.egg,
                x: x,
                y: y
            };
        }
        
        // Проверяем предметы (приоритет 1)
        const item = this.getItemAtPosition(x, y);
        if (item) {
            return {
                type: TARGET_TYPES.ITEM,
                object: item,
                x: x,
                y: y
            };
        }
        
        // Проверяем защиту (приоритет 2)
        const defence = this.getDefenceAtPosition(x, y);
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
    damageEnemy(enemy, damage = 10) {
        console.log(`⚔️ ActionManager.damageEnemy: атака по врагу ${enemy.enemyType || 'неизвестный'}, урон ${damage}`);
        console.log(`⚔️ ActionManager.damageEnemy: враг жив? ${enemy.isAlive}, здоровье: ${enemy.health}`);
        
        if (!enemy || !enemy.isAlive) {
            console.log(`⚔️ ActionManager.damageEnemy: враг мертв или не найден, выходим`);
            return false;
        }
        
        console.log(`⚔️ ActionManager.damageEnemy: вызываем enemy.takeDamage(${damage})`);
        enemy.takeDamage(damage);
        
        console.log(`⚔️ ActionManager.damageEnemy: после takeDamage враг жив? ${enemy.isAlive}, здоровье: ${enemy.health}`);
        if (!enemy.isAlive) {
            console.log(`⚔️ ActionManager.damageEnemy: враг мертв, показываем эффект смерти`);
            this.showDeathEffect(enemy);
        }
        return true;
    }
    
    /**
     * Критический урон врагу
     */
    criticalDamageEnemy(enemy, damage = 25) {
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
    explosion(x, y, radius = 100, damage = 15) {
        
        // Находим врагов в радиусе взрыва
        const enemiesInRange = this.getEnemiesInRadius(x, y, radius);
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
    damageWave(x, y, direction, damage = 8, range = 150) {
        
        // Находим врагов в направлении волны
        const enemiesInWave = this.getEnemiesInDirection(x, y, direction, range);
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
    liftEffect(x, y, force = 200) {
        
        // Находим врагов в области
        const enemiesInArea = this.getEnemiesInRadius(x, y, 100);
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
    crushEffect(x, y, damage = 12, slow = 0.5) {
        
        // Находим врагов в области
        const enemiesInArea = this.getEnemiesInRadius(x, y, 100);
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
     * Проверяет, находится ли точка в яйце
     */
    isPointInEgg(x, y) {
        if (!this.egg || !this.egg.isAlive) {
            return false;
        }
        const distance = Phaser.Math.Distance.Between(x, y, this.egg.x, this.egg.y);
        const hitRadius = 30; // Радиус попадания по яйцу
        return distance <= hitRadius;
    }
    /**
     * Находит врага в указанной позиции
     */
    getEnemyAtPosition(x, y) {
        for (const enemy of this.enemies) {
            if (!enemy.isAlive)
                continue;
            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            const hitRadius = 50; // Радиус попадания
            if (distance <= hitRadius) {
                return enemy;
            }
        }
        return null;
    }
    /**
     * Находит защиту в указанной позиции
     */
    getDefenceAtPosition(x, y) {
        for (const defence of this.defences) {
            const distance = Phaser.Math.Distance.Between(x, y, defence.x, defence.y);
            const hitRadius = 50; // Радиус попадания
            if (distance <= hitRadius) {
                return defence;
            }
        }
        return null;
    }
    /**
     * Находит врагов в радиусе
     */
    getEnemiesInRadius(x, y, radius) {
        const enemiesInRange = [];
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;
            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (distance <= radius) {
                enemiesInRange.push(enemy);
            }
        }
        return enemiesInRange;
    }
    
    /**
     * Находит врагов в направлении
     */
    getEnemiesInDirection(x, y, direction, range) {
        const enemiesInDirection = [];
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;
            
            const deltaX = enemy.x - x;
            const deltaY = enemy.y - y;
            const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            
            if (distance <= range) {
                // Проверяем направление
                let inDirection = false;
                switch (direction) {
                    case 'left':
                        inDirection = deltaX < 0 && Math.abs(deltaY) < Math.abs(deltaX);
                        break;
                    case 'right':
                        inDirection = deltaX > 0 && Math.abs(deltaY) < Math.abs(deltaX);
                        break;
                    case 'up':
                        inDirection = deltaY < 0 && Math.abs(deltaX) < Math.abs(deltaY);
                        break;
                    case 'down':
                        inDirection = deltaY > 0 && Math.abs(deltaX) < Math.abs(deltaY);
                        break;
                }
                
                if (inDirection) {
                    enemiesInDirection.push(enemy);
                }
            }
        }
        return enemiesInDirection;
    }
    
    /**
     * Показывает эффект смерти
     */
    showDeathEffect(enemy) {
        // Эффект исчезновения
        this.scene.tweens.add({
            targets: enemy,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                enemy.destroy();
            }
        });
    }
    
    /**
     * Показывает эффект критического урона
     */
    showCriticalEffect(enemy) {
        // Эффект вспышки
        this.scene.tweens.add({
            targets: enemy,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            repeat: 2,
            ease: 'Power2'
        });
        
        // Эффект тряски
        this.scene.tweens.add({
            targets: enemy,
            x: enemy.x + 5,
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
        // Создаем круг взрыва
        const explosion = this.scene.add.circle(x, y, 0, 0xff0000, 0.5);
        
        this.scene.tweens.add({
            targets: explosion,
            radius: radius,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                explosion.destroy();
            }
        });
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
        
        this.scene.tweens.add({
            targets: wave,
            x: targetX,
            y: targetY,
            width: targetWidth,
            height: targetHeight,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                wave.destroy();
            }
        });
    }
    /**
     * Находит предмет в позиции
     */
    getItemAtPosition(x, y) {
        if (!this.itemDropManager) {
            return null;
        }
        
        for (const item of this.itemDropManager.items) {
            if (item && !item.isCollected && item.body) {
                const distance = Phaser.Math.Distance.Between(x, y, item.x, item.y);
                if (distance <= item.width / 2) {
                    return item;
                }
            }
        }
        return null;
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
