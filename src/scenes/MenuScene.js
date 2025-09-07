export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.scale;
        
        // Создаем фон
        this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
        
        // Заголовок
        this.add.text(width / 2, height / 3, 'Telepets Mini Games', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Подзаголовок
        this.add.text(width / 2, height / 3 + 60, 'Выберите сцену для тестирования', {
            fontSize: '24px',
            fill: '#bdc3c7'
        }).setOrigin(0.5);
        
        // Кнопка основной игры
        const gameButton = this.add.text(width / 2, height / 2, '🎮 Основная игра', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#3498db',
            padding: { x: 20, y: 15 }
        }).setOrigin(0.5).setInteractive();
        
        gameButton.on('pointerdown', () => {
            this.scene.start('GestureTestScene');
        });
        
        // Кнопка тестирования движения
        const movementButton = this.add.text(width / 2, height / 2 + 80, '🏃 Тест паттернов движения', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 20, y: 15 }
        }).setOrigin(0.5).setInteractive();
        
        movementButton.on('pointerdown', () => {
            this.scene.start('MovementTestScene');
        });
        
        // Инструкции
        this.add.text(width / 2, height - 50, 'Нажмите на кнопку для выбора сцены', {
            fontSize: '18px',
            fill: '#95a5a6'
        }).setOrigin(0.5);
        
        // Добавляем эффекты наведения
        [gameButton, movementButton].forEach(button => {
            button.on('pointerover', () => {
                button.setScale(1.05);
            });
            
            button.on('pointerout', () => {
                button.setScale(1);
            });
        });
    }
}
