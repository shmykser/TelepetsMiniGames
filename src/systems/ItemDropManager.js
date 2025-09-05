import { Item } from '../core/objects/Item';
import { ITEM_TYPES, DROP_SETTINGS } from '../core/types/itemTypes';

/**
 * Менеджер дропа предметов
 */
export class ItemDropManager {
    constructor(scene, egg) {
        this.scene = scene;
        this.egg = egg;
        this.luck = DROP_SETTINGS.baseLuck; // Начальное везение
        this.maxLuck = DROP_SETTINGS.maxLuck; // Максимальное везение
        this.items = []; // Массив активных предметов
    }
    
    /**
     * Обработка дропа после убийства врага
     */
    onEnemyKilled(enemy) {
        console.log(`🎁 ItemDropManager.onEnemyKilled: получен враг:`, enemy);
        if (this.shouldDropItem()) {
            console.log(`🎁 ItemDropManager.onEnemyKilled: дроп выпал!`);
            console.log(`🎁 ItemDropManager.onEnemyKilled: создаем предмет в позиции (${enemy.x}, ${enemy.y})`);
            this.dropRandomItem(enemy.x, enemy.y);
        } else {
            console.log(`🎁 ItemDropManager.onEnemyKilled: дроп не выпал`);
        }
    }
    
    /**
     * Проверка вероятности дропа предмета
     */
    shouldDropItem() {
        const roll = Math.random() * 100;
        return roll < this.luck;
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
        if (this.luck <= DROP_SETTINGS.cloverMaxLuck) {
            items.push(ITEM_TYPES.CLOVER);
        }
        
        return items;
    }
    
    /**
     * Создание предмета
     */
    createItem(x, y, itemType) {
        console.log(`🎁 ItemDropManager.createItem: создаем ${itemType} в позиции (${x}, ${y})`);
        
        const item = new Item(this.scene, x, y, itemType);
        this.items.push(item);
        
        // Добавляем предмет в сцену
        this.scene.add.existing(item);
        
        // Устанавливаем высокую глубину, чтобы предмет был поверх всего
        item.setDepth(1000);
        
        // Проверяем, что предмет добавлен в сцену
        console.log(`🎁 ItemDropManager.createItem: предмет ${itemType} создан, всего предметов: ${this.items.length}`);
        console.log(`🎁 ItemDropManager.createItem: предмет в сцене? ${this.scene.children.list.includes(item)}`);
        console.log(`🎁 ItemDropManager.createItem: позиция предмета: (${item.x}, ${item.y})`);
        console.log(`🎁 ItemDropManager.createItem: видимый? ${item.visible}, активный? ${item.active}`);
        
        // Обработчик сбора предмета
        item.on('pointerdown', () => {
            this.collectItem(item);
        });
        
        // Автоматическое удаление через 10 секунд
        this.scene.time.delayedCall(10000, () => {
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
                collected = this.egg.heal(20);
                break;
                
            case ITEM_TYPES.CLOVER:
                this.increaseLuck(DROP_SETTINGS.luckIncrease);
                collected = true;
                break;
        }
        
        if (collected) {
            item.collect();
            this.removeItem(item);
            this.showItemEffect(itemType);
        }
        
        return collected;
    }
    
    /**
     * Увеличение везения
     */
    increaseLuck(amount) {
        const oldLuck = this.luck;
        this.luck = Math.min(this.maxLuck, this.luck + amount);
        const actualIncrease = this.luck - oldLuck;
        
        if (actualIncrease > 0) {
            this.showLuckIncreaseEffect(actualIncrease);
        }
    }
    
    /**
     * Показывает эффект увеличения везения
     */
    showLuckIncreaseEffect(amount) {
        const luckText = this.scene.add.text(
            this.scene.cameras.main.width - 200, 
            50, 
            `🍀 +${amount} Удача!`, 
            {
                fontSize: '20px',
                fill: '#00ff00',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        
        this.scene.tweens.add({
            targets: luckText,
            y: luckText.y - 20,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                luckText.destroy();
            }
        });
    }
    
    /**
     * Показывает эффект предмета
     */
    showItemEffect(itemType) {
        let effectText = '';
        let color = '#ffffff';
        
        switch (itemType) {
            case ITEM_TYPES.HEART:
                effectText = '❤️ +20 HP';
                color = '#ff69b4';
                break;
            case ITEM_TYPES.CLOVER:
                effectText = '🍀 +10 Удача';
                color = '#00ff00';
                break;
        }
        
        const effect = this.scene.add.text(
            this.scene.cameras.main.width / 2, 
            100, 
            effectText, 
            {
                fontSize: '24px',
                fill: color,
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        
        effect.setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: effect,
            y: effect.y - 30,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
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
     * Получение информации о везении
     */
    getLuckInfo() {
        return {
            current: this.luck,
            max: this.maxLuck,
            percentage: Math.round(this.luck)
        };
    }
    
    /**
     * Обновление менеджера
     */
    update(time, delta) {
        // Обновляем все предметы
        this.items.forEach(item => {
            if (item && item.update) {
                item.update(time, delta);
            }
        });
    }
    
    /**
     * Очистка всех предметов
     */
    clearAllItems() {
        this.items.forEach(item => {
            if (item && !item.isCollected) {
                item.destroy();
            }
        });
        this.items = [];
    }
    
    /**
     * Уничтожение менеджера
     */
    destroy() {
        this.clearAllItems();
    }
}
