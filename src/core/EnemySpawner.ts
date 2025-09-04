import Phaser from 'phaser';
import { Enemy } from './objects/Enemy';

/**
 * Спавнер врагов для создания всех врагов на сцене
 */
export class EnemySpawner {
  /**
   * Создает всех врагов на сцене
   */
  static createAllEnemies(scene: Phaser.Scene): Enemy[] {
    const { width, height } = scene.scale;
    const enemies: Enemy[] = [];
    
    // Конфигурация врагов
    const enemyConfigs = [
      { x: 150, y: 200, type: 'ant' as const },
      { x: width - 150, y: 200, type: 'beetle' as const },
      { x: 150, y: height - 200, type: 'rhinoceros' as const },
      { x: width - 150, y: height - 200, type: 'mosquito' as const },
      { x: width / 2 - 100, y: 150, type: 'spider' as const },
      { x: width / 2 + 100, y: height - 150, type: 'fly' as const }
    ];

    // Создаем врагов
    enemyConfigs.forEach(config => {
      const enemy = Enemy.CreateEnemy(scene, config.type, config.x, config.y);
      enemies.push(enemy);
    });

    return enemies;
  }
}
