// Настройки проекта (не связанные с Phaser)
// В .env только пароли и токены
export const settings = {
    // Настройки Telegram интеграции
    telegram: {
        enabled: true
    },
    telegramSecrets: {
        botToken: import.meta.env.VITE_BOT_TOKEN,
        webAppUrl: import.meta.env.VITE_WEBAPP_URL
    },
    // Глобальные флаги ИИ/геймплея
    ai: {
        // Временный флаг: при необходимости отключаем pathfinding, чтобы не ломать стратегии движения
        pathfindingEnabled: false
    }
};
