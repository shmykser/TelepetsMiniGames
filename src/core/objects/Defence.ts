import { GameObject, GameObjectConfig } from '../GameObject';
import { defenceTypes, DefenceType } from '../types/defenceTypes';

export interface DefenceConfig extends GameObjectConfig {
  defenceType?: keyof typeof defenceTypes;
  protectionRadius?: number;
  maxHealth?: number;
  repairRate?: number;
  autoRepair?: boolean;
}

export class Defence extends GameObject {
  private _defenceType: keyof typeof defenceTypes;
  private _protectionRadius: number;
  private _defenceMaxHealth: number;
  private _repairRate: number;
  private _autoRepair: boolean;
  private _isRepairing: boolean = false;
  private _repairTimer?: Phaser.Time.TimerEvent;
  private _protectedObjects: GameObject[] = [];
  private _defenceData: DefenceType;

  constructor(scene: Phaser.Scene, config: DefenceConfig) {
    const defenceType = config.defenceType || 'sugar';
    const defenceData = defenceTypes[defenceType];
    
    // Настройки из типа защиты
    const defenceConfig: GameObjectConfig = {
      health: config.health || defenceData.health,
      damage: config.damage || defenceData.damage,
      speed: 0, // Защитные сооружения неподвижны
      cooldown: config.cooldown || defenceData.cooldown * 1000, // конвертируем секунды в мс
      attackRange: 0,
      x: config.x,
      y: config.y,
      texture: config.texture
    };

    super(scene, defenceConfig);

    this._defenceType = defenceType;
    this._defenceData = defenceData;
    this._protectionRadius = config.protectionRadius || defenceData.radius * defenceData.size * 10; // конвертируем в пиксели
    this._defenceMaxHealth = config.maxHealth || defenceData.health;
    this._repairRate = config.repairRate || 5; // Восстановление здоровья в секунду
    this._autoRepair = config.autoRepair !== false; // По умолчанию включено

    // Настраиваем размер из типа защиты
    this._size = defenceData.size;

    // Настраиваем поведение в зависимости от типа
    this.setupDefenceBehaviour();
    
    // Запускаем систему защиты
    this.startProtectionSystem();
  }

  private setupDefenceBehaviour(): void {
    // Настраиваем визуал в зависимости от типа защиты
    switch (this._defenceType) {
      case 'sugar':
        this.setTint(0xfbbf24); // Желтый
        break;
      case 'stone':
        this.setTint(0x6b7280); // Серый
        this.setScale(1.5, 1.5); // Большой размер
        break;
      case 'crack':
        this.setTint(0x374151); // Темно-серый
        this.setScale(1.0, 2.0); // Длинная трещина
        break;
      case 'spikes':
        this.setTint(0xdc2626); // Красный
        this.setScale(1.2, 1.2);
        break;
      case 'madCucumber':
        this.setTint(0x16a34a); // Зеленый
        break;
      case 'pit':
        this.setTint(0x1f2937); // Очень темный
        break;
      default:
        this.setTint(0x808080); // Серый
        break;
    }

    // Настраиваем физику для защитных сооружений
    this.physicsBody.setImmovable(true);
    this.physicsBody.setBounce(0.1);
    this.physicsBody.setDrag(1000, 1000); // Максимальное сопротивление
  }

  private startProtectionSystem(): void {
    if (!this.scene) return;

    // Запускаем систему автоматического ремонта
    if (this._autoRepair) {
      this.startAutoRepair();
    }

    // Запускаем систему защиты объектов
    this.startObjectProtection();
  }

  private startAutoRepair(): void {
    if (!this.scene) return;

    this._repairTimer = this.scene.time.addEvent({
      delay: 1000, // Каждую секунду
      callback: () => {
        if (this._isAlive && this.health < this._maxHealth && !this._isRepairing) {
          this.repair();
        }
      },
      loop: true
    });
  }

