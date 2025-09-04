import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.text(width / 2, height * 0.25, 'Telepets', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Простая игра
    const simpleGame = this.add.text(width / 2, height * 0.45, 'Простая игра', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#22c55e'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    simpleGame.on('pointerup', () => {
      this.scene.start('Game');
    });

    // Игра с GameObject
    const advancedGame = this.add.text(width / 2, height * 0.45, 'Игра с боем', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#3b82f6'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    advancedGame.on('pointerup', () => {
      this.scene.start('GameWithGameObject');
    });

    // Игра с жестами
    const gestureGame = this.add.text(width / 2, height * 0.55, 'Игра с жестами', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#f59e0b'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    gestureGame.on('pointerup', () => {
      this.scene.start('GestureGame');
    });

    // Инструкции
    this.add.text(width / 2, height * 0.75, 'Управление: Стрелки - движение, Пробел - атака', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#9ca3af'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.8, 'Жесты: Тап - движение, Двойной тап - атака, Свайп - толчок', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#9ca3af'
    }).setOrigin(0.5);
  }
}


