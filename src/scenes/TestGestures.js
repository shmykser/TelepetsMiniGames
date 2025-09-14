/**
 * Сцена тестирования жестов с $1 Recognizer
 * Позволяет рисовать фигуры и распознавать их с помощью алгоритма $1
 */
import { DollarRecognizer, Point, Unistroke, Result } from '@/utils/dollar.js';

export class TestGestures extends Phaser.Scene {
    constructor() {
        super({ key: 'TestGestures' });
        
        // Инициализация $1 Recognizer
        this.dollarRecognizer = null;
        
        // Состояние рисования
        this.isDrawing = false;
        this.currentStroke = [];
        this.strokeGraphics = null;
        this.strokePoints = [];
        
        // UI элементы
        this.resultLabel = null;
        this.canvasArea = null;
        this.clearButton = null;
        this.instructionText = null;
    }

    create() {
        const { width, height } = this.scale;
        
        // Создаем фон
        this.createBackground();
        
        // Инициализируем $1 Recognizer
        this.initializeDollarRecognizer();
        
        // Создаем UI элементы
        this.createUI();
        
        // Создаем область для рисования
        this.createDrawingArea();
        
        // Настраиваем обработчики ввода
        this.setupInputHandlers();
    }

    createBackground() {
        // Создаем градиентный фон
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x2c3e50, 1);
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);
        
        // Добавляем статичную траву
        this.add.tileSprite(0, 0, this.scale.width, 200, 'grass')
            .setOrigin(0, 0)
            .setAlpha(0.2);
    }

    initializeDollarRecognizer() {
        // Создаем экземпляр $1 Recognizer
        this.dollarRecognizer = new DollarRecognizer();
        console.log('$1 Recognizer initialized with', this.dollarRecognizer.Unistrokes.length, 'gestures');
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Заголовок
        this.add.text(width / 2, 50, '🎨 Тест Жестов $1 Recognizer', {
            fontSize: '28px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0.5);
        
        // Лейбл для результата
        this.resultLabel = this.add.text(width / 2, 100, 'Нарисуйте фигуру на поле ниже', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5, 0.5);
        
        // Инструкции
        this.instructionText = this.add.text(width / 2, 140, 
            'Доступные фигуры: круг, треугольник, прямоугольник, звезда, стрелка, галочка, X, V', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        
        // Кнопка очистки
        this.clearButton = this.add.rectangle(width - 100, height - 80, 150, 50, 0xe74c3c)
            .setInteractive()
            .on('pointerdown', () => this.clearCanvas())
            .on('pointerover', () => this.clearButton.setAlpha(0.8))
            .on('pointerout', () => this.clearButton.setAlpha(1));
        
        this.add.text(width - 100, height - 80, 'Очистить', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        
        // Кнопка возврата в меню
        const menuButton = this.add.rectangle(100, height - 80, 150, 50, 0x2d5a27)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('MenuScene'))
            .on('pointerover', () => menuButton.setAlpha(0.8))
            .on('pointerout', () => menuButton.setAlpha(1));
        
        this.add.text(100, height - 80, '🏠 В меню', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0.5);
    }

    createDrawingArea() {
        const { width, height } = this.scale;
        
        // Создаем область для рисования (центр экрана)
        const canvasX = width / 2;
        const canvasY = height / 2 + 50;
        const canvasWidth = Math.min(width - 100, 500);
        const canvasHeight = Math.min(height - 300, 400);
        
        // Фон области рисования
        this.canvasArea = this.add.rectangle(canvasX, canvasY, canvasWidth, canvasHeight, 0x2c3e50)
            .setStrokeStyle(3, 0xffffff)
            .setInteractive();
        
        // Графика для отрисовки жестов
        this.strokeGraphics = this.add.graphics();
        this.strokeGraphics.setDepth(10);
        
        // Текст "Нарисуйте здесь"
        this.add.text(canvasX, canvasY, 'Нарисуйте здесь', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#7f8c8d',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        
        // Сохраняем границы области рисования
        this.canvasBounds = {
            x: canvasX - canvasWidth / 2,
            y: canvasY - canvasHeight / 2,
            width: canvasWidth,
            height: canvasHeight
        };
    }

    setupInputHandlers() {
        // Обработчики для мыши
        this.canvasArea.on('pointerdown', this.startDrawing, this);
        this.canvasArea.on('pointermove', this.draw, this);
        this.canvasArea.on('pointerup', this.stopDrawing, this);
        
        // Обработчики для тач-событий
        this.canvasArea.on('pointerdown', this.startDrawing, this);
        this.canvasArea.on('pointermove', this.draw, this);
        this.canvasArea.on('pointerup', this.stopDrawing, this);
    }

    startDrawing(pointer) {
        if (!this.isPointInCanvas(pointer.x, pointer.y)) return;
        
        this.isDrawing = true;
        this.currentStroke = [];
        this.strokePoints = [];
        
        // Очищаем предыдущий жест
        this.strokeGraphics.clear();
        
        // Начинаем новый штрих
        const point = new Point(pointer.x, pointer.y);
        this.currentStroke.push(point);
        this.strokePoints.push({ x: pointer.x, y: pointer.y });
        
        console.log('Начало рисования в точке:', pointer.x, pointer.y);
    }

    draw(pointer) {
        if (!this.isDrawing || !this.isPointInCanvas(pointer.x, pointer.y)) return;
        
        // Добавляем точку в текущий штрих
        const point = new Point(pointer.x, pointer.y);
        this.currentStroke.push(point);
        this.strokePoints.push({ x: pointer.x, y: pointer.y });
        
        // Рисуем линию от предыдущей точки
        if (this.currentStroke.length > 1) {
            const prevPoint = this.currentStroke[this.currentStroke.length - 2];
            this.strokeGraphics.lineStyle(3, 0xffffff, 1);
            this.strokeGraphics.beginPath();
            this.strokeGraphics.moveTo(prevPoint.X, prevPoint.Y);
            this.strokeGraphics.lineTo(point.X, point.Y);
            this.strokeGraphics.strokePath();
        }
    }

    stopDrawing(pointer) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // Завершаем штрих
        if (this.currentStroke.length > 0) {
            const point = new Point(pointer.x, pointer.y);
            this.currentStroke.push(point);
            this.strokePoints.push({ x: pointer.x, y: pointer.y });
        }
        
        console.log('Завершение рисования. Точек:', this.currentStroke.length);
        
        // Распознаем жест
        if (this.currentStroke.length >= 10) { // Минимум точек для распознавания
            this.recognizeGesture();
        } else {
            this.updateResult('Слишком короткий жест. Нарисуйте более длинную фигуру.', '#e74c3c');
        }
    }

    recognizeGesture() {
        try {
            // Преобразуем точки в формат $1 Recognizer
            const points = this.currentStroke.map(point => new Point(point.X, point.Y));
            
            // Распознаем жест
            const result = this.dollarRecognizer.Recognize(points, false); // false = используем Golden Section Search
            
            console.log('Результат распознавания:', result);
            
            if (result.Score > 0.6) { // Порог уверенности
                this.updateResult(
                    `Распознано: ${this.translateGestureName(result.Name)} (${Math.round(result.Score * 100)}%)`,
                    '#27ae60'
                );
                
                // Добавляем анимацию успеха
                this.playSuccessAnimation();
            } else {
                this.updateResult(
                    `Не удалось распознать жест (${Math.round(result.Score * 100)}%)`,
                    '#e74c3c'
                );
            }
        } catch (error) {
            console.error('Ошибка распознавания:', error);
            this.updateResult('Ошибка распознавания жеста', '#e74c3c');
        }
    }

    translateGestureName(englishName) {
        const translations = {
            'triangle': 'Треугольник',
            'circle': 'Круг',
            'rectangle': 'Прямоугольник',
            'star': 'Звезда',
            'arrow': 'Стрелка',
            'check': 'Галочка',
            'x': 'X',
            'v': 'V',
            'caret': 'Домик',
            'zig-zag': 'Зигзаг',
            'left square bracket': 'Левая скобка',
            'right square bracket': 'Правая скобка',
            'delete': 'Удалить',
            'left curly brace': 'Левая фигурная скобка',
            'right curly brace': 'Правая фигурная скобка',
            'pigtail': 'Хвостик'
        };
        
        return translations[englishName] || englishName;
    }

    updateResult(text, color = '#ffffff') {
        this.resultLabel.setText(text);
        this.resultLabel.setStyle({ fill: color });
    }

    playSuccessAnimation() {
        // Анимация успешного распознавания
        this.tweens.add({
            targets: this.resultLabel,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true,
            ease: 'Power2.easeInOut'
        });
        
        // Эффект свечения для области рисования
        this.tweens.add({
            targets: this.canvasArea,
            alpha: 0.7,
            duration: 200,
            yoyo: true,
            ease: 'Power2.easeInOut'
        });
    }

    clearCanvas() {
        // Очищаем графику
        this.strokeGraphics.clear();
        
        // Сбрасываем состояние
        this.currentStroke = [];
        this.strokePoints = [];
        this.isDrawing = false;
        
        // Сбрасываем результат
        this.updateResult('Нарисуйте фигуру на поле ниже', '#ffffff');
        
        console.log('Холст очищен');
    }

    isPointInCanvas(x, y) {
        return x >= this.canvasBounds.x && 
               x <= this.canvasBounds.x + this.canvasBounds.width &&
               y >= this.canvasBounds.y && 
               y <= this.canvasBounds.y + this.canvasBounds.height;
    }

    update() {
        // Обновление сцены (если необходимо)
    }

    destroy() {
        // Очистка ресурсов
        if (this.strokeGraphics) {
            this.strokeGraphics.destroy();
        }
    }
}
