import Phaser from 'phaser';
import { GestureManager } from '../systems/gesture/GestureManager';
import { GestureActionManager } from '../systems/gesture/GestureActionManager';
import { Egg } from '../core/objects/Egg';
import { Enemy } from '../core/objects/Enemy';
import { Defence } from '../core/objects/Defence';
// import { enemyTypes } from '../core/types/enemyTypes';
// import { defenceTypes } from '../core/types/defenceTypes';

/**
 * Сцена для тестирования системы действий по жестам
 */
export class GestureActionScene extends Phaser.Scene {
  private gestureManager!: GestureManager;
  private actionManager!: GestureActionManager;
  
  // Игровые объекты
  private egg!: Egg;
  private enemies: Enemy[] = [];
  private defences: Defence[] = [];
  
  // UI элементы
  private actionLabel!: Phaser.GameObjects.Text;
  private resultLabel!: Phaser.GameObjects.Text;
  private instructionLabel!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GestureActionScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    
    // Создаем фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
    
    // Создаем игровые объекты
    this.createGameObjects();
    
    // Создаем UI
    this.createUI();
    
    // Настраиваем систему жестов и действий
    this.setupGestureSystem();
    
    // Добавляем инструкции
    this.addInstructions();
  }

  private createGameObjects(): void {
    const { width, height } = this.scale;
    
    // Создаем яйцо в центре
    this.egg = new Egg(this, {
      x: width / 2,
      y: height / 2,
      texture: 'egg',
      health: 100,
      damage: 0,
      speed: 0,
      cooldown: 0
    });

    // Создаем несколько врагов
    const enemyConfigs = [
      { x: 200, y: 200, type: 'ant' as const },
      { x: width - 200, y: 200, type: 'beetle' as const },
      { x: 200, y: height - 200, type: 'rhinoceros' as const },
      { x: width - 200, y: height - 200, type: 'mosquito' as const }
    ];

    enemyConfigs.forEach(config => {
      const enemy = new Enemy(this, {
        x: config.x,
        y: config.y,
        texture: 'enemy',
        enemyType: config.type,
        health: 50,
        damage: 10,
        speed: 100,
        cooldown: 1000
      });
      this.enemies.push(enemy);
    });

    // Создаем несколько защитных объектов
    const defenceConfigs = [
      { x: 300, y: 300, type: 'pit' as const },
      { x: width - 300, y: 300, type: 'stone' as const },
      { x: 300, y: height - 300, type: 'crack' as const }
    ];

    defenceConfigs.forEach(config => {
      const defence = new Defence(this, {
        x: config.x,
        y: config.y,
        texture: 'defence',
        defenceType: config.type,
        protectionRadius: 25,
        health: 100,
        damage: 0,
        speed: 0,
        cooldown: 0
      });
      this.defences.push(defence);
    });
  }

  private createUI(): void {
    const { width } = this.scale;
    
    // Лейбл для текущего действия
    this.actionLabel = this.add.text(width / 2, 50, 'Действие: -', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Лейбл для результата действия
    this.resultLabel = this.add.text(width / 2, 80, 'Результат: -', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Лейбл для инструкций
    this.instructionLabel = this.add.text(width / 2, 110, '', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  private setupGestureSystem(): void {
    // Создаем менеджер действий
    this.actionManager = new GestureActionManager(this);
    this.actionManager.setGameObjects(this.enemies, this.defences, this.egg);

    // Создаем менеджер жестов
    this.gestureManager = new GestureManager(this, {
      onTap: this.handleTap.bind(this),
      onDoubleTap: this.handleDoubleTap.bind(this),
      onPress: this.handlePress.bind(this),
      onSwipe: this.handleSwipe.bind(this),
      onPan: this.handlePan.bind(this),
      onPinch: this.handlePinch.bind(this),
      onRotate: this.handleRotate.bind(this)
    });

    // Связываем менеджеры
    this.gestureManager.setActionManager(this.actionManager);
  }

  private addInstructions(): void {
    const instructions = [
      'Жесты по врагу:',
      '• Тап = урон (10)',
      '',
      'Жесты по защите:',
      '• Долгий тап по яме = увеличить',
      '',
      'Жесты по полю:',
      '• Долгий тап = установить яму',
      '• Двойной тап = установить сахар'
    ];

    this.instructionLabel.setText(instructions.join('\n'));
  }

  private handleTap(e: any): void {
    this.executeGestureAction('tap', e.phaserX, e.phaserY);
  }

  private handleDoubleTap(e: any): void {
    this.executeGestureAction('doubleTap', e.phaserX, e.phaserY);
  }

  private handlePress(e: any): void {
    this.executeGestureAction('press', e.phaserX, e.phaserY);
  }

  private handleSwipe(e: any): void {
    this.executeGestureAction('swipe', e.phaserX, e.phaserY);
  }

  private handlePan(e: any): void {
    this.executeGestureAction('pan', e.phaserX, e.phaserY);
  }

  private handlePinch(e: any): void {
    this.executeGestureAction('pinch', e.phaserX, e.phaserY);
  }

  private handleRotate(e: any): void {
    this.executeGestureAction('rotate', e.phaserX, e.phaserY);
  }

  private executeGestureAction(gesture: string, x: number, y: number): void {
    // Обновляем лейбл действия
    this.actionLabel.setText(`Действие: ${gesture} в (${Math.round(x)}, ${Math.round(y)})`);

    // Выполняем действие
    const result = this.actionManager.handleGesture(gesture as any, x, y);

    // Обновляем лейбл результата
    if (result.success) {
      this.resultLabel.setText(`Результат: ✅ ${result.message}`);
      this.resultLabel.setColor('#2ecc71');
    } else {
      this.resultLabel.setText(`Результат: ❌ ${result.message}`);
      this.resultLabel.setColor('#e74c3c');
    }

    // Логируем результат
    console.log(`Gesture: ${gesture}`, result);
  }

  override update(): void {
    // Обновляем состояние объектов
    this.enemies.forEach(enemy => {
      if (enemy && !enemy.isAlive) {
        // Удаляем мертвых врагов
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
          this.enemies.splice(index, 1);
        }
      }
    });
  }

  destroy(): void {
    if (this.gestureManager) {
      this.gestureManager.destroy();
    }
  }
}
