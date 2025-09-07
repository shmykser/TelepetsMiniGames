import { GameObject } from '../GameObject';
import { enemyTypes } from '../types/enemyTypes';
import { settings } from '../../../config/settings.js';
import { MovementSystem } from '../../systems/movement/MovementSystem.js';
import { PropertyUtils } from '../../utils/PropertyUtils.js';
import { GeometryUtils } from '../../utils/GeometryUtils.js';
import { AnimationLibrary } from '../../animations/AnimationLibrary.js';
export class Enemy extends GameObject {
    constructor(scene, config) {
        const enemyType = config.enemyType || 'ant';
        const enemyData = enemyTypes[enemyType];
        // Настройки из типа врага (приоритет у переданных значений)
        const enemyConfig = {
            health: config.health !== undefined ? config.health : enemyData.health,
            damage: config.damage !== undefined ? config.damage : enemyData.damage,
            speed: config.speed !== undefined ? config.speed : enemyData.speed, // используем скорость как коэффициент
            cooldown: config.cooldown !== undefined ? config.cooldown : enemyData.cooldown * 1000, // конвертируем секунды в мс
            attackRange: config.attackRange || 40,
            x: config.x,
            y: config.y,
            texture: config.texture
        };
        super(scene, enemyConfig);
        // Используем утилитарную функцию для определения свойств
        PropertyUtils.defineProperty(this, "_enemyType", undefined);
        PropertyUtils.defineProperty(this, "_detectionRange", undefined);
        PropertyUtils.defineProperty(this, "_enemyData", undefined);
        PropertyUtils.defineProperty(this, "_lastPlayerPosition", null);
        PropertyUtils.defineProperty(this, "_isChasing", false);
        PropertyUtils.defineProperty(this, "_chaseTimer", undefined);
        PropertyUtils.defineProperty(this, "_id", undefined);
        PropertyUtils.defineProperty(this, "enhancementLevel", undefined);
        PropertyUtils.defineProperty(this, "enhancementParticles", undefined);
        PropertyUtils.defineProperty(this, "displayName", undefined);
        this._id = `${enemyType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this._enemyType = enemyType;
        this._detectionRange = config.detectionRange || 150;
        this._enemyData = enemyData;
        
        // Инициализация свойств усиления
        this.enhancementLevel = null;
        this.enhancementParticles = null;
        this.displayName = enemyData.name;
        
        // Настраиваем свойства из типа врага
        this._size = enemyData.size;
        this._canFly = enemyData.canFly;
        
        // Инициализируем систему движения
        this._movementSystem = null;
        this._useUniqueMovement = config.useUniqueMovement !== false; // По умолчанию включено
        
        
        
        // Настраиваем поведение в зависимости от типа
        this.setupEnemyBehavior();
    }
    setupEnemyBehavior() {
        // Настраиваем физику
        this.physicsBody.setBounce(0.1);
        this.physicsBody.setDrag(50, 50);
        
        // Инициализируем систему движения если включена
        if (this._useUniqueMovement && this.scene) {
            this.initializeMovementSystem();
        }
    }
    
    /**
     * Инициализирует систему движения для врага
     */
    initializeMovementSystem() {
        if (!this.scene || this._movementSystem) return;
        
        // Получаем или создаем систему движения в сцене
        if (!this.scene.movementSystem) {
            this.scene.movementSystem = new MovementSystem(this.scene);
        }
        this._movementSystem = this.scene.movementSystem;
        
    }
    // Переопределяем update для ИИ поведения
    update(_time, _delta) {
        if (!this._isAlive || !this.scene)
            return;
        
                // Обновляем позицию частиц усиления
                if (this.enhancementParticles) {
                    AnimationLibrary.updateParticlesPosition(this.enhancementParticles, this.x, this.y);
                    // Отладочная информация (только для первых нескольких обновлений)
                    if (this._particleUpdateCount === undefined) {
                        this._particleUpdateCount = 0;
                    }
                    if (this._particleUpdateCount < 3) {
                        this._particleUpdateCount++;
                    }
                }
        
        // Если есть цель (яйцо), движемся к ней
        if (this._target && this._target._isAlive) {
            this.moveToTarget();
            // Обновляем HealthBar при движении врага
            this.updateHealthBar();
            return;
        }
        
        // Ищем игрока в сцене (старая логика для совместимости)
        const player = this.findPlayer();
        if (!player)
            return;
        const distanceToPlayer = GeometryUtils.distance(this.x, this.y, player.x, player.y);
        // Логика поведения в зависимости от расстояния
        if (distanceToPlayer <= this._detectionRange) {
            this.handlePlayerDetected(player, distanceToPlayer);
        }
        else {
            this.handlePlayerLost();
        }
        
        // Обновляем HealthBar при движении врага
        this.updateHealthBar();
        
        // Вызываем родительский update для базовой логики
        super.update(_time, _delta);
    }
    findPlayer() {
        // Базовый поиск игрока - можно переопределить в дочерних классах
        return this._target;
    }
    handlePlayerDetected(player, distance) {
        this._isChasing = true;
        this._lastPlayerPosition = new Phaser.Math.Vector2(player.x, player.y);
        if (distance <= this.attackRange) {
            // В радиусе атаки - атакуем
            this.stopMovement();
            this.attack(player);
        }
        else {
            // Вне радиуса атаки - преследуем
            this.chasePlayer(player);
        }
    }
    handlePlayerLost() {
        if (this._isChasing) {
            // Игрок потерян - продолжаем преследование последней известной позиции
            if (this._lastPlayerPosition) {
                this.startMovementToPoint(this._lastPlayerPosition.x, this._lastPlayerPosition.y);
                // Через некоторое время прекращаем преследование
                if (this._chaseTimer) {
                    this._chaseTimer.destroy();
                }
                this._chaseTimer = this.scene.time.delayedCall(3000, () => {
                    this._isChasing = false;
                    this._lastPlayerPosition = null;
                    this.stopMovement();
                });
            }
        }
    }
    chasePlayer(player) {
        // Базовое преследование - движемся к игроку
        this.startMovementToPoint(player.x, player.y);
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
        
        // Используем уникальное движение если включено
        if (this._useUniqueMovement && this._movementSystem) {
            this._movementSystem.updateEnemyMovement(this, this._target, this.scene.game.loop.delta);
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
        
        // Устанавливаем скорость через Phaser Physics (speed как коэффициент)
        const baseSpeed = 10; // Базовая скорость в пикселях в секунду
        const actualSpeed = baseSpeed * this.speed;
        const velocityX = direction.x * actualSpeed;
        const velocityY = direction.y * actualSpeed;
        
        
        this.physicsBody.setVelocity(velocityX, velocityY);
        
        // Поворачиваем спрайт в направлении движения (опционально)
        if (velocityX !== 0 || velocityY !== 0) {
            const angle = GeometryUtils.angle(0, 0, velocityX, velocityY) * (180 / Math.PI);
            this.setRotation(angle * (Math.PI / 180));
        }
    }
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
        
        // Базовая атака для всех типов врагов
        this.performBasicAttack(attackTarget);
        return true;
    }
    performBasicAttack(target) {
        // Базовая атака
        target.takeDamage(this.damage);
        this.emit('attack', target, this.damage);
        
        // Логирование атаки
        
        // Эффект атаки
        this.shake(100, 2);
    }
    /**
     * Получает реакцию врага на защитный объект
     */
    getReactionToDefence(defenceType) {
        const reactions = this._enemyData.reactions;
        switch (defenceType) {
            case 'sugar': return reactions.sugar;
            case 'stone': return reactions.stone;
            case 'crack': return reactions.crack;
            case 'spikes': return reactions.spikes;
            case 'madCucumber': return reactions.madCucumber;
            case 'pit': return reactions.pit;
            default: return 'ignore';
        }
    }
    // Геттеры
    get id() { return this._id; }
    get enemyType() { return this._enemyType; }
    get detectionRange() { return this._detectionRange; }
    get isChasing() { return this._isChasing; }
    get enemyData() { return this._enemyData; }
    // Сеттеры
    set enemyType(value) {
        this._enemyType = value;
        this._enemyData = enemyTypes[value];
        this.setupEnemyBehavior();
    }
    set detectionRange(value) { this._detectionRange = Math.max(0, value); }
    
    /**
     * Устанавливает цель для врага (яйцо)
     */
    setTarget(target) {
        this._target = target;
        this.emit('targetChanged', target);
    }
    
    /**
     * Включает/выключает уникальное движение
     */
    setUniqueMovement(enabled) {
        this._useUniqueMovement = enabled;
        if (enabled && !this._movementSystem) {
            this.initializeMovementSystem();
        }
    }
    
    /**
     * Получает статус уникального движения
     */
    getUniqueMovement() {
        return this._useUniqueMovement;
    }

    // Уничтожение с очисткой таймеров
    destroy() {
        if (this._chaseTimer) {
            this._chaseTimer.destroy();
            this._chaseTimer = undefined;
        }
        
        // Очищаем систему движения
        if (this._movementSystem) {
            this._movementSystem.removePattern(this._id);
        }
        
            // Очищаем эффекты усиления
            if (this.enhancementParticles) {
                AnimationLibrary.destroyParticles(this.enhancementParticles);
                this.enhancementParticles = null;
            }
        
        super.destroy();
    }
    /**
     * Статический метод для создания врага с полной настройкой
     * Создает врага, настраивает графику и создает HealthBar
     */
    static CreateEnemy(scene, enemyType, x, y) {
        const enemyData = enemyTypes[enemyType];
        
        const config = {
            x: x,
            y: y,
            texture: enemyType,
            enemyType: enemyType,
            health: enemyData.health,
            damage: enemyData.damage,
            speed: enemyData.speed * 10, // Умножаем на 10 для Phaser координат
            cooldown: enemyData.cooldown * 1000, // Умножаем на 1000 для миллисекунд
            attackRange: enemyData.attackRange,
            size: enemyData.size,
            canFly: enemyData.canFly
        };
        
        // Используем фабричный метод из базового класса
        const enemy = this.createGameObject(scene, enemyType, config);
        // Настраиваем размер на основе типа врага (стандарт 10 пикселей * size)
        const baseSize = 10; // базовый размер в пикселях
        const enemySize = baseSize * enemyData.size;
        enemy.setScale(enemySize / 32); // 32 - это размер текстуры по умолчанию в Phaser
        // Создаем полосу здоровья
        enemy.createHealthBar({
            showWhenFull: false, // Не показываем при полном здоровье
            showWhenEmpty: true, // Показываем при смерти
            offsetY: -(enemySize / 2 + 5), // Смещение вверх от объекта с учетом размера
            colors: {
                background: 0x000000,
                health: 0x00ff00,
                border: 0xffffff
            }
        });
        return enemy;
    }
}
