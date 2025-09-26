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
        
        // Telegram WebApp кнопки - полупрозрачные как на скриншоте
        this.colors = {
            accent: '#2481cc',       // Telegram accent color
            accentDark: '#1e6bb8',   // Темнее для hover эффектов
            text: '#ffffff',         // Белый текст
            background: 'rgba(0, 0, 0, 0.15)',   // Полупрозрачный черный как у кнопок WebApp
            backgroundAlpha: 0.15    // Прозрачность для видимости фона
        };
        
        this.createElements();
    }
    
    createElements() {
        // Создаем HTML контейнер для таймера с точными параметрами кнопок Telegram
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.left = `${this.x - this.width / 2}px`;
        this.container.style.top = `${this.y - this.height / 2}px`;
        this.container.style.width = `${this.width}px`;
        this.container.style.height = `${this.height}px`;
        this.container.style.minHeight = '36px'; // Точная высота кнопок WebApp
        this.container.style.backgroundColor = this.colors.background;
        this.container.style.borderRadius = '8px'; // Точное скругление кнопок WebApp
        this.container.style.border = 'none'; // Убираем границу
        this.container.style.display = 'inline-flex'; // Как у кнопок WebApp
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'; // Системные шрифты
        this.container.style.fontSize = '14px'; // Точный размер шрифта кнопок WebApp
        this.container.style.fontWeight = '500'; // Средний вес шрифта
        this.container.style.lineHeight = '20px'; // Высота строки
        this.container.style.color = '#ffffff'; // Белый текст как у кнопок WebApp
        this.container.style.letterSpacing = '0px'; // Убираем межбуквенный интервал
        this.container.style.zIndex = '1000';
        this.container.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'; // Мягкая тень как у кнопок WebApp
        this.container.style.userSelect = 'none';
        this.container.style.pointerEvents = 'none';
        this.container.style.padding = '0 16px'; // Точные отступы кнопок WebApp
        this.container.style.transition = 'background-color 0.2s'; // Плавные переходы как у кнопок
        this.container.style.backdropFilter = 'blur(10px)'; // Размытие фона для эффекта стекла
        
        // Создаем текст таймера
        this.textElement = document.createElement('span');
        this.textElement.textContent = '10:00';
        this.textElement.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
        
        this.container.appendChild(this.textElement);
        
        // Добавляем в DOM
        document.body.appendChild(this.container);
        
        // Отладочная информация (только при создании)
        console.log('🎨 [TelegramTimer] HTML элемент создан с параметрами кнопок Telegram');
        
        // Инициализируем переменные темы Telegram
        this.initTelegramTheme();
        
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
    
    initTelegramTheme() {
        // Инициализируем переменные темы Telegram (только для информации)
        if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
            const WebApp = window.Telegram.WebApp;
            const themeParams = WebApp.themeParams;
            
            if (themeParams) {
                console.log('🎨 [TelegramTimer] Тема Telegram обнаружена:', {
                    buttonColor: themeParams.button_color,
                    buttonTextColor: themeParams.button_text_color,
                    bgColor: themeParams.bg_color,
                    textColor: themeParams.text_color
                });
            } else {
                console.log('🎨 [TelegramTimer] Тема Telegram не найдена, используем стандартные цвета WebApp');
            }
        } else {
            console.log('🎨 [TelegramTimer] Telegram WebApp не найден, используем стандартные цвета WebApp');
        }
    }
    
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}