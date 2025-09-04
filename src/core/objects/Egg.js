import { GameObject } from '../GameObject';
export class Egg extends GameObject {
    // Яйцо - статичный объект без вылупления
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
        // Яйцо - основная цель врагов
        this._size = 2; // Размер яйца
        this._canFly = false;
        // Настраиваем физику для яйца
        this.setupEggPhysics();
    }
    setupEggPhysics() {
        // Яйцо статично - не может двигаться
        this.physicsBody.setImmovable(true);
        this.physicsBody.setVelocity(0, 0);
        this.physicsBody.setBounce(0.1);
        this.physicsBody.setDrag(1000, 1000); // Максимальное сопротивление
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
}
