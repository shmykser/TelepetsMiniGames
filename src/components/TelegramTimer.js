/**
 * Telegram-стилизованный таймер
 * Имитирует дизайн встроенных кнопок Telegram WebApp
 */
export class TelegramTimer {
    constructor(scene, x, y, width = 90, height = 40) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Telegram цветовая схема
        this.colors = {
            accent: 0x2481cc,        // Telegram accent color
            accentDark: 0x1e6bb8,    // Темнее для hover эффектов
            text: '#ffffff',         // Белый текст
            background: 0x2481cc,    // Фон кнопки
            backgroundAlpha: 0.9     // Прозрачность фона
        };
        
        this.createElements();
    }
    
    createElements() {
        // Создаем фон с градиентом (имитируем через несколько прямоугольников)
        this.background = this.scene.add.graphics();
        this.background.fillStyle(this.colors.background, this.colors.backgroundAlpha);
        this.background.fillRoundedRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height,
            8 // Радиус скругления как у кнопок Telegram
        );
        
        // Добавляем тонкую обводку
        this.background.lineStyle(1, this.colors.accent, 0.3);
        this.background.strokeRoundedRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height,
            8
        );
        
        // Создаем текст таймера
        this.text = this.scene.add.text(
            this.x,
            this.y,
            '10:00',
            {
                fontSize: '18px',
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                fill: this.colors.text,
                fontStyle: '600',
                stroke: 'none',
                strokeThickness: 0,
                letterSpacing: '0.5px'
            }
        ).setOrigin(0.5);
        
        // Добавляем тень для текста (имитируем depth)
        this.textShadow = this.scene.add.text(
            this.x + 1,
            this.y + 1,
            '10:00',
            {
                fontSize: '18px',
                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                fill: '#000000',
                fontStyle: '600',
                stroke: 'none',
                strokeThickness: 0,
                letterSpacing: '0.5px',
                alpha: 0.2
            }
        ).setOrigin(0.5);
        
        // Устанавливаем глубину
        this.background.setDepth(1000);
        this.textShadow.setDepth(1001);
        this.text.setDepth(1002);
        
        // Изначально скрываем
        this.setVisible(false);
    }
    
    setVisible(visible) {
        this.background.setVisible(visible);
        this.text.setVisible(visible);
        this.textShadow.setVisible(visible);
    }
    
    setText(text) {
        this.text.setText(text);
        this.textShadow.setText(text);
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        
        // Обновляем позиции всех элементов
        this.background.clear();
        this.background.fillStyle(this.colors.background, this.colors.backgroundAlpha);
        this.background.fillRoundedRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height,
            8
        );
        
        this.background.lineStyle(1, this.colors.accent, 0.3);
        this.background.strokeRoundedRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height,
            8
        );
        
        this.text.setPosition(this.x, this.y);
        this.textShadow.setPosition(this.x + 1, this.y + 1);
    }
    
    setColor(color) {
        this.colors.text = color;
        this.text.setFill(color);
    }
    
    destroy() {
        if (this.background) this.background.destroy();
        if (this.text) this.text.destroy();
        if (this.textShadow) this.textShadow.destroy();
    }
}
