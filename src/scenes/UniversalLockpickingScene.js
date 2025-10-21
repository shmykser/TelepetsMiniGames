/**
 * Универсальная сцена взлома замков
 * Поддерживает все типы замков: Simple, Maze, Pattern
 */

import { HTMLButton } from '../components/HTMLButton.js';
import { LOCK_TYPES } from '../types/lockTypes.js';

export class UniversalLockpickingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UniversalLockpickingScene' });
        
        this.lock = null;
        this.pet = null;
        this.lockType = LOCK_TYPES.SIMPLE;
        this.lockLevel = 1;
        this.config = null;
        this.cost = 1;
        
        // Игровые параметры
        this.attempts = 0;
        this.maxAttempts = 3;
        this.timeLeft = 0;
        this.timer = null;
        
        // UI элементы
        this.uiElements = [];
    }
    
    /**
     * Инициализация с данными
     */
    init(data) {
        console.log('🔓 [UniversalLockpicking] Инициализация:', data);
        
        this.lock = data.lock;
        this.pet = data.pet;
        this.lockType = data.lockType || LOCK_TYPES.SIMPLE;
        this.lockLevel = data.lockLevel || 1;
        this.config = data.config || {};
        this.cost = data.cost || 1;
        
        this.attempts = 0;
        this.maxAttempts = this.config.maxAttempts || 3;
        this.timeLeft = this.config.timeLimit || 0;
    }
    
    /**
     * Создание сцены
     */
    create() {
        console.log(`🔓 [UniversalLockpicking] Создание сцены взлома ${this.lockType} замка`);
        
        const { width, height } = this.scale;
        
        // Полупрозрачный фон
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(0);
        
        // Создаем UI
        this.createUI();
        
        // Создаем игру в зависимости от типа замка
        switch (this.lockType) {
            case LOCK_TYPES.SIMPLE:
                this.createSimpleGame();
                break;
            case LOCK_TYPES.MAZE:
                this.createMazeGame();
                break;
            case LOCK_TYPES.PATTERN:
                this.createPatternGame();
                break;
            default:
                console.error('🔒 [UniversalLockpicking] Неизвестный тип замка:', this.lockType);
                this.exitLockpicking(false);
        }
        
        // Обработчики клавиш
        this.setupInput();
        
        console.log('🔓 [UniversalLockpicking] Сцена готова');
    }
    
    /**
     * Создание UI
     */
    createUI() {
        const { width, height } = this.scale;
        
        // Заголовок
        const title = this.add.text(width / 2, 80, `🔓 ВЗЛОМ ${this.getLockTypeName().toUpperCase()}`, {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);
        
        this.uiElements.push(title);
        
        // Информация
        const info = this.add.text(width / 2, 120, `Уровень: ${this.lockLevel} | Стоимость: ${this.cost} отмычек`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        
        this.uiElements.push(info);
        
        // Счетчик попыток
        this.attemptsText = this.add.text(width / 2, 150, `Попыток: ${this.maxAttempts - this.attempts}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        
        this.uiElements.push(this.attemptsText);
        
        // Таймер (если есть ограничение времени)
        if (this.timeLeft > 0) {
            this.timerText = this.add.text(width / 2, 180, `Время: ${this.timeLeft}с`, {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#00ffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(10);
            
            this.uiElements.push(this.timerText);
            
            // Запускаем таймер
            this.startTimer();
        }
        
        // Кнопка выхода
        this.exitButton = new HTMLButton(this, width / 2, height - 70, {
            text: '❌ Отмена',
            width: 120,
            height: 35,
            fontSize: 14
        });
        
        this.exitButton.setOnClick(() => {
            this.exitLockpicking(false);
        });
        
        this.uiElements.push(this.exitButton);
        
        // Мобильные кнопки управления
        this.createMobileControls();
    }
    
    /**
     * Создание мобильных кнопок управления
     */
    createMobileControls() {
        const { width, height } = this.scale;
        
        // Кнопка для простого замка (SPACE)
        if (this.lockType === LOCK_TYPES.SIMPLE) {
            this.actionButton = new HTMLButton(this, width / 2, height - 120, {
                text: '🔓 ВЗЛОМАТЬ',
                width: 150,
                height: 50,
                fontSize: 16,
                fontWeight: 'bold'
            });
            
            this.actionButton.setOnClick(() => {
                this.trySimplePick();
            });
            
            this.uiElements.push(this.actionButton);
        }
        
        // Кнопки для лабиринта (стрелки)
        if (this.lockType === LOCK_TYPES.MAZE) {
            const buttonSize = 60;
            const spacing = 80;
            const centerX = width / 2;
            const centerY = height - 100;
            
            // Вверх
            this.upButton = new HTMLButton(this, centerX, centerY - spacing, {
                text: '↑',
                width: buttonSize,
                height: buttonSize,
                fontSize: 24
            });
            this.upButton.setOnClick(() => {
                this.onMobileInput('up');
            });
            
            // Влево
            this.leftButton = new HTMLButton(this, centerX - spacing, centerY, {
                text: '←',
                width: buttonSize,
                height: buttonSize,
                fontSize: 24
            });
            this.leftButton.setOnClick(() => {
                this.onMobileInput('left');
            });
            
            // Вправо
            this.rightButton = new HTMLButton(this, centerX + spacing, centerY, {
                text: '→',
                width: buttonSize,
                height: buttonSize,
                fontSize: 24
            });
            this.rightButton.setOnClick(() => {
                this.onMobileInput('right');
            });
            
            // Вниз
            this.downButton = new HTMLButton(this, centerX, centerY + spacing, {
                text: '↓',
                width: buttonSize,
                height: buttonSize,
                fontSize: 24
            });
            this.downButton.setOnClick(() => {
                this.onMobileInput('down');
            });
            
            this.uiElements.push(this.upButton, this.leftButton, this.rightButton, this.downButton);
        }
        
        // Для паттерна кнопки не нужны - кликаем по точкам
    }
    
    /**
     * Обработка мобильного ввода
     */
    onMobileInput(direction) {
        if (this.lockType === LOCK_TYPES.MAZE && this.ball && this.ball.body) {
            const speed = this.config.ballSpeed || 200;
            
            switch (direction) {
                case 'up':
                    this.ball.body.setVelocityY(-speed);
                    break;
                case 'down':
                    this.ball.body.setVelocityY(speed);
                    break;
                case 'left':
                    this.ball.body.setVelocityX(-speed);
                    break;
                case 'right':
                    this.ball.body.setVelocityX(speed);
                    break;
            }
            
            // Сбрасываем скорость через короткое время
            this.time.delayedCall(100, () => {
                if (this.ball && this.ball.body) {
                    this.ball.body.setVelocity(0, 0);
                }
            });
        }
    }
    
    /**
     * Создание игры для простого замка
     */
    createSimpleGame() {
        const { width, height } = this.scale;
        
        // Инструкция
        const instruction = this.add.text(width / 2, 220, 'Нажми кнопку ВЗЛОМАТЬ когда индикатор в зеленой зоне!', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        
        this.uiElements.push(instruction);
        
        // Создаем пины
        this.createSimplePins();
        
        // Создаем индикатор
        this.createSimpleIndicator();
    }
    
    /**
     * Создание пинов для простого замка
     */
    createSimplePins() {
        const { width, height } = this.scale;
        const numPins = this.config.pins || 1;
        const pinWidth = 50;
        const spacing = 70;
        const startX = width / 2 - (numPins - 1) * spacing / 2;
        const y = height / 2 - 30;
        
        this.pins = [];
        
        for (let i = 0; i < numPins; i++) {
            const x = startX + i * spacing;
            
            // Основа пина
            const pinBase = this.add.rectangle(x, y, pinWidth, 80, 0x333333).setDepth(5);
            
            // Зеленая зона (успех)
            const greenZone = this.add.rectangle(x, y - 5, pinWidth - 8, 25, 0x00ff00).setDepth(6);
            
            // Текст пина
            const pinText = this.add.text(x, y + 50, `Пин ${i + 1}`, {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(10);
            
            // Статус пина
            const status = this.add.text(x, y + 65, '⚪', {
                fontSize: '20px'
            }).setOrigin(0.5).setDepth(10);
            
            this.pins.push({
                base: pinBase,
                greenZone: greenZone,
                text: pinText,
                status: status,
                unlocked: false,
                x: x,
                y: y
            });
        }
        
        this.currentPin = 0;
        this.highlightCurrentPin();
    }
    
    /**
     * Создание индикатора для простого замка
     */
    createSimpleIndicator() {
        if (!this.pins || !this.pins[this.currentPin]) return;
        
        const pin = this.pins[this.currentPin];
        
        this.indicator = this.add.rectangle(
            pin.x,
            pin.y + 40,
            40,
            8,
            0xff0000
        ).setDepth(7);
        
        // Анимация движения индикатора
        this.tweens.add({
            targets: this.indicator,
            y: pin.y - 40,
            duration: 1200 / this.config.indicatorSpeed,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });
    }
    
    /**
     * Создание игры для лабиринта
     */
    createMazeGame() {
        const { width, height } = this.scale;
        
        // Инструкция
        const instruction = this.add.text(width / 2, 220, 'Проведите шарик к выходу! Используйте кнопки стрелок', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        
        this.uiElements.push(instruction);
        
        // Создаем лабиринт
        this.createMaze();
    }
    
    /**
     * Создание лабиринта
     */
    createMaze() {
        const { width, height } = this.scale;
        const mazeSize = this.config.mazeSize || 5;
        const cellSize = 40;
        const mazeWidth = mazeSize * cellSize;
        const mazeHeight = mazeSize * cellSize;
        const startX = (width - mazeWidth) / 2;
        const startY = (height - mazeHeight) / 2;
        
        // Создаем стены лабиринта (упрощенная версия)
        this.mazeWalls = this.add.group();
        
        // Внешние стены
        this.add.rectangle(startX + mazeWidth/2, startY - 5, mazeWidth, 10, 0x333333).setDepth(5);
        this.add.rectangle(startX + mazeWidth/2, startY + mazeHeight + 5, mazeWidth, 10, 0x333333).setDepth(5);
        this.add.rectangle(startX - 5, startY + mazeHeight/2, 10, mazeHeight, 0x333333).setDepth(5);
        this.add.rectangle(startX + mazeWidth + 5, startY + mazeHeight/2, 10, mazeHeight, 0x333333).setDepth(5);
        
        // Внутренние стены (случайные)
        for (let i = 1; i < mazeSize - 1; i++) {
            for (let j = 1; j < mazeSize - 1; j++) {
                if (Math.random() > 0.5) {
                    const wall = this.add.rectangle(
                        startX + i * cellSize + cellSize/2,
                        startY + j * cellSize + cellSize/2,
                        cellSize - 5,
                        cellSize - 5,
                        0x333333
                    ).setDepth(5);
                    
                    this.mazeWalls.add(wall);
                }
            }
        }
        
        // Создаем шарик
        this.ball = this.add.circle(
            startX + cellSize/2,
            startY + cellSize/2,
            8,
            0xff0000
        ).setDepth(6);
        
        // Создаем выход
        this.exit = this.add.circle(
            startX + (mazeSize - 1) * cellSize + cellSize/2,
            startY + (mazeSize - 1) * cellSize + cellSize/2,
            10,
            0x00ff00
        ).setDepth(6);
        
        // Настраиваем физику
        this.physics.add.existing(this.ball);
        this.ball.body.setCollideWorldBounds(true);
        this.ball.body.setSize(16, 16);
        
        // Коллизии с стенами
        this.physics.add.collider(this.ball, this.mazeWalls);
        
        // Коллизия с выходом
        this.physics.add.overlap(this.ball, this.exit, () => {
            this.onMazeSuccess();
        });
    }
    
    /**
     * Создание игры для паттерна
     */
    createPatternGame() {
        const { width, height } = this.scale;
        
        // Инструкция
        const instruction = this.add.text(width / 2, 220, 'Соедините точки без пересечений! Кликайте по точкам', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
        
        this.uiElements.push(instruction);
        
        // Создаем паттерн
        this.createPattern();
    }
    
    /**
     * Создание паттерна
     */
    createPattern() {
        const { width, height } = this.scale;
        const points = this.config.points || 4;
        const gridSize = Math.ceil(Math.sqrt(points));
        const cellSize = 60;
        const patternWidth = gridSize * cellSize;
        const patternHeight = gridSize * cellSize;
        const startX = (width - patternWidth) / 2;
        const startY = (height - patternHeight) / 2;
        
        this.patternPoints = [];
        this.selectedPoints = [];
        this.lines = [];
        
        // Создаем точки
        for (let i = 0; i < points; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const x = startX + col * cellSize + cellSize/2;
            const y = startY + row * cellSize + cellSize/2;
            
            const point = this.add.circle(x, y, 12, 0xffffff).setDepth(6);
            point.setInteractive();
            point.setData('index', i);
            
            point.on('pointerdown', () => {
                this.onPatternPointClick(point, i);
            });
            
            this.patternPoints.push(point);
        }
        
        // Генерируем правильный паттерн
        this.correctPattern = this.generateCorrectPattern(points);
    }
    
    /**
     * Генерация правильного паттерна
     */
    generateCorrectPattern(points) {
        // Простой паттерн: последовательное соединение точек
        const pattern = [];
        for (let i = 0; i < points - 1; i++) {
            pattern.push([i, i + 1]);
        }
        return pattern;
    }
    
    /**
     * Обработка клика по точке паттерна
     */
    onPatternPointClick(point, index) {
        if (this.selectedPoints.includes(index)) {
            // Уже выбрана - убираем
            this.selectedPoints = this.selectedPoints.filter(i => i !== index);
            point.setFillStyle(0xffffff);
        } else {
            // Добавляем
            this.selectedPoints.push(index);
            point.setFillStyle(0x00ff00);
        }
        
        // Проверяем паттерн
        if (this.selectedPoints.length === this.correctPattern.length + 1) {
            this.checkPattern();
        }
    }
    
    /**
     * Проверка правильности паттерна
     */
    checkPattern() {
        // Упрощенная проверка - последовательность
        const isCorrect = this.selectedPoints.every((point, index) => {
            return index === 0 || point === this.selectedPoints[index - 1] + 1;
        });
        
        if (isCorrect) {
            this.onPatternSuccess();
        } else {
            this.onPatternFailed();
        }
    }
    
    /**
     * Настройка ввода
     */
    setupInput() {
        // Клавиатура
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.lockType === LOCK_TYPES.SIMPLE) {
                this.trySimplePick();
            }
        });
        
        this.input.keyboard.on('keydown-ESC', () => {
            this.exitLockpicking(false);
        });
        
        // Стрелки для лабиринта
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    }
    
    /**
     * Обновление сцены
     */
    update(time, delta) {
        // Обновляем лабиринт
        if (this.lockType === LOCK_TYPES.MAZE && this.ball) {
            this.updateMazeMovement();
        }
    }
    
    /**
     * Обновление движения в лабиринте
     */
    updateMazeMovement() {
        if (!this.ball || !this.ball.body) return;
        
        const speed = this.config.ballSpeed || 200;
        
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.ball.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.ball.body.setVelocityX(speed);
        } else {
            this.ball.body.setVelocityX(0);
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.ball.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.ball.body.setVelocityY(speed);
        } else {
            this.ball.body.setVelocityY(0);
        }
    }
    
    /**
     * Попытка взлома простого замка
     */
    trySimplePick() {
        if (!this.indicator || !this.pins[this.currentPin]) return;
        
        const pin = this.pins[this.currentPin];
        const indicatorY = this.indicator.y;
        const greenZoneY = pin.greenZone.y;
        const tolerance = this.config.tolerance || 20;
        
        const success = Math.abs(indicatorY - greenZoneY) < tolerance;
        
        if (success) {
            pin.unlocked = true;
            pin.status.setText('✅');
            pin.greenZone.setFillStyle(0x00ff00, 0.3);
            
            this.currentPin++;
            
            if (this.currentPin >= this.pins.length) {
                this.onSimpleSuccess();
            } else {
                if (this.indicator) {
                    this.indicator.destroy();
                }
                this.createSimpleIndicator();
                this.highlightCurrentPin();
            }
        } else {
            this.onPickFailed();
        }
    }
    
    /**
     * Подсветка текущего пина
     */
    highlightCurrentPin() {
        if (!this.pins) return;
        
        this.pins.forEach((pin, i) => {
            if (i === this.currentPin && !pin.unlocked) {
                pin.base.setStrokeStyle(3, 0xffff00);
            } else {
                pin.base.setStrokeStyle(0);
            }
        });
    }
    
    /**
     * Успех простого замка
     */
    onSimpleSuccess() {
        this.onPickSuccess();
    }
    
    /**
     * Успех лабиринта
     */
    onMazeSuccess() {
        this.onPickSuccess();
    }
    
    /**
     * Успех паттерна
     */
    onPatternSuccess() {
        this.onPickSuccess();
    }
    
    /**
     * Провал паттерна
     */
    onPatternFailed() {
        this.onPickFailed();
    }
    
    /**
     * Успешный взлом
     */
    onPickSuccess() {
        console.log('✅ [UniversalLockpicking] Замок успешно взломан!');
        
        // Эффект успеха
        this.cameras.main.flash(500, 0, 255, 0);
        
        const { width, height } = this.scale;
        
        const successText = this.add.text(width / 2, height / 2, '✅ ЗАМОК ВЗЛОМАН!', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);
        
        // Анимация текста
        this.tweens.add({
            targets: successText,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            repeat: 2
        });
        
        // Выход через 1.5 секунды
        this.time.delayedCall(1500, () => {
            this.exitLockpicking(true);
        });
    }
    
    /**
     * Провал взлома
     */
    onPickFailed() {
        this.attempts++;
        this.attemptsText.setText(`Попыток: ${this.maxAttempts - this.attempts}`);
        
        // Эффект провала
        this.cameras.main.flash(200, 255, 0, 0);
        
        if (this.attempts >= this.maxAttempts) {
            this.onPickFailedFinal();
        }
    }
    
    /**
     * Окончательный провал
     */
    onPickFailedFinal() {
        console.log('❌ [UniversalLockpicking] Провал взлома! Закончились попытки.');
        
        // Эффект провала
        this.cameras.main.shake(300, 0.01);
        
        const { width, height } = this.scale;
        
        const failText = this.add.text(width / 2, height / 2, '❌ ОТМЫЧКА СЛОМАЛАСЬ!', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);
        
        // Выход через 1.5 секунды
        this.time.delayedCall(1500, () => {
            this.exitLockpicking(false);
        });
    }
    
    /**
     * Запуск таймера
     */
    startTimer() {
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText(`Время: ${this.timeLeft}с`);
                
                if (this.timeLeft <= 0) {
                    this.onPickFailedFinal();
                }
            },
            loop: true
        });
    }
    
    /**
     * Получить название типа замка
     */
    getLockTypeName() {
        switch (this.lockType) {
            case LOCK_TYPES.SIMPLE:
                return 'Простой';
            case LOCK_TYPES.MAZE:
                return 'Лабиринт';
            case LOCK_TYPES.PATTERN:
                return 'Паттерн';
            default:
                return 'Неизвестный';
        }
    }
    
    /**
     * Выход из мини-игры
     */
    exitLockpicking(success) {
        console.log('🚪 [UniversalLockpicking] Выход из мини-игры. Успех:', success);
        
        // Очищаем обработчики
        this.input.keyboard.off('keydown-SPACE');
        this.input.keyboard.off('keydown-ESC');
        
        // Очищаем таймер
        if (this.timer) {
            this.timer.destroy();
        }
        
        // Очищаем UI элементы
        this.uiElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        
        // Останавливаем сцену
        this.scene.stop('UniversalLockpickingScene');
        
        // Возобновляем предыдущую сцену
        const previousScene = this.scene.get('HouseInteriorScene') || this.scene.get('PetThiefScene');
        if (previousScene) {
            this.scene.resume(previousScene.scene.key);
        }
        
        // Передаем результат
        if (success) {
            this.lock.onPickSuccess();
        } else {
            this.lock.onPickFailed();
        }
        
        // Обновляем отмычки
        if (this.pet) {
            this.pet.inventory.lockpicks -= this.cost;
            if (this.pet.scene && this.pet.scene.updateInventoryUI) {
                this.pet.scene.updateInventoryUI();
            }
        }
    }
}
