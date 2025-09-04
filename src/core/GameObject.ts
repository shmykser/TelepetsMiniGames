import Phaser from 'phaser';

export interface GameObjectConfig {
  health: number;
  damage: number;
  speed: number;
  cooldown: number;
  x?: number;
  y?: number;
  texture?: string;
}

export class GameObject extends Phaser.GameObjects.Sprite {
  // Основные свойства
  protected _health: number;
  protected _maxHealth: number;
  protected _damage: number;
  protected _speed: number;
  protected _cooldown: number;
  protected _lastAttackTime: number = 0;

  // Состояние
  protected _isMoving: boolean = false;
  protected _isAlive: boolean = true;
  protected _target: GameObject | null = null;

  // Физика
  protected _body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, config: GameObjectConfig) {
    super(scene, config.x || 0, config.y || 0, config.texture || '');
    
    // Инициализация свойств
    this._health = config.health;
    this._maxHealth = config.health;
    this._damage = config.damage;
    this._speed = config.speed;
    this._cooldown = config.cooldown;

    // Добавляем в сцену
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this._body = this.body as Phaser.Physics.Arcade.Body;
    this._body.setCollideWorldBounds(true);
  }

  // Геттеры для свойств
  get health(): number { return this._health; }
  get maxHealth(): number { return this._maxHealth; }
  get damage(): number { return this._damage; }
  get speed(): number { return this._speed; }
  get cooldown(): number { return this._cooldown; }
  get isMoving(): boolean { return this._isMoving; }
  get isAlive(): boolean { return this._isAlive; }
  get target(): GameObject | null { return this._target; }

  // Сеттеры для свойств
  set health(value: number) { 
    this._health = Math.max(0, Math.min(value, this._maxHealth));
    if (this._health <= 0) {
      this.die();
    }
  }

  set damage(value: number) { this._damage = Math.max(0, value); }
  set speed(value: number) { this._speed = Math.max(0, value); }
  set cooldown(value: number) { this._cooldown = Math.max(0, value); }

  // Методы движения
  startMovement(direction: Phaser.Math.Vector2): void {
    if (!this._isAlive) return;
    
    this._isMoving = true;
    const normalizedDirection = direction.normalize();
    this._body.setVelocity(
      normalizedDirection.x * this._speed,
      normalizedDirection.y * this._speed
    );
  }

  startMovementToPoint(x: number, y: number): void {
    if (!this._isAlive) return;
    
    const direction = new Phaser.Math.Vector2(x - this.x, y - this.y);
    this.startMovement(direction);
  }

  stopMovement(): void {
    this._isMoving = false;
    this._body.setVelocity(0, 0);
  }

  // Методы атаки
  attack(target?: GameObject): boolean {
    if (!this._isAlive) return false;
    
    const currentTime = this.scene.time.now;
    if (currentTime - this._lastAttackTime < this._cooldown) {
      return false; // Еще на перезарядке
    }

    const attackTarget = target || this._target;
    if (!attackTarget || !attackTarget._isAlive) {
      return false;
    }

    // Проверяем расстояние до цели
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y, 
      attackTarget.x, attackTarget.y
    );
    
    if (distance > this.getAttackRange()) {
      return false; // Цель слишком далеко
    }

    // Наносим урон
    attackTarget.takeDamage(this._damage);
    this._lastAttackTime = currentTime;
    
    // Вызываем событие атаки
    this.emit('attack', attackTarget, this._damage);
    
    return true;
  }

  takeDamage(damage: number): void {
    if (!this._isAlive) return;
    
    this.health -= damage;
    this.emit('damage', damage, this._health);
    
    // Эффект получения урона
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
  }

  // Методы определения цели
  setTarget(target: GameObject | null): void {
    this._target = target;
    this.emit('targetChanged', target);
  }

  findNearestTarget(targets: GameObject[]): GameObject | null {
    if (targets.length === 0) return null;
    
    let nearestTarget: GameObject | null = null;
    let nearestDistance = Infinity;
    
    for (const target of targets) {
      if (!target._isAlive) continue;
      
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, 
        target.x, target.y
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = target;
      }
    }
    
    return nearestTarget;
  }

  // Вспомогательные методы
  protected getAttackRange(): number {
    return 50; // Базовый радиус атаки
  }

  protected die(): void {
    this._isAlive = false;
    this._isMoving = false;
    this._target = null;
    this.stopMovement();
    
    // Анимация смерти
    this.setTint(0x666666);
    this.setAlpha(0.5);
    
    this.emit('death', this);
  }

  // Обновление (вызывается в update цикле сцены)
  override update(_time: number, _delta: number): void {
    if (!this._isAlive) return;
    
    // Автоматическое преследование цели
    if (this._target && this._target._isAlive) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, 
        this._target.x, this._target.y
      );
      
      if (distance > this.getAttackRange()) {
        // Двигаемся к цели
        this.startMovementToPoint(this._target.x, this._target.y);
      } else {
        // Останавливаемся и атакуем
        this.stopMovement();
        this.attack();
      }
    }
  }

  // Уничтожение объекта
  override destroy(): void {
    this.emit('destroy', this);
    super.destroy();
  }
}
