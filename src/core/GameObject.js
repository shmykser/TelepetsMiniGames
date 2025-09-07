import Phaser from 'phaser';
import { HealthBar } from '../components/HealthBar';
import { DamageIndicator } from '../components/DamageIndicator';
import { PropertyUtils } from '../utils/PropertyUtils.js';
export class GameObject extends Phaser.GameObjects.Sprite {
    constructor(scene, config) {
        super(scene, config.x || 0, config.y || 0, config.texture || '');
        // Основные свойства - используем утилитарную функцию
        PropertyUtils.defineProperty(this, "_health", undefined);
        PropertyUtils.defineProperty(this, "_maxHealth", undefined);
        PropertyUtils.defineProperty(this, "_damage", undefined);
        PropertyUtils.defineProperty(this, "_speed", undefined);
        PropertyUtils.defineProperty(this, "_cooldown", undefined);
        PropertyUtils.defineProperty(this, "_attackRange", undefined);
        PropertyUtils.defineProperty(this, "_lastAttackTime", 0);
        // Состояние - используем утилитарную функцию
        PropertyUtils.defineProperty(this, "_isAlive", true);
        PropertyUtils.defineProperty(this, "_target", null);
        PropertyUtils.defineProperty(this, "_size", 1); // размер для взаимодействия с ямой
        PropertyUtils.defineProperty(this, "_canFly", false); // способность летать
        // Phaser компоненты
        PropertyUtils.defineProperty(this, "_body", undefined);
        PropertyUtils.defineProperty(this, "_tweenManager", undefined);
        PropertyUtils.defineProperty(this, "_healthBar", undefined);
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
    // Геттеры для HealthObject интерфейса
    get objectWidth() { return this.displayWidth; }
    get objectHeight() { return this.displayHeight; }
    get objectScaleX() { return this.scaleX; }
    get objectScaleY() { return this.scaleY; }
    // Сеттеры для свойств
    set health(value) {
        this._health = Math.max(0, Math.min(value, this._maxHealth));
        this.updateHealthBar();
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
        
        console.log(`💥 GameObject.takeDamage: получен урон ${damage}, здоровье было ${this.health}`);
        this.health -= damage;
        console.log(`💥 GameObject.takeDamage: здоровье стало ${this.health}`);
        this.emit('damage', damage, this._health);
        
        // Показываем цифровой урон
        DamageIndicator.showDamageWithOffset(this.scene, this, damage, {
            duration: 1500,
            driftDistance: 60,
            fontSize: 28,
            color: 0xff0000, // Красный цвет
            strokeColor: 0xffffff, // Белая обводка
            strokeThickness: 3
        });
        
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
        
        // Проверяем смерть
        if (this.health <= 0) {
            this.die();
        }
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
        console.log(`💀 GameObject.die: вызывается die() для объекта`);
        this._isAlive = false;
        this._target = null;
        this.stopMovement();
        
        // Уничтожаем HealthBar сразу при смерти
        this.destroyHealthBar();
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
                    console.log(`💀 GameObject.die: анимация смерти завершена, эмитим событие death`);
                    this.emit('death', this);
                    // Если это враг, эмитим событие enemyKilled
                    if (this.enemyType) {
                        console.log(`💀 GameObject.die: эмитим событие enemyKilled для врага ${this.enemyType}`);
                        this.emit('enemyKilled', this);
                    }
                    this.destroy();
                }
            });
        }
        else {
            // Если сцена недоступна, просто эмитим событие и уничтожаем
            this.emit('death', this);
            // Если это враг, эмитим событие enemyKilled
            if (this.enemyType) {
                console.log(`💀 GameObject.die: эмитим событие enemyKilled для врага ${this.enemyType}`);
                this.emit('enemyKilled', this);
            }
            this.destroy();
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
        this.destroyHealthBar();
        this.emit('destroy', this);
        super.destroy();
    }
    // === ОБЩИЕ МЕТОДЫ ДЛЯ ВСЕХ ОБЪЕКТОВ ===
    /**
     * Проверяет, находится ли объект в радиусе действия
     */
    isInRange(target, range) {
        if (!target || !target.isAlive)
            return false;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        return distance <= range;
    }
    /**
     * Меняет цель объекта
     */
    changeTarget(newTarget) {
        const oldTarget = this._target;
        this._target = newTarget;
        if (oldTarget !== newTarget) {
            this.emit('targetChanged', newTarget, oldTarget);
        }
    }
    /**
     * Движется к цели со своей скоростью
     */
    moveToTarget() {
        if (!this._target || !this._target.isAlive || this._speed === 0) {
            this.stopMovement();
            return;
        }
        const direction = new Phaser.Math.Vector2(this._target.x - this.x, this._target.y - this.y).normalize();
        this.startMovement(direction);
    }
    /**
     * Атакует цель
     */
    attackTarget(target) {
        return this.attack(target);
    }
    /**
     * Обрабатывает реакцию на защитный объект
     */
    handleDefenceReaction(defence, reaction) {
        switch (reaction) {
            case 'attack':
                this.changeTarget(defence);
                break;
            case 'ignore':
                // Ничего не делаем
                break;
            case 'influence':
                // Базовое влияние - можно переопределить в дочерних классах
                this.emit('defenceInfluence', defence);
                break;
        }
    }
    /**
     * Проверяет способность летать
     */
    canFlyObject() {
        return this._canFly;
    }
    /**
     * Получает размер объекта
     */
    getObjectSize() {
        return this._size;
    }
    /**
     * Устанавливает размер объекта
     */
    setObjectSize(size) {
        this._size = Math.max(1, size);
    }
    /**
     * Устанавливает способность летать
     */
    setCanFlyObject(canFly) {
        this._canFly = canFly;
    }
    // Геттеры для новых свойств
    get objectSize() { return this._size; }
    get canFlyProperty() { return this._canFly; }
    // Сеттеры для новых свойств
    set objectSize(value) { this.setObjectSize(value); }
    set canFlyProperty(value) { this.setCanFlyObject(value); }
    // Методы для работы с HealthBar
    /**
     * Создает полосу здоровья для объекта
     */
    createHealthBar(options) {
        if (this._healthBar) {
            this._healthBar.destroy();
        }
        this._healthBar = new HealthBar(this.scene, this, options);
    }
    /**
     * Обновляет полосу здоровья
     */
    updateHealthBar() {
        if (this._healthBar) {
            this._healthBar.updateHealth();
        }
    }
    /**
     * Уничтожает полосу здоровья
     */
    destroyHealthBar() {
        if (this._healthBar) {
            this._healthBar.destroy();
            this._healthBar = undefined;
        }
    }
    /**
     * Показывает/скрывает полосу здоровья
     */
    setHealthBarVisible(visible) {
        if (this._healthBar) {
            this._healthBar.setVisible(visible);
        }
    }

    /**
     * Базовый фабричный метод для создания игровых объектов
     * Следует принципу Factory Method Pattern
     * @param {Phaser.Scene} scene - Сцена
     * @param {string} type - Тип объекта
     * @param {Object} config - Конфигурация
     * @returns {GameObject} Созданный объект
     */
    static createGameObject(scene, type, config = {}) {
        const defaultConfig = {
            x: 0,
            y: 0,
            texture: type,
            health: 100,
            damage: 10,
            speed: 1,
            cooldown: 1000,
            attackRange: 50,
            size: 1,
            canFly: false
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        // Создаем объект с базовой конфигурацией
        const gameObject = new this(scene, finalConfig);
        
        // Применяем специфичные настройки для типа
        gameObject.applyTypeSpecificConfig(type, finalConfig);
        
        return gameObject;
    }

    /**
     * Применяет специфичные настройки для типа объекта
     * Переопределяется в наследниках
     * @param {string} type - Тип объекта
     * @param {Object} config - Конфигурация
     */
    applyTypeSpecificConfig(type, config) {
        // Базовая реализация - переопределяется в наследниках
        this.setTexture(type);
    }
}
