import { Enemy } from './objects/Enemy';

/**
 * Спавнер врагов (упрощенная версия для совместимости)
 * Основная логика теперь в WaveManager
 */
export class EnemySpawner {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        
        console.log('⚠️ EnemySpawner устарел. Используйте WaveManager для новой системы волн.');
    }

    /**
     * Получает список врагов (для совместимости)
     */
    getEnemies() {
        return this.enemies;
    }

    /**
     * Обновляет состояние (для совместимости)
     */
    update() {
        // Очищаем мертвых врагов
        this.enemies = this.enemies.filter(enemy => enemy && enemy.isAlive);
    }

    /**
     * Статический метод для обратной совместимости
     * @deprecated Используйте new EnemySpawner(scene).startFirstWave()
     */
    static createAllEnemies(scene) {
        console.warn('EnemySpawner.createAllEnemies() устарел. Используйте new EnemySpawner(scene).startFirstWave()');
        const { width, height } = scene.scale;
        const enemies = [];
        // Конфигурация врагов
        const enemyConfigs = [
            { x: 150, y: 200, type: 'ant' },
            { x: width - 150, y: 200, type: 'beetle' },
            { x: 150, y: height - 200, type: 'rhinoceros' },
            { x: width - 150, y: height - 200, type: 'mosquito' },
            { x: width / 2 - 100, y: 150, type: 'spider' },
            { x: width / 2 + 100, y: height - 150, type: 'fly' }
        ];
        // Создаем врагов
        enemyConfigs.forEach(config => {
            const enemy = Enemy.CreateEnemy(scene, config.type, config.x, config.y);
            enemies.push(enemy);
        });
        return enemies;
    }
}
