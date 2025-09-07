import { InsectMovementPatterns } from '../systems/movement/InsectMovementPatterns.js';

export class MovementTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MovementTestScene' });
        this.testObject = null;
        this.movementPattern = null;
        this.patterns = ['ant', 'fly', 'mosquito', 'spider', 'beetle', 'bee', 'butterfly', 'dragonfly'];
        this.currentPatternIndex = 0;
        this.patternText = null;
    }

    preload() {
        // Создаем простую текстуру для тестового объекта
        this.load.image('test-object', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        const { width, height } = this.scale;
        
        // Создаем тестовый объект
        this.testObject = this.add.circle(400, 300, 20, 0xff0000);
        this.testObject.setInteractive();
        
        // Добавляем эффект пульсации для привлечения внимания
        this.tweens.add({
            targets: this.testObject,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Создаем текст для отображения текущего паттерна
        this.patternText = this.add.text(10, 10, 'Insect: ant', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        
        // Создаем инструкции
        this.add.text(10, 50, 'Click anywhere, press SPACE, or use "Switch Pattern" button', {
            fontSize: '16px',
            fill: '#ffffff'
        });
        
        this.add.text(10, 70, 'Insect Patterns: ant, fly, mosquito, spider, beetle, bee, butterfly, dragonfly', {
            fontSize: '14px',
            fill: '#cccccc'
        });
        
        // Создаем кнопку для смены паттерна
        const switchButton = this.add.text(width - 150, height - 30, 'Switch Pattern', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#27ae60',
            padding: { x: 10, y: 5 }
        }).setInteractive();
        
        switchButton.on('pointerdown', () => {
            console.log('🔘 Switch button clicked');
            this.nextPattern();
        });
        
        // Создаем кнопку возврата в меню
        const backButton = this.add.text(10, height - 30, 'Back to Menu', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#34495e',
            padding: { x: 10, y: 5 }
        }).setInteractive();
        
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        // Инициализируем первый паттерн
        this.setPattern(this.patterns[0]);
        
        // Обработчик клика для смены паттерна
        this.input.on('pointerdown', (pointer) => {
            console.log('🖱️ Mouse clicked');
            this.nextPattern();
        });
        
        // Обработчик клавиатуры
        this.input.keyboard.on('keydown-SPACE', () => {
            console.log('⌨️ Space pressed');
            this.nextPattern();
        });
        
        // Обработчик для клика по тестовому объекту
        this.testObject.on('pointerdown', () => {
            this.nextPattern();
        });
    }

    update(time, delta) {
        if (!this.testObject || !this.movementPattern) return;
        
        // Обновляем паттерн движения
        const newPosition = this.movementPattern.update(
            this.testObject.x, 
            this.testObject.y, 
            this.testObject.x + 100, // targetX - простое смещение
            this.testObject.y + 50,  // targetY - простое смещение
            delta,
            {} // пустой контекст
        );
        
        // Отладочная информация (каждые 2 секунды)
        if (Math.floor(time / 2000) !== Math.floor((time - delta) / 2000)) {
        }
        
        // Применяем новую позицию
        this.testObject.setPosition(newPosition.x, newPosition.y);
        
        // Автоматическое переключение убрано - только ручное управление
        
        // Ограничиваем движение в пределах экрана
        this.constrainToScreen();
    }

    setPattern(patternType) {
        this.movementPattern = new InsectMovementPatterns(patternType);
        this.patternText.setText(`Insect: ${patternType}`);
    }

    nextPattern() {
        this.currentPatternIndex = (this.currentPatternIndex + 1) % this.patterns.length;
        this.setPattern(this.patterns[this.currentPatternIndex]);
    }

    constrainToScreen() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const radius = 20; // радиус круга
        
        // Ограничиваем движение в пределах экрана с учетом радиуса объекта
        if (this.testObject.x < radius) this.testObject.x = radius;
        if (this.testObject.x > width - radius) this.testObject.x = width - radius;
        if (this.testObject.y < radius) this.testObject.y = radius;
        if (this.testObject.y > height - radius) this.testObject.y = height - radius;
    }
}
