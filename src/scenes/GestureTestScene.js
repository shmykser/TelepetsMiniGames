import Phaser from 'phaser';
import { Enemy } from '../core/objects/Enemy';
/**
 * Сцена для тестирования жестов с врагами
 */
export class GestureTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GestureTestScene' });
        Object.defineProperty(this, "enemies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    create() {
        const { width, height } = this.scale;
        // Создаем фон
        this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
        // Создаем врагов
        this.createEnemies();
        // Добавляем заголовок
        this.add.text(width / 2, 50, 'Тестирование жестов с врагами', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        // Добавляем инструкции
        this.add.text(width / 2, height - 50, 'Тапните по врагам для тестирования жестов', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }
    createEnemies() {
        const { width, height } = this.scale;
        // Создаем несколько врагов разных типов
        const enemyConfigs = [
            { x: 200, y: 200, type: 'ant' },
            { x: width - 200, y: 200, type: 'beetle' },
            { x: 200, y: height - 200, type: 'rhinoceros' },
            { x: width - 200, y: height - 200, type: 'mosquito' },
            { x: width / 2, y: 150, type: 'spider' },
            { x: width / 2, y: height - 150, type: 'fly' }
        ];
        enemyConfigs.forEach(config => {
            const enemy = new Enemy(this, {
                x: config.x,
                y: config.y,
                texture: 'enemy',
                enemyType: config.type,
                health: 50,
                damage: 10,
                speed: 100,
                cooldown: 1000
            });
            this.enemies.push(enemy);
        });
    }
    update() {
        // Обновляем состояние врагов
        this.enemies.forEach(enemy => {
            if (enemy && !enemy.isAlive) {
                // Удаляем мертвых врагов
                const index = this.enemies.indexOf(enemy);
                if (index > -1) {
                    this.enemies.splice(index, 1);
                }
            }
        });
    }
}
