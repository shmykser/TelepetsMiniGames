/**
 * Генератор открытого мира для Pet Thief
 * Создает процедурно генерируемый мир с биомами, препятствиями и жилищами
 */

import { 
    BIOME_TYPES, 
    WORLD_SIZE, 
    WORLD_GENERATION,
    generateValidPosition,
    generateRandomPosition
} from '../../types/worldTypes.js';

export class WorldGenerator {
    constructor(seed = null) {
        // Seed для воспроизводимости (на основе даты для 24-часового цикла)
        this.seed = seed || WORLD_GENERATION.getSeed();
        
        // Инициализация генератора случайных чисел с seed
        this.rng = this.seedRandom(this.seed);
        
        console.log(`🗺️ [WorldGenerator] Генерация мира с seed: ${this.seed}`);
    }
    
    /**
     * Простой генератор случайных чисел с seed (для воспроизводимости)
     * @param {string} seed 
     * @returns {Function}
     */
    seedRandom(seed) {
        // Простой хеш seed в число
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Linear Congruential Generator
        let current = Math.abs(hash);
        return () => {
            current = (current * 1664525 + 1013904223) % 4294967296;
            return current / 4294967296;
        };
    }
    
    /**
     * Генерирует мир
     * @returns {Object} Данные мира
     */
    generate() {
        console.log('🗺️ [WorldGenerator] Начало генерации мира...');
        
        const world = {
            seed: this.seed,
            size: { ...WORLD_SIZE },
            biome: BIOME_TYPES.FOREST, // Пока один биом - лес
            playerHouse: this.generatePlayerHouse(),
            houses: [],
            obstacles: [],
            coins: []
        };
        
        // Генерируем жилища других игроков
        world.houses = this.generateHouses(world.playerHouse.position);
        
        // Генерируем препятствия
        world.obstacles = this.generateObstacles([world.playerHouse.position, ...world.houses.map(h => h.position)]);
        
        // Генерируем монеты
        world.coins = this.generateCoins([world.playerHouse.position, ...world.houses.map(h => h.position)]);
        
        // Генерируем отмычки
        world.lockpicks = this.generateLockpicks([world.playerHouse.position, ...world.houses.map(h => h.position)]);
        
        console.log(`🗺️ [WorldGenerator] Мир сгенерирован:`);
        console.log(`   - Жилищ игроков: ${world.houses.length}`);
        console.log(`   - Препятствий: ${world.obstacles.length}`);
        console.log(`   - Монет: ${world.coins.length}`);
        console.log(`   - Отмычек: ${world.lockpicks.length}`);
        
        return world;
    }
    
    /**
     * Генерирует стартовое жилище игрока (в центре мира)
     * @returns {Object}
     */
    generatePlayerHouse() {
        // Генерируем 1 сундук для хранения украденного
        const playerChest = [{
            id: 'player_chest_0',
            coins: 0,
            jewels: 0,
            keys: 0,
            isLocked: false,
            lockLevel: 0,
            isOpened: false,
            isEmpty: false
        }];
        
        return {
            id: 'player_house',
            ownerId: 'player',
            ownerName: 'Мой дом',
            isPlayerHouse: true,
            position: {
                x: WORLD_SIZE.width / 2,
                y: WORLD_SIZE.height / 2
            },
            type: 'home',
            texture: '🏡',
            chests: playerChest
        };
    }
    
    /**
     * Генерирует жилища других игроков
     * @param {{x: number, y: number}} playerPosition - Позиция игрока
     * @returns {Array}
     */
    generateHouses(playerPosition) {
        const houses = [];
        const houseCount = Math.floor(
            WORLD_GENERATION.HOUSES.MIN + 
            this.rng() * (WORLD_GENERATION.HOUSES.MAX - WORLD_GENERATION.HOUSES.MIN)
        );
        
        console.log(`🏠 [WorldGenerator] Генерация ${houseCount} жилищ...`);
        
        const occupiedPositions = [playerPosition];
        
        for (let i = 0; i < houseCount; i++) {
            // Генерируем валидную позицию
            const position = this.generateValidPositionWithRng(
                occupiedPositions,
                WORLD_GENERATION.MIN_DISTANCE_BETWEEN_HOUSES
            );
            
            if (!position) {
                console.warn(`🏠 [WorldGenerator] Не удалось найти позицию для жилища ${i + 1}`);
                continue;
            }
            
            // Проверяем расстояние от игрока
            const dx = position.x - playerPosition.x;
            const dy = position.y - playerPosition.y;
            const distanceFromPlayer = Math.sqrt(dx * dx + dy * dy);
            
            if (distanceFromPlayer < WORLD_GENERATION.MIN_DISTANCE_FROM_PLAYER) {
                i--; // Пробуем еще раз
                continue;
            }
            
            // Генерируем сундуки для дома
            const chestsCount = 2 + Math.floor(this.rng() * 2); // 2-3 сундука
            const chests = this.generateChestsForHouse(chestsCount);
            
            // Случайная защита: 70% шанс что дом защищен
            const hasSecurity = this.rng() > 0.3; // 70% шанс защиты
            const securityLevel = hasSecurity ? Math.floor(this.rng() * 3) + 1 : 0; // 1-3 уровень или 0
            
            console.log(`🏠 [WorldGenerator] Дом ${i + 1}: ${hasSecurity ? `защищен (уровень ${securityLevel})` : 'не защищен'}`);
            
            houses.push({
                id: `house_${i}`,
                ownerId: `player_${i}`,
                ownerName: `Игрок ${i + 1}`,
                ownerOnline: false,
                position: position,
                type: 'house',
                texture: '🏠',
                security: {
                    lockType: hasSecurity ? 'simple' : null,
                    level: securityLevel,
                    traps: []
                },
                chests: chests, // Массив сундуков с содержимым
                isPlayerHouse: false
            });
            
            occupiedPositions.push(position);
        }
        
        return houses;
    }
    
