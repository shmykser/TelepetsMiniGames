import { settings } from '../../config/settings.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.scale;
        
        // Определяем размеры для мобильных устройств
        const isMobile = width < 600 || height < 800;
        const isSmallMobile = width < 400 || height < 600;
        
        // Адаптивные размеры шрифтов
        const titleFontSize = isSmallMobile ? '28px' : (isMobile ? '36px' : '48px');
        const subtitleFontSize = isSmallMobile ? '16px' : (isMobile ? '20px' : '24px');
        const buttonFontSize = isSmallMobile ? '20px' : (isMobile ? '24px' : '32px');
        const instructionFontSize = isSmallMobile ? '14px' : (isMobile ? '16px' : '18px');
        
        // Адаптивные отступы
        const buttonPadding = isSmallMobile ? { x: 15, y: 10 } : (isMobile ? { x: 18, y: 12 } : { x: 20, y: 15 });
        const buttonSpacing = isSmallMobile ? 60 : (isMobile ? 70 : 80);
        
        // Создаем фон
        this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
        
        // Заголовок (адаптивная позиция)
        const titleY = isSmallMobile ? height * 0.25 : (isMobile ? height * 0.28 : height / 3);
        this.add.text(width / 2, titleY, 'Telepets Mini Games', {
            fontSize: titleFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // Подзаголовок (адаптивная позиция)
        const subtitleY = titleY + (isSmallMobile ? 40 : (isMobile ? 50 : 60));
        this.add.text(width / 2, subtitleY, 'Выберите сцену для тестирования', {
            fontSize: subtitleFontSize,
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);
        
        // Кнопка основной игры (адаптивная позиция)
        const buttonStartY = isSmallMobile ? height * 0.45 : (isMobile ? height * 0.47 : height / 2);
        const gameButton = this.add.text(width / 2, buttonStartY, '🎮 Основная игра', {
            fontSize: buttonFontSize,
            fill: '#ffffff',
            backgroundColor: '#3498db',
            padding: buttonPadding,
            align: 'center'
        }).setOrigin(0.5).setInteractive();
        
        gameButton.on('pointerdown', () => {
            this.scene.start('GestureTestScene');
        });
        
        // Кнопка тестирования движения (адаптивная позиция)
        const movementButton = this.add.text(width / 2, buttonStartY + buttonSpacing, '🏃 Тест паттернов движения', {
            fontSize: buttonFontSize,
            fill: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: buttonPadding,
            align: 'center'
        }).setOrigin(0.5).setInteractive();
        
        movementButton.on('pointerdown', () => {
            this.scene.start('MovementTestScene');
        });
        
        // Инструкции (адаптивная позиция)
        const instructionY = isSmallMobile ? height - 30 : (isMobile ? height - 40 : height - 50);
        this.add.text(width / 2, instructionY, 'Нажмите на кнопку для выбора сцены', {
            fontSize: instructionFontSize,
            fill: '#95a5a6',
            align: 'center'
        }).setOrigin(0.5);
        
        // Добавляем эффекты наведения (только для десктопа)
        if (!isMobile) {
            [gameButton, movementButton].forEach(button => {
                button.on('pointerover', () => {
                    button.setScale(1.05);
                });
                
                button.on('pointerout', () => {
                    button.setScale(1);
                });
            });
        }
        
        // Добавляем тактильную обратную связь для мобильных устройств
        if (isMobile) {
            [gameButton, movementButton].forEach(button => {
                button.on('pointerdown', () => {
                    button.setScale(0.95);
                    this.time.delayedCall(100, () => {
                        button.setScale(1);
                    });
                });
            });
        }
    }
}
