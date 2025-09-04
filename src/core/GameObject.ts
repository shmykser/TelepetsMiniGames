import Phaser from 'phaser';
import { HealthBar, HealthObject } from '../components/HealthBar';

export interface GameObjectConfig {
  health: number;
  damage: number;
  speed: number;
  cooldown: number;
  x?: number;
  y?: number;
  texture?: string;
  attackRange?: number;
}

export class GameObject extends Phaser.GameObjects.Sprite implements HealthObject {
  // Основные свойства
  protected _health: number;
  protected _maxHealth: number;
  protected _damage: number;
  protected _speed: number;
  protected _cooldown: number;
  protected _attackRange: number;
  protected _lastAttackTime: number = 0;

  // Состояние
  protected _isAlive: boolean = true;
  protected _target: GameObject | null = null;
  protected _size: number = 1; // размер для взаимодействия с ямой
  protected _canFly: boolean = false; // способность летать

  // Phaser компоненты
  protected _body: Phaser.Physics.Arcade.Body;
  protected _tweenManager: Phaser.Tweens.TweenManager;
  protected _healthBar?: HealthBar;

  constructor(scene: Phaser.Scene, config: GameObjectConfig) {
    super(scene, config.x || 0, config.y || 0, config.texture || '');
    
    // Инициализация свойств
    this._health = config.health;
    this._maxHealth = config.health;
    this._damage = config.damage;
    this._speed = config.speed;
    this._cooldown = config.cooldown;
    this._attackRange = config.attackRange || 50;

    // Добавляем в сцену и физику
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this._body = this.body as Phaser.Physics.Arcade.Body;
    this._body.setCollideWorldBounds(true);
    this._body.setBounce(0.2);
    this._body.setDrag(100, 100); // Сопротивление для плавного движения
    
    // Получаем менеджеры из сцены
    this._tweenManager = scene.tweens;
    
    // Настраиваем события физики
    this.setupPhysicsEvents();
  }

  // Геттеры для свойств
  get health(): number { return this._health; }
  get maxHealth(): number { return this._maxHealth; }
  get damage(): number { return this._damage; }
  get speed(): number { return this._speed; }
  get cooldown(): number { return this._cooldown; }
  get attackRange(): number { return this._attackRange; }
  get isMoving(): boolean { return this._body.velocity.length() > 0; }
  get isAlive(): boolean { return this._isAlive; }
  get target(): GameObject | null { return this._target; }
  get physicsBody(): Phaser.Physics.Arcade.Body { return this._body; }
  
  // Геттеры для HealthObject интерфейса
  get objectWidth(): number { return this.displayWidth; }
  get objectHeight(): number { return this.displayHeight; }
  get objectScaleX(): number { return this.scaleX; }
  get objectScaleY(): number { return this.scaleY; }

  // Сеттеры для свойств
  set health(value: number) { 
    this._health = Math.max(0, Math.min(value, this._maxHealth));
    this.updateHealthBar();
    if (this._health <= 0) {
      this.die();
    }
  }

  set damage(value: number) { this._damage = Math.max(0, value); }
  set speed(value: number) { this._speed = Math.max(0, value); }
  set cooldown(value: number) { this._cooldown = Math.max(0, value); }
  set attackRange(value: number) { this._attackRange = Math.max(0, value); }

  // Настройка событий физики
  private setupPhysicsEvents(): void {
    // События столкновения
    this._body.onWorldBounds = true;
    this.on('worldbounds', this.onWorldBounds, this);
    
    // События движения
    this._body.onOverlap = true;
  }

  private onWorldBounds(): void {
    this.emit('worldbounds', this);
  }

  // Методы движения через Phaser Physics
  startMovement(direction: Phaser.Math.Vector2): void {
    if (!this._isAlive) return;
    
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
    this._body.setVelocity(0, 0);
  }

