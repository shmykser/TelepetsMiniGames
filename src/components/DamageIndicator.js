import Phaser from 'phaser';

/**
 * Компонент для отображения цифрового урона
 * Показывает анимированный текст с уроном над объектом
 */
export class DamageIndicator extends Phaser.GameObjects.Container {
    constructor(scene, x, y, damage, options = {}) {
        super(scene, x, y);
        
        // Настройки по умолчанию
        this.damage = damage;
        this.duration = options.duration || 1000; // Время показа в миллисекундах
        this.driftDistance = options.driftDistance || 50; // Расстояние дрейфа вверх
        this.fontSize = options.fontSize || 24;
        this.color = options.color || 0xff0000; // Красный цвет по умолчанию
        this.strokeColor = options.strokeColor || 0x000000; // Черная обводка
        this.strokeThickness = options.strokeThickness || 2;
        
        // Создаем текст с уроном
        this.damageText = scene.add.text(0, 0, `-${damage}`, {
            fontSize: `${this.fontSize}px`,
            fill: `#${this.color.toString(16).padStart(6, '0')}`,
            stroke: `#${this.strokeColor.toString(16).padStart(6, '0')}`,
            strokeThickness: this.strokeThickness,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        
        // Центрируем текст
        this.damageText.setOrigin(0.5, 0.5);
        
        // Добавляем текст в контейнер
        this.add(this.damageText);
        
        // Добавляем в сцену
        scene.add.existing(this);
        
        // Запускаем анимацию
        this.startAnimation();
    }
    
    /**
     * Запускает анимацию появления и исчезновения
     */
    startAnimation() {
        // Анимация дрейфа вверх и исчезновения
        this.scene.tweens.add({
            targets: this,
            y: this.y - this.driftDistance,
            alpha: 0,
            duration: this.duration,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
        
        // Анимация масштабирования (появление)
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        });
        
        // Анимация пульсации
        this.scene.tweens.add({
            targets: this.damageText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 150,
            yoyo: true,
            repeat: 2,
            ease: 'Power2'
        });
    }
    
    /**
     * Статический метод для создания индикатора урона
     */
    static showDamage(scene, target, damage, options = {}) {
        // Позиция над объектом
        const x = target.x;
        const y = target.y - (target.displayHeight / 2) - 20;
        
        // Создаем индикатор
        return new DamageIndicator(scene, x, y, damage, options);
    }
    
    /**
     * Статический метод для показа урона с случайным смещением
     */
    static showDamageWithOffset(scene, target, damage, options = {}) {
        // Случайное смещение по X для избежания наложения
        const offsetX = Phaser.Math.Between(-20, 20);
        const x = target.x + offsetX;
        const y = target.y - (target.displayHeight / 2) - 20;
        
        // Создаем индикатор
        return new DamageIndicator(scene, x, y, damage, options);
    }
    
    /**
     * Уничтожение компонента
     */
    destroy() {
        if (this.damageText) {
            this.damageText.destroy();
        }
        super.destroy();
    }
}
