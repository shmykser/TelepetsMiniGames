import { Enemy } from './objects/Enemy';
/**
 * Спавнер врагов для создания всех врагов на сцене
 */
export class EnemySpawner {
    /**
     * Создает всех врагов на сцене
     */
    static createAllEnemies(scene) {
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
