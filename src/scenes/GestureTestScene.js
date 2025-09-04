import Phaser from 'phaser';
import { Enemy } from '@/core/objects/Enemy';
import { Defence } from '@/core/objects/Defence';
import { Egg } from '@/core/objects/Egg';
import { GestureManager } from '@/systems/gesture/GestureManager';
export class GestureTestScene extends Phaser.Scene {
    constructor() {
        super('GestureTest');
        Object.defineProperty(this, "enemies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "defences", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "egg", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gestureManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gestureLabel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "objectsLabel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    create() {
        // Создаем текстуры
        this.createTextures();
        // Создаем яйцо в центре
        this.createEgg();
        // Создаем врагов
        this.createEnemies();
        // Создаем защитные объекты
        this.createDefences();
        // Создаем лейблы для отображения жестов
        this.createLabels();
        // Инициализируем GestureManager
        this.setupGestures();
        // Запускаем UI
        this.scene.run('UI');
    }
    createTextures() {
        // Текстура яйца
        const eggGraphics = this.add.graphics({ x: 0, y: 0 });
        eggGraphics.fillStyle(0xfbbf24, 1);
        eggGraphics.fillEllipse(12, 16, 24, 32);
        eggGraphics.generateTexture('egg', 24, 32);
        eggGraphics.destroy();
        // Текстура врага
        const enemyGraphics = this.add.graphics({ x: 0, y: 0 });
        enemyGraphics.fillStyle(0xef4444, 1);
        enemyGraphics.fillCircle(12, 12, 12);
        enemyGraphics.generateTexture('enemy', 24, 24);
        enemyGraphics.destroy();
        // Текстура защиты
        const defenceGraphics = this.add.graphics({ x: 0, y: 0 });
        defenceGraphics.fillStyle(0x6b7280, 1);
        defenceGraphics.fillRect(0, 0, 32, 32);
        defenceGraphics.generateTexture('defence', 32, 32);
        defenceGraphics.destroy();
    }
    createEgg() {
        const { width, height } = this.scale;
        this.egg = new Egg(this, {
            health: 100,
            damage: 0,
            speed: 0,
            cooldown: 0,
            x: width / 2,
            y: height / 2,
            texture: 'egg'
        });
    }
    createEnemies() {
        const { width } = this.scale;
        // Создаем врагов разных типов
        const enemyConfigs = [
            {
                health: 10,
                damage: 5,
                speed: 0, // Без движения для тестирования
                cooldown: 5000,
                x: width - 100,
                y: 100,
                texture: 'enemy',
                attackRange: 40,
                enemyType: 'ant'
            },
            {
                health: 30,
                damage: 10,
                speed: 0,
                cooldown: 5000,
                x: width - 150,
                y: 200,
                texture: 'enemy',
                attackRange: 40,
                enemyType: 'beetle'
            },
            {
                health: 60,
                damage: 20,
                speed: 0,
                cooldown: 10000,
                x: width - 200,
                y: 300,
                texture: 'enemy',
                attackRange: 50,
                enemyType: 'rhinoceros'
            },
            {
                health: 10,
                damage: 2,
                speed: 0,
                cooldown: 5000,
                x: width - 100,
                y: 400,
                texture: 'enemy',
                attackRange: 30,
                enemyType: 'mosquito'
            }
        ];
        enemyConfigs.forEach(config => {
            const enemy = new Enemy(this, config);
            this.enemies.push(enemy);
        });
    }
    createDefences() {
        // Создаем защитные объекты разных типов
        const defenceConfigs = [
            {
                health: 30,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 100,
                y: 100,
                texture: 'defence',
                defenceType: 'sugar',
                protectionRadius: 50
            },
            {
                health: 150,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 150,
                y: 200,
                texture: 'defence',
                defenceType: 'stone',
                protectionRadius: 30
            },
            {
                health: -1,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 200,
                y: 300,
                texture: 'defence',
                defenceType: 'crack',
                protectionRadius: 40
            },
            {
                health: -1,
                damage: 100,
                speed: 0,
                cooldown: 5000,
                x: 100,
                y: 400,
                texture: 'defence',
                defenceType: 'spikes',
                protectionRadius: 20
            },
            {
                health: 50,
                damage: 3,
                speed: 0,
                cooldown: 0,
                x: 250,
                y: 150,
                texture: 'defence',
                defenceType: 'madCucumber',
                protectionRadius: 30
            },
            {
                health: -1,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 200,
                y: 450,
                texture: 'defence',
                defenceType: 'pit',
                protectionRadius: 25
            }
        ];
        defenceConfigs.forEach(config => {
            const defence = new Defence(this, config);
            this.defences.push(defence);
        });
    }
    createLabels() {
        const { width } = this.scale;
        // Лейбл для жеста
        this.gestureLabel = this.add.text(width / 2, 50, 'Жест: -', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        // Лейбл для объекта
        this.objectsLabel = this.add.text(width / 2, 80, 'Объект: -', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }
    setupGestures() {
        this.gestureManager = new GestureManager(this, {
            onTap: this.handleTap.bind(this),
            onDoubleTap: this.handleDoubleTap.bind(this),
            onPan: this.handlePan.bind(this),
            onSwipe: this.handleSwipe.bind(this),
            onPinch: this.handlePinch.bind(this),
            onRotate: this.handleRotate.bind(this),
            onPress: this.handlePress.bind(this)
        });
    }
    handleTap(e) {
        const object = this.getObjectAtPosition(e.phaserX, e.phaserY);
        this.updateLabels('Тап', object);
        console.log('Tap at:', e.phaserX, e.phaserY, 'on:', object);
    }
    handleDoubleTap(e) {
        const object = this.getObjectAtPosition(e.phaserX, e.phaserY);
        this.updateLabels('Двойной тап', object);
        console.log('Double Tap at:', e.phaserX, e.phaserY, 'on:', object);
    }
    handlePan(e) {
        const object = this.getObjectAtPosition(e.phaserX, e.phaserY);
        this.updateLabels('Удержание', object);
        console.log('Pan at:', e.phaserX, e.phaserY, 'on:', object, 'deltaX:', e.deltaX, 'deltaY:', e.deltaY);
    }
    handleSwipe(e) {
        const object = this.getObjectAtPosition(e.phaserX, e.phaserY);
        const direction = this.getSwipeDirection(e.direction);
        this.updateLabels(`Свайп ${direction}`, object);
        console.log('Swipe', direction, 'at:', e.phaserX, e.phaserY, 'on:', object, 'velocity:', e.velocity);
    }
    handlePinch(e) {
        const object = this.getObjectAtPosition(e.phaserX, e.phaserY);
        this.updateLabels('Щипок', object);
        console.log('Pinch at:', e.phaserX, e.phaserY, 'on:', object, 'scale:', e.scale);
    }
    handleRotate(e) {
        const object = this.getObjectAtPosition(e.phaserX, e.phaserY);
        this.updateLabels('Вращение', object);
        console.log('Rotate at:', e.phaserX, e.phaserY, 'on:', object, 'rotation:', e.rotation);
    }
    handlePress(e) {
        const object = this.getObjectAtPosition(e.phaserX, e.phaserY);
        this.updateLabels('Долгое нажатие', object);
        console.log('Press at:', e.phaserX, e.phaserY, 'on:', object);
    }
    getObjectAtPosition(x, y) {
        // Проверяем яйцо
        if (this.egg && this.egg.isAlive) {
            const distance = Phaser.Math.Distance.Between(x, y, this.egg.x, this.egg.y);
            if (distance <= 20) {
                return 'Яйцо';
            }
        }
        // Проверяем врагов
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (enemy && enemy.isAlive) {
                const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (distance <= 15) {
                    return enemy.enemyData.name;
                }
            }
        }
        // Проверяем защитные объекты
        for (let i = 0; i < this.defences.length; i++) {
            const defence = this.defences[i];
            if (defence && defence.isAlive) {
                const distance = Phaser.Math.Distance.Between(x, y, defence.x, defence.y);
                if (distance <= 20) {
                    return defence.defenceData.name;
                }
            }
        }
        return 'Поле';
    }
    getSwipeDirection(direction) {
        // Используем правильные константы Hammer.js
        switch (direction) {
            case 2: return '←'; // Hammer.DIRECTION_LEFT
            case 4: return '→'; // Hammer.DIRECTION_RIGHT  
            case 8: return '↑'; // Hammer.DIRECTION_UP
            case 16: return '↓'; // Hammer.DIRECTION_DOWN
            default: return '?';
        }
    }
    updateLabels(gesture, object) {
        this.gestureLabel.setText(`Жест: ${gesture}`);
        this.objectsLabel.setText(`Объект: ${object}`);
    }
    update() {
        // Обновляем все объекты (пока без движения)
        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.update(this.time.now, this.game.loop.delta);
            }
        });
        this.defences.forEach(defence => {
            if (defence.isAlive) {
                defence.update(this.time.now, this.game.loop.delta);
            }
        });
        if (this.egg.isAlive) {
            this.egg.update(this.time.now, this.game.loop.delta);
        }
    }
    destroy() {
        if (this.gestureManager) {
            this.gestureManager.destroy();
        }
    }
}
