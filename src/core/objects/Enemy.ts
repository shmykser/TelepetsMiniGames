import { GameObject, GameObjectConfig } from '../GameObject';

export interface EnemyConfig extends GameObjectConfig {
  enemyType?: 'basic' | 'fast' | 'tank' | 'ranged';
  detectionRange?: number;
  attackPattern?: 'melee' | 'ranged' | 'charge';
}

export class Enemy extends GameObject {
  private _enemyType: string;
  private _detectionRange: number;
  private _attackPattern: string;
  private _lastPlayerPosition: Phaser.Math.Vector2 | null = null;
  private _isChasing: boolean = false;
  private _chaseTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, config: EnemyConfig) {
    // Настройки по умолчанию для врага
    const enemyConfig: GameObjectConfig = {
      health: config.health || 50,
      damage: config.damage || 15,
      speed: config.speed || 100,
      cooldown: config.cooldown || 1000,
      attackRange: config.attackRange || 40,
      x: config.x,
      y: config.y,
      texture: config.texture
    };

    super(scene, enemyConfig);

    this._enemyType = config.enemyType || 'basic';
    this._detectionRange = config.detectionRange || 150;
    this._attackPattern = config.attackPattern || 'melee';

    // Настраиваем поведение в зависимости от типа
    this.setupEnemyBehavior();
  }

  private setupEnemyBehavior(): void {
    // Настройки в зависимости от типа врага
    switch (this._enemyType) {
      case 'fast':
        this.speed = 180;
        this.health = 30;
        this.damage = 10;
        this.attackRange = 30;
        this.setTint(0xff6b6b); // Красный
        break;
      
      case 'tank':
        this.speed = 60;
        this.health = 120;
        this.damage = 25;
        this.attackRange = 50;
        this.setTint(0x4ecdc4); // Бирюзовый
        break;
      
      case 'ranged':
        this.speed = 80;
        this.health = 40;
        this.damage = 20;
        this.attackRange = 80;
        this.cooldown = 1500;
        this.setTint(0xffe66d); // Желтый
        break;
      
      default: // basic
        this.setTint(0xef4444); // Красный
        break;
    }

    // Настраиваем физику
    this.physicsBody.setBounce(0.1);
    this.physicsBody.setDrag(50, 50);
  }

  // Переопределяем update для ИИ поведения
  override update(_time: number, _delta: number): void {
    if (!this._isAlive || !this.scene) return;

    // Ищем игрока в сцене
    const player = this.findPlayer();
    if (!player) return;

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.x, this.y, 
      player.x, player.y
    );

    // Логика поведения в зависимости от расстояния
    if (distanceToPlayer <= this._detectionRange) {
      this.handlePlayerDetected(player, distanceToPlayer);
    } else {
      this.handlePlayerLost();
    }

    // Вызываем родительский update для базовой логики
    super.update(_time, _delta);
  }

  private findPlayer(): GameObject | null {
    // Ищем игрока в сцене (предполагаем, что игрок имеет тег 'player')
    const gameObjects = this.scene.children.list;
    for (const obj of gameObjects) {
      if (obj instanceof GameObject && obj !== this && obj.isAlive) {
        // Проверяем, является ли объект игроком (можно добавить тег или свойство)
        if ((obj as any).isPlayer) {
          return obj;
        }
      }
    }
    return null;
  }

  private handlePlayerDetected(player: GameObject, distance: number): void {
    this._isChasing = true;
    this._lastPlayerPosition = new Phaser.Math.Vector2(player.x, player.y);

    if (distance <= this.attackRange) {
      // В радиусе атаки - атакуем
      this.stopMovement();
      this.attack(player);
    } else {
      // Вне радиуса атаки - преследуем
      this.chasePlayer(player);
    }
  }

  private handlePlayerLost(): void {
    if (this._isChasing) {
      // Игрок потерян - продолжаем преследование последней известной позиции
      if (this._lastPlayerPosition) {
        this.startMovementToPoint(this._lastPlayerPosition.x, this._lastPlayerPosition.y);
        
        // Через некоторое время прекращаем преследование
        if (this._chaseTimer) {
          this._chaseTimer.destroy();
        }
        
        this._chaseTimer = this.scene.time.delayedCall(3000, () => {
          this._isChasing = false;
          this._lastPlayerPosition = null;
          this.stopMovement();
        });
      }
    }
  }

  private chasePlayer(player: GameObject): void {
    // Различные паттерны преследования
    switch (this._attackPattern) {
      case 'charge':
        this.chargeAtPlayer(player);
        break;
      
      case 'ranged':
        this.maintainDistance(player);
        break;
      
      default: // melee
        this.startMovementToPoint(player.x, player.y);
        break;
    }
  }

  private chargeAtPlayer(player: GameObject): void {
    // Быстрая атака с ускорением
    const direction = new Phaser.Math.Vector2(
      player.x - this.x,
      player.y - this.y
    ).normalize();
    
    this.physicsBody.setVelocity(
      direction.x * this.speed * 1.5,
      direction.y * this.speed * 1.5
    );
  }

  private maintainDistance(player: GameObject): void {
    // Поддерживаем дистанцию для дальнобойных атак
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const optimalDistance = this.attackRange * 0.8;
    
    if (distance > optimalDistance) {
      // Слишком далеко - приближаемся
      this.startMovementToPoint(player.x, player.y);
    } else if (distance < optimalDistance * 0.6) {
      // Слишком близко - отходим
      const direction = new Phaser.Math.Vector2(
        this.x - player.x,
        this.y - player.y
      ).normalize();
      
      this.startMovement(direction);
    } else {
      // Оптимальная дистанция - атакуем
      this.stopMovement();
      this.attack(player);
    }
  }

  // Переопределяем атаку для разных типов врагов
  override attack(target?: GameObject): boolean {
    if (!this._isAlive || !this.scene) return false;

    const attackTarget = target || this._target;
    if (!attackTarget || !attackTarget.isAlive) return false;

    const distance = Phaser.Math.Distance.Between(
      this.x, this.y, 
      attackTarget.x, attackTarget.y
    );
    
    if (distance > this.attackRange) return false;

    // Специальные атаки в зависимости от типа
    switch (this._enemyType) {
      case 'ranged':
        this.performRangedAttack(attackTarget);
        break;
      
      case 'tank':
        this.performTankAttack(attackTarget);
        break;
      
      default:
        this.performBasicAttack(attackTarget);
        break;
    }

    return true;
  }

  private performBasicAttack(target: GameObject): void {
    // Базовая атака
    target.takeDamage(this.damage);
    this.emit('attack', target, this.damage);
    
    // Эффект атаки
    this.shake(100, 2);
  }

  private performRangedAttack(target: GameObject): void {
    // Дальнобойная атака - создаем снаряд
    if (!this.scene) return;

    const projectile = this.scene.add.circle(this.x, this.y, 3, 0xffe66d);
    this.scene.physics.add.existing(projectile);
    
    const projectileBody = projectile.body as Phaser.Physics.Arcade.Body;
    const direction = new Phaser.Math.Vector2(
      target.x - this.x,
      target.y - this.y
    ).normalize();
    
    projectileBody.setVelocity(
      direction.x * 200,
      direction.y * 200
    );

    // Уничтожаем снаряд через время
    this.scene.time.delayedCall(2000, () => {
      if (projectile && projectile.active) {
        projectile.destroy();
      }
    });

    // Проверяем попадание
    this.scene.physics.add.overlap(projectile, target, () => {
      target.takeDamage(this.damage);
      projectile.destroy();
    });

    this.emit('attack', target, this.damage);
  }

  private performTankAttack(target: GameObject): void {
    // Танковая атака - урон по области
    const nearbyTargets = this.findTargetsInRange([target], this.attackRange * 1.5);
    
    nearbyTargets.forEach(nearbyTarget => {
      nearbyTarget.takeDamage(this.damage);
    });

    // Эффект ударной волны
    this.createShockwave();
    this.emit('attack', target, this.damage);
  }

  private createShockwave(): void {
    if (!this.scene) return;

    const shockwave = this.scene.add.circle(this.x, this.y, 5, 0x4ecdc4, 0.5);
    
    this.scene.tweens.add({
      targets: shockwave,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        shockwave.destroy();
      }
    });
  }

  // Геттеры
  get enemyType(): string { return this._enemyType; }
  get detectionRange(): number { return this._detectionRange; }
  get attackPattern(): string { return this._attackPattern; }
  get isChasing(): boolean { return this._isChasing; }

  // Сеттеры
  set enemyType(value: string) { 
    this._enemyType = value;
    this.setupEnemyBehavior();
  }
  
  set detectionRange(value: number) { this._detectionRange = Math.max(0, value); }
  set attackPattern(value: string) { this._attackPattern = value; }

  // Уничтожение с очисткой таймеров
  override destroy(): void {
    if (this._chaseTimer) {
      this._chaseTimer.destroy();
      this._chaseTimer = undefined;
    }
    super.destroy();
  }
}
