import { GameObject } from '../GameObject';
import { enemyTypes } from '../types/enemyTypes';
export class Enemy extends GameObject {
    constructor(scene, config) {
        const enemyType = config.enemyType || 'ant';
        const enemyData = enemyTypes[enemyType];
        // Настройки из типа врага
        const enemyConfig = {
            health: config.health || enemyData.health,
            damage: config.damage || enemyData.damage,
            speed: config.speed || enemyData.speed * 20, // конвертируем 1-10 в пиксели
            cooldown: config.cooldown || enemyData.cooldown * 1000, // конвертируем секунды в мс
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
        // Настраиваем свойства из типа врага
        this._size = enemyData.size;
        this._canFly = enemyData.canFly;
        // Настраиваем поведение в зависимости от типа
        this.setupEnemyBehavior();
    }
    setupEnemyBehavior() {
        // Настраиваем физику
        this.physicsBody.setBounce(0.1);
        this.physicsBody.setDrag(50, 50);
    }
    // Переопределяем update для ИИ поведения
    update(_time, _delta) {
        if (!this._isAlive || !this.scene)
            return;
        // Ищем игрока в сцене
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
    // Переопределяем атаку для разных типов врагов
    attack(target) {
        if (!this._isAlive || !this.scene)
            return false;
        const attackTarget = target || this._target;
        if (!attackTarget || !attackTarget.isAlive)
            return false;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, attackTarget.x, attackTarget.y);
        if (distance > this.attackRange)
            return false;
        // Базовая атака для всех типов врагов
        this.performBasicAttack(attackTarget);
        return true;
    }
    performBasicAttack(target) {
        // Базовая атака
        target.takeDamage(this.damage);
        this.emit('attack', target, this.damage);
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
    // Уничтожение с очисткой таймеров
    destroy() {
        if (this._chaseTimer) {
            this._chaseTimer.destroy();
            this._chaseTimer = undefined;
        }
        super.destroy();
    }
}
