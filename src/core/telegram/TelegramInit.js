import { settings } from '@config/settings';
import WebApp from '@twa-dev/sdk';
export function initTelegram() {
    if (!settings.telegram.enabled)
        return;
    try {
        // Инициализация темы и размеров
        WebApp.ready();
        WebApp.expand();
        // Проверяем поддержку методов для совместимости с версией 6.0
        // setHeaderColor не поддерживается в версии 6.0, пропускаем
        if (WebApp.version && parseFloat(WebApp.version) >= 6.1) {
            if (WebApp.setHeaderColor && typeof WebApp.setHeaderColor === 'function') {
                try {
                    WebApp.setHeaderColor('secondary_bg_color');
                }
                catch (error) {
                    console.warn('[Telegram.WebApp] Header color not supported in this version');
                }
            }
        }
        
        // BackButton не поддерживается в версии 6.0, пропускаем
        if (WebApp.version && parseFloat(WebApp.version) >= 6.1) {
            if (WebApp.BackButton && typeof WebApp.BackButton.onClick === 'function') {
                try {
                    WebApp.BackButton.onClick(() => WebApp.close());
                    if (typeof WebApp.BackButton.show === 'function') {
                        WebApp.BackButton.show();
                    }
                }
                catch (error) {
                    console.warn('[Telegram.WebApp] BackButton not supported in this version');
                }
            }
        }
    }
    catch (error) {
        // В небраузерной среде/без Telegram SDK — мягкая деградация
        console.warn('[Telegram.WebApp] Initialization failed:', error);
    }
}
