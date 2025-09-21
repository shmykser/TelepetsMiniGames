# 🎮 Telepets Mini Games

Базовый шаблон браузерной мини-игры для Telegram Web Apps на Phaser 3, с поддержкой жестов через Hammer.js, сборкой на Vite и строгой типизацией TypeScript.

## 🚀 Демо

[**Играть онлайн**](https://shmykser.github.io/TelepetsMiniGames/) - GitHub Pages

## 🏗️ Архитектура

- **Vite + TS**: быстрая разработка и HMR
- **Phaser 3**: сцены `Boot`, `Preload`, `MainMenu`, `Game`, `UI`
- **Жесты**: `src/systems/GestureSystem.js`
- **Telegram**: `src/telegram/TelegramInit.js`
- **Настройки проекта**: `config/settings.js` (Telegram интеграция)
- **Игровые настройки**: `src/settings/GameSettings.js` (все настройки Phaser)
- **Секреты**: `.env` (только токены и пароли)

## 🛠️ Установка и запуск

### Локальная разработка

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/shmykser/TelepetsMiniGames.git
   cd TelepetsMiniGames
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Создайте файл `.env`** (только для токенов):
   ```env
   VITE_BOT_TOKEN=your_bot_token_here
   VITE_WEBAPP_URL=https://your-webapp-url.com
   ```

4. **Запустите dev-сервер:**
   ```bash
   npm run dev
   ```

5. **Сборка для продакшна:**
   ```bash
   npm run build
   npm run preview
   ```

### GitHub Pages (автоматическая публикация)

Проект автоматически публикуется на GitHub Pages при каждом push в ветку `main`.

**Настройка GitHub Pages:**
1. Перейдите в Settings → Pages
2. Source: "GitHub Actions"
3. После первого push в `main` сайт будет доступен по адресу:
   `https://shmykser.github.io/TelepetsMiniGames/`

## ⚙️ Конфигурация

### Настройки проекта (`config/settings.js`)

Настройки проекта (не связанные с игрой):
- Интеграция с Telegram
- Токены из переменных окружения

### Игровые настройки (`src/settings/GameSettings.js`)

Все настройки Phaser и игрового процесса:
- Размеры игры (360x640)
- Цвет фона
- Физический движок (Arcade Physics)
- Настройки волн, врагов, эффектов

### Переменные окружения (`.env`)

В `.env` хранятся только секретные данные:
```env
VITE_BOT_TOKEN=your_bot_token_here
VITE_WEBAPP_URL=https://your-webapp-url.com
```

## 🎯 Особенности

- **Мобильная оптимизация**: адаптивный дизайн для Telegram WebApp
- **Жесты**: поддержка tap, swipe, pinch, rotate через Hammer.js
- **Telegram интеграция**: автоматическая инициализация WebApp SDK
- **TypeScript**: строгая типизация для надежности кода
- **Hot Reload**: быстрая разработка с Vite
- **GitHub Actions**: автоматическая публикация на GitHub Pages

## 📱 Telegram WebApp

Игра оптимизирована для запуска в Telegram:
- Автоматическое определение темы
- Поддержка кнопки "Назад"
- Адаптивные размеры экрана
- Touch-жесты для мобильных устройств

## 🛡️ Безопасность

- Секретные данные (токены) хранятся в `.env`
- Настройки проекта в `config/settings.js`
- Игровые настройки в `src/settings/GameSettings.js`
- `.gitignore` исключает чувствительные файлы

## 📚 Документация

Подробная документация доступна в папке [`docs/`](docs/README.md).

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## 🔗 Ссылки

- [Phaser 3](https://phaser.io/) - игровой движок
- [Hammer.js](https://hammerjs.github.io/) - библиотека жестов
- [Telegram WebApp](https://core.telegram.org/bots/webapps) - документация
- [Vite](https://vitejs.dev/) - сборщик
- [TypeScript](https://www.typescriptlang.org/) - типизация

---

⭐ **Если проект полезен, поставьте звезду!**
