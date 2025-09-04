import { GameObject, GameObjectConfig } from '../GameObject';

export interface DefenceConfig extends GameObjectConfig {
  defenceType?: 'wall' | 'tower' | 'shield' | 'barrier';
  protectionRadius?: number;
  maxHealth?: number;
  repairRate?: number;
  autoRepair?: boolean;
}

export class Defence extends GameObject {
  private _defenceType: string;
  private _protectionRadius: number;
  private _defenceMaxHealth: number;
  private _repairRate: number;
  private _autoRepair: boolean;
  private _isRepairing: boolean = false;
  private _repairTimer?: Phaser.Time.TimerEvent;
  private _protectedObjects: GameObject[] = [];

  constructor(scene: Phaser.Scene, config: DefenceConfig) {
    // Настройки по умолчанию для защитных сооружений
    const defenceConfig: GameObjectConfig = {
      health: config.health || 200,
      damage: 0, // Защитные сооружения не атакуют
      speed: 0, // Неподвижны
      cooldown: 0,
      attackRange: 0,
      x: config.x,
      y: config.y,
      texture: config.texture
    };

    super(scene, defenceConfig);

    this._defenceType = config.defenceType || 'wall';
    this._protectionRadius = config.protectionRadius || 100;
    this._defenceMaxHealth = config.maxHealth || 200;
    this._repairRate = config.repairRate || 5; // Восстановление здоровья в секунду
    this._autoRepair = config.autoRepair !== false; // По умолчанию включено

    // Настраиваем поведение в зависимости от типа
    this.setupDefenceBehaviour();
    
    // Запускаем систему защиты
    this.startProtectionSystem();
  }

  private setupDefenceBehaviour(): void {
    // Настройки в зависимости от типа защиты
    switch (this._defenceType) {
      case 'wall':
        this.health = 300;
        this._defenceMaxHealth = 300;
        this._protectionRadius = 50;
        this.setTint(0x8b4513); // Коричневый
        this.setScale(1.5, 0.8); // Широкая стена
        break;
      
      case 'tower':
        this.health = 150;
        this._defenceMaxHealth = 150;
        this._protectionRadius = 120;
        this.setTint(0x696969); // Серый
        this.setScale(1.2, 1.5); // Высокая башня
        break;
      
      case 'shield':
        this.health = 100;
        this._defenceMaxHealth = 100;
        this._protectionRadius = 80;
        this.setTint(0x4169e1); // Синий
        this.setAlpha(0.7); // Полупрозрачный
        break;
      
      case 'barrier':
        this.health = 250;
        this._defenceMaxHealth = 250;
        this._protectionRadius = 60;
        this.setTint(0x2f4f4f); // Темно-серый
        this.setScale(1.3, 1.0);
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
    
    console.log(`Защитное сооружение восстановлено: ${oldHealth} → ${this.health}`);
    
    // Небольшая задержка перед следующим ремонтом
    this.scene.time.delayedCall(2000, () => {
      this._isRepairing = false;
    });
  }

  private playRepairEffect(): void {
    if (!this.scene) return;

    // Эффект восстановления - зеленые частицы
    for (let i = 0; i < 5; i++) {
      const particle = this.scene.add.circle(
        this.x + Phaser.Math.Between(-20, 20),
        this.y + Phaser.Math.Between(-20, 20),
        2, 0x00ff00
      );
      
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 30,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // Временное свечение
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

  private applyProtection(obj: GameObject): void {
    // Различные типы защиты
    switch (this._defenceType) {
      case 'wall':
        this.applyWallProtection(obj);
        break;
      
      case 'tower':
        this.applyTowerProtection(obj);
        break;
      
      case 'shield':
        this.applyShieldProtection(obj);
        break;
      
      case 'barrier':
        this.applyBarrierProtection(obj);
        break;
    }
  }

  private applyWallProtection(obj: GameObject): void {
    // Стена блокирует движение врагов
    if (obj instanceof GameObject && (obj as any).isEnemy) {
      const direction = new Phaser.Math.Vector2(
        obj.x - this.x,
        obj.y - this.y
      ).normalize();
      
      // Отталкиваем врага от стены
      obj.physicsBody.setVelocity(
        direction.x * 50,
        direction.y * 50
      );
    }
  }

  private applyTowerProtection(obj: GameObject): void {
    // Башня восстанавливает здоровье союзников
    if (obj instanceof GameObject && !(obj as any).isEnemy && obj.health < obj.maxHealth) {
      obj.health = Math.min(obj.health + 1, obj.maxHealth);
    }
  }

  private applyShieldProtection(obj: GameObject): void {
    // Щит уменьшает получаемый урон
    if (obj instanceof GameObject) {
      // Добавляем временную защиту (можно реализовать через модификаторы)
      obj.setAlpha(0.8); // Визуальный эффект защиты
    }
  }

  private applyBarrierProtection(obj: GameObject): void {
    // Барьер замедляет врагов
    if (obj instanceof GameObject && (obj as any).isEnemy) {
      obj.speed = obj.speed * 0.5; // Замедляем на 50%
    }
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

    // Эффект предупреждения о критическом состоянии
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.setAlpha(1);
      }
    });
  }

  // Геттеры
  get defenceType(): string { return this._defenceType; }
  get protectionRadius(): number { return this._protectionRadius; }
  override get maxHealth(): number { return this._defenceMaxHealth; }
  get repairRate(): number { return this._repairRate; }
  get autoRepair(): boolean { return this._autoRepair; }
  get isRepairing(): boolean { return this._isRepairing; }
  get protectedObjects(): GameObject[] { return this._protectedObjects; }

  // Сеттеры
  set defenceType(value: string) { 
    this._defenceType = value;
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
