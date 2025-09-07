export type EnemyReaction = 'attack' | 'ignore' | 'influence';

export interface EnemyType {
  name: string;
  health: number;
  damage: number;
  cooldown: number; // в секундах
  speed: number; // 1-10
  attackRange?: number; // радиус атаки
  canFly: boolean;
  size: number; // размер для взаимодействия с ямой
  reactions: {
    sugar: EnemyReaction;
    stone: EnemyReaction;
    crack: EnemyReaction;
    spikes: EnemyReaction;
    madCucumber: EnemyReaction;
    pit: EnemyReaction;
  };
}

export const enemyTypes: Record<string, EnemyType> = {
  ant: {
    name: 'Муравей',
    health: 10,
    damage: 2,
    cooldown: 5,
    speed: 7,
    canFly: false,
    size: 1,
    reactions: {
      sugar: 'attack',
      stone: 'influence',
      crack: 'influence',
      spikes: 'influence',
      madCucumber: 'influence',
      pit: 'influence'
    }
  },
  
  beetle: {
    name: 'Жук',
    health: 30,
    damage: 5,
    cooldown: 5,
    speed: 5,
    canFly: false,
    size: 2,
    reactions: {
      sugar: 'ignore',
      stone: 'influence',
      crack: 'influence',
      spikes: 'influence',
      madCucumber: 'influence',
      pit: 'influence'
    }
  },
  
  rhinoceros: {
    name: 'Жук-носорог',
    health: 60,
    damage: 10,
    cooldown: 5,
    speed: 4,
    canFly: false,
    size: 3,
    reactions: {
      sugar: 'attack',
      stone: 'attack',
      crack: 'ignore',
      spikes: 'influence',
      madCucumber: 'influence',
      pit: 'influence'
    }
  },
  
  mosquito: {
    name: 'Комар',
    health: 10,
    damage: 2,
    cooldown: 5,
    speed: 5,
    canFly: true,
    size: 1,
    reactions: {
      sugar: 'ignore',
      stone: 'ignore',
      crack: 'ignore',
      spikes: 'ignore',
      madCucumber: 'influence',
      pit: 'influence'
    }
  },
  
  spider: {
    name: 'Паук',
    health: 100,
    damage: 10,
    cooldown: 5,
    speed: 2,
    canFly: false,
    size: 2,
    reactions: {
      sugar: 'ignore',
      stone: 'influence',
      crack: 'ignore',
      spikes: 'influence',
      madCucumber: 'influence',
      pit: 'influence'
    }
  },
  
  fly: {
    name: 'Муха',
    health: 20,
    damage: 3,
    cooldown: 5,
    speed: 8,
    attackRange: 30,
    canFly: true,
    size: 1,
    reactions: {
      sugar: 'attack',
      stone: 'ignore',
      crack: 'ignore',
      spikes: 'ignore',
      madCucumber: 'influence',
      pit: 'influence'
    }
  },
  
  bee: {
    name: 'Пчела',
    health: 15,
    damage: 4,
    cooldown: 4,
    speed: 6,
    attackRange: 35,
    canFly: true,
    size: 1.2,
    reactions: {
      sugar: 'attack',
      stone: 'ignore',
      crack: 'ignore',
      spikes: 'ignore',
      madCucumber: 'influence',
      pit: 'influence'
    }
  },
  
  butterfly: {
    name: 'Бабочка',
    health: 8,
    damage: 1,
    cooldown: 6,
    speed: 4,
    attackRange: 20,
    canFly: true,
    size: 1.5,
    reactions: {
      sugar: 'ignore',
      stone: 'ignore',
      crack: 'ignore',
      spikes: 'ignore',
      madCucumber: 'ignore',
      pit: 'influence'
    }
  },
  
  dragonfly: {
    name: 'Стрекоза',
    health: 25,
    damage: 6,
    cooldown: 3,
    speed: 12,
    attackRange: 40,
    canFly: true,
    size: 1.8,
    reactions: {
      sugar: 'ignore',
      stone: 'ignore',
      crack: 'ignore',
      spikes: 'ignore',
      madCucumber: 'influence',
      pit: 'influence'
    }
  }
};
