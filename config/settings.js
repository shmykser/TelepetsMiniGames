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
        // Pathfinding для наземных врагов - обход камней
        // НЕ используется для: летающих врагов (canFly + ignoreGroundObstacles), 
        // static (улей), spawner, randomPoint (крот)
        pathfindingEnabled: true
    }
};
