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

    /**
     * Статический метод для создания яйца с полной настройкой
     * Создает яйцо, настраивает графику и создает HealthBar
     */
    static CreateEgg(scene, x, y, options = {}) {
        // Настройки по умолчанию для яйца
        const defaultOptions = {
            health: 100,
            texture: 'egg', // Текстура яйца
            ...options
        };

        // Создаем яйцо
        const egg = new Egg(scene, {
            x: x,
            y: y,
            texture: defaultOptions.texture,
            health: defaultOptions.health,
            damage: 0,
            speed: 0,
            cooldown: 0,
            attackRange: 0
        });

        // Настраиваем размер яйца (больше чем у врагов)
        const eggSize = 20; // 20 пикселей
        egg.setScale(eggSize / 32); // 32 - размер текстуры по умолчанию в Phaser

        // Создаем полосу здоровья
        egg.createHealthBar({
            showWhenFull: true, // Показываем даже при полном здоровье
            showWhenEmpty: true, // Показываем при смерти
            offsetY: -(eggSize / 2 + 15), // Смещение вверх от объекта (больше отступ)
            offsetX: 0, // По центру по горизонтали
            colors: {
                background: 0x000000,
                health: 0x00ff00,
                border: 0xffffff
            }
        });

        // Добавляем визуальные эффекты для яйца
        egg.setTint(0xffffff); // Убираем оттенок
        egg.setAlpha(1.0); // Полная непрозрачность


        return egg;
    }
}