  // Движение с помощью Phaser Tweens
  moveToPointTween(x: number, y: number, duration: number = 1000): Phaser.Tweens.Tween {
    return this._tweenManager.add({
      targets: this,
      x: x,
      y: y,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        this.stopMovement();
      }
    });
  }

  // Методы атаки через Phaser Timer
  attack(target?: GameObject): boolean {
    if (!this._isAlive || !this.scene) return false;
    
    const currentTime = this.scene.time.now;
    if (currentTime - this._lastAttackTime < this._cooldown) {
      return false; // Еще на перезарядке
    }

    const attackTarget = target || this._target;
    if (!attackTarget || !attackTarget._isAlive) {
      return false;
    }

    // Проверяем расстояние до цели через Phaser.Math.Distance
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y, 
      attackTarget.x, attackTarget.y
    );
    
    if (distance > this._attackRange) {
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
    if (!this._isAlive || !this.scene) return;
    
    this.health -= damage;
    this.emit('damage', damage, this._health);
    
    // Эффект получения урона через Phaser Tween
    this._tweenManager.add({
      targets: this,
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.clearTint();
      }
    });
  }

  // Методы определения цели через Phaser.Math
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

  // Поиск целей в радиусе через Phaser.Geom.Circle
  findTargetsInRange(targets: GameObject[], range: number = this._attackRange): GameObject[] {
    const circle = new Phaser.Geom.Circle(this.x, this.y, range);
    return targets.filter(target => {
      if (!target._isAlive) return false;
      return Phaser.Geom.Circle.Contains(circle, target.x, target.y);
    });
  }

  // Анимация смерти через Phaser Tweens
  protected die(): void {
    this._isAlive = false;
    this._target = null;
    this.stopMovement();
    
    // Анимация смерти с помощью Phaser Tween
    if (this.scene) {
      this._tweenManager.add({
        targets: this,
        alpha: 0.3,
        scaleX: 0.5,
        scaleY: 0.5,
        tint: 0x666666,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          this.emit('death', this);
        }
      });
    } else {
      // Если сцена недоступна, просто эмитим событие
      this.emit('death', this);
    }
  }

  // Обновление через Phaser update цикл
  override update(_time: number, _delta: number): void {
    if (!this._isAlive) return;
    
    // Автоматическое преследование цели
    if (this._target && this._target._isAlive) {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, 
        this._target.x, this._target.y
      );
      
      if (distance > this._attackRange) {
        // Двигаемся к цели
        this.startMovementToPoint(this._target.x, this._target.y);
      } else {
        // Останавливаемся и атакуем
        this.stopMovement();
        this.attack();
      }
    }
  }

  // Дополнительные методы для работы с Phaser
  addPhysicsCollider(other: GameObject, callback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback): void {
    this.scene.physics.add.collider(this, other, callback);
  }

  addPhysicsOverlap(other: GameObject, callback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback): void {
    this.scene.physics.add.overlap(this, other, callback);
  }

  // Эффекты через Phaser Tweens
  shake(duration: number = 200, intensity: number = 5): void {
    if (!this.scene) return;
    
    this._tweenManager.add({
      targets: this,
      x: this.x + Phaser.Math.Between(-intensity, intensity),
      y: this.y + Phaser.Math.Between(-intensity, intensity),
      duration: duration,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.setPosition(this.x, this.y);
      }
    });
  }

  pulse(scale: number = 1.2, duration: number = 300): void {
    if (!this.scene) return;
    
    this._tweenManager.add({
      targets: this,
      scaleX: scale,
      scaleY: scale,
      duration: duration,
      yoyo: true,
      ease: 'Power2'
    });
  }

  // Уничтожение объекта
  override destroy(): void {
    this.destroyHealthBar();
    this.emit('destroy', this);
    super.destroy();
  }

  // === ОБЩИЕ МЕТОДЫ ДЛЯ ВСЕХ ОБЪЕКТОВ ===

  /**
   * Проверяет, находится ли объект в радиусе действия
   */
  isInRange(target: GameObject, range: number): boolean {
    if (!target || !target.isAlive) return false;
    
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y, 
      target.x, target.y
    );
    
    return distance <= range;
  }

  /**
   * Меняет цель объекта
   */
  changeTarget(newTarget: GameObject | null): void {
    const oldTarget = this._target;
    this._target = newTarget;
    
    if (oldTarget !== newTarget) {
      this.emit('targetChanged', newTarget, oldTarget);
    }
  }

  /**
   * Движется к цели со своей скоростью
   */
  moveToTarget(): void {
    if (!this._target || !this._target.isAlive || this._speed === 0) {
      this.stopMovement();
      return;
    }

    const direction = new Phaser.Math.Vector2(
      this._target.x - this.x,
      this._target.y - this.y
    ).normalize();

    this.startMovement(direction);
  }

  /**
   * Атакует цель
   */
  attackTarget(target?: GameObject): boolean {
    return this.attack(target);
  }

  /**
   * Обрабатывает реакцию на защитный объект
   */
  handleDefenceReaction(defence: GameObject, reaction: 'attack' | 'ignore' | 'influence'): void {
    switch (reaction) {
      case 'attack':
        this.changeTarget(defence);
        break;
      case 'ignore':
        // Ничего не делаем
        break;
      case 'influence':
        // Базовое влияние - можно переопределить в дочерних классах
        this.emit('defenceInfluence', defence);
        break;
    }
  }

  /**
   * Проверяет способность летать
   */
  canFlyObject(): boolean {
    return this._canFly;
  }

  /**
   * Получает размер объекта
   */
  getObjectSize(): number {
    return this._size;
  }

  /**
   * Устанавливает размер объекта
   */
  setObjectSize(size: number): void {
    this._size = Math.max(1, size);
  }

  /**
   * Устанавливает способность летать
   */
  setCanFlyObject(canFly: boolean): void {
    this._canFly = canFly;
  }

  // Геттеры для новых свойств
  get objectSize(): number { return this._size; }
  get canFlyProperty(): boolean { return this._canFly; }

  // Сеттеры для новых свойств
  set objectSize(value: number) { this.setObjectSize(value); }
  set canFlyProperty(value: boolean) { this.setCanFlyObject(value); }

  // Методы для работы с HealthBar
  /**
   * Создает полосу здоровья для объекта
   */
  createHealthBar(options?: {
    showWhenFull?: boolean;
    showWhenEmpty?: boolean;
    offsetY?: number;
    colors?: {
      background?: number;
      health?: number;
      border?: number;
    };
  }): void {
    if (this._healthBar) {
      this._healthBar.destroy();
    }
    
    this._healthBar = new HealthBar(this.scene, this, options);
  }

  /**
   * Обновляет полосу здоровья
   */
  updateHealthBar(): void {
    if (this._healthBar) {
      this._healthBar.updateHealth();
    }
  }

  /**
   * Уничтожает полосу здоровья
   */
  destroyHealthBar(): void {
    if (this._healthBar) {
      this._healthBar.destroy();
      this._healthBar = undefined;
    }
  }

  /**
   * Показывает/скрывает полосу здоровья
   */
  setHealthBarVisible(visible: boolean): void {
    if (this._healthBar) {
      this._healthBar.setVisible(visible);
    }
  }
}
