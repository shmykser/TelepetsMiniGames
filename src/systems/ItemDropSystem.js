import { Item } from '../objects/Item';
import { ITEM_TYPES, ITEMS } from '../types/itemTypes';

/**
 * Система дропа предметов
 */
export class ItemDropSystem {
    constructor(scene, egg, probabilitySystem = null, abilitySystem = null) {
        this.scene = scene;
        this.egg = egg;
        this.probabilitySystem = probabilitySystem;
        this.abilitySystem = abilitySystem;
        this.items = []; // Отслеживание активных предметов
        
        // Подписываемся на события предметов
        this.scene.events.on('item:created', this.onItemCreated.bind(this));
        this.scene.events.on('item:removed', this.onItemRemoved.bind(this));
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
        
        // Создаем предмет через статический метод Item
        const item = Item.CreateItem(this.scene, x, y, randomItem, this.abilitySystem);
        
        return item;
    }
    
    /**
     * Получение доступных предметов для дропа
     */
    getAvailableItems() {
        const items = [ITEM_TYPES.HEART, ITEM_TYPES.PATCH, ITEM_TYPES.DOUBLEPATCH, ITEM_TYPES.SHOVEL]; // Сердце, пластырь и лопата всегда доступны
        
        // Клевер выпадает только если везение <= максимального
        const currentLuck = this.abilitySystem ? this.abilitySystem.getLuck() : 5;
        if (currentLuck <= 25) { // Максимальная удача для дропа клевера
            items.push(ITEM_TYPES.CLOVER);
        }
        
        return items;
    }
    
    /**
     * Обработка создания предмета (событие)
     */
    onItemCreated(item) {
        this.items.push(item);
    }
    
    /**
     * Обработка удаления предмета (событие)
     */
    onItemRemoved(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }
    
    /**
     * Очистка всех предметов
     */
    clearAllItems() {
        // Эмитим событие - предметы сами себя уничтожат
        this.scene.events.emit('items:clear-all');
        
        // Очищаем массив отслеживания
        this.items = [];
    }
    
    /**
     * Уничтожение системы
     */
    destroy() {
        // Отписываемся от событий
        this.scene.events.off('item:created', this.onItemCreated.bind(this));
        this.scene.events.off('item:removed', this.onItemRemoved.bind(this));
        
        this.clearAllItems();
    }
}
