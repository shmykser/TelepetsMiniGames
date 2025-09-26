export const enemyTypes = {
    unknown: {
        name: 'Неизвестный',
        health: 10,
        canFly: false,
        size: 1,
        texture: '❓',
        spriteKey: 'ant',
        defaultSize: '64x64',
        detectionRange: 150,
        movement: {
            strategy: 'linear',
            speed: 70,
            rotationSpeed: 0.1
        },
        attack: {
            strategy: 'simple',
            damage: 5,
            range: 30,
            cooldown: 5000
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    ant: {
        name: 'Муравей',
        health: 10,
        canFly: false,
        size: 1,
        texture: '🐜',
        spriteKey: 'ant',
        defaultSize: '32x32',
        detectionRange: 150,
        movement: {
            strategy: 'linear',
            speed: 60,
            rotationSpeed: 0.15
        },
        attack: {
            strategy: 'simple',
            damage: 3,
            range: 30,
            cooldown: 5000
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    beetle: {
        name: 'Жук',
        health: 30,
        canFly: false,
        size: 2,
        texture: '🐞',
        spriteKey: 'ladybug',
        defaultSize: '64x64',
        detectionRange: 150,
        movement: {
            strategy: 'linear',
            speed: 50,
            rotationSpeed: 0.1
        },
        attack: {
            strategy: 'simple',
            damage: 10,
            range: 35,
            cooldown: 5000
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    rhinoceros: {
        name: 'Жук-носорог',
        health: 60,
        canFly: false,
        size: 3,
        texture: '🐛',
        spriteKey: 'rhinoceros',
        defaultSize: '128x128',
        detectionRange: 150,
        movement: {
            strategy: 'inertia',
            speed: 5,              // стартовая скорость
            maxSpeed: 120,          // Максимальная скорость у цели
            minSpeed: 5,            // Минимальная скорость для разворота
            acceleration: 800,      // Скорость ускорения
            deceleration: 800,      // Скорость торможения (быстрее чем ускорение)
            rotationSpeed: 0.05,    // Скорость поворота спрайта
            attackRange: 60,        // Радиус атаки при прохождении
            mass: 3.5,              // Масса для инерции
            drag: 0.95,             // Сопротивление воздуха
            bounce: 0.3             // Отскок от границ
        },
        attack: {
            strategy: 'none',       // Отключаем обычную атаку, используем только inertia атаку
            damage: 50,             // Большой урон при прохождении через цель
            range: 50,
            cooldown: 5000          // Короткая задержка между атаками
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    spider: {
        name: 'Паук',
        health: 100,
        canFly: false,
        size: 2,
        texture: '🕷️',
        spriteKey: 'spider',
        defaultSize: '64x64',
        detectionRange: 150,
        movement: {
            strategy: 'linear',
            speed: 50,
            rotationSpeed: 0.1
        },
        attack: {
            strategy: 'simple',
            damage: 10,
            range: 50,
            cooldown: 5000
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    bee: {
        name: 'Пчела',
        health: 15,
        canFly: true,
        size: 2,
        texture: '🐝',
        spriteKey: 'bee',
        defaultSize: '64x64',
        detectionRange: 150,
        movement: {
            strategy: 'flying',
            speed: 60,
            rotationSpeed: 0.08,
            amplitude: 35,
            oscillationSpeed: 0.02,
            targetAttraction: 0.9,
            attackRange: 35
        },
        attack: {
            strategy: 'simple',
            damage: 4,
            range: 35,
            cooldown: 4000
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: true
        }
    },
    butterfly: {
        name: 'Бабочка',
        health: 8,
        canFly: true,
        size: 2,
        texture: '🦋',
        spriteKey: 'butterfly',
        defaultSize: '64x64',
        detectionRange: 150,
        movement: {
            strategy: 'butterfly',
            speed: 25,                    // Уменьшил скорость с 30 до 25 для более медленного движения
            attackRange: 20,
            // Параметры порхания
            flutterAmplitude: 20,        // Уменьшил амплитуду с 40 до 20 для более плавного порхания
            flutterFrequency: 0.1,      // Уменьшил частоту с 0.3 до 0.1 для более медленного порхания
            flutterSpeed: 0.05,         // Уменьшил скорость изменения с 0.1 до 0.05 для плавности
            // Параметры случайности
            randomness: 0.1,             // Уменьшил случайность с 0.3 до 0.1 для более предсказуемого движения
            directionChangeInterval: 4000, // Увеличил интервал с 2000 до 4000 мс для более плавных переходов
            directionChangeChance: 0.02,   // Уменьшил вероятность смены с 0.1 до 0.02 для стабильности
            
            // Параметры притяжения к цели
            targetAttraction: 0.8,        // Увеличил притяжение с 0.7 до 0.8 для более целенаправленного движения
            minDistanceToTarget: 40,      // Уменьшил минимальное расстояние с 50 до 40 для более точного подхода
            directionTransitionSpeed: 0.01 // Уменьшил скорость перехода с 0.02 до 0.01 для более плавных поворотов
        },
        attack: {
            strategy: 'simple',
            damage: 1,
            range: 20,
            cooldown: 6000
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: true
        }
    },
    dragonfly: {
        name: 'Стрекоза',
        health: 1,
        canFly: true,
        size: 2,
        texture: '🦇',
        spriteKey: 'dragonfly',
        defaultSize: '64x64',
        detectionRange: 250,
        movement: {
            strategy: 'linear',
            speed: 180,
            rotationSpeed: 0.2
        },
        attack: {
            strategy: 'singleUse',
            damage: 40,
            range: 30,
            explosionRadius: 100,
            explosionDamage: 25
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: true
        }
    },
    wasp: {
        name: 'Оса',
        health: 15,
        canFly: true,
        size: 2,
        texture: '🐝',
        spriteKey: 'bee',
        defaultSize: '64x64',
        detectionRange: 400,
        movement: {
            strategy: 'orbital',
            speed: 120,
            rotationSpeed: 0.15,
            orbitSpeed: 0.02,
            approachDistance: 250,
            minOrbitRadius: 50,
            maxOrbitRadius: 300
        },
        attack: {
            strategy: 'spawn',
            damage: 0,
            range: 300,
            spawnInterval: 3000,
            spawnCount: 1,
            spawnRange: 10,
            spawnType: 'projectile',
            spawnDirection: 'target',
            spawnSpeed: 250,
            maxSpawned: 5
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: true
        }
    },  
    slug: {
        name: 'Слизень',
        health: 25,
        canFly: false,
        size: 2,
        texture: '🐌',
        spriteKey: 'snail',
        defaultSize: '64x64',
        detectionRange: 200,
        movement: {
            strategy: 'linear',
            speed: 30,
            rotationSpeed: 0.1
        },
        stealth: {
            strategy: 'stealth',
            stealthAlpha: 0.05,
            visibleAlpha: 1.0,
            visibilityDuration: 2000,
            slimeTrail: true
        },
        attack: {
            strategy: 'simple',
            damage: 4,
            range: 35,
            cooldown: 3000
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    snail: {
        name: 'Улитка',
        health: 100,
        canFly: false,
        size: 2,
        texture: '🐌',
        spriteKey: 'snail',
        defaultSize: '64x64',
        detectionRange: 120,
        movement: {
            strategy: 'shell',
            speed: 20,
            rotationSpeed: 0.08,
            shellProtection: 0.5,
            shellDuration: 3000,
            shellCooldown: 5000
        },
        attack: {
            strategy: 'simple',
            damage: 6,
            range: 40,
            cooldown: 4000
        },
        recovery: {
            strategy: 'regeneration',
            regenerationRate: 0.2,       // 1 HP за кадр
            regenerationDelay: 1000,     // 1 сек задержка
            regenerationCap: 1.0,        // 100% эффективность
            regenerationDecay: 0,    // 0.1% затухание за кадр (затухнет за 1000 кадров)
            maxRecovery: 0              // Без ограничений
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    spiderQueen: {
        name: 'Самка паука',
        health: 80,
        canFly: false,
        size: 3,
        texture: '🕷️👑',
        spriteKey: 'spider',
        defaultSize: '128x128',
        detectionRange: 200,
        movement: {
            strategy: 'linear',
            speed: 25,
            rotationSpeed: 0.1
        },
        attack: {
            strategy: 'spawn',
            spawnInterval: 5000,
            spawnCount: 2,
            spawnRange: 100,
            spawnType: 'spider'
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    mole: {
        name: 'Крот',
        health: 35,
        canFly: false,
        size: 2,
        texture: '🐀',
        spriteKey: 'mole',
        defaultSize: '64x64',
        detectionRange: 180,
        movement: {
            strategy: 'randomPoint',
            speed: 40,
            rotationSpeed: 0.12,
            searchRadius: 600,
            minDistance: 50
        },
        stealth: {
            strategy: 'burrow',
            undergroundAlpha: 0.1,
            surfaceAlpha: 1.0,
            surfaceMinDuration: 2000,
            surfaceMaxDuration: 8000
        },
        attack: {
            strategy: 'spawn',
            spawnType: 'projectile',
            spawnDirection: 'target',
            spawnInterval: 3000,
            spawnCount: 1,
            spawnRange: 10,
            conditionalSpawn: true
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    mosquito: {
        name: 'Комар',
        health: 8,
        canFly: true,
        size: 2,
        texture: '🦟',
        spriteKey: 'mosquito',
        defaultSize: '64x64',
        detectionRange: 120,
        movement: {
            strategy: 'flying',
            speed: 40,
            rotationSpeed: 0.1,
            amplitude: 45,
            oscillationSpeed: 0.2,
            targetAttraction: 0.9,
            attackRange: 20
        },
        attack: {
            strategy: 'simple',
            damage: 2,
            range: 20,
            cooldown: 1500
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: true
        }
    },
    flea: {
        name: 'Блоха',
        health: 12,
        canFly: false,
        size: 1,
        texture: '🦗',
        spriteKey: 'flea',
        defaultSize: '32x32',
        detectionRange: 100,
        movement: {
            strategy: 'jumping',
            speed: 200,                   // Скорость прыжка
            rotationSpeed: 0.2,           // Скорость поворота спрайта
            jumpDuration: 1000,           // Длительность прыжка в миллисекундах
            restDuration: 500,            // Длительность отдыха между прыжками в миллисекундах
            jumpHeight: 30,               // Высота прыжка в пикселях
            jumpArc: 0.6,                 // Кривизна траектории прыжка (0-1)
            mass: 0.5,                    // Масса для физики
            bounce: 0.3,                  // Отскок от поверхностей
            drag: 0.1                     // Сопротивление воздуха
        },
        attack: {
            strategy: 'simple',
            damage: 3,
            range: 25,
            cooldown: 1000
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    fly: {
        name: 'Муха',
        health: 5,
        canFly: true,
        size: 1,
        texture: '🪰',
        spriteKey: 'fly',
        defaultSize: '64x64',
        detectionRange: 150,
        movement: {         
            strategy: 'jittery',
            speed: 80,                     // Базовая скорость движения
            rotationSpeed: 0.15,          // Скорость поворота спрайта
            jitterIntensity: 100,          // Максимальное отклонение в пикселях
            jitterFrequency: 0.2,         // Частота смены направления (0-1)
            jitterSmoothness: 0.08        // Плавность перехода (0=резкий, 1=плавный)
        },
        attack: {
            strategy: 'simple',
            damage: 1,
            range: 30,
            cooldown: 2000
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: true
        }
    },
    projectile: {
        name: 'Снаряд',
        health: 1,
        canFly: false,
        size: 1,
        texture: '💣',
        spriteKey: 'bomb',
        defaultSize: '64x64',
        detectionRange: 300,
        movement: {
            strategy: 'linear',
            speed: 150,
            rotationSpeed: 0.2
        },
        attack: {
            strategy: 'singleUse',
            damage: 10,
            range: 50,
            explosionRadius: 80,
            explosionDamage: 30
        },
        collision: {
            enabled: true,
            layers: ['ENEMIES', 'OBSTACLES']
        },
        pathfinding: {
            algorithm: 'astar',
            allowDiagonal: true,
            ignoreGroundObstacles: false
        }
    },
    
    // Бабочка - порхающий полет с синусоидальными колебаниям
};
