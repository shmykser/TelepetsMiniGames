import { BaseUIComponent } from '../core/BaseUIComponent.js';
import { AnimationLibrary } from '../animations/AnimationLibrary.js';
import { PropertyUtils } from './PropertyUtils.js';

/**
 * Утилитарный класс для создания кнопок
 * Следует принципу Single Responsibility Principle
 */
export class UIButton extends BaseUIComponent {
    constructor(scene, x, y, config = {}) {
        const defaultConfig = {
            width: 200,
            height: 50,
            text: 'Button',
            backgroundColor: 0x4a4a4a,
            textColor: '#ffffff',
            fontSize: '16px',
            fontFamily: 'Arial',
            borderRadius: 5,
            padding: 10,
            interactive: true,
            hoverScale: 1.05,
            clickScale: 0.95,
            animations: true
        };

        super(scene, x, y, { ...defaultConfig, ...config });
    }

    init() {
        this.createButton();
        this.setupInteractions();
        this.setupAnimations();
    }

    createButton() {
        // Создаем фон кнопки
        this.background = this.scene.add.graphics();
        this.background.x = this.x;
        this.background.y = this.y;
        
        // Создаем текст кнопки
        this.text = this.scene.add.text(this.x, this.y, this.text, {
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fill: this.textColor,
            align: 'center'
        });
        this.text.setOrigin(0.5, 0.5);

        // Рисуем фон
        this.drawBackground();
    }

    drawBackground() {
        this.background.clear();
        this.background.fillStyle(this.backgroundColor);
        this.background.fillRoundedRect(
            -this.width / 2, 
            -this.height / 2, 
            this.width, 
            this.height, 
            this.borderRadius
        );
    }

    setupInteractions() {
        if (!this.interactive) return;

        // Создаем невидимую область для взаимодействия
        this.hitArea = this.scene.add.rectangle(
            this.x, 
            this.y, 
            this.width, 
            this.height, 
            0x000000, 
            0
        );
        this.hitArea.setInteractive();

        // Обработчики событий
        this.hitArea.on('pointerover', () => this.onHover());
        this.hitArea.on('pointerout', () => this.onHoverOut());
        this.hitArea.on('pointerdown', () => this.onClick());
        this.hitArea.on('pointerup', () => this.onClickUp());
    }

    setupAnimations() {
        if (!this.animations) return;

        this.hoverAnimation = null;
        this.clickAnimation = null;
    }

    onHover() {
        if (this.hoverAnimation) {
            this.hoverAnimation.stop();
        }
        
        if (this.animations) {
            this.hoverAnimation = AnimationLibrary.createScaleAnimation(
                this.scene, 
                this.background, 
                { scale: { from: 1, to: this.hoverScale }, duration: 150 }
            );
        }
    }

    onHoverOut() {
        if (this.hoverAnimation) {
            this.hoverAnimation.stop();
        }
        
        if (this.animations) {
            this.hoverAnimation = AnimationLibrary.createScaleAnimation(
                this.scene, 
                this.background, 
                { scale: { from: this.hoverScale, to: 1 }, duration: 150 }
            );
        }
    }

    onClick() {
        if (this.clickAnimation) {
            this.clickAnimation.stop();
        }
        
        if (this.animations) {
            this.clickAnimation = AnimationLibrary.createScaleAnimation(
                this.scene, 
                this.background, 
                { scale: { from: 1, to: this.clickScale }, duration: 100, yoyo: true }
            );
        }

        // Вызываем пользовательский обработчик
        if (this.onButtonClick) {
            this.onButtonClick();
        }
    }

    onClickUp() {
        // Дополнительная логика при отпускании кнопки
    }

    setText(text) {
        this.text = text;
        this.text.setText(text);
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
        this.drawBackground();
    }

    setTextColor(color) {
        this.textColor = color;
        this.text.setStyle({ fill: color });
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.drawBackground();
        
        if (this.hitArea) {
            this.hitArea.setSize(width, height);
        }
    }

    setPosition(x, y) {
        super.setPosition(x, y);
        
        if (this.background) {
            this.background.x = x;
            this.background.y = y;
        }
        
        if (this.text) {
            this.text.x = x;
            this.text.y = y;
        }
        
        if (this.hitArea) {
            this.hitArea.x = x;
            this.hitArea.y = y;
        }
    }

    setAlpha(alpha) {
        super.setAlpha(alpha);
        
        if (this.background) {
            this.background.alpha = alpha;
        }
        
        if (this.text) {
            this.text.alpha = alpha;
        }
        
        if (this.hitArea) {
            this.hitArea.alpha = alpha;
        }
    }

    setScale(scale) {
        super.setScale(scale);
        
        if (this.background) {
            this.background.setScale(scale);
        }
        
        if (this.text) {
            this.text.setScale(scale);
        }
        
        if (this.hitArea) {
            this.hitArea.setScale(scale);
        }
    }

    destroy() {
        if (this.background) {
            this.background.destroy();
        }
        
        if (this.text) {
            this.text.destroy();
        }
        
        if (this.hitArea) {
            this.hitArea.destroy();
        }
        
        if (this.hoverAnimation) {
            this.hoverAnimation.stop();
        }
        
        if (this.clickAnimation) {
            this.clickAnimation.stop();
        }
        
        super.destroy();
    }
}
