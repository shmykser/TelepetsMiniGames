/**
 * Сцена взлома паттерн-замка
 * Мини-игра: соединить точки в правильном порядке без пересечений
 */

import { BaseLockScene } from './BaseLockScene.js';

export class PatternLockScene extends BaseLockScene {
    constructor() {
        super('PatternLockScene');
        
        // Элементы игры
        this.patternPoints = [];
        this.selectedPoints = [];
        this.lines = [];
        this.correctPattern = [];
    }
    
    /**
     * Создание сцены
     */
    create() {
        super.create();
        
        // Создаем базовый UI
        this.createBaseUI('🎯 ВЗЛОМ ПАТТЕРН-ЗАМКА');
        
        // Инструкция
        const { width } = this.scale;
        const instruction = this.add.text(width / 2, 180, 'Соедините точки в правильном порядке!\nКликайте по точкам последовательно', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
        
        // Создаем паттерн
        this.createPattern();
        
        // Игра активна
        this.isGameActive = true;
        
        console.log('🎯 [PatternLockScene] Игра начата');
    }
    
    /**
     * Создание паттерна
     */
    createPattern() {
        const { width, height } = this.scale;
        const points = this.config.points || 4;
        const gridSize = Math.ceil(Math.sqrt(points));
        const cellSize = 70;
        const patternWidth = gridSize * cellSize;
        const patternHeight = gridSize * cellSize;
        const startX = (width - patternWidth) / 2 + cellSize / 2;
        const startY = (height - patternHeight) / 2 + cellSize / 2;
        
        // Создаем точки
        let pointIndex = 0;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (pointIndex >= points) break;
                
                const x = startX + col * cellSize;
                const y = startY + row * cellSize;
                
                // Кружок точки (увеличен радиус для мобильных)
                const point = this.add.circle(x, y, 20, 0x666666).setDepth(6);
                point.setStrokeStyle(4, 0xffffff);
                
                // Увеличенная область клика для тач-экрана
                const hitArea = new Phaser.Geom.Circle(0, 0, 30);
                point.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
                point.setData('index', pointIndex);
                point.setData('x', x);
                point.setData('y', y);
                
                // Номер точки (опционально, если нужна подсказка)
                const showNumbers = this.config.showPattern || false;
                if (showNumbers) {
                    const label = this.add.text(x, y, (pointIndex + 1).toString(), {
                        fontSize: '16px',
                        fontFamily: 'Arial',
                        color: '#ffffff',
                        fontStyle: 'bold'
                    }).setOrigin(0.5).setDepth(7);
                    point.setData('label', label);
                }
                
                // Обработка клика
                point.on('pointerdown', () => {
                    this.onPointClick(point, pointIndex);
                });
                
                this.patternPoints.push(point);
                pointIndex++;
            }
        }
        
        // Генерируем правильный паттерн
        this.correctPattern = this.generateCorrectPattern(points);
        
        console.log('🎯 [PatternLockScene] Правильный паттерн:', this.correctPattern);
    }
    
    /**
     * Генерация правильного паттерна
     */
    generateCorrectPattern(points) {
        // Простой паттерн: последовательное соединение точек 0 → 1 → 2 → ...
        const pattern = [];
        for (let i = 0; i < points - 1; i++) {
            pattern.push([i, i + 1]);
        }
        return pattern;
    }
    
    /**
     * Обработка клика по точке
     */
    onPointClick(point, index) {
        if (!this.isGameActive) return;
        
        const isAlreadySelected = this.selectedPoints.includes(index);
        
        if (isAlreadySelected) {
            // Точка уже выбрана, игнорируем
            return;
        }
        
        // Добавляем точку в выбранные
        this.selectedPoints.push(index);
        
        // Подсвечиваем точку
        point.setFillStyle(0x00ff00);
        
        console.log('🎯 [PatternLockScene] Выбрана точка:', index, '| Всего:', this.selectedPoints);
        
        // Если это не первая точка, рисуем линию от предыдущей
        if (this.selectedPoints.length > 1) {
            const prevIndex = this.selectedPoints[this.selectedPoints.length - 2];
            const prevPoint = this.patternPoints[prevIndex];
            
            this.drawLine(
                prevPoint.getData('x'),
                prevPoint.getData('y'),
                point.getData('x'),
                point.getData('y')
            );
        }
        
        // Проверяем завершение паттерна
        if (this.selectedPoints.length === this.patternPoints.length) {
            // Все точки выбраны, проверяем правильность
            this.checkPattern();
        }
    }
    
    /**
     * Рисование линии между точками
     */
    drawLine(x1, y1, x2, y2) {
        const line = this.add.line(0, 0, x1, y1, x2, y2, 0x00ff00, 0.8);
        line.setLineWidth(4);
        line.setDepth(5);
        
        this.lines.push(line);
    }
    
    /**
     * Проверка паттерна
     */
    checkPattern() {
        console.log('🎯 [PatternLockScene] Проверка паттерна...');
        console.log('Выбранные точки:', this.selectedPoints);
        console.log('Правильный паттерн:', this.correctPattern);
        
        // Проверяем правильность последовательности
        let isCorrect = true;
        
        for (let i = 0; i < this.correctPattern.length; i++) {
            const [from, to] = this.correctPattern[i];
            
            // Проверяем, что соединение присутствует
            const selectedFrom = this.selectedPoints[i];
            const selectedTo = this.selectedPoints[i + 1];
            
            if (selectedFrom !== from || selectedTo !== to) {
                isCorrect = false;
                break;
            }
        }
        
        console.log('🎯 [PatternLockScene] Результат:', isCorrect ? 'Правильно' : 'Неправильно');
        
        // Задержка для визуализации
        this.time.delayedCall(500, () => {
            if (isCorrect) {
                this.onSuccess();
            } else {
                this.onPatternFailed();
            }
        });
    }
    
    /**
     * Провал попытки
     */
    onPatternFailed() {
        console.log('❌ [PatternLockScene] Неправильный паттерн!');
        
        // Подсвечиваем линии красным
        this.lines.forEach(line => {
            line.setStrokeStyle(4, 0xff0000);
        });
        
        // Подсвечиваем точки красным
        this.patternPoints.forEach(point => {
            if (this.selectedPoints.includes(point.getData('index'))) {
                point.setFillStyle(0xff0000);
            }
        });
        
        // Увеличиваем счетчик попыток
        this.incrementAttempts();
        
        // Сбрасываем паттерн через 1 секунду
        this.time.delayedCall(1000, () => {
            if (this.isGameActive) {
                this.resetPattern();
            }
        });
    }
    
    /**
     * Сброс паттерна
     */
    resetPattern() {
        console.log('🔄 [PatternLockScene] Сброс паттерна');
        
        // Очищаем выбранные точки
        this.selectedPoints = [];
        
        // Сбрасываем цвет точек
        this.patternPoints.forEach(point => {
            point.setFillStyle(0x666666);
        });
        
        // Удаляем линии
        this.lines.forEach(line => line.destroy());
        this.lines = [];
    }
    
    /**
     * Очистка
     */
    shutdown() {
        super.shutdown();
        
        // Очищаем линии
        if (this.lines) {
            this.lines.forEach(line => line.destroy());
            this.lines = [];
        }
        
        // Очищаем точки
        if (this.patternPoints) {
            this.patternPoints.forEach(point => {
                point.removeAllListeners();
            });
            this.patternPoints = [];
        }
    }
}

