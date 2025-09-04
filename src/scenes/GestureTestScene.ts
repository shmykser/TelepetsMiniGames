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
    // Создаем детализированные текстуры для каждого типа врага
    this.createAntTexture();
    this.createBeetleTexture();
    this.createRhinocerosTexture();
    this.createMosquitoTexture();
    this.createSpiderTexture();
    this.createFlyTexture();
    
    // Создаем анимированные версии для движения
    this.createAnimatedTextures();
  }

  private createAnimatedTextures(): void {
    // Создаем анимированные текстуры для движения лапок
    this.createAntWalkAnimation();
    this.createBeetleWalkAnimation();
    this.createSpiderWalkAnimation();
    this.createFlyHoverAnimation();
  }

  private createAntWalkAnimation(): void {
    // Создаем 4 кадра анимации ходьбы муравья
    for (let frame = 0; frame < 4; frame++) {
      const graphics = this.add.graphics();
      
      // Тело муравья (3 сегмента)
      graphics.fillStyle(0x8B4513);
      
      // Голова
      graphics.fillCircle(8, 8, 6);
      
      // Средний сегмент
      graphics.fillEllipse(16, 8, 8, 6);
      
      // Задний сегмент
      graphics.fillEllipse(22, 8, 6, 5);
      
      // Анимированные лапки
      graphics.lineStyle(2, 0x654321);
      const legOffset = Math.sin(frame * Math.PI / 2) * 2; // Анимация движения лапок
      
      // Передние лапки
      graphics.lineBetween(6, 6, 4 + legOffset, 10);
      graphics.lineBetween(10, 6, 12 - legOffset, 10);
      // Средние лапки
      graphics.lineBetween(14, 6, 12 + legOffset, 12);
      graphics.lineBetween(18, 6, 20 - legOffset, 12);
      // Задние лапки
      graphics.lineBetween(20, 6, 18 - legOffset, 12);
      graphics.lineBetween(24, 6, 26 + legOffset, 12);
      
      // Антенны
      graphics.lineStyle(1, 0x654321);
      graphics.lineBetween(6, 4, 4, 2);
      graphics.lineBetween(10, 4, 12, 2);
      
      graphics.generateTexture(`ant_walk_${frame}`, 32, 16);
      graphics.destroy();
    }
  }

  private createBeetleWalkAnimation(): void {
    for (let frame = 0; frame < 4; frame++) {
      const graphics = this.add.graphics();
      
      // Тело жука
      graphics.fillStyle(0x2F4F4F);
      graphics.fillEllipse(16, 12, 20, 12);
      
      // Надкрылья
      graphics.fillStyle(0x1C3A3A);
      graphics.fillEllipse(14, 8, 8, 8);
      graphics.fillEllipse(18, 8, 8, 8);
      
      // Анимированные лапки
      graphics.lineStyle(2, 0x1C3A3A);
      const legOffset = Math.sin(frame * Math.PI / 2) * 1.5;
      
      graphics.lineBetween(8, 10, 6 + legOffset, 14);
      graphics.lineBetween(12, 10, 10 - legOffset, 16);
      graphics.lineBetween(20, 10, 22 + legOffset, 16);
      graphics.lineBetween(24, 10, 26 - legOffset, 14);
      
      graphics.generateTexture(`beetle_walk_${frame}`, 32, 20);
      graphics.destroy();
    }
  }

  private createSpiderWalkAnimation(): void {
    for (let frame = 0; frame < 4; frame++) {
      const graphics = this.add.graphics();
      
      // Тело паука
      graphics.fillStyle(0x000000);
      graphics.fillCircle(16, 12, 8);
      
      // Голова
      graphics.fillCircle(16, 6, 4);
      
      // Анимированные лапки
      graphics.lineStyle(2, 0x000000);
      const legOffset = Math.sin(frame * Math.PI / 2) * 2;
      
      // Передние лапки
      graphics.lineBetween(12, 8, 8 + legOffset, 4);
      graphics.lineBetween(20, 8, 24 - legOffset, 4);
      // Вторые лапки
      graphics.lineBetween(10, 10, 6 + legOffset, 6);
      graphics.lineBetween(22, 10, 26 - legOffset, 6);
      // Третьи лапки
      graphics.lineBetween(10, 14, 6 - legOffset, 18);
      graphics.lineBetween(22, 14, 26 + legOffset, 18);
      // Задние лапки
      graphics.lineBetween(12, 16, 8 - legOffset, 20);
      graphics.lineBetween(20, 16, 24 + legOffset, 20);
      
      graphics.generateTexture(`spider_walk_${frame}`, 32, 24);
      graphics.destroy();
    }
  }

  private createFlyHoverAnimation(): void {
    for (let frame = 0; frame < 4; frame++) {
      const graphics = this.add.graphics();
      
      // Тело мухи
      graphics.fillStyle(0x808080);
      graphics.fillEllipse(16, 8, 6, 10);
      
      // Анимированные крылья
      graphics.fillStyle(0xA0A0A0, 0.6);
      const wingOffset = Math.sin(frame * Math.PI / 2) * 0.5;
      graphics.fillEllipse(12, 6 + wingOffset, 8, 6);
      graphics.fillEllipse(20, 6 - wingOffset, 8, 6);
      
      // Глаза
      graphics.fillStyle(0xFF0000);
      graphics.fillCircle(14, 4, 2);
      graphics.fillCircle(18, 4, 2);
      
      // Лапки
      graphics.lineStyle(1, 0x808080);
      graphics.lineBetween(13, 10, 11, 14);
      graphics.lineBetween(19, 10, 21, 14);
      graphics.lineBetween(14, 12, 12, 16);
      graphics.lineBetween(18, 12, 20, 16);
      
      graphics.generateTexture(`fly_hover_${frame}`, 32, 18);
      graphics.destroy();
    }
  }

  private createAntTexture(): void {
    const graphics = this.add.graphics();
    
    // Тело муравья (3 сегмента)
    graphics.fillStyle(0x8B4513); // Коричневый
    
    // Голова
    graphics.fillCircle(8, 8, 6);
    
    // Средний сегмент
    graphics.fillEllipse(16, 8, 8, 6);
    
    // Задний сегмент
    graphics.fillEllipse(22, 8, 6, 5);
    
    // Лапки (6 штук)
    graphics.lineStyle(2, 0x654321);
    // Передние лапки
    graphics.lineBetween(6, 6, 4, 10);
    graphics.lineBetween(10, 6, 12, 10);
    // Средние лапки
    graphics.lineBetween(14, 6, 12, 12);
    graphics.lineBetween(18, 6, 20, 12);
    // Задние лапки
    graphics.lineBetween(20, 6, 18, 12);
    graphics.lineBetween(24, 6, 26, 12);
    
    // Антенны
    graphics.lineStyle(1, 0x654321);
    graphics.lineBetween(6, 4, 4, 2);
    graphics.lineBetween(10, 4, 12, 2);
    
    graphics.generateTexture('ant', 32, 16);
    graphics.destroy();
  }

  private createBeetleTexture(): void {
    const graphics = this.add.graphics();
    
    // Тело жука
    graphics.fillStyle(0x2F4F4F); // Темно-серый
    graphics.fillEllipse(16, 12, 20, 12);
    
    // Надкрылья
    graphics.fillStyle(0x1C3A3A);
    graphics.fillEllipse(14, 8, 8, 8);
    graphics.fillEllipse(18, 8, 8, 8);
    
    // Лапки
    graphics.lineStyle(2, 0x1C3A3A);
    graphics.lineBetween(8, 10, 6, 14);
    graphics.lineBetween(12, 10, 10, 16);
    graphics.lineBetween(20, 10, 22, 16);
    graphics.lineBetween(24, 10, 26, 14);
    
    graphics.generateTexture('beetle', 32, 20);
    graphics.destroy();
  }

  private createRhinocerosTexture(): void {
    const graphics = this.add.graphics();
    
    // Тело носорога
    graphics.fillStyle(0x4A4A4A); // Серый
    graphics.fillEllipse(16, 14, 24, 16);
    
    // Рог
    graphics.fillStyle(0x696969);
    graphics.fillTriangle(16, 6, 14, 10, 18, 10);
    
    // Лапки
    graphics.fillStyle(0x3A3A3A);
    graphics.fillRect(10, 18, 4, 8);
    graphics.fillRect(18, 18, 4, 8);
    graphics.fillRect(12, 20, 3, 6);
    graphics.fillRect(20, 20, 3, 6);
    
    graphics.generateTexture('rhinoceros', 32, 28);
    graphics.destroy();
  }

  private createMosquitoTexture(): void {
    const graphics = this.add.graphics();
    
    // Тело комара
    graphics.fillStyle(0x696969); // Серый
    graphics.fillEllipse(16, 8, 4, 12);
    
    // Крылья
    graphics.fillStyle(0x808080, 0.7);
    graphics.fillEllipse(12, 6, 6, 4);
    graphics.fillEllipse(20, 6, 6, 4);
    
    // Лапки
    graphics.lineStyle(1, 0x696969);
    graphics.lineBetween(14, 10, 12, 14);
    graphics.lineBetween(18, 10, 20, 14);
    graphics.lineBetween(15, 12, 13, 16);
    graphics.lineBetween(17, 12, 19, 16);
    
    // Хоботок
    graphics.lineStyle(2, 0x8B4513);
    graphics.lineBetween(16, 2, 16, 0);
    
    graphics.generateTexture('mosquito', 32, 18);
    graphics.destroy();
  }

  private createSpiderTexture(): void {
    const graphics = this.add.graphics();
    
    // Тело паука
    graphics.fillStyle(0x000000); // Черный
    graphics.fillCircle(16, 12, 8);
    
    // Голова
    graphics.fillCircle(16, 6, 4);
    
    // Лапки (8 штук)
    graphics.lineStyle(2, 0x000000);
    // Передние лапки
    graphics.lineBetween(12, 8, 8, 4);
    graphics.lineBetween(20, 8, 24, 4);
    // Вторые лапки
    graphics.lineBetween(10, 10, 6, 6);
    graphics.lineBetween(22, 10, 26, 6);
    // Третьи лапки
    graphics.lineBetween(10, 14, 6, 18);
    graphics.lineBetween(22, 14, 26, 18);
    // Задние лапки
    graphics.lineBetween(12, 16, 8, 20);
    graphics.lineBetween(20, 16, 24, 20);
    
    graphics.generateTexture('spider', 32, 24);
    graphics.destroy();
  }

  private createFlyTexture(): void {
    const graphics = this.add.graphics();
    
    // Тело мухи
    graphics.fillStyle(0x808080); // Серый
    graphics.fillEllipse(16, 8, 6, 10);
    
    // Крылья
    graphics.fillStyle(0xA0A0A0, 0.6);
    graphics.fillEllipse(12, 6, 8, 6);
    graphics.fillEllipse(20, 6, 8, 6);
    
    // Глаза
    graphics.fillStyle(0xFF0000);
    graphics.fillCircle(14, 4, 2);
    graphics.fillCircle(18, 4, 2);
    
    // Лапки
    graphics.lineStyle(1, 0x808080);
    graphics.lineBetween(13, 10, 11, 14);
    graphics.lineBetween(19, 10, 21, 14);
    graphics.lineBetween(14, 12, 12, 16);
    graphics.lineBetween(18, 12, 20, 16);
    
    graphics.generateTexture('fly', 32, 18);
    graphics.destroy();
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