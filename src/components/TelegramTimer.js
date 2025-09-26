import { BaseHTMLComponent } from './BaseHTMLComponent.js';
import { TELEGRAM_UI_STYLES } from '../settings/GameSettings.js';

/**
 * Telegram-стилизованный таймер
 * Имитирует дизайн встроенных кнопок Telegram WebApp
 * Использует HTML/CSS для точного контроля стилизации
 */
export class TelegramTimer extends BaseHTMLComponent {
    constructor(scene, x, y, width = 70, height = 36) {
        const config = {
            width,
            height,
            backgroundColor: TELEGRAM_UI_STYLES.colors.background,
            textColor: TELEGRAM_UI_STYLES.colors.text,
            fontSize: TELEGRAM_UI_STYLES.fonts.size,
            fontFamily: TELEGRAM_UI_STYLES.fonts.family,
            fontWeight: TELEGRAM_UI_STYLES.fonts.weight,
            borderRadius: TELEGRAM_UI_STYLES.sizes.borderRadius,
            padding: TELEGRAM_UI_STYLES.sizes.padding,
            zIndex: TELEGRAM_UI_STYLES.zIndex.base
        };
        
        super(scene, x, y, config);
        
        this.createTextElement();
        this.initTelegramTheme();
    }
    
    /**
     * Создать элемент текста
     */
    createTextElement() {
        this.textElement = document.createElement('span');
        this.textElement.textContent = '10:00';
        this.textElement.style.textShadow = TELEGRAM_UI_STYLES.effects.textShadow;
        
        this.container.appendChild(this.textElement);
    }
    
    /**
     * Установить цвет текста
     * @param {string} color - Цвет
     */
    setColor(color) {
        this.setTextColor(color);
    }
    
    /**
     * Инициализировать тему Telegram
     */
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
}