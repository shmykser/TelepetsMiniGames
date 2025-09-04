import { GameObject } from '../GameObject';
export class Defence extends GameObject {
    constructor(scene, config) {
        // Настройки по умолчанию для защитных сооружений
        const defenceConfig = {
            health: config.health || 200,
            damage: 0, // Защитные сооружения не атакуют
            speed: 0, // Неподвижны
            cooldown: 0,
            attackRange: 0,
            x: config.x,
            y: config.y,
            texture: config.texture
        };
        super(scene, defenceConfig);
        Object.defineProperty(this, "_defenceType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_protectionRadius", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_defenceMaxHealth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_repairRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_autoRepair", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isRepairing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_repairTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_protectedObjects", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this._defenceType = config.defenceType || 'wall';
        this._protectionRadius = config.protectionRadius || 100;
        this._defenceMaxHealth = config.maxHealth || 200;
        this._repairRate = config.repairRate || 5; // Восстановление здоровья в секунду
        this._autoRepair = config.autoRepair !== false; // По умолчанию включено
        // Настраиваем поведение в зависимости от типа
        this.setupDefenceBehaviour();
        // Запускаем систему защиты
        this.startProtectionSystem();
    }
    setupDefenceBehaviour() {
        // Настройки в зависимости от типа защиты
        switch (this._defenceType) {
            case 'wall':
                this.health = 300;
                this._defenceMaxHealth = 300;
                this._protectionRadius = 50;
                this.setTint(0x8b4513); // Коричневый
                this.setScale(1.5, 0.8); // Широкая стена
                break;
            case 'tower':
                this.health = 150;
                this._defenceMaxHealth = 150;
                this._protectionRadius = 120;
                this.setTint(0x696969); // Серый
                this.setScale(1.2, 1.5); // Высокая башня
                break;
            case 'shield':
                this.health = 100;
                this._defenceMaxHealth = 100;
                this._protectionRadius = 80;
                this.setTint(0x4169e1); // Синий
                this.setAlpha(0.7); // Полупрозрачный
                break;
            case 'barrier':
                this.health = 250;
                this._defenceMaxHealth = 250;
                this._protectionRadius = 60;
                this.setTint(0x2f4f4f); // Темно-серый
                this.setScale(1.3, 1.0);
                break;
            default:
                this.setTint(0x808080); // Серый
                break;
        }
        // Настраиваем физику для защитных сооружений
        this.physicsBody.setImmovable(true);
        this.physicsBody.setBounce(0.1);
        this.physicsBody.setDrag(1000, 1000); // Максимальное сопротивление
    }
    startProtectionSystem() {
        if (!this.scene)
            return;
        // Запускаем систему автоматического ремонта
        if (this._autoRepair) {
            this.startAutoRepair();
        }
        // Запускаем систему защиты объектов
        this.startObjectProtection();
    }
    startAutoRepair() {
        if (!this.scene)
            return;
        this._repairTimer = this.scene.time.addEvent({
            delay: 1000, // Каждую секунду
            callback: () => {
                if (this._isAlive && this.health < this._maxHealth && !this._isRepairing) {
                    this.repair();
                }
            },
            loop: true
        });
    }
    startObjectProtection() {
        if (!this.scene)
            return;
        // Проверяем защиту объектов каждые 500мс
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                this.updateProtection();
            },
            loop: true
        });
    }
    repair() {
        if (!this._isAlive || this.health >= this._defenceMaxHealth)
            return;
        this._isRepairing = true;
        const oldHealth = this.health;
        this.health = Math.min(this.health + this._repairRate, this._defenceMaxHealth);
        // Эффект ремонта
        this.playRepairEffect();
        console.log(`Защитное сооружение восстановлено: ${oldHealth} → ${this.health}`);
        // Небольшая задержка перед следующим ремонтом
        this.scene.time.delayedCall(2000, () => {
            this._isRepairing = false;
        });
    }
    playRepairEffect() {
        if (!this.scene)
            return;
        // Эффект восстановления - зеленые частицы
        for (let i = 0; i < 5; i++) {
            const particle = this.scene.add.circle(this.x + Phaser.Math.Between(-20, 20), this.y + Phaser.Math.Between(-20, 20), 2, 0x00ff00);
            this.scene.tweens.add({
                targets: particle,
                y: particle.y - 30,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        // Временное свечение
        this.setTint(0x00ff00);
        this.scene.time.delayedCall(500, () => {
            this.clearTint();
        });
    }
    updateProtection() {
        if (!this._isAlive || !this.scene)
            return;
        // Ищем объекты в радиусе защиты
        const protectedObjects = this.findProtectedObjects();
        // Применяем защиту к объектам
        protectedObjects.forEach(obj => {
            this.applyProtection(obj);
        });
        // Обновляем список защищаемых объектов
        this._protectedObjects = protectedObjects;
    }
    findProtectedObjects() {
        if (!this.scene)
            return [];
        const protectedObjects = [];
        const gameObjects = this.scene.children.list;
        for (const obj of gameObjects) {
            if (obj instanceof GameObject && obj.isAlive) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, obj.x, obj.y);
                if (distance <= this._protectionRadius) {
                    protectedObjects.push(obj);
                }
            }
        }
        return protectedObjects;
    }
    applyProtection(obj) {
        // Различные типы защиты
        switch (this._defenceType) {
            case 'wall':
                this.applyWallProtection(obj);
                break;
            case 'tower':
                this.applyTowerProtection(obj);
                break;
            case 'shield':
                this.applyShieldProtection(obj);
                break;
            case 'barrier':
                this.applyBarrierProtection(obj);
                break;
        }
    }
    applyWallProtection(obj) {
        // Стена блокирует движение врагов
        if (obj instanceof GameObject && obj.isEnemy) {
            const direction = new Phaser.Math.Vector2(obj.x - this.x, obj.y - this.y).normalize();
            // Отталкиваем врага от стены
            obj.physicsBody.setVelocity(direction.x * 50, direction.y * 50);
        }
    }
    applyTowerProtection(obj) {
        // Башня восстанавливает здоровье союзников
        if (obj instanceof GameObject && !obj.isEnemy && obj.health < obj.maxHealth) {
            obj.health = Math.min(obj.health + 1, obj.maxHealth);
        }
    }
    applyShieldProtection(obj) {
        // Щит уменьшает получаемый урон
        if (obj instanceof GameObject) {
            // Добавляем временную защиту (можно реализовать через модификаторы)
            obj.setAlpha(0.8); // Визуальный эффект защиты
        }
    }
    applyBarrierProtection(obj) {
        // Барьер замедляет врагов
        if (obj instanceof GameObject && obj.isEnemy) {
            obj.speed = obj.speed * 0.5; // Замедляем на 50%
        }
    }
    // Переопределяем методы движения - защитные сооружения неподвижны
    startMovement(_direction) {
        // Защитные сооружения не могут двигаться
        return;
    }
    startMovementToPoint(_x, _y) {
        // Защитные сооружения не могут двигаться
        return;
    }
    moveToPointTween(_x, _y, _duration) {
        // Защитные сооружения не могут двигаться
        return this.scene.tweens.add({ targets: this, duration: 0 });
    }
    // Переопределяем методы атаки - защитные сооружения не атакуют
    attack(_target) {
        // Защитные сооружения не атакуют
        return false;
    }
    // Переопределяем получение урона
    takeDamage(damage) {
        if (!this._isAlive || !this.scene)
            return;
        // Защитные сооружения получают меньше урона
        const reducedDamage = damage * 0.7; // 30% снижение урона
        this.health -= reducedDamage;
        this.emit('damage', reducedDamage, this.health);
        // Эффект получения урона
        this.scene.tweens.add({
            targets: this,
            tint: 0xff0000,
            duration: 200,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.clearTint();
            }
        });
        // Если здоровье критично, показываем предупреждение
        if (this.health < this._defenceMaxHealth * 0.3) {
            this.showDamageWarning();
        }
    }
    showDamageWarning() {
        if (!this.scene)
            return;
        // Эффект предупреждения о критическом состоянии
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.setAlpha(1);
            }
        });
    }
    // Геттеры
    get defenceType() { return this._defenceType; }
    get protectionRadius() { return this._protectionRadius; }
    get maxHealth() { return this._defenceMaxHealth; }
    get repairRate() { return this._repairRate; }
    get autoRepair() { return this._autoRepair; }
    get isRepairing() { return this._isRepairing; }
    get protectedObjects() { return this._protectedObjects; }
    // Сеттеры
    set defenceType(value) {
        this._defenceType = value;
        this.setupDefenceBehaviour();
    }
    set protectionRadius(value) { this._protectionRadius = Math.max(0, value); }
    set maxHealth(value) { this._defenceMaxHealth = Math.max(1, value); }
    set repairRate(value) { this._repairRate = Math.max(0, value); }
    set autoRepair(value) {
        this._autoRepair = value;
        if (value && !this._repairTimer) {
            this.startAutoRepair();
        }
        else if (!value && this._repairTimer) {
            this._repairTimer.destroy();
            this._repairTimer = undefined;
        }
    }
    // Уничтожение с очисткой таймеров
    destroy() {
        if (this._repairTimer) {
            this._repairTimer.destroy();
            this._repairTimer = undefined;
        }
        super.destroy();
    }
}