  private startObjectProtection(): void {
    if (!this.scene) return;

    // Проверяем защиту объектов каждые 500мс
    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.updateProtection();
      },
      loop: true
    });
  }

  private repair(): void {
    if (!this._isAlive || this.health >= this._defenceMaxHealth) return;

    this._isRepairing = true;
    const oldHealth = this.health;
    this.health = Math.min(this.health + this._repairRate, this._defenceMaxHealth);
    
    // Эффект ремонта
    this.playRepairEffect();
    
    
    // Небольшая задержка перед следующим ремонтом
    this.scene.time.delayedCall(2000, () => {
      this._isRepairing = false;
    });
  }

  private playRepairEffect(): void {
    if (!this.scene) return;

    // Простой эффект восстановления
    this.setTint(0x00ff00);
    this.scene.time.delayedCall(500, () => {
      this.clearTint();
    });
  }

  private updateProtection(): void {
    if (!this._isAlive || !this.scene) return;

    // Ищем объекты в радиусе защиты
    const protectedObjects = this.findProtectedObjects();
    
    // Применяем защиту к объектам
    protectedObjects.forEach(obj => {
      this.applyProtection(obj);
    });

    // Обновляем список защищаемых объектов
    this._protectedObjects = protectedObjects;
  }

  private findProtectedObjects(): GameObject[] {
    if (!this.scene) return [];

    const protectedObjects: GameObject[] = [];
    const gameObjects = this.scene.children.list;

    for (const obj of gameObjects) {
      if (obj instanceof GameObject && obj.isAlive) {
        const distance = Phaser.Math.Distance.Between(
          this.x, this.y, 
          obj.x, obj.y
        );
        
        if (distance <= this._protectionRadius) {
          protectedObjects.push(obj);
        }
      }
    }

    return protectedObjects;
  }

  private applyProtection(_obj: GameObject): void {
    // Базовая защита - можно переопределить в дочерних классах
    // По умолчанию ничего не делаем
  }

  // Переопределяем методы движения - защитные сооружения неподвижны
  override startMovement(_direction: Phaser.Math.Vector2): void {
    // Защитные сооружения не могут двигаться
    return;
  }

  override startMovementToPoint(_x: number, _y: number): void {
    // Защитные сооружения не могут двигаться
    return;
  }

  override moveToPointTween(_x: number, _y: number, _duration?: number): Phaser.Tweens.Tween {
    // Защитные сооружения не могут двигаться
    return this.scene.tweens.add({ targets: this, duration: 0 });
  }

  // Переопределяем методы атаки - защитные сооружения не атакуют
  override attack(_target?: GameObject): boolean {
    // Защитные сооружения не атакуют
    return false;
  }

  // Переопределяем получение урона
  override takeDamage(damage: number): void {
    if (!this._isAlive || !this.scene) return;

    // Защитные сооружения получают меньше урона
    const reducedDamage = damage * 0.7; // 30% снижение урона
    
    this.health -= reducedDamage;
    this.emit('damage', reducedDamage, this.health);
    
    // Эффект получения урона
    this.scene.tweens.add({
      targets: this,
      tint: 0xff0000,
      duration: 200,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.clearTint();
      }
    });

    // Если здоровье критично, показываем предупреждение
    if (this.health < this._defenceMaxHealth * 0.3) {
      this.showDamageWarning();
    }
  }

  private showDamageWarning(): void {
    if (!this.scene) return;

    // Простое предупреждение
  }

  // Геттеры
  get defenceType(): keyof typeof defenceTypes { return this._defenceType; }
  get protectionRadius(): number { return this._protectionRadius; }
  override get maxHealth(): number { return this._defenceMaxHealth; }
  get repairRate(): number { return this._repairRate; }
  get autoRepair(): boolean { return this._autoRepair; }
  get isRepairing(): boolean { return this._isRepairing; }
  get protectedObjects(): GameObject[] { return this._protectedObjects; }
  get defenceData(): DefenceType { return this._defenceData; }

  // Сеттеры
  set defenceType(value: keyof typeof defenceTypes) { 
    this._defenceType = value;
    this._defenceData = defenceTypes[value];
    this.setupDefenceBehaviour();
  }
  
  set protectionRadius(value: number) { this._protectionRadius = Math.max(0, value); }
  override set maxHealth(value: number) { this._defenceMaxHealth = Math.max(1, value); }
  set repairRate(value: number) { this._repairRate = Math.max(0, value); }
  set autoRepair(value: boolean) { 
    this._autoRepair = value;
    if (value && !this._repairTimer) {
      this.startAutoRepair();
    } else if (!value && this._repairTimer) {
      this._repairTimer.destroy();
      this._repairTimer = undefined;
    }
  }

  // Уничтожение с очисткой таймеров
  override destroy(): void {
    if (this._repairTimer) {
      this._repairTimer.destroy();
      this._repairTimer = undefined;
    }
    super.destroy();
  }
}
