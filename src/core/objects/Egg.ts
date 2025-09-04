import { GameObject, GameObjectConfig } from '../GameObject';

export interface EggConfig extends GameObjectConfig {
  // Яйцо - статичный объект без вылупления
}

export class Egg extends GameObject {
  // Яйцо - статичный объект без вылупления

  constructor(scene: Phaser.Scene, config: EggConfig) {
    // Настройки для яйца - неподвижное, без атак
    const eggConfig: GameObjectConfig = {
      ...config,
      speed: 0, // Не может двигаться
      damage: 0, // Нет атак
      cooldown: 0, // Нет перезарядки
      attackRange: 0 // Нет радиуса атаки
    };

    super(scene, eggConfig);

    // Яйцо - основная цель врагов
    this._size = 2; // Размер яйца
    this._canFly = false;

    // Настраиваем физику для яйца
    this.setupEggPhysics();
  }

  private setupEggPhysics(): void {
    // Яйцо статично - не может двигаться
    this.physicsBody.setImmovable(true);
    this.physicsBody.setVelocity(0, 0);
    this.physicsBody.setBounce(0.1);
    this.physicsBody.setDrag(1000, 1000); // Максимальное сопротивление
  }


  // Переопределяем методы движения - яйцо не может двигаться
  override startMovement(_direction: Phaser.Math.Vector2): void {
    // Яйцо не может двигаться
    return;
  }

  override startMovementToPoint(_x: number, _y: number): void {
    // Яйцо не может двигаться
    return;
  }

  override moveToPointTween(_x: number, _y: number, _duration?: number): Phaser.Tweens.Tween {
    // Яйцо не может двигаться
    return this.scene.tweens.add({ targets: this, duration: 0 });
  }

  // Переопределяем методы атаки - яйцо не может атаковать
  override attack(_target?: GameObject): boolean {
    // Яйцо не может атаковать
    return false;
  }

  // Яйцо - статичный объект без вылупления
}
