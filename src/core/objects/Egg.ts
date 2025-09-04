import { GameObject, GameObjectConfig } from '../GameObject';

export interface EggConfig extends GameObjectConfig {
  hatchTime?: number;
  hatchType?: string;
}

export class Egg extends GameObject {
  private _hatchTime: number;
  private _hatchType: string;
  private _isHatching: boolean = false;
  private _hatchTimer?: Phaser.Time.TimerEvent;

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

    this._hatchTime = config.hatchTime || 10000; // 10 секунд по умолчанию
    this._hatchType = config.hatchType || 'default';

    // Настраиваем физику для яйца
    this.setupEggPhysics();
    
    // Запускаем таймер вылупления
    this.startHatchTimer();
  }

  private setupEggPhysics(): void {
    // Яйцо статично - не может двигаться
    this.physicsBody.setImmovable(true);
    this.physicsBody.setVelocity(0, 0);
    this.physicsBody.setBounce(0.1);
    this.physicsBody.setDrag(1000, 1000); // Максимальное сопротивление
  }

  private startHatchTimer(): void {
    if (!this.scene) return;

    this._hatchTimer = this.scene.time.delayedCall(this._hatchTime, () => {
      this.hatch();
    });
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

  // Процесс вылупления
  hatch(): void {
    if (this._isHatching || !this._isAlive) return;

    this._isHatching = true;
    console.log(`Яйцо вылупляется! Тип: ${this._hatchType}`);

    // Эмитим событие вылупления
    this.emit('hatch', this._hatchType, this.x, this.y);
    
    // Уничтожаем яйцо
    this.destroy();
  }

  // Геттеры
  get hatchTime(): number { return this._hatchTime; }
  get hatchType(): string { return this._hatchType; }
  get isHatching(): boolean { return this._isHatching; }

  // Сеттеры
  set hatchTime(value: number) { 
    this._hatchTime = Math.max(0, value);
    // Перезапускаем таймер если он активен
    if (this._hatchTimer && !this._isHatching) {
      this._hatchTimer.destroy();
      this.startHatchTimer();
    }
  }

  set hatchType(value: string) { this._hatchType = value; }

  // Уничтожение с очисткой таймера
  override destroy(): void {
    if (this._hatchTimer) {
      this._hatchTimer.destroy();
      this._hatchTimer = undefined;
    }
    super.destroy();
  }
}
