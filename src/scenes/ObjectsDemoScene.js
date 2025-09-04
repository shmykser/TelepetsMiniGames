import Phaser from 'phaser';
import { Egg } from '@/core/objects/Egg';
import { Enemy } from '@/core/objects/Enemy';
import { Defence } from '@/core/objects/Defence';
import { GameObject } from '@/core/objects';
export class ObjectsDemoScene extends Phaser.Scene {
    constructor() {
        super('ObjectsDemo');
        Object.defineProperty(this, "player", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eggs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
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
        Object.defineProperty(this, "cursors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    create() {
        // Создаем текстуры
        this.createTextures();
        // Создаем игрока
        this.createPlayer();
        // Создаем яйца
        this.createEggs();
        // Создаем врагов
        this.createEnemies();
        // Создаем защитные сооружения
        this.createDefences();
        // Настраиваем управление
        this.cursors = this.input.keyboard.createCursorKeys();
        // Настраиваем события
        this.setupEvents();
        // Запускаем UI
        this.scene.run('UI');
    }
    createTextures() {
        // Текстура игрока
        const playerGraphics = this.add.graphics({ x: 0, y: 0 });
        playerGraphics.fillStyle(0x22c55e, 1);
        playerGraphics.fillCircle(16, 16, 16);
        playerGraphics.generateTexture('player', 32, 32);
        playerGraphics.destroy();
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
    createPlayer() {
        const { width, height } = this.scale;
        this.player = new GameObject(this, {
            health: 100,
            damage: 25,
            speed: 200,
            cooldown: 500,
            x: width / 2,
            y: height / 2,
            texture: 'player',
            attackRange: 60
        });
        this.player.setTint(0x22c55e);
        // Помечаем как игрока для Enemy
        this.player.isPlayer = true;
    }
    createEggs() {
        // Создаем 3 яйца разных типов
        const eggConfigs = [
            {
                health: 50,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 100,
                y: 100,
                texture: 'egg',
                hatchTime: 8000, // 8 секунд
                hatchType: 'basic'
            },
            {
                health: 50,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 200,
                y: 150,
                texture: 'egg',
                hatchTime: 12000, // 12 секунд
                hatchType: 'special'
            },
            {
                health: 50,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 150,
                y: 200,
                texture: 'egg',
                hatchTime: 6000, // 6 секунд
                hatchType: 'rare'
            }
        ];
        eggConfigs.forEach(config => {
            const egg = new Egg(this, config);
            this.eggs.push(egg);
        });
    }
    createEnemies() {
        const { width } = this.scale;
        // Создаем врагов разных типов
        const enemyConfigs = [
            {
                health: 50,
                damage: 15,
                speed: 100,
                cooldown: 1000,
                x: width - 100,
                y: 100,
                texture: 'enemy',
                attackRange: 40,
                enemyType: 'basic',
                detectionRange: 150
            },
            {
                health: 30,
                damage: 10,
                speed: 180,
                cooldown: 800,
                x: width - 150,
                y: 200,
                texture: 'enemy',
                attackRange: 30,
                enemyType: 'fast',
                detectionRange: 120
            },
            {
                health: 120,
                damage: 25,
                speed: 60,
                cooldown: 1500,
                x: width - 200,
                y: 300,
                texture: 'enemy',
                attackRange: 50,
                enemyType: 'tank',
                detectionRange: 180
            },
            {
                health: 40,
                damage: 20,
                speed: 80,
                cooldown: 1500,
                x: width - 100,
                y: 400,
                texture: 'enemy',
                attackRange: 80,
                enemyType: 'ranged',
                detectionRange: 200,
                attackPattern: 'ranged'
            }
        ];
        enemyConfigs.forEach(config => {
            const enemy = new Enemy(this, config);
            // Помечаем как врага
            enemy.isEnemy = true;
            this.enemies.push(enemy);
        });
    }
    createDefences() {
        const { height } = this.scale;
        // Создаем защитные сооружения разных типов
        const defenceConfigs = [
            {
                health: 300,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 50,
                y: height / 2,
                texture: 'defence',
                defenceType: 'wall',
                protectionRadius: 50,
                maxHealth: 300,
                repairRate: 3
            },
            {
                health: 150,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 100,
                y: height / 2 - 100,
                texture: 'defence',
                defenceType: 'tower',
                protectionRadius: 120,
                maxHealth: 150,
                repairRate: 5
            },
            {
                health: 100,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 100,
                y: height / 2 + 100,
                texture: 'defence',
                defenceType: 'shield',
                protectionRadius: 80,
                maxHealth: 100,
                repairRate: 2
            },
            {
                health: 250,
                damage: 0,
                speed: 0,
                cooldown: 0,
                x: 150,
                y: height / 2,
                texture: 'defence',
                defenceType: 'barrier',
                protectionRadius: 60,
                maxHealth: 250,
                repairRate: 4
            }
        ];
        defenceConfigs.forEach(config => {
            const defence = new Defence(this, config);
            this.defences.push(defence);
        });
    }
    setupEvents() {
        // События игрока
        this.player.on('damage', (damage, health) => {
            console.log(`Игрок получил ${damage} урона. Здоровье: ${health}`);
            this.player.shake(200, 3);
        });
        this.player.on('death', () => {
            console.log('Игрок погиб!');
            this.scene.restart();
        });
        // События яиц
        this.eggs.forEach((egg, index) => {
            egg.on('hatch', (hatchType, x, y) => {
                console.log(`Яйцо ${index} вылупилось! Тип: ${hatchType} в позиции (${x}, ${y})`);
                // Здесь можно создать нового союзника или предмет
                this.createHatchedCreature(hatchType, x, y);
            });
        });
        // События врагов
        this.enemies.forEach((enemy, index) => {
            enemy.on('damage', (damage, health) => {
                console.log(`Враг ${index} (${enemy.enemyType}) получил ${damage} урона. Здоровье: ${health}`);
                enemy.shake(150, 2);
            });
            enemy.on('death', () => {
                console.log(`Враг ${index} (${enemy.enemyType}) погиб!`);
                const enemyIndex = this.enemies.indexOf(enemy);
                if (enemyIndex > -1) {
                    this.enemies.splice(enemyIndex, 1);
                }
            });
        });
        // События защитных сооружений
        this.defences.forEach((defence, index) => {
            defence.on('damage', (damage, health) => {
                console.log(`Защита ${index} (${defence.defenceType}) получила ${damage} урона. Здоровье: ${health}`);
                defence.shake(100, 1);
            });
            defence.on('death', () => {
                console.log(`Защита ${index} (${defence.defenceType}) разрушена!`);
                const defenceIndex = this.defences.indexOf(defence);
                if (defenceIndex > -1) {
                    this.defences.splice(defenceIndex, 1);
                }
            });
        });
    }
    createHatchedCreature(hatchType, x, y) {
        // Создаем существо в зависимости от типа яйца
        let creature;
        switch (hatchType) {
            case 'special':
                creature = new GameObject(this, {
                    health: 80,
                    damage: 20,
                    speed: 150,
                    cooldown: 600,
                    x: x,
                    y: y,
                    texture: 'player',
                    attackRange: 50
                });
                creature.setTint(0x8b5cf6); // Фиолетовый
                break;
            case 'rare':
                creature = new GameObject(this, {
                    health: 60,
                    damage: 30,
                    speed: 120,
                    cooldown: 400,
                    x: x,
                    y: y,
                    texture: 'player',
                    attackRange: 70
                });
                creature.setTint(0xf59e0b); // Оранжевый
                break;
            default: // basic
                creature = new GameObject(this, {
                    health: 50,
                    damage: 15,
                    speed: 100,
                    cooldown: 800,
                    x: x,
                    y: y,
                    texture: 'player',
                    attackRange: 40
                });
                creature.setTint(0x10b981); // Зеленый
                break;
        }
        // Помечаем как союзника
        creature.isAlly = true;
    }
    update() {
        if (!this.player.isAlive)
            return;
        // Управление игроком
        this.handlePlayerInput();
        // Обновляем все объекты
        this.player.update(this.time.now, this.game.loop.delta);
        this.eggs.forEach(egg => {
            if (egg.isAlive) {
                egg.update(this.time.now, this.game.loop.delta);
            }
        });
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
        // Проверяем условия победы/поражения
        this.checkGameState();
    }
    handlePlayerInput() {
        const speed = this.player.speed;
        let velocityX = 0;
        let velocityY = 0;
        // Движение
        if (this.cursors.left?.isDown) {
            velocityX = -speed;
        }
        else if (this.cursors.right?.isDown) {
            velocityX = speed;
        }
        if (this.cursors.up?.isDown) {
            velocityY = -speed;
        }
        else if (this.cursors.down?.isDown) {
            velocityY = speed;
        }
        // Применяем движение
        if (velocityX !== 0 || velocityY !== 0) {
            const direction = new Phaser.Math.Vector2(velocityX, velocityY);
            this.player.startMovement(direction);
        }
        else {
            this.player.stopMovement();
        }
        // Атака (пробел)
        if (this.input.keyboard?.checkDown(this.input.keyboard.addKey('SPACE'), 100)) {
            const nearestEnemy = this.player.findNearestTarget(this.enemies);
            if (nearestEnemy) {
                this.player.attack(nearestEnemy);
            }
        }
    }
    checkGameState() {
        // Проверяем победу (все враги уничтожены)
        if (this.enemies.length === 0) {
            console.log('Победа! Все враги уничтожены!');
            this.scene.restart();
        }
        // Проверяем поражение (игрок погиб)
        if (!this.player.isAlive) {
            console.log('Поражение! Игрок погиб!');
            this.scene.restart();
        }
    }
}
