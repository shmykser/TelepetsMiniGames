import { GameObject } from './GameObject.js';
import { enemyTypes } from '../types/enemyTypes';
import { PropertyUtils } from '../utils/PropertyUtils.js';
import { GeometryUtils } from '../utils/GeometryUtils.js';
import { PHYSICS_CONSTANTS, COLORS } from '../settings/GameSettings.js';
import { ItemDropSystem } from '../systems/ItemDropSystem.js';
import { EVENT_TYPES } from '../types/EventTypes.js';
export class Enemy extends GameObject {
    // Статическая система дропа для всех врагов
    static itemDropSystem = null;
    static probabilitySystem = null;
    // Статическая система событий для всех врагов
    static eventSystem = null;

    constructor(scene, config) {
        const enemyType = config.enemyType || 'unknown';
        const enemyData = enemyTypes[enemyType];
        // Настройки из типа врага (приоритет у переданных значений)
        const enemyConfig = {
            health: config.health !== undefined ? config.health : enemyData.health,
            damage: config.damage !== undefined ? config.damage : enemyData.damage,
            speed: config.speed !== undefined ? config.speed : enemyData.speed, // скорость в пикселях в секунду
            cooldown: config.cooldown !== undefined ? config.cooldown : enemyData.cooldown, // уже в миллисекундах
            attackRange: config.attackRange || enemyData.attackRange || PHYSICS_CONSTANTS.ENEMY_ATTACK_RANGE_DEFAULT,
            size: config.size !== undefined ? config.size : enemyData.size, // размер врага
            x: config.x,
            y: config.y,
            texture: config.texture || enemyData.texture, // fallback эмодзи
            spriteKey: config.spriteKey || enemyData.spriteKey // ключ для спрайта
        };
        super(scene, enemyConfig);
        
        // Специфичные для врагов свойства
        PropertyUtils.defineProperty(this, "_damage", undefined);
        PropertyUtils.defineProperty(this, "_speed", undefined);
        PropertyUtils.defineProperty(this, "_cooldown", undefined);
        PropertyUtils.defineProperty(this, "_attackRange", undefined);
        PropertyUtils.defineProperty(this, "_lastAttackTime", 0);
        PropertyUtils.defineProperty(this, "_target", null);
        PropertyUtils.defineProperty(this, "_enemyType", undefined);
        PropertyUtils.defineProperty(this, "_enemyData", undefined);
        PropertyUtils.defineProperty(this, "_id", undefined);
        PropertyUtils.defineProperty(this, "_size", undefined);
        
        // Инициализация свойств врага
        this._damage = enemyConfig.damage;
        this._speed = enemyConfig.speed;
        this._cooldown = enemyConfig.cooldown;
        this._attackRange = enemyConfig.attackRange;
        this._size = enemyConfig.size;
        this._lastAttackTime = 0;
        this._target = null;
        this._id = `${enemyType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this._enemyType = enemyType;
        this._enemyData = enemyData;

        this.physicsBody.setBounce(PHYSICS_CONSTANTS.ENEMY_BOUNCE);
        this.physicsBody.setDrag(PHYSICS_CONSTANTS.ENEMY_DRAG_X, PHYSICS_CONSTANTS.ENEMY_DRAG_Y);
        
        // Отправляем событие появления врага
        if (Enemy.eventSystem) {
            const intensity = this.size > 1 ? this.size : 0.8;
            Enemy.eventSystem.emit(EVENT_TYPES.ENEMY_SPAWN, {
                enemy: this,
                intensity: intensity
            });
        }
    }
        // Геттеры для врагов
        get damage() { return this._damage; }
        get speed() { return this._speed; }
        get cooldown() { return this._cooldown; }
        get attackRange() { return this._attackRange; }
        get size() { return this._size; }
        get target() { return this._target; }
        get id() { return this._id; }
        get enemyType() { return this._enemyType; }
        get enemyData() { return this._enemyData; }
        // Сеттеры для врагов
        set damage(value) { this._damage = Math.max(0, value); }
        set speed(value) { this._speed = Math.max(0, value); }
        set cooldown(value) { this._cooldown = Math.max(0, value); }
        set attackRange(value) { this._attackRange = Math.max(0, value); }
        set target(value) { 
            const oldTarget = this._target;
            this._target = value; 
            
            // Отправляем событие смены цели через EventSystem
            if (Enemy.eventSystem) {
                Enemy.eventSystem.emit(EVENT_TYPES.ENEMY_TARGET_CHANGED, {
                    enemy: this,
                    oldTarget: oldTarget,
                    newTarget: value
                });
            }
        }
        set enemyType(value) {
            this._enemyType = value;
            this._enemyData = enemyTypes[value];
            this.setupEnemyBehavior();
        }
    // Переопределяем update для ИИ поведения
    update(_time, _delta) {
        if (!this._isAlive || !this.scene)
            return;
        
        // Если есть цель (яйцо), движемся к ней
        if (this._target && this._target._isAlive) {
            this.moveToTarget();
            // Обновляем HealthBar при движении врага
            this.updateHealthBar();
            return;
        }
        
        // Вызываем родительский update для базовой логики
        super.update(_time, _delta);
    }
    
    /**
     * Движется к цели (яйцу) с определенной скоростью через Phaser Physics
     */
    moveToTarget() {
        if (!this._target || !this._target._isAlive || !this._isAlive) {
            this.stopMovement();
            return;
        }
        
        // Вычисляем расстояние до цели
        const distance = GeometryUtils.distance(this.x, this.y, this._target.x, this._target.y);
        
        // Если цель в радиусе атаки, останавливаемся и атакуем
        if (distance <= this.attackRange) {
            this.stopMovement();
            this.attack(this._target);
            return;
        }
        
        // Стандартное линейное движение
        this.moveToTargetLinear();
    }
    
    /**
     * Стандартное линейное движение к цели
     */
    moveToTargetLinear() {
        // Вычисляем направление к цели
        const direction = new Phaser.Math.Vector2(
            this._target.x - this.x,
            this._target.y - this.y
        ).normalize();
        
        // Устанавливаем скорость через Phaser Physics
        const actualSpeed = this.speed; // скорость уже в пикселях в секунду
        const velocityX = direction.x * actualSpeed;
        const velocityY = direction.y * actualSpeed;
        
        this.physicsBody.setVelocity(velocityX, velocityY);
        
        // Поворачиваем спрайт в направлении движения (опционально)
        if (velocityX !== 0 || velocityY !== 0) {
            const angle = GeometryUtils.angle(0, 0, velocityX, velocityY) * (180 / Math.PI);
            this.setRotation(angle * (Math.PI / 180));
        }
    }
    
    // Неиспользуемые методы движения удалены
    
    // stopMovement наследуется от GameObject
    // Переопределяем атаку для разных типов врагов
    attack(target) {
        if (!this._isAlive || !this.scene)
            return false;
            
        // Проверяем кулдаун
        const currentTime = this.scene.time.now;
        if (currentTime - this._lastAttackTime < this.cooldown) {
            return false; // Еще на перезарядке
        }
        
        const attackTarget = target || this._target;
        if (!attackTarget || !attackTarget.isAlive)
            return false;
        const distance = GeometryUtils.distance(this.x, this.y, attackTarget.x, attackTarget.y);
        if (distance > this.attackRange)
            return false;
            
        // Обновляем время последней атаки
        this._lastAttackTime = currentTime;
        
        // Отправляем событие атаки
        if (Enemy.eventSystem) {
            Enemy.eventSystem.emit(EVENT_TYPES.ENEMY_ATTACK, {
                enemy: this,
                target: attackTarget,
                damage: this.damage
            });
        }
        
        // Базовая атака для всех типов врагов
        this.performBasicAttack(attackTarget);
        return true;
    }
    performBasicAttack(target) {
        // Базовая атака
        target.takeDamage(this.damage);
        this.emit('attack', target, this.damage);
    }

    
    // Метод для работы с целями
    setTarget(target) {
        this.target = target;
    }
    

    /**
     * Переопределяем takeDamage для добавления эффектов
     */
    takeDamage(damage) {
        // Вызываем родительский метод
        super.takeDamage(damage);
        
        // Отправляем событие получения урона
        if (Enemy.eventSystem) {
            const intensity = damage / this.maxHealth;
            Enemy.eventSystem.emit(EVENT_TYPES.ENEMY_DAMAGE, {
                enemy: this,
                damage: damage,
                intensity: Math.min(intensity, 1.0)
            });
        }
    }
    
    /**
     * Переопределяем die() для обработки дропа предметов и эффектов
     */
    die() {
        // Отправляем событие смерти
        if (Enemy.eventSystem) {
            Enemy.eventSystem.emit(EVENT_TYPES.ENEMY_DEATH, {
                enemy: this,
                position: { x: this.x, y: this.y }
            });
        }
        
        // Обрабатываем дроп предметов перед смертью
        this.handleItemDrop();
        
        // Вызываем родительский метод
        super.die();
    }
    
    
    
    /**
     * Обработка дропа предметов при смерти
     */
    handleItemDrop() {
        if (Enemy.itemDropSystem && Enemy.probabilitySystem) {
            // Проверяем вероятность дропа через ProbabilitySystem
            if (Enemy.probabilitySystem.rollItemDrop(this.enemyType)) {
                Enemy.itemDropSystem.dropRandomItem(this.x, this.y);
            }
        }
    }

    // Уничтожение
    destroy() {
        super.destroy();
    }
    /**
     * Статический метод для инициализации систем дропа
     */
    static initDropSystems(scene, egg, probabilitySystem, abilitySystem = null) {
        Enemy.itemDropSystem = new ItemDropSystem(scene, egg, probabilitySystem, abilitySystem);
        Enemy.probabilitySystem = probabilitySystem;
    }
    
    /**
     * Статический метод для инициализации системы событий
     */
    static initEventSystem(eventSystem) {
        Enemy.eventSystem = eventSystem;
    }
    
    /**
     * Статический метод для создания врага с полной настройкой
     * Создает врага, настраивает графику, применяет усиление и создает HealthBar
     */
    static CreateEnemy(scene, enemyType, x, y, enhancementMultiplier = 1) {
        const enemyData = enemyTypes[enemyType];
        
        // Применяем усиление к характеристикам
        const enhancedHealth = enemyData.health * enhancementMultiplier;
        const enhancedDamage = enemyData.damage * enhancementMultiplier;
        const enhancedSize = enemyData.size * enhancementMultiplier;
        
        // Создаем врага с усиленными характеристиками
        const enemy = new Enemy(scene, {
            x, y, enemyType,
            ...enemyData, // Сначала все базовые данные из enemyTypes
            health: enhancedHealth, // Переопределяем усиленными значениями
            damage: enhancedDamage,
            size: enhancedSize
        });
        
        // Настраиваем размер на основе усиленного размера
        const enemySize = PHYSICS_CONSTANTS.BASE_ENEMY_SIZE * enhancedSize;
        enemy.setScale(enemySize / PHYSICS_CONSTANTS.DEFAULT_TEXTURE_SIZE);
        
        // Устанавливаем глубину отрисовки (поверх защиты)
        enemy.setDepth(30);
        
        // Создаем полосу здоровья
        enemy.createHealthBar({
            showWhenFull: false,
            showWhenEmpty: true,
            offsetY: -(enemySize / 2 + PHYSICS_CONSTANTS.HEALTH_BAR_OFFSET),
            colors: {
                background: COLORS.BLACK,
                health: COLORS.HEALTH_GREEN,
                border: COLORS.WHITE
            }
        });
        
        // Эффекты появления теперь обрабатываются через EventSystem в конструкторе
        
        return enemy;
    }
    
    // getGameProgress удален - теперь прогресс передается как параметр
}
