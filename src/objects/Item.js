import { GameObject } from './GameObject';
import { ITEMS } from '../types/itemTypes';
import { GeometryUtils } from '../utils/GeometryUtils.js';
import { ITEM_CONSTANTS, COLORS } from '../constants/GameConstants.js';

/**
 * Класс предмета для сбора
 */
export class Item extends GameObject {
    constructor(scene, x, y, itemType) {
        // Получаем данные предмета
        const itemData = ITEMS[itemType];
        
        // Создаем конфигурацию предмета
        const itemConfig = {
            x: x,
            y: y,
            texture: itemData.texture,
            health: 1, // Предметы не имеют здоровья, но нужны для GameObject
            damage: 0,
            speed: 0,
            cooldown: 0,
            attackRange: 0
        };
        
        super(scene, itemConfig);
        
        // Специфичные для предметов свойства
        this.itemType = itemType;
        this.itemData = itemData;
        this.isCollected = false;
        
        // Настройка спрайта
        this.setScale(ITEM_CONSTANTS.ITEM_SCALE);
        this.setInteractive();
        this.setDepth(ITEM_CONSTANTS.ITEM_DEPTH);
        
        // Настройка физики
        this.physicsBody.setSize(this.width * ITEM_CONSTANTS.ITEM_BODY_SCALE, this.height * ITEM_CONSTANTS.ITEM_BODY_SCALE);
        this.physicsBody.setImmovable(true);
    }
    
    /**
     * Получает цвет предмета
     */
    getItemTint() {
        switch (this.itemType) {
            case 'heart':
                return COLORS.HEART_COLOR;
            case 'clover':
                return COLORS.CLOVER_COLOR;
            default:
                return COLORS.WHITE;
        }
    }
    
    /**
     * Собирает предмет
     */
    collect() {
        if (this.isCollected) {
            return false;
        }
        
        this.isCollected = true;
        this.destroy();
        return true;
    }
}
