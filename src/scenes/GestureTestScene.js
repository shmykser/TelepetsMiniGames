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
        // Создаем простые геометрические текстуры для врагов
        this.createTextures();
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
    createTextures() {
        // Создаем детализированные текстуры для каждого типа врага
        this.createAntTexture();
        this.createBeetleTexture();
        this.createRhinocerosTexture();
        this.createMosquitoTexture();
        this.createSpiderTexture();
        this.createFlyTexture();
        // Создаем анимированные версии для движения
        this.createAnimatedTextures();
    }
    createAnimatedTextures() {
        // Создаем анимированные текстуры для движения лапок
        this.createAntWalkAnimation();
        this.createBeetleWalkAnimation();
        this.createSpiderWalkAnimation();
        this.createFlyHoverAnimation();
    }
    createAntWalkAnimation() {
        // Создаем 4 кадра анимации ходьбы муравья
        for (let frame = 0; frame < 4; frame++) {
            const graphics = this.add.graphics();
            // Тело муравья (3 сегмента) - увеличиваем в 5 раз
            graphics.fillStyle(0x8B4513);
            // Голова
            graphics.fillCircle(40, 40, 30); // 8*5, 8*5, 6*5
            // Средний сегмент
            graphics.fillEllipse(80, 40, 40, 30); // 16*5, 8*5, 8*5, 6*5
            // Задний сегмент
            graphics.fillEllipse(110, 40, 30, 25); // 22*5, 8*5, 6*5, 5*5
            // Анимированные лапки
            graphics.lineStyle(10, 0x654321); // 2*5
            const legOffset = Math.sin(frame * Math.PI / 2) * 10; // Анимация движения лапок * 5
            // Передние лапки
            graphics.lineBetween(30, 30, 20 + legOffset, 50); // 6*5, 6*5, 4*5+offset, 10*5
            graphics.lineBetween(50, 30, 60 - legOffset, 50); // 10*5, 6*5, 12*5-offset, 10*5
            // Средние лапки
            graphics.lineBetween(70, 30, 60 + legOffset, 60); // 14*5, 6*5, 12*5+offset, 12*5
            graphics.lineBetween(90, 30, 100 - legOffset, 60); // 18*5, 6*5, 20*5-offset, 12*5
            // Задние лапки
            graphics.lineBetween(100, 30, 90 - legOffset, 60); // 20*5, 6*5, 18*5-offset, 12*5
            graphics.lineBetween(120, 30, 130 + legOffset, 60); // 24*5, 6*5, 26*5+offset, 12*5
            // Антенны
            graphics.lineStyle(5, 0x654321); // 1*5
            graphics.lineBetween(30, 20, 20, 10); // 6*5, 4*5, 4*5, 2*5
            graphics.lineBetween(50, 20, 60, 10); // 10*5, 4*5, 12*5, 2*5
            graphics.generateTexture(`ant_walk_${frame}`, 80, 40); // Уменьшаем в 2 раза
            graphics.destroy();
        }
    }
    createBeetleWalkAnimation() {
        for (let frame = 0; frame < 4; frame++) {
            const graphics = this.add.graphics();
            // Тело жука
            graphics.fillStyle(0x2F4F4F);
            graphics.fillEllipse(16, 12, 20, 12);
            // Надкрылья
            graphics.fillStyle(0x1C3A3A);
            graphics.fillEllipse(14, 8, 8, 8);
            graphics.fillEllipse(18, 8, 8, 8);
            // Анимированные лапки
            graphics.lineStyle(2, 0x1C3A3A);
            const legOffset = Math.sin(frame * Math.PI / 2) * 1.5;
            graphics.lineBetween(8, 10, 6 + legOffset, 14);
            graphics.lineBetween(12, 10, 10 - legOffset, 16);
            graphics.lineBetween(20, 10, 22 + legOffset, 16);
            graphics.lineBetween(24, 10, 26 - legOffset, 14);
            graphics.generateTexture(`beetle_walk_${frame}`, 80, 50); // Уменьшаем в 2 раза
            graphics.destroy();
        }
    }
    createSpiderWalkAnimation() {
        for (let frame = 0; frame < 4; frame++) {
            const graphics = this.add.graphics();
            // Тело паука
            graphics.fillStyle(0x000000);
            graphics.fillCircle(16, 12, 8);
            // Голова
            graphics.fillCircle(16, 6, 4);
            // Анимированные лапки
            graphics.lineStyle(2, 0x000000);
            const legOffset = Math.sin(frame * Math.PI / 2) * 2;
            // Передние лапки
            graphics.lineBetween(12, 8, 8 + legOffset, 4);
            graphics.lineBetween(20, 8, 24 - legOffset, 4);
            // Вторые лапки
            graphics.lineBetween(10, 10, 6 + legOffset, 6);
            graphics.lineBetween(22, 10, 26 - legOffset, 6);
            // Третьи лапки
            graphics.lineBetween(10, 14, 6 - legOffset, 18);
            graphics.lineBetween(22, 14, 26 + legOffset, 18);
            // Задние лапки
            graphics.lineBetween(12, 16, 8 - legOffset, 20);
            graphics.lineBetween(20, 16, 24 + legOffset, 20);
            graphics.generateTexture(`spider_walk_${frame}`, 80, 60); // Уменьшаем в 2 раза
            graphics.destroy();
        }
    }
    createFlyHoverAnimation() {
        for (let frame = 0; frame < 4; frame++) {
            const graphics = this.add.graphics();
            // Тело мухи
            graphics.fillStyle(0x808080);
            graphics.fillEllipse(16, 8, 6, 10);
            // Анимированные крылья
            graphics.fillStyle(0xA0A0A0, 0.6);
            const wingOffset = Math.sin(frame * Math.PI / 2) * 0.5;
            graphics.fillEllipse(12, 6 + wingOffset, 8, 6);
            graphics.fillEllipse(20, 6 - wingOffset, 8, 6);
            // Глаза
            graphics.fillStyle(0xFF0000);
            graphics.fillCircle(14, 4, 2);
            graphics.fillCircle(18, 4, 2);
            // Лапки
            graphics.lineStyle(1, 0x808080);
            graphics.lineBetween(13, 10, 11, 14);
            graphics.lineBetween(19, 10, 21, 14);
            graphics.lineBetween(14, 12, 12, 16);
            graphics.lineBetween(18, 12, 20, 16);
            graphics.generateTexture(`fly_hover_${frame}`, 80, 45); // Уменьшаем в 2 раза
            graphics.destroy();
        }
    }
    createAntTexture() {
        const graphics = this.add.graphics();
        // Тело муравья (3 сегмента) - увеличиваем все размеры в 5 раз
        graphics.fillStyle(0x8B4513); // Коричневый
        // Голова
        graphics.fillCircle(40, 40, 30); // 8*5, 8*5, 6*5
        // Средний сегмент
        graphics.fillEllipse(80, 40, 40, 30); // 16*5, 8*5, 8*5, 6*5
        // Задний сегмент
        graphics.fillEllipse(110, 40, 30, 25); // 22*5, 8*5, 6*5, 5*5
        // Лапки (6 штук) - увеличиваем толщину линии
        graphics.lineStyle(10, 0x654321); // 2*5
        // Передние лапки
        graphics.lineBetween(30, 30, 20, 50); // 6*5, 6*5, 4*5, 10*5
        graphics.lineBetween(50, 30, 60, 50); // 10*5, 6*5, 12*5, 10*5
        // Средние лапки
        graphics.lineBetween(70, 30, 60, 60); // 14*5, 6*5, 12*5, 12*5
        graphics.lineBetween(90, 30, 100, 60); // 18*5, 6*5, 20*5, 12*5
        // Задние лапки
        graphics.lineBetween(100, 30, 90, 60); // 20*5, 6*5, 18*5, 12*5
        graphics.lineBetween(120, 30, 130, 60); // 24*5, 6*5, 26*5, 12*5
        // Антенны
        graphics.lineStyle(5, 0x654321); // 1*5
        graphics.lineBetween(30, 20, 20, 10); // 6*5, 4*5, 4*5, 2*5
        graphics.lineBetween(50, 20, 60, 10); // 10*5, 4*5, 12*5, 2*5
        graphics.generateTexture('ant', 80, 40); // Уменьшаем в 2 раза
        graphics.destroy();
    }
    createBeetleTexture() {
        const graphics = this.add.graphics();
        // Тело жука - увеличиваем в 5 раз
        graphics.fillStyle(0x2F4F4F); // Темно-серый
        graphics.fillEllipse(80, 60, 100, 60); // 16*5, 12*5, 20*5, 12*5
        // Надкрылья
        graphics.fillStyle(0x1C3A3A);
        graphics.fillEllipse(70, 40, 40, 40); // 14*5, 8*5, 8*5, 8*5
        graphics.fillEllipse(90, 40, 40, 40); // 18*5, 8*5, 8*5, 8*5
        // Лапки
        graphics.lineStyle(10, 0x1C3A3A); // 2*5
        graphics.lineBetween(40, 50, 30, 70); // 8*5, 10*5, 6*5, 14*5
        graphics.lineBetween(60, 50, 50, 80); // 12*5, 10*5, 10*5, 16*5
        graphics.lineBetween(100, 50, 110, 80); // 20*5, 10*5, 22*5, 16*5
        graphics.lineBetween(120, 50, 130, 70); // 24*5, 10*5, 26*5, 14*5
        graphics.generateTexture('beetle', 80, 50); // Уменьшаем в 2 раза
        graphics.destroy();
    }
    createRhinocerosTexture() {
        const graphics = this.add.graphics();
        // Тело носорога - увеличиваем в 5 раз
        graphics.fillStyle(0x4A4A4A); // Серый
        graphics.fillEllipse(80, 70, 120, 80); // 16*5, 14*5, 24*5, 16*5
        // Рог
        graphics.fillStyle(0x696969);
        graphics.fillTriangle(80, 30, 70, 50, 90, 50); // 16*5, 6*5, 14*5, 10*5, 18*5, 10*5
        // Лапки
        graphics.fillStyle(0x3A3A3A);
        graphics.fillRect(50, 90, 20, 40); // 10*5, 18*5, 4*5, 8*5
        graphics.fillRect(90, 90, 20, 40); // 18*5, 18*5, 4*5, 8*5
        graphics.fillRect(60, 100, 15, 30); // 12*5, 20*5, 3*5, 6*5
        graphics.fillRect(100, 100, 15, 30); // 20*5, 20*5, 3*5, 6*5
        graphics.generateTexture('rhinoceros', 80, 70); // Уменьшаем в 2 раза
        graphics.destroy();
    }
    createMosquitoTexture() {
        const graphics = this.add.graphics();
        // Тело комара - увеличиваем в 5 раз
        graphics.fillStyle(0x696969); // Серый
        graphics.fillEllipse(80, 40, 20, 60); // 16*5, 8*5, 4*5, 12*5
        // Крылья
        graphics.fillStyle(0x808080, 0.7);
        graphics.fillEllipse(60, 30, 30, 20); // 12*5, 6*5, 6*5, 4*5
        graphics.fillEllipse(100, 30, 30, 20); // 20*5, 6*5, 6*5, 4*5
        // Лапки
        graphics.lineStyle(5, 0x696969); // 1*5
        graphics.lineBetween(70, 50, 60, 70); // 14*5, 10*5, 12*5, 14*5
        graphics.lineBetween(90, 50, 100, 70); // 18*5, 10*5, 20*5, 14*5
        graphics.lineBetween(75, 60, 65, 80); // 15*5, 12*5, 13*5, 16*5
        graphics.lineBetween(85, 60, 95, 80); // 17*5, 12*5, 19*5, 16*5
        // Хоботок
        graphics.lineStyle(10, 0x8B4513); // 2*5
        graphics.lineBetween(80, 10, 80, 0); // 16*5, 2*5, 16*5, 0
        graphics.generateTexture('mosquito', 80, 45); // Уменьшаем в 2 раза
        graphics.destroy();
    }
    createSpiderTexture() {
        const graphics = this.add.graphics();
        // Тело паука - увеличиваем в 5 раз
        graphics.fillStyle(0x000000); // Черный
        graphics.fillCircle(80, 60, 40); // 16*5, 12*5, 8*5
        // Голова
        graphics.fillCircle(80, 30, 20); // 16*5, 6*5, 4*5
        // Лапки (8 штук)
        graphics.lineStyle(10, 0x000000); // 2*5
        // Передние лапки
        graphics.lineBetween(60, 40, 40, 20); // 12*5, 8*5, 8*5, 4*5
        graphics.lineBetween(100, 40, 120, 20); // 20*5, 8*5, 24*5, 4*5
        // Вторые лапки
        graphics.lineBetween(50, 50, 30, 30); // 10*5, 10*5, 6*5, 6*5
        graphics.lineBetween(110, 50, 130, 30); // 22*5, 10*5, 26*5, 6*5
        // Третьи лапки
        graphics.lineBetween(50, 70, 30, 90); // 10*5, 14*5, 6*5, 18*5
        graphics.lineBetween(110, 70, 130, 90); // 22*5, 14*5, 26*5, 18*5
        // Задние лапки
        graphics.lineBetween(60, 80, 40, 100); // 12*5, 16*5, 8*5, 20*5
        graphics.lineBetween(100, 80, 120, 100); // 20*5, 16*5, 24*5, 20*5
        graphics.generateTexture('spider', 80, 60); // Уменьшаем в 2 раза
        graphics.destroy();
    }
    createFlyTexture() {
        const graphics = this.add.graphics();
        // Тело мухи - увеличиваем в 5 раз
        graphics.fillStyle(0x808080); // Серый
        graphics.fillEllipse(80, 40, 30, 50); // 16*5, 8*5, 6*5, 10*5
        // Крылья
        graphics.fillStyle(0xA0A0A0, 0.6);
        graphics.fillEllipse(60, 30, 40, 30); // 12*5, 6*5, 8*5, 6*5
        graphics.fillEllipse(100, 30, 40, 30); // 20*5, 6*5, 8*5, 6*5
        // Глаза
        graphics.fillStyle(0xFF0000);
        graphics.fillCircle(70, 20, 10); // 14*5, 4*5, 2*5
        graphics.fillCircle(90, 20, 10); // 18*5, 4*5, 2*5
        // Лапки
        graphics.lineStyle(5, 0x808080); // 1*5
        graphics.lineBetween(65, 50, 55, 70); // 13*5, 10*5, 11*5, 14*5
        graphics.lineBetween(95, 50, 105, 70); // 19*5, 10*5, 21*5, 14*5
        graphics.lineBetween(70, 60, 60, 80); // 14*5, 12*5, 12*5, 16*5
        graphics.lineBetween(90, 60, 100, 80); // 18*5, 12*5, 20*5, 16*5
        graphics.generateTexture('fly', 80, 45); // Уменьшаем в 2 раза
        graphics.destroy();
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
                texture: config.type, // Используем текстуру соответствующую типу врага
                enemyType: config.type,
                health: 50,
                damage: 10,
                speed: 100,
                cooldown: 1000
            });
            // Враги уже увеличены через размеры текстур
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
