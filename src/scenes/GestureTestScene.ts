import Phaser from 'phaser';

/**
 * Пустая сцена для тестирования жестов
 */
export class GestureTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GestureTestScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    
    // Создаем фон
    this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
    
    // Добавляем заголовок
    this.add.text(width / 2, height / 2, 'Пустая сцена для тестирования жестов', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
  }
}