    /**
     * Генерирует сундуки для дома
     * @param {number} count - Количество сундуков
     * @returns {Array}
     */
    generateChestsForHouse(count) {
        const chests = [];
        
        for (let i = 0; i < count; i++) {
            // Генерируем содержимое сундука
            const coins = 10 + Math.floor(this.rng() * 40); // 10-50 монет
            const jewels = Math.floor(this.rng() * 5); // 0-4 драгоценности
            const keys = this.rng() > 0.7 ? 1 : 0; // 30% шанс ключа
            
            // Генерируем замок
            const isLocked = this.rng() > 0.5; // 50% шанс замка
            const lockLevel = isLocked ? Math.floor(this.rng() * 3) + 1 : 0; // Уровень 1-3
            
            chests.push({
                id: `chest_${i}`,
                coins: coins,
                jewels: jewels,
                keys: keys,
                isLocked: isLocked,
                lockLevel: lockLevel,
                isOpened: false, // Флаг открытия сундука
                isEmpty: false // Флаг опустошения
            });
        }
        
        return chests;
    }
    
    /**
     * Генерирует препятствия
     * @param {Array<{x: number, y: number}>} occupiedPositions - Занятые позиции
     * @returns {Array}
     */
    generateObstacles(occupiedPositions) {
        const obstacles = [];
        const obstacleCount = Math.floor(
            WORLD_GENERATION.OBSTACLES.MIN +
            this.rng() * (WORLD_GENERATION.OBSTACLES.MAX - WORLD_GENERATION.OBSTACLES.MIN)
        );
        
        console.log(`🪨 [WorldGenerator] Генерация ${obstacleCount} препятствий...`);
        
        // Типы препятствий для леса
        const forestObstacles = ['tree', 'bush', 'stone'];
        
        for (let i = 0; i < obstacleCount; i++) {
            // Генерируем позицию с минимальным расстоянием от важных объектов
            const position = this.generateValidPositionWithRng(
                occupiedPositions,
                100 // Минимальное расстояние от домов
            );
            
            if (!position) {
                continue;
            }
            
            // Выбираем случайный тип препятствия
            const obstacleType = forestObstacles[Math.floor(this.rng() * forestObstacles.length)];
            
            obstacles.push({
                id: `obstacle_${i}`,
                type: obstacleType,
                position: position,
                collision: true
            });
        }
        
        return obstacles;
    }
    
    /**
     * Генерирует монеты
     * @param {Array<{x: number, y: number}>} occupiedPositions - Занятые позиции
     * @returns {Array}
     */
    generateCoins(occupiedPositions) {
        const coins = [];
        const coinCount = Math.floor(
            WORLD_GENERATION.COINS.MIN +
            this.rng() * (WORLD_GENERATION.COINS.MAX - WORLD_GENERATION.COINS.MIN)
        );
        
        console.log(`💰 [WorldGenerator] Генерация ${coinCount} монет...`);
        
        for (let i = 0; i < coinCount; i++) {
            // Генерируем позицию с минимальным расстоянием от важных объектов
            const position = this.generateValidPositionWithRng(
                occupiedPositions,
                50 // Минимальное расстояние от домов
            );
            
            if (!position) {
                continue;
            }
            
            coins.push({
                id: `coin_${i}`,
                type: 'coin',
                position: position,
                value: 1
            });
        }
        
        return coins;
    }
    
    /**
     * Генерирует отмычки на карте
     * @param {Array<{x: number, y: number}>} occupiedPositions - Занятые позиции
     * @returns {Array}
     */
    generateLockpicks(occupiedPositions) {
        const lockpicks = [];
        const lockpickCount = 3 + Math.floor(this.rng() * 4); // 3-6 отмычек
        
        console.log(`🔧 [WorldGenerator] Генерация ${lockpickCount} отмычек...`);
        
        for (let i = 0; i < lockpickCount; i++) {
            // Генерируем позицию с минимальным расстоянием от важных объектов
            const position = this.generateValidPositionWithRng(
                occupiedPositions,
                50 // Минимальное расстояние от домов
            );
            
            if (!position) {
                continue;
            }
            
            lockpicks.push({
                id: `lockpick_${i}`,
                type: 'lockpick',
                position: position,
                collected: false
            });
        }
        
        return lockpicks;
    }
    
    /**
     * Генерирует валидную позицию с использованием rng
     * @param {Array<{x: number, y: number}>} existingPositions 
     * @param {number} minDistance 
     * @param {number} maxAttempts 
     * @returns {{x: number, y: number}|null}
     */
    generateValidPositionWithRng(existingPositions, minDistance, maxAttempts = 100) {
        const margin = 100;
        
        for (let i = 0; i < maxAttempts; i++) {
            const pos = {
                x: margin + this.rng() * (WORLD_SIZE.width - margin * 2),
                y: margin + this.rng() * (WORLD_SIZE.height - margin * 2)
            };
            
            // Проверяем расстояние от существующих позиций
            let valid = true;
            for (const existingPos of existingPositions) {
                const dx = pos.x - existingPos.x;
                const dy = pos.y - existingPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDistance) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                return pos;
            }
        }
        
        return null;
    }
}

