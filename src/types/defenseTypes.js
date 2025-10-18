export const defenseTypes = {
    sugar: {
        name: 'Сахар',
        health: 30,
        radius: 50, // радиус действия в "единицах размера"
        effect: 'Враги с влиянием на сахар (attack) идут к нему и едят (наносят урон)',
        upgradableParams: ['Здоровье', 'Радиус действия'],
        damage: 0,
        cooldown: 0, // уже в миллисекундах
        size: 2, // Размер пончика
        texture: '🍩', // fallback эмодзи сахара
        spriteKey: 'donut', // ключ для спрайта
        defaultSize: '128x128'
    },
    stone: {
        name: 'Камень',
        health: 150,
        radius: 1, // по размеру
        effect: 'Враги с влиянием на камни обходят, летающие пролетают над ним, атакующие наносят урон',
        upgradableParams: ['Здоровье'],
        damage: 0,
        cooldown: 0, // уже в миллисекундах
        size: 3, // 3x3
        texture: '', // fallback эмодзи камня
        spriteKey: 'stone', // ключ для спрайта
        defaultSize: '128x128',
        isDraggable: true,           // Можно перетаскивать
        isObstacle: true,           // Является препятствием
        affectsFlying: false,       // Не влияет на летающих
        affectsGround: true,        // Влияет на наземных
        // Параметры генерации камней на карте
        spawn: {
            minCount: 3,
            maxCount: 10,
            margin: 50 // отступ от краёв экрана (px)
        }
    },
    crack: {
        name: 'Трещина',
        health: -1, // без здоровья (неуничтожима)
        radius: 1, // по размеру
        effect: 'Враги с влиянием на разлом замедляются в 5 раз',
        upgradableParams: ['Длина', 'Коэффициент замедления'],
        damage: 0,
        cooldown: 0, // уже в миллисекундах
        size: 5, // 1x5
        texture: '⚡', // fallback эмодзи трещины
        spriteKey: 'crack', // ключ для спрайта
        defaultSize: '500x500',
        specialProperties: {
            slowdownMultiplier: 5
        }
    },
    shell: {
        name: 'Скорлупа',
        health: -1, // без здоровья (неуничтожима)
        radius: 1, // по размеру
        effect: 'Наносит урон врагу при контакте',
        upgradableParams: ['Урон', 'Кулдаун'],
        damage: 100,
        cooldown: 5000, // 5 секунд в миллисекундах
        size: 2, // 2x2
        texture: '🌟', // fallback эмодзи скорлупы
        spriteKey: 'shell', // ключ для спрайта
        defaultSize: '64x64'
    },
    madCucumber: {
        name: 'Бешенный огурец',
        health: 50,
        radius: 3, // x3 от размера
        effect: 'Стреляет в ближайшего врага в радиусе действия',
        upgradableParams: ['Радиус действия', 'Урон'],
        damage: 3,
        cooldown: 0, // уже в миллисекундах
        size: 1, // 1x1
        texture: '🌵', // fallback эмодзи огурца
        spriteKey: 'madCucumber', // ключ для спрайта
        defaultSize: '32x32',
        specialProperties: {
            projectileRange: 10,
            projectileDamage: 3
        }
    },
    pit: {
        name: 'Яма',
        health: 200,
        maxHealth: 1000, // верхняя граница здоровья
        radius: 100, // стартовый радиус (px)
        effect: 'Мгновенное взаимодействие: яма и враг вычитают здоровье друг из друга',
        upgradableParams: ['Макс. здоровье'],
        damage: 0,
        cooldown: 0,
        size: 2,
        texture: '🕳️',
        spriteKey: 'pit',
        defaultSize: '64x64'
    }
};