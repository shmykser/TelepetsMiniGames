export type GameSettings = {
  appName: string;
  width: number;
  height: number;
  backgroundColor: number;
  physics: {
    default: 'arcade' | 'matter' | 'impact';
    arcade?: {
      gravity: { x: number; y: number };
      debug: boolean;
    };
  };
  telegram: {
    enabled: boolean;
  };
  // Переменные для Telegram WebApp (токены, пароли)
  telegramSecrets: {
    botToken?: string;
    webAppUrl?: string;
  };
};

// Все глобальные переменные храним здесь
// В .env только пароли и токены
export const settings: GameSettings = {
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
  }
};
