export const enemyTypes = {
    unknown: {
        name: 'Неизвестный',
        health: 10,
        damage: 5,
        cooldown: 5000, // 5 секунд в миллисекундах
        speed: 70, // скорость в пикселях в секунду
        attackRange: 30,
        canFly: false,
        size: 1,
        texture: '❓', // fallback для неизвестных типов
        spriteKey: 'ant', // используем спрайт муравья как fallback
        defaultSize: '64x64',
        detectionRange: 150, // радиус обнаружения игрока
        reactions: {
            sugar: 'attack',
            stone: 'influence',
            crack: 'influence',
            spikes: 'influence',
            madCucumber: 'influence',
            pit: 'influence'
        }
    },
    ant: {
        name: 'Муравей',
        health: 10,
        damage: 5,
        cooldown: 5000, // 5 секунд в миллисекундах
        speed: 70, // скорость в пикселях в секунду
        attackRange: 30,
        canFly: false,
        size: 1,
        texture: '🐜', // fallback эмодзи
        spriteKey: 'ant', // ключ для выбора спрайта
        defaultSize: '32x32', // размер по умолчанию
        detectionRange: 150, // радиус обнаружения игрока
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
        damage: 10,
        cooldown: 5000, // 5 секунд в миллисекундах
        speed: 50, // скорость в пикселях в секунду
        attackRange: 35,
        canFly: false,
        size: 2,
        texture: '🐞', // fallback эмодзи
        spriteKey: 'ladybug', // используем спрайт божьей коровки как жука
        defaultSize: '64x64',
        detectionRange: 150, // радиус обнаружения игрока
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
        damage: 20,
        cooldown: 5000, // 5 секунд в миллисекундах
        speed: 40, // скорость в пикселях в секунду
        attackRange: 40,
        canFly: false,
        size: 3,
        texture: '🐛', // fallback эмодзи
        spriteKey: 'rhinoceros',
        defaultSize: '128x128',
        detectionRange: 150, // радиус обнаружения игрока
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
        cooldown: 5000, // 5 секунд в миллисекундах
        speed: 50, // скорость в пикселях в секунду
        attackRange: 25,
        canFly: true,
        size: 1,
        texture: '🦟', // fallback эмодзи
        spriteKey: 'mosquito',
        defaultSize: '32x32',
        detectionRange: 150, // радиус обнаружения игрока
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
        cooldown: 5000, // 5 секунд в миллисекундах
        speed: 20, // скорость в пикселях в секунду
        attackRange: 50,
        canFly: false,
        size: 3,
        texture: '🕷️', // fallback эмодзи
        spriteKey: 'spider',
        defaultSize: '128x128',
        detectionRange: 150, // радиус обнаружения игрока
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
        cooldown: 5000, // 5 секунд в миллисекундах
        speed: 80, // скорость в пикселях в секунду
        attackRange: 30,
        canFly: true,
        size: 1,
        texture: '🦗', // fallback эмодзи
        spriteKey: 'fly',
        defaultSize: '32x32',
        detectionRange: 150, // радиус обнаружения игрока
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
        cooldown: 4000, // 4 секунды в миллисекундах
        speed: 60, // скорость в пикселях в секунду
        attackRange: 35,
        canFly: true,
        size: 2,
        texture: '🐝', // fallback эмодзи
        spriteKey: 'bee',
        defaultSize: '64x64',
        detectionRange: 150, // радиус обнаружения игрока
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
        cooldown: 6000, // 6 секунд в миллисекундах
        speed: 40, // скорость в пикселях в секунду
        attackRange: 20,
        canFly: true,
        size: 2,
        texture: '🦋', // fallback эмодзи
        spriteKey: 'butterfly',
        defaultSize: '64x64',
        detectionRange: 150, // радиус обнаружения игрока
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
        cooldown: 3000, // 3 секунды в миллисекундах
        speed: 120, // скорость в пикселях в секунду
        attackRange: 40,
        canFly: true,
        size: 2,
        texture: '🦇', // fallback эмодзи
        spriteKey: 'dragonfly',
        defaultSize: '64x64',
        detectionRange: 150, // радиус обнаружения игрока
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
