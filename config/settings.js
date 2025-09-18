// Все глобальные переменные храним здесь
// В .env только пароли и токены
export const settings = {
    appName: 'Telepets Mini Games',
    width: 360,
    height: 640,
    backgroundColor: 0x0b1221,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    telegram: {
        enabled: true
    },
    telegramSecrets: {
        botToken: import.meta.env.VITE_BOT_TOKEN,
        webAppUrl: import.meta.env.VITE_WEBAPP_URL
    },
    responsive: {
        minWidth: 320,
        minHeight: 480,
        maxWidth: 800,
        maxHeight: 1200
    },
    game: {
        // Настройки игры в стиле Vampire Survivors
        duration: 10 * 60 * 1000,        // 10 минут в миллисекундах
        waveDuration: 60 * 1000,         // 1 минута на волну
        maxWaves: 10,                    // Максимальное количество волн
        
        // Настройки спавна врагов
        spawn: {
            baseRate: 5000,              // 2 секунды между спавнами в начале
            minRate: 500,                // 0.5 секунды в конце игры
            rateMultiplier: 0.9,         // Коэффициент ускорения спавна
            maxEnemiesOnScreen: 50,      // Максимум врагов на экране
            enemiesPerSpawn: 5,          // Количество врагов создаваемых за раз
            randomFactor: {
                min: 0.8,                // Минимальный коэффициент случайности задержки
                max: 1.2                 // Максимальный коэффициент случайности задержки
            }
        },
        
        // Модификаторы сложности
        difficulty: {
            healthMultiplier: 1.15,      // Рост здоровья врагов
            speedMultiplier: 1.05,       // Рост скорости врагов
            damageMultiplier: 1.1,       // Рост урона врагов
            countMultiplier: 1.2         // Рост количества врагов
        },
        
        // Настройки волн (конфигурация перенесена в waveTypes.js)
        
        // Настройки UI
        ui: {
            timer: {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff',
                warningTime: 60000,      // 1 минута до конца
                criticalTime: 30000      // 30 секунд до конца
            },
        },
        
        // Настройки фона
        background: {
            tileSize: 64,
            animate: true,
            animation: {
                speedX: 8,
                speedY: 4,
                duration: 20000
            }
        },
        
        // Настройки яйца
        egg: {
            health: 100,
            texture: '🥚'
        },
        
        // Настройки окончания игры
        endGameDelay: 3000  // 3 секунды до возврата в меню
    }
};
