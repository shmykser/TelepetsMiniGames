import { GameObject } from './GameObject';
import { PHYSICS_CONSTANTS, COLORS } from '../constants/GameConstants.js';
export class Egg extends GameObject {
    // Яйцо - статичный объект без вылупления
    constructor(scene, config) {
        // Настройки для яйца - неподвижное, без атак
        const eggConfig = {
            ...config,
            speed: 0, // Не может двигаться
            damage: 0, // Нет атак
            cooldown: 0, // Нет перезарядки
            attackRange: 0, // Нет радиуса атаки
            size: config.size || 2 // Размер яйца по умолчанию
        };
        super(scene, eggConfig);
        
        // Сохраняем размер яйца для системы попадания
        this._size = eggConfig.size;
        
        // Настраиваем физику для яйца
        this.setupEggPhysics();
    }
    setupEggPhysics() {
        // Яйцо статично - не может двигаться
        this.physicsBody.setImmovable(true);
        this.physicsBody.setVelocity(0, 0);
        this.physicsBody.setBounce(PHYSICS_CONSTANTS.EGG_BOUNCE);
        this.physicsBody.setDrag(PHYSICS_CONSTANTS.EGG_DRAG, PHYSICS_CONSTANTS.EGG_DRAG);
    }
    // Методы движения и атаки не нужны - яйцо статично

    /**
     * Статический метод для создания яйца с полной настройкой
     * Создает яйцо, настраивает графику и создает HealthBar
     */
    static CreateEgg(scene, x, y, options = {}) {
        // Настройки по умолчанию для яйца
        const defaultOptions = {
            health: 100,
            texture: '🥚', // Эмодзи яйца
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
            attackRange: 0,
            size: defaultOptions.size || 2
        });

        // Настраиваем размер яйца
        const eggSize = PHYSICS_CONSTANTS.EGG_SIZE;
        egg.setScale(eggSize / PHYSICS_CONSTANTS.DEFAULT_TEXTURE_SIZE);

        // Создаем полосу здоровья
        egg.createHealthBar({
            showWhenFull: true,
            showWhenEmpty: true,
            offsetY: -(eggSize / 2 + PHYSICS_CONSTANTS.EGG_HEALTH_BAR_OFFSET),
            offsetX: 0,
            colors: {
                background: COLORS.BLACK,
                health: COLORS.HEALTH_GREEN,
                border: COLORS.WHITE
            }
        });


        return egg;
    }
    
    /**
     * Лечит яйцо на указанное количество HP
     */
    heal(amount) {
        if (!this.isAlive) {
            return false;
        }
        
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        const actualHeal = this.health - oldHealth;
        
        return actualHeal > 0;
    }
}
