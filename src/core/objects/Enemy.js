import { GameObject } from '../GameObject';
import { enemyTypes } from '../types/enemyTypes';
import { settings } from '../../../config/settings.js';
import { MovementSystem } from '../../systems/movement/MovementSystem.js';
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
        Object.defineProperty(this, "_enemyType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_detectionRange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_enemyData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_lastPlayerPosition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "_isChasing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_chaseTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._id = `${enemyType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this._enemyType = enemyType;
        this._detectionRange = config.detectionRange || 150;
        this._enemyData = enemyData;
        
        // Отладочный лог для проверки типа врага
        if (enemyType === 'ant') {
            console.log(`🐜 Enemy Constructor Debug:`, {
                enemyType: enemyType,
                _enemyType: this._enemyType,
                id: this._id
            });
        }
        // Настраиваем свойства из типа врага
        this._size = enemyData.size;
        this._canFly = enemyData.canFly;
        
        // Инициализируем систему движения
        this._movementSystem = null;
        this._useUniqueMovement = config.useUniqueMovement !== false; // По умолчанию включено
        
        // Логи для отладки скорости (только для муравья)
        if (enemyType === 'ant') {
            console.log(`🐜 Ant Speed Debug:`, {
                originalSpeed: enemyData.speed,
                finalSpeed: this.speed,
                note: 'Speed is now used as coefficient (no *20 multiplication)'
            });
        }
        
        
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
            console.log(`🔄 Created MovementSystem for scene`);
        }
        this._movementSystem = this.scene.movementSystem;
        
        // Отладочный лог
        if (this.enemyType === 'ant') {
            console.log(`🐜 MovementSystem initialized for ${this.enemyType}`, {
                hasMovementSystem: !!this._movementSystem,
                sceneHasMovementSystem: !!this.scene.movementSystem
            });
        }
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
        
        // Ищем игрока в сцене (старая логика для совместимости)
        const player = this.findPlayer();
        if (!player)
            return;
        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
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
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this._target.x, this._target.y);
        
        // Если цель в радиусе атаки, останавливаемся и атакуем
        if (distance <= this.attackRange) {
            this.stopMovement();
            this.attack(this._target);
            return;
        }
        
        // Используем уникальное движение если включено
        if (this._useUniqueMovement && this._movementSystem) {
            // Отладочный лог для проверки типа врага
            if (this.enemyType === 'ant' && Math.random() < 0.1) {
                console.log(`🐜 Enemy Debug:`, {
                    enemyType: this.enemyType,
                    useUniqueMovement: this._useUniqueMovement,
                    hasMovementSystem: !!this._movementSystem,
                    position: `(${this.x.toFixed(1)}, ${this.y.toFixed(1)})`,
                    target: this._target ? `(${this._target.x.toFixed(1)}, ${this._target.y.toFixed(1)})` : 'none',
                    movementType: 'UNIQUE'
                });
            }
            this._movementSystem.updateEnemyMovement(this, this._target, this.scene.game.loop.delta);
            return;
        }
        
        // Логируем, если используется линейное движение
        if (this.enemyType === 'ant' && Math.random() < 0.1) {
            console.log(`🐜 Enemy Debug:`, {
                enemyType: this.enemyType,
                useUniqueMovement: this._useUniqueMovement,
                hasMovementSystem: !!this._movementSystem,
                position: `(${this.x.toFixed(1)}, ${this.y.toFixed(1)})`,
                target: this._target ? `(${this._target.x.toFixed(1)}, ${this._target.y.toFixed(1)})` : 'none',
                movementType: 'LINEAR'
            });
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
        
        // Логи для отладки движения (только для муравья)
        if (this.enemyType === 'ant' && Math.random() < 0.1) { // 10% шанс логирования
            console.log(`🐜 Ant Movement Debug:`, {
                position: `(${this.x.toFixed(1)}, ${this.y.toFixed(1)})`,
                target: `(${this._target.x.toFixed(1)}, ${this._target.y.toFixed(1)})`,
                distance: Phaser.Math.Distance.Between(this.x, this.y, this._target.x, this._target.y).toFixed(1),
                direction: `(${direction.x.toFixed(3)}, ${direction.y.toFixed(3)})`,
                speed: {
                    base: baseSpeed,
                    coefficient: this.speed,
                    actual: actualSpeed.toFixed(1)
                },
                velocity: `(${velocityX.toFixed(1)}, ${velocityY.toFixed(1)})`,
                deltaTime: this.scene.game.loop.delta,
                movementType: 'linear'
            });
        }
        
        this.physicsBody.setVelocity(velocityX, velocityY);
        
        // Поворачиваем спрайт в направлении движения (опционально)
        if (velocityX !== 0 || velocityY !== 0) {
            const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
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
        const distance = Phaser.Math.Distance.Between(this.x, this.y, attackTarget.x, attackTarget.y);
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
        
        super.destroy();
    }
    /**
     * Статический метод для создания врага с полной настройкой
     * Создает врага, настраивает графику и создает HealthBar
     */
    static CreateEnemy(scene, enemyType, x, y) {
        const enemyData = enemyTypes[enemyType];
        // Создаем врага
        const enemy = new Enemy(scene, {
            x: x,
            y: y,
            texture: enemyType,
            enemyType: enemyType,
            health: enemyData.health,
            damage: enemyData.damage,
            speed: enemyData.speed * 10, // Умножаем на 10 для Phaser координат
            cooldown: enemyData.cooldown * 1000 // Умножаем на 1000 для миллисекунд
        });
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
