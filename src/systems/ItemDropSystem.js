import { Item } from '../objects/Item';
import { ITEM_TYPES, DROP_SETTINGS } from '../types/itemTypes';
import { ITEM_CONSTANTS } from '../constants/GameConstants.js';

/**
 * Система дропа предметов
 */
export class ItemDropSystem {
    constructor(scene, egg, probabilitySystem = null) {
        this.scene = scene;
        this.egg = egg;
        this.probabilitySystem = probabilitySystem;
        this.luck = DROP_SETTINGS.baseLuck; // Начальное везение
        this.maxLuck = DROP_SETTINGS.maxLuck; // Максимальное везение
        this.items = []; // Массив активных предметов
    }
    
    
    /**
     * Создание случайного предмета
     */
    dropRandomItem(x, y) {
        const availableItems = this.getAvailableItems();
        if (availableItems.length === 0) {
            return;
        }
        
        const randomItem = Phaser.Utils.Array.GetRandom(availableItems);
        this.createItem(x, y, randomItem);
    }
    
    /**
     * Получение доступных предметов для дропа
     */
    getAvailableItems() {
        const items = [ITEM_TYPES.HEART]; // Сердце всегда доступно
        
        // Клевер выпадает только если везение <= 10
        if (this.luck <= DROP_SETTINGS.maxLuck) {
            items.push(ITEM_TYPES.CLOVER);
        }
        
        return items;
    }
    
    /**
     * Создание предмета
     */
    createItem(x, y, itemType) {
        const item = new Item(this.scene, x, y, itemType);
        this.items.push(item);
        
        // Добавляем предмет в сцену
        this.scene.add.existing(item);
        
        // Устанавливаем высокую глубину, чтобы предмет был поверх всего
        item.setDepth(ITEM_CONSTANTS.ITEM_DEPTH);
        
        // Предмет уже интерактивный (setInteractive в Item.js)
        
        // Автоматическое удаление через заданное время
        this.scene.time.delayedCall(ITEM_CONSTANTS.AUTO_REMOVE_DELAY, () => {
            if (item && !item.isCollected) {
                this.removeItem(item);
            }
        });
        
        return item;
    }
    
    /**
     * Сбор предмета
     */
    collectItem(item) {
        if (item.isCollected) {
            return false;
        }
        
        const itemType = item.itemType;
        let collected = false;
        
        // Применяем эффект предмета
        switch (itemType) {
            case ITEM_TYPES.HEART:
                collected = this.egg.heal(ITEM_CONSTANTS.HEART_HEAL_AMOUNT);
                break;
                
            case ITEM_TYPES.CLOVER:
                this.increaseLuck(DROP_SETTINGS.luckIncrease);
                collected = true;
                break;
        }
        
        if (collected) {
            item.collect();
            this.removeItem(item);
            // Эффект предмета можно обработать здесь при необходимости
        }
        
        return collected;
    }
    
    /**
     * Увеличение везения
     */
    increaseLuck(amount) {
        this.luck = Math.min(this.maxLuck, this.luck + amount);
    }
    
    /**
     * Удаление предмета из списка
     */
    removeItem(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }
    
    /**
     * Очистка всех предметов
     */
    clearAllItems() {
        // Уничтожаем все предметы
        this.items.forEach(item => {
            if (item && item.destroy) {
                item.destroy();
            }
        });
        
        // Очищаем массив
        this.items = [];
    }
    
    /**
     * Уничтожение системы
     */
    destroy() {
        this.clearAllItems();
    }
}
