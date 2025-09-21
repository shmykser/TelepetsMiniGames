import { GameObject } from './GameObject';
import { defenseTypes } from '../types/defenseTypes';
import { PropertyUtils } from '../utils/PropertyUtils.js';
import { PHYSICS_CONSTANTS, COLORS } from '../settings/GameSettings.js';

export class Defense extends GameObject {
    constructor(scene, config) {
        const defenseType = config.defenseType || 'sugar';
        const defenseData = defenseTypes[defenseType];
        
        // Настройки из типа защиты (приоритет у переданных значений)
        const defenseConfig = {
            health: config.health !== undefined ? config.health : defenseData.health,
            maxHealth: config.maxHealth !== undefined ? config.maxHealth : defenseData.maxHealth,
            speed: 0, // Защитные сооружения неподвижны
            x: config.x,
            y: config.y,
            texture: config.texture || defenseData.texture, // fallback эмодзи
            spriteKey: config.spriteKey || defenseData.spriteKey, // ключ для спрайта
            size: config.size || defenseData.size // размер для выбора спрайта
        };
        
        super(scene, defenseConfig);
        
        // Специфичные для защиты свойства
        PropertyUtils.defineProperty(this, "_defenseType", undefined);
        PropertyUtils.defineProperty(this, "_defenseData", undefined);
        
        // Инициализация свойств защиты
        this._defenseType = defenseType;
        this._defenseData = defenseData;

        // Настраиваем физику для защитных сооружений
        this.physicsBody.setImmovable(true);
        this.physicsBody.setBounce(PHYSICS_CONSTANTS.DEFAULT_BOUNCE);
        this.physicsBody.setDrag(PHYSICS_CONSTANTS.DEFAULT_DRAG, PHYSICS_CONSTANTS.DEFAULT_DRAG);
    }

    // Геттеры
    get defenseType() { return this._defenseType; }

    /**
     * Статический метод для создания защиты с полной настройкой
     */
    static createDefense(scene, defenseType, x, y) {
        const defenseData = defenseTypes[defenseType];
        
        // Создаем защиту с базовыми характеристиками
        const defense = new Defense(scene, {
            x, y, defenseType,
            ...defenseData // Все данные из defenseTypes
        });
        
        // Настраиваем размер
        const defenseSize = PHYSICS_CONSTANTS.BASE_ENEMY_SIZE * defenseData.size;
        defense.setScale(defenseSize / PHYSICS_CONSTANTS.DEFAULT_TEXTURE_SIZE);
        
        // Устанавливаем глубину отрисовки
        defense.setDepth(10);
        
        // Создаем полосу здоровья (если у защиты есть здоровье)
        if (defenseData.health > 0) {
            const healthBarConfig = {
                showWhenFull: false,
                showWhenEmpty: true,
                colors: {
                    background: COLORS.BLACK,
                    health: COLORS.HEALTH_GREEN,
                    border: COLORS.WHITE
                },
                offsetY: -(defenseSize / 2 + PHYSICS_CONSTANTS.HEALTH_BAR_OFFSET)
            };
            
            // Для ям добавляем цифровое отображение
            if (defenseType === 'pit') {
                healthBarConfig.showDigits = true;
                healthBarConfig.showBar = false; // Только цифры для ям
            }
            
            defense.createHealthBar(healthBarConfig);
        }
        
        return defense;
    }

}