import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    const { width, height } = this.scale;
    
    // Адаптивные размеры шрифтов
    const titleFontSize = Math.min(width * 0.1, 36);
    const buttonFontSize = Math.min(width * 0.05, 18);
    const instructionFontSize = Math.min(width * 0.03, 12);
    
    // Заголовок
    this.add.text(width / 2, height * 0.15, 'Telepets', {
      fontFamily: 'Arial',
      fontSize: `${titleFontSize}px`,
      color: '#ffffff'
    }).setOrigin(0.5);

    // Кнопки меню с правильными отступами
    const buttonSpacing = height * 0.08;
    let currentY = height * 0.3;

    // Простая игра
    const simpleGame = this.add.text(width / 2, currentY, 'Простая игра', {
      fontFamily: 'Arial',
      fontSize: `${buttonFontSize}px`,
      color: '#22c55e'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    simpleGame.on('pointerup', () => {
      this.scene.start('Game');
    });

    currentY += buttonSpacing;

    // Игра с GameObject
    const advancedGame = this.add.text(width / 2, currentY, 'Игра с боем', {
      fontFamily: 'Arial',
      fontSize: `${buttonFontSize}px`,
      color: '#3b82f6'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    advancedGame.on('pointerup', () => {
      this.scene.start('GameWithGameObject');
    });

    currentY += buttonSpacing;

    // Тест жестов
    const gestureTest = this.add.text(width / 2, currentY, 'Тест жестов', {
      fontFamily: 'Arial',
      fontSize: `${buttonFontSize}px`,
      color: '#8b5cf6'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    gestureTest.on('pointerup', () => {
      this.scene.start('GestureTest');
    });

    // Инструкции с переносами строк
    const instructionY = height * 0.75;
    const instructionSpacing = height * 0.04;
    
    // Разбиваем длинные строки на части
    const instructions = [
      'Управление: Стрелки - движение, Пробел - атака',
      'Жесты: Тап - движение, Двойной тап - атака',
      'Свайп - толчок, Тест жестов - проверка объектов'
    ];

    instructions.forEach((instruction, index) => {
      this.add.text(width / 2, instructionY + (index * instructionSpacing), instruction, {
        fontFamily: 'Arial',
        fontSize: `${instructionFontSize}px`,
        color: '#9ca3af',
        align: 'center',
        wordWrap: { width: width * 0.9 }
      }).setOrigin(0.5);
    });
  }
}


