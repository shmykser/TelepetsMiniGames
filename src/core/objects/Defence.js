import { GameObject } from '../GameObject';
import { defenceTypes } from '../types/defenceTypes';
export class Defence extends GameObject {
    constructor(scene, config) {
        const defenceType = config.defenceType || 'sugar';
        const defenceData = defenceTypes[defenceType];
        // Настройки из типа защиты
        const defenceConfig = {
            health: config.health || defenceData.health,
            damage: config.damage || defenceData.damage,
            speed: 0, // Защитные сооружения неподвижны
            cooldown: config.cooldown || defenceData.cooldown * 1000, // конвертируем секунды в мс
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
        Object.defineProperty(this, "_defenceData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._defenceType = defenceType;
        this._defenceData = defenceData;
        this._protectionRadius = config.protectionRadius || defenceData.radius * defenceData.size * 10; // конвертируем в пиксели
        this._defenceMaxHealth = config.maxHealth || defenceData.health;
        this._repairRate = config.repairRate || 5; // Восстановление здоровья в секунду
        this._autoRepair = config.autoRepair !== false; // По умолчанию включено
        // Настраиваем размер из типа защиты
        this._size = defenceData.size;
        // Настраиваем поведение в зависимости от типа
        this.setupDefenceBehaviour();
        // Запускаем систему защиты
        this.startProtectionSystem();
    }
    setupDefenceBehaviour() {
        // Настраиваем визуал в зависимости от типа защиты
        switch (this._defenceType) {
            case 'sugar':
                this.setTint(0xfbbf24); // Желтый
                break;
            case 'stone':
                this.setTint(0x6b7280); // Серый
                this.setScale(1.5, 1.5); // Большой размер
                break;
            case 'crack':
                this.setTint(0x374151); // Темно-серый
                this.setScale(1.0, 2.0); // Длинная трещина
                break;
            case 'spikes':
                this.setTint(0xdc2626); // Красный
                this.setScale(1.2, 1.2);
                break;
            case 'madCucumber':
                this.setTint(0x16a34a); // Зеленый
                break;
            case 'pit':
                this.setTint(0x1f2937); // Очень темный
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
        // Простой эффект восстановления
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
    applyProtection(_obj) {
        // Базовая защита - можно переопределить в дочерних классах
        // По умолчанию ничего не делаем
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
        // Простое предупреждение
        console.log(`Защитное сооружение ${this._defenceType} в критическом состоянии!`);
    }
    // Геттеры
    get defenceType() { return this._defenceType; }
    get protectionRadius() { return this._protectionRadius; }
    get maxHealth() { return this._defenceMaxHealth; }
    get repairRate() { return this._repairRate; }
    get autoRepair() { return this._autoRepair; }
    get isRepairing() { return this._isRepairing; }
    get protectedObjects() { return this._protectedObjects; }
    get defenceData() { return this._defenceData; }
    // Сеттеры
    set defenceType(value) {
        this._defenceType = value;
        this._defenceData = defenceTypes[value];
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
