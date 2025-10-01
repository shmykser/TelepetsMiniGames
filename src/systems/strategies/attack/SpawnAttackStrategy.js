import { GeometryUtils } from '../../../utils/GeometryUtils.js';

/**
 * Стратегия атаки через спавн врагов
 * Используется самкой паука и другими спавнерами
 */
export class SpawnAttackStrategy {
    constructor(gameObject, config) {
        this.gameObject = gameObject;
        this.config = config;
        this.lastSpawnTime = 0;
        this.spawnedCount = 0;
        this.maxSpawned = 10; // Максимальное количество спавненных врагов
    }

    /**
     * Обновление стратегии
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    update(time, delta) {
        if (this.gameObject.enemyType === 'wasp') {
            console.log(`🐝 [SpawnAttackStrategy] ОСА: Update в ${time}`);
        }
        // Проверяем, можем ли спавнить
        if (this.canSpawn(time)) {
            if (this.gameObject.enemyType === 'wasp') {
                console.log(`🐝 [SpawnAttackStrategy] ОСА: Выполняем спавн в ${time}`);
            }
            this.performSpawn(time);
        }
    }

    /**
     * Проверка, можем ли спавнить
     * @param {number} time - Текущее время
     * @returns {boolean}
     */
    canSpawn(time) {
        const spawnInterval = this.config.get('spawnInterval', 5000);
        const timeSinceLastSpawn = time - this.lastSpawnTime;
        const basicCondition = timeSinceLastSpawn > spawnInterval && this.spawnedCount < this.maxSpawned;
        
        // Проверяем дополнительные условия (для крота)
        let conditionalCheck = true;
        if (this.conditionCallback) {
            conditionalCheck = this.conditionCallback();
        }
        
        const canSpawnNow = basicCondition && conditionalCheck;
        
        if (this.gameObject.enemyType === 'wasp') {
            console.log(`🐝 [SpawnAttackStrategy] ОСА: Проверка спавна - время: ${timeSinceLastSpawn}/${spawnInterval}, спавнено: ${this.spawnedCount}/${this.maxSpawned}, условие: ${conditionalCheck}, можно: ${canSpawnNow}`);
        } else if (this.gameObject.enemyType === 'mole') {
            console.log(`🐀 [SpawnAttackStrategy] КРОТ: Проверка спавна - время: ${timeSinceLastSpawn}/${spawnInterval}, спавнено: ${this.spawnedCount}/${this.maxSpawned}, условие: ${conditionalCheck}, можно: ${canSpawnNow}`);
        }
        
        return canSpawnNow;
    }

    /**
     * Выполнение спавна
     * @param {number} time - Текущее время
     */
    performSpawn(time) {
        const minSpawnCount = this.config.get('minSpawnCount', 1);
        const maxSpawnCount = this.config.get('maxSpawnCount', 5);
        const spawnCount = Math.floor(Math.random() * (maxSpawnCount - minSpawnCount + 1)) + minSpawnCount;
        const spawnRange = this.config.get('spawnRange', 100);
        const spawnType = this.config.get('spawnType', 'spider');
        const spawnDirection = this.config.get('spawnDirection', 'circle');
        
        if (this.gameObject.enemyType === 'wasp') {
            console.log(`🐝 [SpawnAttackStrategy] ОСА: Параметры спавна - count: ${spawnCount} (${minSpawnCount}-${maxSpawnCount}), range: ${spawnRange}, type: ${spawnType}, direction: ${spawnDirection}`);
        }

        for (let i = 0; i < spawnCount; i++) {
            let spawnX, spawnY;
            
            if (spawnDirection === 'target' && this.gameObject.aiCoordinator && this.gameObject.aiCoordinator.currentTarget) {
                // Спавн в направлении цели
                const target = this.gameObject.aiCoordinator.currentTarget;
                const angleToTarget = Math.atan2(target.y - this.gameObject.y, target.x - this.gameObject.x);
                
                spawnX = this.gameObject.x + Math.cos(angleToTarget) * spawnRange;
                spawnY = this.gameObject.y + Math.sin(angleToTarget) * spawnRange;
                
                if (this.gameObject.enemyType === 'wasp') {
                    console.log(`🐝 [SpawnAttackStrategy] ОСА: Спавн ${spawnType} в направлении цели: угол ${(angleToTarget * 180 / Math.PI).toFixed(1)}°`);
                }
            } else {
                // Круговой спавн (по умолчанию)
                const angle = (Math.PI * 2 * i) / spawnCount;
                const distance = Math.random() * spawnRange;
                
                spawnX = this.gameObject.x + Math.cos(angle) * distance;
                spawnY = this.gameObject.y + Math.sin(angle) * distance;
            }
            
            // Эмитим событие спавна
            if (this.gameObject.scene && this.gameObject.scene.events) {
                if (this.gameObject.enemyType === 'wasp') {
                    console.log(`🐝 [SpawnAttackStrategy] ОСА: Эмитим событие спавна ${spawnType} в (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)})`);
                }
                this.gameObject.scene.events.emit('enemy:spawn', {
                    enemyType: spawnType,
                    x: spawnX,
                    y: spawnY,
                    parent: this.gameObject,
                    target: this.gameObject.aiCoordinator?.currentTarget // Передаем цель для снарядов
                });
            } else {
                if (this.gameObject.enemyType === 'wasp') {
                    console.log(`🐝 [SpawnAttackStrategy] ОСА: ОШИБКА - нет сцены или событий для спавна!`);
                }
            }
        }

        this.lastSpawnTime = time;
        this.spawnedCount += spawnCount;
        
        // Для крота: отмечаем, что спавн на поверхности выполнен
        if (this.gameObject.enemyType === 'mole') {
            this.hasSpawnedOnSurface = true;
        }
        
        if (this.gameObject.enemyType === 'wasp') {
            console.log(`🐝 [SpawnAttackStrategy] ОСА: Спавн ${spawnCount} ${spawnType} завершен (всего: ${this.spawnedCount})`);
        } else if (this.gameObject.enemyType === 'mole') {
            console.log(`🐀 [SpawnAttackStrategy] КРОТ: Спавн ${spawnCount} ${spawnType} завершен (всего: ${this.spawnedCount})`);
        }
    }

    /**
     * Проверка, в радиусе ли цель
     * @param {Object} target - Цель
     * @returns {boolean}
     */
    isInRange(target) {
        if (!target) return false;
        
        // Радиус атаки берем ТОЛЬКО из attack.range
        const attackCfg = this.config.get('attack', {});
        const attackRange = attackCfg.range || 0;
        const distance = GeometryUtils.distance(
            this.gameObject.x, this.gameObject.y,
            target.x, target.y
        );
        
        return distance <= attackRange;
    }

    /**
     * Атака (спавн врагов)
     * @param {Object} target - Цель
     */
    attack(target) {
        // Спавн не требует цели, но может использовать её позицию
        this.performSpawn(this.gameObject.scene.time.now);
    }

    /**
     * Установка функции проверки условий для условного спавна
     * @param {Function} callback - Функция, возвращающая true если можно спавнить
     */
    setConditionCallback(callback) {
        this.conditionCallback = callback;
        console.log(`🕷️ [SpawnAttackStrategy] Установлен callback для условного спавна`);
    }


    /**
     * Сброс стратегии
     */
    reset() {
        this.lastSpawnTime = 0;
        this.spawnedCount = 0;
        this.hasSpawnedOnSurface = false;
        this.surfaceStartTime = 0;
    }
}
