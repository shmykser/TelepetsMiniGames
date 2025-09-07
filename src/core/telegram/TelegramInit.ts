import { settings } from '@config/settings';
import WebApp from '@twa-dev/sdk';

export function initTelegram(): void {
  if (!settings.telegram.enabled) return;

  try {
    // Инициализация темы и размеров
    WebApp.ready();
    WebApp.expand();
    
    // Проверяем поддержку методов для совместимости с версией 6.0
    if (WebApp.setHeaderColor && typeof WebApp.setHeaderColor === 'function') {
      try {
        WebApp.setHeaderColor('secondary_bg_color');
      } catch (error) {
      }
    }

    // Кнопка назад закрывает мини-приложение (только если поддерживается)
    if (WebApp.BackButton && typeof WebApp.BackButton.onClick === 'function') {
      try {
        WebApp.BackButton.onClick(() => WebApp.close());
        if (typeof WebApp.BackButton.show === 'function') {
          WebApp.BackButton.show();
        }
      } catch (error) {
      }
    }
  } catch (error) {
    // В небраузерной среде/без Telegram SDK — мягкая деградация
  }
}


