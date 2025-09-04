export interface DefenceType {
  name: string;
  health: number;
  radius: number; // радиус действия (множитель от размера)
  effect: string; // описание эффекта
  upgradableParams: string[]; // прокачиваемые параметры
  damage: number;
  cooldown: number; // в секундах
  size: number; // размер (1x1, 2x2, 3x3 и т.д.)
  specialProperties?: {
    slowdownMultiplier?: number; // для трещины
    maxSize?: number; // для ямы
    projectileRange?: number; // для бешенного огурца
    projectileDamage?: number; // для бешенного огурца
  };
}

export const defenceTypes: Record<string, DefenceType> = {
  sugar: {
    name: 'Сахар',
    health: 30,
    radius: 5, // x5 от размера
    effect: 'Враги с влиянием на сахар (attack) идут к нему и едят (наносят урон)',
    upgradableParams: ['Здоровье', 'Радиус действия'],
    damage: 0,
    cooldown: 0,
    size: 1 // 1x1
  },
  
  stone: {
    name: 'Камень',
    health: 150,
    radius: 1, // по размеру
    effect: 'Враги с влиянием на камни обходят, летающие пролетают над ним, атакующие наносят урон',
    upgradableParams: ['Здоровье'],
    damage: 0,
    cooldown: 0,
    size: 3 // 3x3
  },
  
  crack: {
    name: 'Трещина',
    health: -1, // без здоровья (неуничтожима)
    radius: 1, // по размеру
    effect: 'Враги с влиянием на разлом замедляются в 5 раз',
    upgradableParams: ['Длина', 'Коэффициент замедления'],
    damage: 0,
    cooldown: 0,
    size: 5, // 1x5
    specialProperties: {
      slowdownMultiplier: 5
    }
  },
  
  spikes: {
    name: 'Шипы',
    health: -1, // без здоровья (неуничтожимы)
    radius: 1, // по размеру
    effect: 'Наносит урон врагу при контакте',
    upgradableParams: ['Урон', 'Кулдаун'],
    damage: 100,
    cooldown: 5,
    size: 2 // 2x2
  },
  
  madCucumber: {
    name: 'Бешенный огурец',
    health: 50,
    radius: 3, // x3 от размера
    effect: 'Стреляет в ближайшего врага в радиусе действия',
    upgradableParams: ['Радиус действия', 'Урон'],
    damage: 3,
    cooldown: 0,
    size: 1, // 1x1
    specialProperties: {
      projectileRange: 10,
      projectileDamage: 3
    }
  },
  
  pit: {
    name: 'Яма',
    health: -1, // без здоровья (неуничтожима)
    radius: 1, // по размеру
    effect: 'Мгновенно убивает врага по размеру, при убийстве врага становится меньше на размер врага',
    upgradableParams: ['Максимальный размер'],
    damage: 0,
    cooldown: 0,
    size: 1, // 1x1 по умолчанию
    specialProperties: {
      maxSize: 100 // 100% максимальный размер
    }
  }
};
