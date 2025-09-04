import Phaser from 'phaser';
import { GameObject, GameObjectConfig } from '@/core/GameObject';
import { GestureManager } from '@/systems/gesture/GestureManager';

export class GestureGameScene extends Phaser.Scene {
  private player!: GameObject;
  private enemies: GameObject[] = [];
  private gestureManager!: GestureManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('GestureGame');
  }

  create(): void {
    const { width, height } = this.scale;

    // Создаем текстуры
    this.createTextures();

    // Создаем игрока
    const playerConfig: GameObjectConfig = {
      health: 100,
      damage: 25,
      speed: 200,
      cooldown: 500,
      x: width / 2,
      y: height / 2,
      texture: 'player',
      attackRange: 60
    };
    
    this.player = new GameObject(this, playerConfig);
    this.player.setTint(0x22c55e);

    // Создаем врагов
    this.createEnemies();

    // Настраиваем управление клавиатурой
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Настраиваем жесты Hammer.js
    this.setupGestures();

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

    // Текстура для эффектов
    const effectGraphics = this.add.graphics({ x: 0, y: 0 });
    effectGraphics.fillStyle(0xffff00, 1);
    effectGraphics.fillCircle(8, 8, 8);
    effectGraphics.generateTexture('effect', 16, 16);
    effectGraphics.destroy();
  }

  private createEnemies(): void {
    const { width, height } = this.scale;
    
    // Создаем 4 врагов
    for (let i = 0; i < 4; i++) {
      const enemyConfig: GameObjectConfig = {
        health: 50,
        damage: 15,
        speed: 80,
        cooldown: 1000,
        x: Phaser.Math.Between(50, width - 50),
        y: Phaser.Math.Between(50, height - 50),
        texture: 'enemy',
        attackRange: 40
      };
      
      const enemy = new GameObject(this, enemyConfig);
      this.enemies.push(enemy);
    }
  }

  private setupGestures(): void {
    this.gestureManager = new GestureManager(this, {
      onTap: (e) => this.onTap(e),
      onDoubleTap: (e) => this.onDoubleTap(e),
      onPan: (e) => this.onPan(e),
      onSwipe: (e) => this.onSwipe(e),
      onPinch: (e) => this.onPinch(e),
      onRotate: (e) => this.onRotate(e)
    });
  }

  private onTap(e: any): void {
    console.log('Tap at:', e.phaserX, e.phaserY);
    
    // Двигаем игрока к точке тапа
    this.player.moveToPointTween(e.phaserX, e.phaserY, 500);
    
    // Создаем эффект в точке тапа
    this.createTapEffect(e.phaserX, e.phaserY);
  }

  private onDoubleTap(e: any): void {
    console.log('Double tap at:', e.phaserX, e.phaserY);
    
    // Атака в радиусе от точки двойного тапа
    const targetsInRange = this.player.findTargetsInRange(this.enemies, 100);
    targetsInRange.forEach(target => {
      this.player.attack(target);
    });
    
    // Создаем эффект взрыва
    this.createExplosionEffect(e.phaserX, e.phaserY);
  }

  private onPan(e: any): void {
    if (e.isFirst) {
      // Начинаем панорамирование
      console.log('Pan start at:', e.phaserX, e.phaserY);
    } else if (e.isFinal) {
      // Заканчиваем панорамирование
      console.log('Pan end at:', e.phaserX, e.phaserY);
    } else {
      // Продолжаем панорамирование - двигаем игрока
      const deltaX = e.deltaX * 0.5;
      const deltaY = e.deltaY * 0.5;
      
      this.player.x += deltaX;
      this.player.y += deltaY;
    }
  }

  private onSwipe(e: any): void {
    console.log('Swipe direction:', e.direction);
    
    const direction = this.gestureManager.getSwipeDirection(e);
    const force = this.gestureManager.getGestureForce(e);
    
    // Применяем силу к игроку
    this.player.physicsBody.setVelocity(
      direction.x * force * 100,
      direction.y * force * 100
    );
    
    // Создаем эффект следа
    this.createSwipeTrail(this.player.x, this.player.y, direction);
  }

  private onPinch(e: any): void {
    const scale = this.gestureManager.getPinchScale(e);
    console.log('Pinch scale:', scale);
    
    if (e.type === 'pinchstart') {
      // Начинаем пинч
      this.player.pulse(scale, 200);
    } else if (e.type === 'pinch') {
      // Обновляем масштаб
      this.player.setScale(scale);
    } else if (e.type === 'pinchend') {
      // Заканчиваем пинч - возвращаем нормальный размер
      this.player.setScale(1);
    }
  }

  private onRotate(e: any): void {
    const angle = this.gestureManager.getRotationAngle(e);
    console.log('Rotation angle:', angle);
    
    // Поворачиваем игрока
    this.player.setRotation(angle);
    
    // Создаем эффект вращения
    this.createRotationEffect(this.player.x, this.player.y);
  }

  private createTapEffect(x: number, y: number): void {
    const effect = this.add.sprite(x, y, 'effect');
    effect.setScale(0.5);
    
    this.tweens.add({
      targets: effect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  private createExplosionEffect(x: number, y: number): void {
    // Создаем несколько эффектов для взрыва
    for (let i = 0; i < 8; i++) {
      const effect = this.add.sprite(x, y, 'effect');
      effect.setScale(0.3);
      
      const angle = (i / 8) * Math.PI * 2;
      const distance = 50;
      
      this.tweens.add({
        targets: effect,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          effect.destroy();
        }
      });
    }
  }

  private createSwipeTrail(x: number, y: number, direction: Phaser.Math.Vector2): void {
    const trail = this.add.sprite(x, y, 'effect');
    trail.setScale(0.2);
    trail.setTint(0x00ff00);
    
    this.tweens.add({
      targets: trail,
      x: x + direction.x * 100,
      y: y + direction.y * 100,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        trail.destroy();
      }
    });
  }

  private createRotationEffect(x: number, y: number): void {
    const effect = this.add.sprite(x, y, 'effect');
    effect.setScale(0.5);
    effect.setTint(0x0088ff);
    
    this.tweens.add({
      targets: effect,
      rotation: Math.PI * 2,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        effect.destroy();
      }
    });
  }

  private setupEvents(): void {
    // События игрока
    this.player.on('damage', (damage: number, health: number) => {
      console.log(`Игрок получил ${damage} урона. Здоровье: ${health}`);
      this.player.shake(200, 3);
    });

    this.player.on('death', () => {
      console.log('Игрок погиб!');
      this.scene.restart();
    });

    // События врагов
    this.enemies.forEach((enemy, index) => {
      enemy.on('damage', (damage: number, health: number) => {
        console.log(`Враг ${index} получил ${damage} урона. Здоровье: ${health}`);
        enemy.shake(150, 2);
      });

      enemy.on('death', () => {
        console.log(`Враг ${index} погиб!`);
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

    // Управление клавиатурой (резервное)
    this.handleKeyboardInput();

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

  private handleKeyboardInput(): void {
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
      const nearestEnemy = this.player.findNearestTarget(this.enemies);
      if (nearestEnemy) {
        this.player.attack(nearestEnemy);
      }
    }
  }

  destroy(): void {
    if (this.gestureManager) {
      this.gestureManager.destroy();
    }
  }
}
