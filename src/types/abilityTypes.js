/**
 * Типы и конфигурация системы прокачки
 */

// Конфигурация прокачек
export const ABILITIES = {
    // Тап по врагу ----------------------------------------
    TAP_DAMAGE: {
        name: 'Урон по тапу',
        description: 'Влияет на урон тапом по врагу',
        baseValue: 5,
        increase: 2,        // +2 урона за уровень
        maxValue: 100,
        icon: '⚔️'
    },
    TAP_EXPLOSION: {
        name: 'Взрыв по тапу',
        description: 'Убивает взрывной волной врагов в радиусе по тапу',
        baseValue: 0,
        increase: 1,        // +2 урона за уровень
        maxValue: 100,
        icon: '⚔️'
    },

    // ЯЙЦО ----------------------------------------
    EGG_HEALTH: {
        name: 'Здоровье яйца',
        description: 'Максимальное здоровье яйца',
        baseValue: 100,      // Базовое здоровье
        increase: 20,        // +20 HP за уровень (за каждое сердце)
        maxValue: 500,       // Максимум 500 HP
        icon: '❤️'
    },
    
    EGG_DAMAGE: {
        name: 'Урон яйца',
        description: 'базовый урон яйца',
        baseValue: 10,
        increase: 3,        // +3 урона за уровень
        maxValue: 100,
        icon: '🥚'
    },
    
    EGG_COOLDOWN: {
        name: 'Кулдаун',
        description: 'базовый кулдаун яйца',
        baseValue: 1000, // 10 секунд в миллисекундах
        increase: -100,   // -100мс за уровень (уменьшается)
        maxValue: 500, // пол секунды
        icon: '⏱️'
    },
    
    EGG_RADIUS: {
        name: 'Радиус',
        description: 'базовый радиус поражения яйца в пикселях',
        baseValue: 60,
        increase: 20,      // +20 пикселя за уровень
        maxValue: 500,
        icon: '🎯'
    },

    EGG_RECOVERY: {
        name: 'Регенерация',
        description: 'Количество доступных регенераций',
        baseValue: 0,     // Нет регенераций изначально
        increase: 1,      // +1 регенерация за предмет
        maxValue: 10,     // Максимум регенераций в секунду
        icon: '🌿'
    },

    EGG_AURA: {
        name: 'Аура',
        description: 'Аура вокруг яйца',
        baseValue: 0,     // 0=заблокирована, 1+=множитель
        increase: 1,      // +1 к множителю за уровень
        maxValue: 10,
        icon: '✨'
    },

    EGG_EXPLOSION: {
        name: 'Взрыв тапом по яйцу',
        description: 'Убивает взрывной волной врагов в радиусе по тапу',
        baseValue: 10,
        increase: 5,       
        maxValue: 50,
        icon: '⚔️'
    },

    // ОБЩИЕ ----------------------------------------
    LUCK: {
        name: 'Удача',
        description: 'Влияет на дроп предметов из врагов',
        baseValue: 100,
        increase: 5,      // +5 удача за уровень
        maxValue: 30,
        icon: '🍀'
    },
    
    PIT: {
        name: 'Ямы на поле',
        description: 'Текущее количество ям на поле',
        baseValue: 0,     // Нет ям изначально
        increase: 1,      // +1 яма при выкапывании
        maxValue: 4,      // Максимум 4 ямы на поле
        icon: '🕳️'
    },
    
    SHOVEL_COUNT: {
        name: 'Лопаты',
        description: 'Количество доступных лопат для копания',
        baseValue: 0,     // Нет лопат изначально
        increase: 1,      // +1 лопата за предмет
        maxValue: 10,     // Максимум лопат в инвентаре
        icon: '🪓'
    },
    PEPPER_COUNT: {
        name: 'Перецы',
        description: 'Количество доступных перцев',
        baseValue: 0,     // Нет перцев изначально
        increase: 1,      // +1 перец за предмет
        maxValue: 10,     // Максимум перцев в инвентаре
        icon: '🌶️'
    },
    HONEY_COUNT: {
        name: 'Мёды',
        description: 'Количество доступных мёдов',
        baseValue: 0,     // Нет мёдов изначально
        increase: 1,      // +1 мёд за предмет
        maxValue: 10,     // Максимум мёдов в инвентаре
        icon: '🍯'
    },
    SEED_COUNT: {
        name: 'Семена',
        description: 'Количество доступных семян',
        baseValue: 0,     // Нет семян изначально
        increase: 1,      // +1 семя за предмет
        maxValue: 10,     // Максимум семян в инвентаре
        icon: '🌱'
    },
    ALOE_COUNT: {
        name: 'Алоэ',
        description: 'Количество доступных алоэ',
        baseValue: 0,     // Нет алоэ изначально
        increase: 1,      // +1 алоэ за предмет
        maxValue: 10,     // Максимум алоэ в инвентаре
        icon: '🌿'
    },

};
