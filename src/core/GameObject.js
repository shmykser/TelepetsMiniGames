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
        Object.defineProperty(this, "_attackRange", {
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
        // Phaser компоненты
        Object.defineProperty(this, "_body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_tweenManager", {
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
        this._attackRange = config.attackRange || 50;
        // Добавляем в сцену и физику
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this._body = this.body;
        this._body.setCollideWorldBounds(true);
        this._body.setBounce(0.2);
        this._body.setDrag(100, 100); // Сопротивление для плавного движения
        // Получаем менеджеры из сцены
        this._tweenManager = scene.tweens;
        // Настраиваем события физики
        this.setupPhysicsEvents();
    }
    // Геттеры для свойств
    get health() { return this._health; }
    get maxHealth() { return this._maxHealth; }
    get damage() { return this._damage; }
    get speed() { return this._speed; }
    get cooldown() { return this._cooldown; }
    get attackRange() { return this._attackRange; }
    get isMoving() { return this._body.velocity.length() > 0; }
    get isAlive() { return this._isAlive; }
    get target() { return this._target; }
    get physicsBody() { return this._body; }
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
    set attackRange(value) { this._attackRange = Math.max(0, value); }
    // Настройка событий физики
    setupPhysicsEvents() {
        // События столкновения
        this._body.onWorldBounds = true;
        this.on('worldbounds', this.onWorldBounds, this);
        // События движения
        this._body.onOverlap = true;
    }
    onWorldBounds() {
        this.emit('worldbounds', this);
    }
    // Методы движения через Phaser Physics
    startMovement(direction) {
        if (!this._isAlive)
            return;
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
        this._body.setVelocity(0, 0);
    }
    // Движение с помощью Phaser Tweens
    moveToPointTween(x, y, duration = 1000) {
        return this._tweenManager.add({
            targets: this,
            x: x,
            y: y,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                this.stopMovement();
            }
        });
    }
    // Методы атаки через Phaser Timer
    attack(target) {
        if (!this._isAlive || !this.scene)
            return false;
        const currentTime = this.scene.time.now;
        if (currentTime - this._lastAttackTime < this._cooldown) {
            return false; // Еще на перезарядке
        }
        const attackTarget = target || this._target;
        if (!attackTarget || !attackTarget._isAlive) {
            return false;
        }
        // Проверяем расстояние до цели через Phaser.Math.Distance
        const distance = Phaser.Math.Distance.Between(this.x, this.y, attackTarget.x, attackTarget.y);
        if (distance > this._attackRange) {
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
        if (!this._isAlive || !this.scene)
            return;
        this.health -= damage;
        this.emit('damage', damage, this._health);
        // Эффект получения урона через Phaser Tween
        this._tweenManager.add({
            targets: this,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.clearTint();
            }
        });
    }
    // Методы определения цели через Phaser.Math
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
    // Поиск целей в радиусе через Phaser.Geom.Circle
    findTargetsInRange(targets, range = this._attackRange) {
        const circle = new Phaser.Geom.Circle(this.x, this.y, range);
        return targets.filter(target => {
            if (!target._isAlive)
                return false;
            return Phaser.Geom.Circle.Contains(circle, target.x, target.y);
        });
    }
    // Анимация смерти через Phaser Tweens
    die() {
        this._isAlive = false;
        this._target = null;
        this.stopMovement();
        // Анимация смерти с помощью Phaser Tween
        if (this.scene) {
            this._tweenManager.add({
                targets: this,
                alpha: 0.3,
                scaleX: 0.5,
                scaleY: 0.5,
                tint: 0x666666,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    this.emit('death', this);
                }
            });
        }
        else {
            // Если сцена недоступна, просто эмитим событие
            this.emit('death', this);
        }
    }
    // Обновление через Phaser update цикл
    update(_time, _delta) {
        if (!this._isAlive)
            return;
        // Автоматическое преследование цели
        if (this._target && this._target._isAlive) {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this._target.x, this._target.y);
            if (distance > this._attackRange) {
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
    // Дополнительные методы для работы с Phaser
    addPhysicsCollider(other, callback) {
        this.scene.physics.add.collider(this, other, callback);
    }
    addPhysicsOverlap(other, callback) {
        this.scene.physics.add.overlap(this, other, callback);
    }
    // Эффекты через Phaser Tweens
    shake(duration = 200, intensity = 5) {
        if (!this.scene)
            return;
        this._tweenManager.add({
            targets: this,
            x: this.x + Phaser.Math.Between(-intensity, intensity),
            y: this.y + Phaser.Math.Between(-intensity, intensity),
            duration: duration,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.setPosition(this.x, this.y);
            }
        });
    }
    pulse(scale = 1.2, duration = 300) {
        if (!this.scene)
            return;
        this._tweenManager.add({
            targets: this,
            scaleX: scale,
            scaleY: scale,
            duration: duration,
            yoyo: true,
            ease: 'Power2'
        });
    }
    // Уничтожение объекта
    destroy() {
        this.emit('destroy', this);
        super.destroy();
    }
}
