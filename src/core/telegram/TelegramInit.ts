import { settings } from '@config/settings';
import WebApp from '@twa-dev/sdk';

export function initTelegram(): void {
  if (!settings.telegram.enabled) return;

  try {
    // Инициализация темы и размеров
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('secondary_bg_color');

    // Кнопка назад закрывает мини-приложение
    WebApp.BackButton.onClick(() => WebApp.close());
    WebApp.BackButton.show();
  } catch {
    // В небраузерной среде/без Telegram SDK — мягкая деградация
  }
}


