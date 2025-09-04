import Phaser from 'phaser';
import { GameObject, GameObjectConfig } from '@/core/GameObject';

export class GameSceneWithGameObject extends Phaser.Scene {
  private player!: GameObject;
  private enemies: GameObject[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('GameWithGameObject');
  }

  create(): void {
    const { width, height } = this.scale;

    // Создаем текстуры для игрока и врагов
    this.createTextures();

    // Создаем игрока
    const playerConfig: GameObjectConfig = {
      health: 100,
      damage: 25,
      speed: 200,
      cooldown: 500,
      x: width / 2,
      y: height / 2,
      texture: 'player'
    };
    
    this.player = new GameObject(this, playerConfig);
    this.player.setTint(0x22c55e); // Зеленый цвет для игрока

    // Создаем врагов
    this.createEnemies();

    // Настраиваем управление
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Настраиваем события
    this.setupEvents();

    // Запускаем UI
    this.scene.run('UI');
  }

  private createTextures(): void {
    // Текстура игрока
    const playerGraphics = this.add.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0x22c55e, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Текстура врага
    const enemyGraphics = this.add.graphics({ x: 0, y: 0 });
    enemyGraphics.fillStyle(0xef4444, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();
  }

  private createEnemies(): void {
    const { width, height } = this.scale;
    
    // Создаем 3 врагов
    for (let i = 0; i < 3; i++) {
      const enemyConfig: GameObjectConfig = {
        health: 50,
        damage: 15,
        speed: 100,
        cooldown: 1000,
        x: Phaser.Math.Between(50, width - 50),
        y: Phaser.Math.Between(50, height - 50),
        texture: 'enemy'
      };
      
      const enemy = new GameObject(this, enemyConfig);
      this.enemies.push(enemy);
    }
  }

  private setupEvents(): void {
    // События игрока
    this.player.on('damage', (damage: number, health: number) => {
      console.log(`Игрок получил ${damage} урона. Здоровье: ${health}`);
    });

    this.player.on('death', () => {
      console.log('Игрок погиб!');
      this.scene.restart();
    });

    // События врагов
    this.enemies.forEach((enemy, index) => {
      enemy.on('damage', (damage: number, health: number) => {
        console.log(`Враг ${index} получил ${damage} урона. Здоровье: ${health}`);
      });

      enemy.on('death', () => {
        console.log(`Враг ${index} погиб!`);
        // Удаляем врага из массива
        const enemyIndex = this.enemies.indexOf(enemy);
        if (enemyIndex > -1) {
          this.enemies.splice(enemyIndex, 1);
        }
      });

      // Враг автоматически атакует игрока
      enemy.setTarget(this.player);
    });
  }

  override update(): void {
    if (!this.player.isAlive) return;

    // Управление игроком
    this.handlePlayerInput();

    // Обновляем все GameObject'ы
    this.player.update(this.time.now, this.game.loop.delta);
    this.enemies.forEach(enemy => {
      if (enemy.isAlive) {
        enemy.update(this.time.now, this.game.loop.delta);
      }
    });

    // Проверяем победу
    if (this.enemies.length === 0) {
      console.log('Победа! Все враги уничтожены!');
      this.scene.restart();
    }
  }

  private handlePlayerInput(): void {
    const speed = this.player.speed;
    let velocityX = 0;
    let velocityY = 0;

    // Движение
    if (this.cursors.left?.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right?.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up?.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down?.isDown) {
      velocityY = speed;
    }

    // Применяем движение
    if (velocityX !== 0 || velocityY !== 0) {
      const direction = new Phaser.Math.Vector2(velocityX, velocityY);
      this.player.startMovement(direction);
    } else {
      this.player.stopMovement();
    }

    // Атака (пробел)
    if (this.input.keyboard?.checkDown(this.input.keyboard.addKey('SPACE'), 100)) {
      // Ищем ближайшего врага для атаки
      const nearestEnemy = this.player.findNearestTarget(this.enemies);
      if (nearestEnemy) {
        this.player.attack(nearestEnemy);
      }
    }
  }
}
