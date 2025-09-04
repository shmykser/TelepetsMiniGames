import Phaser from 'phaser';
import { Enemy } from '../core/objects/Enemy';

/**
 * Сцена для тестирования жестов с врагами
 */
export class GestureTestScene extends Phaser.Scene {
  private enemies: Enemy[] = [];

  constructor() {
    super({ key: 'GestureTestScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    
    // Создаем простые геометрические текстуры для врагов
    this.createTextures();
    
    // Создаем фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
    
    // Создаем врагов
    this.createEnemies();
    
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

  private createTextures(): void {
    // Создаем простые текстуры со смайликами
    this.createEmojiTextures();
  }

  private createEmojiTextures(): void {
    // Создаем простые текстуры со смайликами для всех объектов
    this.createEmojiTexture('🥚', 'egg');
    this.createEmojiTexture('🕷️', 'spider');
    this.createEmojiTexture('🐞', 'beetle');
    this.createEmojiTexture('🐜', 'ant');
    this.createEmojiTexture('🦏', 'rhinoceros');
    this.createEmojiTexture('🦋', 'fly');
    this.createEmojiTexture('🦟', 'mosquito');
    
    // Создаем текстуры для защитных объектов
    this.createEmojiTexture('🍯', 'sugar'); // Сахар
    this.createEmojiTexture('🪨', 'stone'); // Камень
    this.createEmojiTexture('⚡', 'crack'); // Трещина/молния
    this.createEmojiTexture('🔺', 'spikes'); // Шипы
    this.createEmojiTexture('🥒', 'madCucumber'); // Бешеный огурец
    this.createEmojiTexture('🕳️', 'pit'); // Яма
  }

  private createEmojiTexture(emoji: string, textureKey: string): void {
    // Создаем RenderTexture для рендеринга эмодзи
    const renderTexture = this.add.renderTexture(0, 0, 64, 64);
    
    // Создаем текстовый объект с эмодзи
    const text = this.add.text(32, 32, emoji, {
      fontSize: '48px',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Рендерим текст в текстуру
    renderTexture.draw(text);
    
    // Сохраняем как текстуру
    renderTexture.saveTexture(textureKey);
    
    // Очищаем
    text.destroy();
    renderTexture.destroy();
  }

  private createEnemies(): void {
    const { width, height } = this.scale;
    
    // Создаем несколько врагов разных типов
    const enemyConfigs = [
      { x: 200, y: 200, type: 'ant' as const },
      { x: width - 200, y: 200, type: 'beetle' as const },
      { x: 200, y: height - 200, type: 'rhinoceros' as const },
      { x: width - 200, y: height - 200, type: 'mosquito' as const },
      { x: width / 2, y: 150, type: 'spider' as const },
      { x: width / 2, y: height - 150, type: 'fly' as const }
    ];

    enemyConfigs.forEach(config => {
      const enemy = new Enemy(this, {
        x: config.x,
        y: config.y,
        texture: config.type, // Используем текстуру соответствующую типу врага
        enemyType: config.type,
        health: 50,
        damage: 10,
        speed: 100,
        cooldown: 1000
      });
      
      // Устанавливаем размер для смайликов
      enemy.setScale(1.5);
      
      this.enemies.push(enemy);
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
  }
}