import Phaser from 'phaser';
import { Enemy } from '../core/objects/Enemy';
import { ActionManager } from '../systems/actions/ActionManager';
import { GestureManager } from '../systems/gesture/GestureManager';
import { TextureManager } from '../core/TextureManager';
import { EnemySpawner } from '../core/EnemySpawner';

/**
 * Сцена для тестирования жестов с врагами
 */
export class GestureTestScene extends Phaser.Scene {
  private enemies: Enemy[] = [];
  private actionManager?: ActionManager;

  constructor() {
    super({ key: 'GestureTestScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    
    // Создаем все текстуры
    TextureManager.createAllTextures(this);
    
    // Создаем фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
    
    // Создаем всех врагов
    this.enemies = EnemySpawner.createAllEnemies(this);
    
    // Добавляем UI
    this.createUI();
    
    // Инициализируем менеджеры
    this.initializeManagers();
  }

  private createUI(): void {
    const { width, height } = this.scale;
    
    // Добавляем заголовок
    this.add.text(width / 2, 50, 'Тестирование жестов с врагами', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Добавляем инструкции
    this.add.text(width / 2, height - 50, 'Тапните по врагам для тестирования жестов', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  private initializeManagers(): void {
    // Создаем ActionManager
    this.actionManager = new ActionManager(this, this.enemies, []);
    
    // Создаем GestureManager с обработчиками событий
    new GestureManager(this, {
      onTap: (e) => {
        console.log(`Тап в позиции: (${e.phaserX}, ${e.phaserY})`);
        this.actionManager!.handleAction('tap', 'enemy', e.phaserX, e.phaserY);
      },
      onDoubleTap: (e) => {
        console.log(`Двойной тап в позиции: (${e.phaserX}, ${e.phaserY})`);
        this.actionManager!.handleAction('doubleTap', 'field', e.phaserX, e.phaserY);
      },
      onPress: (e) => {
        console.log(`Долгое нажатие в позиции: (${e.phaserX}, ${e.phaserY})`);
        this.actionManager!.handleAction('press', 'field', e.phaserX, e.phaserY);
      }
    });
  }

  override update(): void {
    // Обновляем состояние врагов
    this.enemies.forEach(enemy => {
      if (enemy && !enemy.isAlive) {
        // Удаляем мертвых врагов
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
          this.enemies.splice(index, 1);
        }
      }
    });

    // Обновляем списки объектов в ActionManager
    if (this.actionManager) {
      this.actionManager.updateObjects(this.enemies, []);
    }
  }
}