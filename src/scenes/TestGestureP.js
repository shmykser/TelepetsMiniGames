/**
 * Сцена тестирования рисования с распознаванием жестов через $P
 * Позволяет рисовать фигуры и распознавать их с помощью $P Recognizer
 */
import { PDollarRecognizer, Point } from '@/utils/pdollar.js';

export class TestGestureP extends Phaser.Scene {
    constructor() {
        super({ key: 'TestGestureP' });
        
        // Инициализация $P распознавателя
        this.recognizer = null;
        
        // Состояние рисования
        this.isDrawing = false;
        this.strokeGraphics = null;
        this.lastPoint = null;
        this.drawingPoints = []; // Точки для распознавания
        
        // UI элементы
        this.clearButton = null;
        this.resultText = null;
    }

    create() {
        const { width, height } = this.scale;
        
        // Создаем фон
        this.createBackground();
        
        // Инициализируем $P распознаватель
        this.initializeRecognizer();
        
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
        graphics.fillGradientStyle(0x2c3e50, 0x34495e, 0x3498db, 0x2980b9, 1);
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);
        
        // Добавляем статичную траву
        this.add.tileSprite(0, 0, this.scale.width, 200, 'grass')
            .setOrigin(0, 0)
            .setAlpha(0.2);
    }

    initializeRecognizer() {
        // Создаем экземпляр $P распознавателя
        this.recognizer = new PDollarRecognizer();
        
        // Добавляем кастомные жесты
        this.addCustomGestures();
        
        console.log('$P Recognizer initialized with', this.recognizer.PointClouds.length, 'gestures');
        
        // Выводим список доступных жестов
        const gestureNames = this.recognizer.PointClouds.map(cloud => cloud.Name);
        console.log('Available gestures:', gestureNames.join(', '));
    }

    addCustomGestures() {
        // Создаем шаблон круга
        const circlePoints = this.createCircleTemplate();
        this.recognizer.AddGesture("circle", circlePoints);
        
        // Создаем шаблон треугольника
        const trianglePoints = this.createTriangleTemplate();
        this.recognizer.AddGesture("triangle", trianglePoints);
        
        // Создаем шаблоны линий под разными углами
        this.addLineTemplates();
        
        console.log('Added custom gestures: circle, triangle, improved lines');
    }

    createCircleTemplate() {
        // Создаем круг для $P
        const centerX = 50;
        const centerY = 50;
        const radius = 25;
        const numPoints = 40;
        
        const points = [];
        
        // Создаем круг из одного штриха (ID = 1)
        for (let i = 0; i <= numPoints; i++) {
            const angle = (2 * Math.PI * i) / numPoints;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            points.push(new Point(x, y, 1));
        }
        
        return points;
    }

    createTriangleTemplate() {
        // Создаем равносторонний треугольник для $P
        const centerX = 50;
        const centerY = 50;
        const radius = 30;
        
        const points = [];
        
        // Вычисляем вершины треугольника
        const topX = centerX;
        const topY = centerY - radius;
        const leftX = centerX - radius * Math.cos(Math.PI/6);
        const leftY = centerY + radius * Math.sin(Math.PI/6);
        const rightX = centerX + radius * Math.cos(Math.PI/6);
        const rightY = centerY + radius * Math.sin(Math.PI/6);
        
        // Штрих 1: левая сторона
        points.push(new Point(topX, topY, 1));
        points.push(new Point(leftX, leftY, 1));
        
        // Штрих 2: правая сторона
        points.push(new Point(leftX, leftY, 2));
        points.push(new Point(rightX, rightY, 2));
        
        // Штрих 3: верхняя сторона
        points.push(new Point(rightX, rightY, 3));
        points.push(new Point(topX, topY, 3));
        
        return points;
    }

    addLineTemplates() {
        // Создаем шаблоны линий под разными углами (каждые 30 градусов)
        for (let angle = 0; angle < 180; angle += 30) {
            const linePoints = this.createLineTemplate(angle);
            this.recognizer.AddGesture("line", linePoints);
        }
        
        console.log('Added line templates for angles: 0°, 30°, 60°, 90°, 120°, 150°');
    }

    createLineTemplate(angleDegrees) {
        const centerX = 50;
        const centerY = 50;
        const length = 40;
        const numPoints = 20;
        
        const points = [];
        const angleRad = (angleDegrees * Math.PI) / 180;
        
        // Создаем линию под заданным углом
        for (let i = 0; i <= numPoints; i++) {
            const t = (i / numPoints) - 0.5; // от -0.5 до 0.5
            const x = centerX + t * length * Math.cos(angleRad);
            const y = centerY + t * length * Math.sin(angleRad);
            points.push(new Point(x, y, 1));
        }
        
        return points;
    }

    createUI() {
        const { width, height } = this.scale;
        
        // Заголовок
        this.add.text(width / 2, 50, '🎨 Тест Рисования с $P', {
            fontSize: '28px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0.5);
        
        // Инструкции
        this.add.text(width / 2, 90, 'Рисуйте жесты: T, N, D, P, X, H, I, !, line, star, circle, triangle, arrow, null', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        
        // Результат распознавания
        this.resultText = this.add.text(width / 2, 120, 'Нарисуйте жест на поле ниже', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center',
            backgroundColor: '#2c3e50',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5, 0.5);
        
        // Кнопка очистки
        this.clearButton = this.add.rectangle(width - 100, height - 80, 150, 50, 0xe74c3c)
            .setInteractive()
            .on('pointerdown', () => this.clearCanvas())
            .on('pointerover', () => this.clearButton.setAlpha(0.8))
            .on('pointerout', () => this.clearButton.setAlpha(1));
            
        this.add.text(width - 100, height - 80, 'Очистить', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);
    }

    createDrawingArea() {
        const { width, height } = this.scale;
        
        // Область для рисования
        this.canvasArea = this.add.rectangle(width / 2, height / 2 + 50, width - 100, height - 300, 0xffffff)
            .setInteractive()
            .setStrokeStyle(3, 0x000000);
            
        // Графический объект для рисования
        this.strokeGraphics = this.add.graphics();
        
        // Границы области рисования
        this.canvasBounds = {
            x: this.canvasArea.x - this.canvasArea.width / 2,
            y: this.canvasArea.y - this.canvasArea.height / 2,
            width: this.canvasArea.width,
            height: this.canvasArea.height
        };
    }

    setupInputHandlers() {
        // Настраиваем обработчики для рисования
        this.canvasArea.on('pointerdown', this.startDrawing, this);
        this.canvasArea.on('pointermove', this.draw, this);
        this.canvasArea.on('pointerup', this.stopDrawing, this);
    }

    startDrawing(pointer) {
        if (!this.isPointInCanvas(pointer.x, pointer.y)) return;
        
        this.isDrawing = true;
        this.lastPoint = { x: pointer.x, y: pointer.y };
        this.drawingPoints = []; // Сбрасываем точки для нового жеста
        
        // Очищаем предыдущий рисунок
        this.strokeGraphics.clear();
        
        // Сбрасываем результат
        this.resultText.setText('Рисую...');
        this.resultText.setStyle({ fill: '#f39c12' });
        
        console.log('Начало рисования в точке:', pointer.x, pointer.y);
    }

    draw(pointer) {
        if (!this.isDrawing || !this.isPointInCanvas(pointer.x, pointer.y)) return;
        
        // Рисуем линию от предыдущей точки
        if (this.lastPoint) {
            this.strokeGraphics.lineStyle(3, 0x2c3e50, 1);
            this.strokeGraphics.beginPath();
            this.strokeGraphics.moveTo(this.lastPoint.x, this.lastPoint.y);
            this.strokeGraphics.lineTo(pointer.x, pointer.y);
            this.strokeGraphics.strokePath();
        }
        
        // Добавляем точку для распознавания
        this.drawingPoints.push(new Point(pointer.x, pointer.y, 1));
        
        // Обновляем последнюю точку
        this.lastPoint = { x: pointer.x, y: pointer.y };
    }

    stopDrawing(pointer) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        // Добавляем последнюю точку
        if (pointer && this.isPointInCanvas(pointer.x, pointer.y)) {
            this.drawingPoints.push(new Point(pointer.x, pointer.y, 1));
        }
        
        // Распознаем жест, если нарисовано достаточно точек
        if (this.drawingPoints.length >= 5) {
            this.recognizeGesture();
        } else {
            this.resultText.setText('Слишком короткий жест. Нарисуйте более длинную фигуру.');
            this.resultText.setStyle({ fill: '#e74c3c' });
        }
        
        console.log('Завершение рисования. Точек:', this.drawingPoints.length);
    }

    recognizeGesture() {
        try {
            // Сначала проверяем, не является ли это линией
            if (this.isLikelyLine()) {
                this.resultText.setText('Распознано: Горизонтальная линия (100%)');
                this.resultText.setStyle({ fill: '#27ae60' });
                this.playSuccessAnimation();
                return;
            }
            
            // Распознаем жест с помощью $P
            const result = this.recognizer.Recognize(this.drawingPoints);
            
            console.log('Результат распознавания $P:', result);
            
            // Проверяем результат
            if (result.Name === 'No match.') {
                this.resultText.setText('Жест не распознан');
                this.resultText.setStyle({ fill: '#e74c3c' });
            } else if (result.Score > 0.6) { // Порог уверенности
                const gestureName = this.translateGestureName(result.Name);
                this.resultText.setText(`Распознано: ${gestureName} (${Math.round(result.Score * 100)}%)`);
                this.resultText.setStyle({ fill: '#27ae60' });
                
                // Анимация успеха
                this.playSuccessAnimation();
            } else {
                const gestureName = this.translateGestureName(result.Name);
                this.resultText.setText(`Возможно: ${gestureName} (${Math.round(result.Score * 100)}%)`);
                this.resultText.setStyle({ fill: '#f39c12' });
            }
        } catch (error) {
            console.error('Ошибка распознавания:', error);
            this.resultText.setText('Ошибка распознавания');
            this.resultText.setStyle({ fill: '#e74c3c' });
        }
    }

    isLikelyLine() {
        if (this.drawingPoints.length < 3) return false;
        
        // Находим крайние точки
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const point of this.drawingPoints) {
            minX = Math.min(minX, point.X);
            maxX = Math.max(maxX, point.X);
            minY = Math.min(minY, point.Y);
            maxY = Math.max(maxY, point.Y);
        }
        
        const width = maxX - minX;
        const height = maxY - minY;
        
        // Проверяем соотношение сторон
        const aspectRatio = Math.max(width, height) / Math.min(width, height);
        
        // Если одна сторона намного больше другой, это скорее всего линия
        return aspectRatio > 3;
    }

    translateGestureName(englishName) {
        const translations = {
            'circle': 'Круг',
            'triangle': 'Треугольник',
            'T': 'Буква T',
            'N': 'Буква N', 
            'D': 'Буква D',
            'P': 'Буква P',
            'X': 'Буква X',
            'H': 'Буква H',
            'I': 'Буква I',
            'exclamation': 'Восклицательный знак (!)',
            'line': 'Горизонтальная линия',
            'five-point star': 'Пятиконечная звезда',
            'six-point star': 'Шестиконечная звезда',
            'asterisk': 'Звездочка (*)',
            'null': 'Ноль (круг с точкой)',
            'arrowhead': 'Стрелка',
            'pitchfork': 'Вилы',
            'half-note': 'Половинная нота'
        };
        
        return translations[englishName] || englishName;
    }

    playSuccessAnimation() {
        // Простая анимация успеха
        this.tweens.add({
            targets: this.resultText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true,
            ease: 'Power2.easeInOut'
        });
    }

    clearCanvas() {
        // Очищаем графику
        this.strokeGraphics.clear();
        
        // Сбрасываем состояние
        this.isDrawing = false;
        this.lastPoint = null;
        this.drawingPoints = [];
        
        // Сбрасываем результат
        this.resultText.setText('Нарисуйте жест на поле ниже');
        this.resultText.setStyle({ fill: '#ffffff' });
        
        console.log('Холст очищен');
    }

    isPointInCanvas(x, y) {
        return x >= this.canvasBounds.x && 
               x <= this.canvasBounds.x + this.canvasBounds.width &&
               y >= this.canvasBounds.y && 
               y <= this.canvasBounds.y + this.canvasBounds.height;
    }
}
