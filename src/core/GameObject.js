import Phaser from 'phaser';
export class GameObject extends Phaser.GameObjects.Sprite {
    constructor(scene, config) {
        super(scene, config.x || 0, config.y || 0, config.texture || '');
        // Основные свойства
        Object.defineProperty(this, "_health", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_maxHealth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_damage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_speed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_cooldown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_lastAttackTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        // Состояние
        Object.defineProperty(this, "_isMoving", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_isAlive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "_target", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        // Физика
        Object.defineProperty(this, "_body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Инициализация свойств
        this._health = config.health;
        this._maxHealth = config.health;
        this._damage = config.damage;
        this._speed = config.speed;
        this._cooldown = config.cooldown;
        // Добавляем в сцену
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this._body = this.body;
        this._body.setCollideWorldBounds(true);
    }
    // Геттеры для свойств
    get health() { return this._health; }
    get maxHealth() { return this._maxHealth; }
    get damage() { return this._damage; }
    get speed() { return this._speed; }
    get cooldown() { return this._cooldown; }
    get isMoving() { return this._isMoving; }
    get isAlive() { return this._isAlive; }
    get target() { return this._target; }
    // Сеттеры для свойств
    set health(value) {
        this._health = Math.max(0, Math.min(value, this._maxHealth));
        if (this._health <= 0) {
            this.die();
        }
    }
    set damage(value) { this._damage = Math.max(0, value); }
    set speed(value) { this._speed = Math.max(0, value); }
    set cooldown(value) { this._cooldown = Math.max(0, value); }
    // Методы движения
    startMovement(direction) {
        if (!this._isAlive)
            return;
        this._isMoving = true;
        const normalizedDirection = direction.normalize();
        this._body.setVelocity(normalizedDirection.x * this._speed, normalizedDirection.y * this._speed);
    }
    startMovementToPoint(x, y) {
        if (!this._isAlive)
            return;
        const direction = new Phaser.Math.Vector2(x - this.x, y - this.y);
        this.startMovement(direction);
    }
    stopMovement() {
        this._isMoving = false;
        this._body.setVelocity(0, 0);
    }
    // Методы атаки
    attack(target) {
        if (!this._isAlive)
            return false;
        const currentTime = this.scene.time.now;
        if (currentTime - this._lastAttackTime < this._cooldown) {
            return false; // Еще на перезарядке
        }
        const attackTarget = target || this._target;
        if (!attackTarget || !attackTarget._isAlive) {
            return false;
        }
        // Проверяем расстояние до цели
        const distance = Phaser.Math.Distance.Between(this.x, this.y, attackTarget.x, attackTarget.y);
        if (distance > this.getAttackRange()) {
            return false; // Цель слишком далеко
        }
        // Наносим урон
        attackTarget.takeDamage(this._damage);
        this._lastAttackTime = currentTime;
        // Вызываем событие атаки
        this.emit('attack', attackTarget, this._damage);
        return true;
    }
    takeDamage(damage) {
        if (!this._isAlive)
            return;
        this.health -= damage;
        this.emit('damage', damage, this._health);
        // Эффект получения урона
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
    }
    // Методы определения цели
    setTarget(target) {
        this._target = target;
        this.emit('targetChanged', target);
    }
    findNearestTarget(targets) {
        if (targets.length === 0)
            return null;
        let nearestTarget = null;
        let nearestDistance = Infinity;
        for (const target of targets) {
            if (!target._isAlive)
                continue;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestTarget = target;
            }
        }
        return nearestTarget;
    }
    // Вспомогательные методы
    getAttackRange() {
        return 50; // Базовый радиус атаки
    }
    die() {
        this._isAlive = false;
        this._isMoving = false;
        this._target = null;
        this.stopMovement();
        // Анимация смерти
        this.setTint(0x666666);
        this.setAlpha(0.5);
        this.emit('death', this);
    }
    // Обновление (вызывается в update цикле сцены)
    update(_time, _delta) {
        if (!this._isAlive)
            return;
        // Автоматическое преследование цели
        if (this._target && this._target._isAlive) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this._target.x, this._target.y);
            if (distance > this.getAttackRange()) {
                // Двигаемся к цели
                this.startMovementToPoint(this._target.x, this._target.y);
            }
            else {
                // Останавливаемся и атакуем
                this.stopMovement();
                this.attack();
            }
        }
    }
    // Уничтожение объекта
    destroy() {
        this.emit('destroy', this);
        super.destroy();
    }
}
