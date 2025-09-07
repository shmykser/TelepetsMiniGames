import Phaser from 'phaser';
import { ITEMS } from '../types/itemTypes';
import { GeometryUtils } from '../../utils/GeometryUtils.js';
import { AnimationLibrary } from '../../animations/AnimationLibrary.js';

/**
 * Класс предмета для сбора
 */
export class Item extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, itemType) {
        // Сначала получаем данные предмета
        const itemData = ITEMS[itemType];
        
        // Проверяем, что текстура существует
        if (!scene.textures.exists(itemData.texture)) {
            // Используем fallback текстуру
            super(scene, x, y, 'egg');
        } else {
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
        
        // Анимация появления через AnimationLibrary
        this.setAlpha(0);
        AnimationLibrary.createItemAppearEffect(this.scene, this, {
            alpha: { to: 1 },
            scale: { to: 0.6 },
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // Анимация пульсации через AnimationLibrary
        AnimationLibrary.createItemPulseEffect(this.scene, this, {
            scale: { to: 0.7 },
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
        
        // Анимация сбора через AnimationLibrary
        AnimationLibrary.createItemCollectEffect(this.scene, this, {
            scale: { to: 1.2 },
            alpha: { to: 0 },
            duration: 200,
            ease: 'Power2',
            onComplete: () => this.destroy()
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
                this.x + GeometryUtils.randomBetween(-20, 20),
                this.y + GeometryUtils.randomBetween(-20, 20),
                3,
                this.getItemTint()
            );
            
            // Используем AnimationLibrary для анимации частиц
            AnimationLibrary.createDisappearEffect(this.scene, particle, {
                duration: 500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
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
        // Очищаем твины через AnimationLibrary
        AnimationLibrary.stopAllAnimations(this.scene, this);
        super.destroy();
    }
}
