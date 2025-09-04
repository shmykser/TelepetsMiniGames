# Telepets Mini Games

## Обзор
Базовый шаблон браузерной мини-игры для Telegram Web Apps на Phaser 3, с поддержкой жестов через Hammer.js, сборкой на Vite и строгой типизацией TypeScript.

## Архитектура
- **Vite + TS**: быстрая разработка и HMR
- **Phaser 3**: сцены `Boot`, `Preload`, `MainMenu`, `Game`, `UI`
- **Жесты**: `src/systems/gesture/GestureManager.ts` (Hammer.js)
- **Telegram**: `src/core/telegram/TelegramInit.ts`
- **Глобальные настройки**: `config/settings.ts` (все настройки игры)
- **Секреты**: `.env` (только токены и пароли)

## Запуск
1. Установить зависимости: `npm i`
2. Создать файл `.env` только с токенами (см. ниже)
3. Запуск dev-сервера: `npm run dev`
4. Продакшн-сборка: `npm run build` и предпросмотр `npm run preview`

## Конфигурация
### Настройки игры
Все настройки игры хранятся в `config/settings.ts`:
- Размеры игры, цвет фона
- Физический движок и параметры
- Включение/отключение Telegram интеграции

### Переменные окружения (.env)
В `.env` хранятся только секретные данные:
```
VITE_BOT_TOKEN=your_bot_token_here
VITE_WEBAPP_URL=https://your-webapp-url.com
```

## Паттерны
- Разделение сцен и систем
- Чистый DI через импорт настроек из `config/settings.ts`
- Слабая связанность Telegram/Hammer с игрой (инициализация в `bootstrap.ts`)
- Все настройки игры в одном месте, секреты отдельно
