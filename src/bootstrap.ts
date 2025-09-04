import { initTelegram } from './core/telegram/TelegramInit';
import { GestureManager } from './systems/gesture/GestureManager';
import './main';

// Инициализируем Telegram WebApp SDK (мягко в вебе)
initTelegram();

// Привязываем Hammer к canvas после появления на странице
const observer = new MutationObserver(() => {
  const canvas = document.querySelector('#game canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  new GestureManager(canvas, {
    onSwipe: () => {
      // пример хука жестов — в реальном проекте пробрасывайте через EventEmitter/шину
    }
  });

  observer.disconnect();
});

observer.observe(document.body, { childList: true, subtree: true });


