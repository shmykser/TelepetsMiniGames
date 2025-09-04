import { GameObject } from '../GameObject';
export class Egg extends GameObject {
    constructor(scene, config) {
        // Настройки для яйца - неподвижное, без атак
        const eggConfig = {
            ...config,
            speed: 0, // Не может двигаться
            damage: 0, // Нет атак
            cooldown: 0, // Нет перезарядки
            attackRange: 0 // Нет радиуса атаки
        };
        super(scene, eggConfig);
        Object.defineProperty(this, "_hatchTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_hatchType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_isHatching", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_hatchTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._hatchTime = config.hatchTime || 10000; // 10 секунд по умолчанию
        this._hatchType = config.hatchType || 'default';
        // Настраиваем физику для яйца
        this.setupEggPhysics();
        // Запускаем таймер вылупления
        this.startHatchTimer();
    }
    setupEggPhysics() {
        // Яйцо статично - не может двигаться
        this.physicsBody.setImmovable(true);
        this.physicsBody.setVelocity(0, 0);
        this.physicsBody.setBounce(0.1);
        this.physicsBody.setDrag(1000, 1000); // Максимальное сопротивление
    }
    startHatchTimer() {
        if (!this.scene)
            return;
        this._hatchTimer = this.scene.time.delayedCall(this._hatchTime, () => {
            this.hatch();
        });
    }
    // Переопределяем методы движения - яйцо не может двигаться
    startMovement(_direction) {
        // Яйцо не может двигаться
        return;
    }
    startMovementToPoint(_x, _y) {
        // Яйцо не может двигаться
        return;
    }
    moveToPointTween(_x, _y, _duration) {
        // Яйцо не может двигаться
        return this.scene.tweens.add({ targets: this, duration: 0 });
    }
    // Переопределяем методы атаки - яйцо не может атаковать
    attack(_target) {
        // Яйцо не может атаковать
        return false;
    }
    // Процесс вылупления
    hatch() {
        if (this._isHatching || !this._isAlive)
            return;
        this._isHatching = true;
        console.log(`Яйцо вылупляется! Тип: ${this._hatchType}`);
        // Анимация вылупления
        this.playHatchAnimation();
        // Эмитим событие вылупления
        this.emit('hatch', this._hatchType, this.x, this.y);
    }
    playHatchAnimation() {
        if (!this.scene)
            return;
        // Анимация трещин на яйце
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: 2,
            ease: 'Power2',
            onComplete: () => {
                this.playHatchEffect();
            }
        });
    }
    playHatchEffect() {
        if (!this.scene)
            return;
        // Эффект вылупления - частицы
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.circle(this.x, this.y, 2, 0xffffff);
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30;
            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * distance,
                y: this.y + Math.sin(angle) * distance,
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        // Финальная анимация исчезновения яйца
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
    }
    // Геттеры
    get hatchTime() { return this._hatchTime; }
    get hatchType() { return this._hatchType; }
    get isHatching() { return this._isHatching; }
    // Сеттеры
    set hatchTime(value) {
        this._hatchTime = Math.max(0, value);
        // Перезапускаем таймер если он активен
        if (this._hatchTimer && !this._isHatching) {
            this._hatchTimer.destroy();
            this.startHatchTimer();
        }
    }
    set hatchType(value) { this._hatchType = value; }
    // Уничтожение с очисткой таймера
    destroy() {
        if (this._hatchTimer) {
            this._hatchTimer.destroy();
            this._hatchTimer = undefined;
        }
        super.destroy();
    }
}
