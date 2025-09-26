import { settings } from '../../config/settings.js';
import WebApp from '@twa-dev/sdk';

// Глобальная переменная для хранения safe-area значений
window.telegramSafeArea = { top: 0, bottom: 0, left: 0, right: 0 };

export function initTelegram() {
    if (!settings.telegram.enabled)
        return;
    try {
        // Инициализация темы и размеров
        WebApp.ready();
        WebApp.expand();
        
        // Обработчик событий safe-area от Telegram WebApp
        WebApp.onEvent('safe_area_changed', (data) => {
            console.log('📱 [Telegram] Safe area changed:', data);
            if (data) {
                window.telegramSafeArea = {
                    top: data.top || 0,
                    bottom: data.bottom || 0,
                    left: data.left || 0,
                    right: data.right || 0
                };
                // Отправляем событие в игру
                window.dispatchEvent(new CustomEvent('safe-area-changed', { detail: window.telegramSafeArea }));
            }
        });
        
        // Обработчик событий content safe-area от Telegram WebApp
        WebApp.onEvent('content_safe_area_changed', (data) => {
            console.log('📱 [Telegram] Content safe area changed:', data);
            if (data) {
                window.telegramSafeArea = {
                    top: data.top || 0,
                    bottom: data.bottom || 0,
                    left: data.left || 0,
                    right: data.right || 0
                };
                // Отправляем событие в игру
                window.dispatchEvent(new CustomEvent('safe-area-changed', { detail: window.telegramSafeArea }));
            }
        });
        
        // Проверяем поддержку методов для совместимости с версией 6.0
        if (WebApp.setHeaderColor && typeof WebApp.setHeaderColor === 'function') {
            try {
                WebApp.setHeaderColor('secondary_bg_color');
            }
            catch (error) {
            }
        }
        // Кнопка назад закрывает мини-приложение (только если поддерживается)
        if (WebApp.BackButton && typeof WebApp.BackButton.onClick === 'function') {
            try {
                WebApp.BackButton.onClick(() => WebApp.close());
                if (typeof WebApp.BackButton.show === 'function') {
                    WebApp.BackButton.show();
                }
            }
            catch (error) {
            }
        }
    }
    catch (error) {
        // В небраузерной среде/без Telegram SDK — мягкая деградация
    }
}
