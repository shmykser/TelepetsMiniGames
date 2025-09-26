/**
 * Telegram-стилизованный таймер
 * Имитирует дизайн встроенных кнопок Telegram WebApp
 * Использует HTML/CSS для точного контроля стилизации
 */
export class TelegramTimer {
    constructor(scene, x, y, width = 90, height = 40) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.lastCanvasPosition = { left: 0, top: 0 };
        
        // Telegram цветовая схема
        this.colors = {
            accent: '#2481cc',       // Telegram accent color
            accentDark: '#1e6bb8',   // Темнее для hover эффектов
            text: '#ffffff',         // Белый текст
            background: 'rgba(36, 129, 204, 0.7)',   // Фон кнопки с прозрачностью
            backgroundAlpha: 0.7     // Прозрачность фона
        };
        
        this.createElements();
    }
    
    createElements() {
        // Создаем HTML контейнер для таймера
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.left = `${this.x - this.width / 2}px`;
        this.container.style.top = `${this.y - this.height / 2}px`;
        this.container.style.width = `${this.width}px`;
        this.container.style.height = `${this.height}px`;
        this.container.style.backgroundColor = this.colors.background;
        this.container.style.borderRadius = '8px';
        this.container.style.border = `1px solid ${this.colors.accent}40`; // 40 = 25% opacity
        this.container.style.display = 'flex';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.fontFamily = 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
        this.container.style.fontSize = '18px';
        this.container.style.fontWeight = '600';
        this.container.style.color = this.colors.text;
        this.container.style.letterSpacing = '0.5px';
        this.container.style.zIndex = '1000';
        this.container.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        this.container.style.userSelect = 'none';
        this.container.style.pointerEvents = 'none';
        
        // Создаем текст таймера
        this.textElement = document.createElement('span');
        this.textElement.textContent = '10:00';
        this.textElement.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
        
        this.container.appendChild(this.textElement);
        
        // Добавляем в DOM
        document.body.appendChild(this.container);
        
        // Отладочная информация (только при создании)
        console.log('🎨 [TelegramTimer] HTML элемент создан с прозрачностью:', this.colors.background);
        
        // Изначально скрываем
        this.setVisible(false);
    }
    
    setVisible(visible) {
        if (this.container.style.display !== (visible ? 'flex' : 'none')) {
            this.container.style.display = visible ? 'flex' : 'none';
        }
    }
    
    setText(text) {
        if (this.textElement.textContent !== text) {
            this.textElement.textContent = text;
        }
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.container.style.left = `${this.x - this.width / 2}px`;
        this.container.style.top = `${this.y - this.height / 2}px`;
    }
    
    setColor(color) {
        this.colors.text = color;
        this.textElement.style.color = color;
    }
    
    updatePosition() {
        // Обновляем позицию относительно canvas
        if (this.scene && this.scene.game && this.scene.game.canvas) {
            const canvas = this.scene.game.canvas;
            const canvasRect = canvas.getBoundingClientRect();
            
            // Проверяем, изменилась ли позиция canvas
            if (this.lastCanvasPosition.left !== canvasRect.left || 
                this.lastCanvasPosition.top !== canvasRect.top) {
                
                this.lastCanvasPosition.left = canvasRect.left;
                this.lastCanvasPosition.top = canvasRect.top;
                
                this.container.style.left = `${canvasRect.left + this.x - this.width / 2}px`;
                this.container.style.top = `${canvasRect.top + this.y - this.height / 2}px`;
            }
        }
    }
    
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}