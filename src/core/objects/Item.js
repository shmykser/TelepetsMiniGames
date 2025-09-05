import Phaser from 'phaser';
import { ITEMS } from '../types/itemTypes';

/**
 * Класс предмета для сбора
 */
export class Item extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, itemType) {
        // Сначала получаем данные предмета
        const itemData = ITEMS[itemType];
        console.log(`🎁 Item: создаем предмет ${itemType}, текстура: ${itemData.texture}`);
        
        // Проверяем, что текстура существует
        if (!scene.textures.exists(itemData.texture)) {
            console.warn(`⚠️ Item: текстура ${itemData.texture} не найдена! Используем fallback`);
            // Используем fallback текстуру
            super(scene, x, y, 'egg');
        } else {
            console.log(`✅ Item: текстура ${itemData.texture} найдена, создаем предмет`);
            super(scene, x, y, itemData.texture);
        }
        
        // Теперь можем обращаться к this
        this.scene = scene;
        this.itemType = itemType;
        this.itemData = itemData;
        this.isCollected = false;
        
        // Настройка спрайта
        this.setScale(0.8);
        this.setInteractive();
        this.setDepth(1000); // Высокая глубина, чтобы предметы были поверх всего
        
        // Настройка физики
        this.scene.physics.add.existing(this);
        this.body.setSize(this.width * 0.8, this.height * 0.8);
        this.body.setImmovable(true);
        
        // Анимация появления
        this.setAlpha(0);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            scaleX: 0.6,
            scaleY: 0.6,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // Анимация пульсации
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.7,
            scaleY: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Эффект свечения
        this.setTint(this.getItemTint());
    }
    
    /**
     * Получает цвет предмета
     */
    getItemTint() {
        switch (this.itemType) {
            case 'heart':
                return 0xff69b4; // Розовый для сердца
            case 'clover':
                return 0x00ff00; // Зеленый для клевера
            default:
                return 0xffffff;
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
        
        // Анимация сбора
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
        
        // Эффект частиц при сборе
        this.showCollectEffect();
        
        return true;
    }
    
    /**
     * Показывает эффект сбора
     */
    showCollectEffect() {
        // Создаем частицы
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.circle(
                this.x + Phaser.Math.Between(-20, 20),
                this.y + Phaser.Math.Between(-20, 20),
                3,
                this.getItemTint()
            );
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-50, 50),
                y: particle.y + Phaser.Math.Between(-50, 50),
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
    
    /**
     * Обновление предмета
     */
    update(time, delta) {
        // Можно добавить дополнительную логику обновления
    }
    
    /**
     * Уничтожение предмета
     */
    destroy() {
        // Очищаем твины
        this.scene.tweens.killTweensOf(this);
        super.destroy();
    }
}
