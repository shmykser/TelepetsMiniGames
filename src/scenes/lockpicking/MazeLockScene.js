/**
 * Сцена взлома лабиринт-замка
 * Мини-игра: провести шарик через лабиринт к выходу
 */

import { BaseLockScene } from './BaseLockScene.js';
import { MazeGenerator } from '../../utils/MazeGenerator.js';
// HTMLButton удален - используем нативные Phaser компоненты

export class MazeLockScene extends BaseLockScene {
    constructor() {
        super('MazeLockScene');
        
        // Элементы игры
        this.ball = null;
        this.exit = null;
        this.mazeWalls = null;
        
        // Координаты лабиринта (для интерактивных областей)
        this.mazeStartX = 0;
        this.mazeStartY = 0;
        this.mazeWidth = 0;
        this.mazeHeight = 0;
    }
    
    /**
     * Создание сцены
     */
    create() {
        super.create();
        
        // Создаем базовый UI
        this.createBaseUI('🧩 ВЗЛОМ ЛАБИРИНТ-ЗАМКА');
        
        // Инструкция
        const { width } = this.scale;
        this.add.text(width / 2, 160, 'Проведите шарик к зеленому выходу!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
        
        // Создаем лабиринт
        this.createMaze();
        
        // Обработка клавиш (для ПК)
        this.setupKeyboard();
        
        // Игра активна
        this.isGameActive = true;
        
        console.log('🧩 [MazeLockScene] Игра начата');
    }
    
    /**
     * Создание лабиринта с использованием алгоритма Recursive Backtracker
     */
    createMaze() {
        const { width, height } = this.scale;
        const mazeSize = this.config.mazeSize || 5;
        const cellSize = 40;
        const mazeWidth = mazeSize * cellSize;
        const mazeHeight = mazeSize * cellSize;
        const startX = (width - mazeWidth) / 2;
        const startY = (height - mazeHeight) / 2 + 20;
        
        // Сохраняем координаты лабиринта для Tap-to-Move
        this.mazeStartX = startX;
        this.mazeStartY = startY;
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        
        // Генерируем "идеальный" лабиринт с помощью алгоритма Recursive Backtracker
        const mazeGrid = MazeGenerator.generate(mazeSize, mazeSize);
        
        // Выводим ASCII визуализацию в консоль для отладки
        console.log('🧩 [MazeLockScene] Сгенерирован лабиринт:\n' + MazeGenerator.visualize(mazeGrid));
        
        // Группа для стен
        this.mazeWalls = this.physics.add.staticGroup();
        
        // Толщина стен
        const wallThickness = 6;
        
        // Отрисовываем стены на основе сгенерированной сетки
        for (let y = 0; y < mazeSize; y++) {
            for (let x = 0; x < mazeSize; x++) {
                const cell = mazeGrid[y][x];
                const cellX = startX + x * cellSize;
                const cellY = startY + y * cellSize;
                
                // Верхняя стена
                if (cell.walls.top) {
                    const wall = this.add.rectangle(
                        cellX + cellSize / 2,
                        cellY,
                        cellSize,
                        wallThickness,
                        0x444444
                    ).setDepth(5);
                    this.physics.add.existing(wall, true);
                    this.mazeWalls.add(wall);
                }
                
                // Правая стена
                if (cell.walls.right) {
                    const wall = this.add.rectangle(
                        cellX + cellSize,
                        cellY + cellSize / 2,
                        wallThickness,
                        cellSize,
                        0x444444
                    ).setDepth(5);
                    this.physics.add.existing(wall, true);
                    this.mazeWalls.add(wall);
                }
                
                // Нижняя стена
                if (cell.walls.bottom) {
                    const wall = this.add.rectangle(
                        cellX + cellSize / 2,
                        cellY + cellSize,
                        cellSize,
                        wallThickness,
                        0x444444
                    ).setDepth(5);
                    this.physics.add.existing(wall, true);
                    this.mazeWalls.add(wall);
                }
                
                // Левая стена
                if (cell.walls.left) {
                    const wall = this.add.rectangle(
                        cellX,
                        cellY + cellSize / 2,
                        wallThickness,
                        cellSize,
                        0x444444
                    ).setDepth(5);
                    this.physics.add.existing(wall, true);
                    this.mazeWalls.add(wall);
                }
            }
        }
        
        // Создаем шарик (старт в левом верхнем углу)
        this.ball = this.add.circle(
            startX + cellSize / 2,
            startY + cellSize / 2,
            12,
            0xff0000
        ).setDepth(6);
        
        this.physics.add.existing(this.ball);
        this.ball.body.setCircle(12);
        this.ball.body.setCollideWorldBounds(false);
        this.ball.body.setBounce(0.3);
        this.ball.body.setDamping(true);
        this.ball.body.setDrag(0.95);
        this.ball.body.setMaxVelocity(300, 300);
        
        // Создаем выход (в правом нижнем углу)
        this.exit = this.add.circle(
            startX + (mazeSize - 1) * cellSize + cellSize / 2,
            startY + (mazeSize - 1) * cellSize + cellSize / 2,
            15,
            0x00ff00
        ).setDepth(6);
        
        this.physics.add.existing(this.exit, true);
        
        // Коллизии с стенами
        this.physics.add.collider(this.ball, this.mazeWalls);
        
        // Проверка достижения выхода
        this.physics.add.overlap(this.ball, this.exit, () => {
            if (this.isGameActive) {
                this.onSuccess();
            }
        });
        
        console.log('🧩 [MazeLockScene] Лабиринт создан с помощью Recursive Backtracker');
    }
    
    /**
     * Настройка клавиатуры
     */
    setupKeyboard() {
        const cursors = this.input.keyboard.createCursorKeys();
        
        this.input.keyboard.on('keydown-UP', () => this.moveBall('up'));
        this.input.keyboard.on('keydown-DOWN', () => this.moveBall('down'));
        this.input.keyboard.on('keydown-LEFT', () => this.moveBall('left'));
        this.input.keyboard.on('keydown-RIGHT', () => this.moveBall('right'));
        
        // WASD
        this.input.keyboard.on('keydown-W', () => this.moveBall('up'));
        this.input.keyboard.on('keydown-S', () => this.moveBall('down'));
        this.input.keyboard.on('keydown-A', () => this.moveBall('left'));
        this.input.keyboard.on('keydown-D', () => this.moveBall('right'));
        
        // МОБИЛЬНАЯ ПОДДЕРЖКА: Альтернативные методы управления
        this.setupTapToMove();
        this.setupSwipeControls();
        this.setupGyroscope();
    }
    
    /**
     * Настройка свайп-управления для мобильных
     */
    setupSwipeControls() {
        const { width, height } = this.scale;
        
        // Создаём невидимую область для свайпов (точно по размеру лабиринта + отступы)
        const areaPadding = 50;
        const areaX = this.mazeStartX + this.mazeWidth / 2;
        const areaY = this.mazeStartY + this.mazeHeight / 2;
        const areaWidth = this.mazeWidth + areaPadding * 2;
        const areaHeight = this.mazeHeight + areaPadding * 2;
        
        const swipeArea = this.add.rectangle(areaX, areaY, areaWidth, areaHeight, 0x000000, 0.01);
        swipeArea.setInteractive();
        swipeArea.setDepth(1); // Ниже кнопок управления
        
        let swipeStartX = 0;
        let swipeStartY = 0;
        let swipeTime = 0;
        
        swipeArea.on('pointerdown', (pointer) => {
            swipeStartX = pointer.x;
            swipeStartY = pointer.y;
            swipeTime = this.time.now;
        });
        
        swipeArea.on('pointerup', (pointer) => {
            const swipeEndX = pointer.x;
            const swipeEndY = pointer.y;
            const swipeDuration = this.time.now - swipeTime;
            
            // Минимальная дистанция для свайпа
            const minDistance = 30;
            // Максимальное время для свайпа (мс)
            const maxDuration = 300;
            
            if (swipeDuration > maxDuration) return;
            
            const deltaX = swipeEndX - swipeStartX;
            const deltaY = swipeEndY - swipeStartY;
            
            // Определяем направление свайпа
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Горизонтальный свайп
                if (Math.abs(deltaX) > minDistance) {
                    if (deltaX > 0) {
                        this.moveBall('right');
                    } else {
                        this.moveBall('left');
                    }
                }
            } else {
                // Вертикальный свайп
                if (Math.abs(deltaY) > minDistance) {
                    if (deltaY > 0) {
                        this.moveBall('down');
                    } else {
                        this.moveBall('up');
                    }
                }
            }
        });
        
        // Инструкция для мобильных (обновим позже)
        this.controlHintText = this.add.text(width / 2, 180, 'Загрузка управления...', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
    }
    
    /**
     * Настройка Tap-to-Move управления
     */
    setupTapToMove() {
        const { width, height } = this.scale;
        
        // Создаём невидимую область для тапов (точно по размеру лабиринта + отступы)
        const areaPadding = 50;
        const areaX = this.mazeStartX + this.mazeWidth / 2;
        const areaY = this.mazeStartY + this.mazeHeight / 2;
        const areaWidth = this.mazeWidth + areaPadding * 2;
        const areaHeight = this.mazeHeight + areaPadding * 2;
        
        const tapArea = this.add.rectangle(areaX, areaY, areaWidth, areaHeight, 0x00ff00, 0.05);
        tapArea.setInteractive();
        tapArea.setDepth(2); // Выше свайп-зоны, но ниже кнопок
        
        console.log('🎯 [MazeLockScene] Tap область:', { 
            areaX, areaY, areaWidth, areaHeight,
            mazeStartX: this.mazeStartX, 
            mazeStartY: this.mazeStartY,
            mazeWidth: this.mazeWidth,
            mazeHeight: this.mazeHeight
        });
        
        tapArea.on('pointerdown', (pointer) => {
            if (!this.isGameActive || !this.ball) return;
            
            // Получаем позицию шарика
            const ballX = this.ball.x;
            const ballY = this.ball.y;
            
            // Вычисляем направление от шарика к точке тапа
            const deltaX = pointer.x - ballX;
            const deltaY = pointer.y - ballY;
            
            // Определяем основное направление (горизонтальное или вертикальное)
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Горизонтальное движение
                if (deltaX > 0) {
                    this.moveBall('right');
                } else {
                    this.moveBall('left');
                }
            } else {
                // Вертикальное движение
                if (deltaY > 0) {
                    this.moveBall('down');
                } else {
                    this.moveBall('up');
                }
            }
        });
        
        console.log('🎯 [MazeLockScene] Tap-to-Move управление активировано');
    }
    
    /**
     * Настройка управления через гироскоп
     */
    setupGyroscope() {
        // Проверяем доступность Telegram WebApp API
        if (typeof window.Telegram === 'undefined' || !window.Telegram.WebApp) {
            console.log('⚠️ [MazeLockScene] Telegram WebApp API недоступен');
            this.updateControlHint('tap');
            return;
        }
        
        const WebApp = window.Telegram.WebApp;
        
        // Проверяем поддержку Accelerometer (доступен с версии 11.4)
        if (!WebApp.Accelerometer) {
            console.log('⚠️ [MazeLockScene] Гироскоп не поддерживается в этой версии Telegram');
            this.updateControlHint('tap');
            return;
        }
        
        // Флаг для переключения режима
        this.gyroscopeEnabled = false;
        this.gyroscopeData = { x: 0, y: 0, z: 0 };
        
        // Пытаемся запросить доступ к акселерометру
        try {
            WebApp.Accelerometer.start({ refresh_rate: 60 }, (data) => {
                if (this.gyroscopeEnabled && this.isGameActive && this.ball && this.ball.body) {
                    // Данные: x, y, z (ускорение по осям)
                    // Применяем силу к шарику на основе наклона устройства
                    
                    const sensitivity = 50; // Чувствительность управления
                    
                    // x - наклон влево/вправо
                    // y - наклон вперед/назад
                    const forceX = data.x * sensitivity;
                    const forceY = data.y * sensitivity;
                    
                    // Применяем ускорение к шарику
                    this.ball.body.setVelocityX(this.ball.body.velocity.x + forceX);
                    this.ball.body.setVelocityY(this.ball.body.velocity.y + forceY);
                    
                    this.gyroscopeData = data;
                }
            });
            
            console.log('📱 [MazeLockScene] Гироскоп доступен');
            
            // Создаём кнопку переключения режима управления
            this.createControlSwitcher();
            
            this.updateControlHint('tap+gyro');
            
        } catch (error) {
            console.warn('⚠️ [MazeLockScene] Не удалось запустить гироскоп:', error);
            this.updateControlHint('tap');
        }
    }
    
    /**
     * Создание кнопки переключения режима управления
     */
    createControlSwitcher() {
        const { width, height } = this.scale;
        
        // Кнопка переключения (компактная, справа сверху)
        this.gyroToggleButton = this.createButton(width - 80, 220, 140, 45, '📱 Гироскоп: OFF', {
            fontSize: '13px',
            backgroundColor: 0x555555,
            borderColor: 0x777777,
            hoverColor: 0x666666
        });
        
        this.gyroToggleButton.container.on('pointerdown', () => {
            this.gyroscopeEnabled = !this.gyroscopeEnabled;
            
            // Обновляем текст кнопки
            if (this.gyroToggleButton.label && this.gyroToggleButton.label.scene) {
                this.gyroToggleButton.label.setText(
                    this.gyroscopeEnabled ? '📱 Гироскоп: ON' : '📱 Гироскоп: OFF'
                );
            }
            
            // Обновляем цвет кнопки
            const newColor = this.gyroscopeEnabled ? 0x4CAF50 : 0x555555;
            this.updateButtonColor(this.gyroToggleButton, newColor);
            
            // Обновляем подсказку
            this.updateControlHint(this.gyroscopeEnabled ? 'gyro' : 'tap');
            
            console.log(`📱 [MazeLockScene] Гироскоп: ${this.gyroscopeEnabled ? 'ON' : 'OFF'}`);
        });
    }
    
    /**
     * Обновление цвета кнопки
     */
    updateButtonColor(button, color) {
        if (!button || !button.bg || !button.x) return;
        
        const { x, y, width, height } = button;
        button.bg.clear();
        button.bg.fillStyle(color, 1);
        button.bg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
        button.bg.lineStyle(2, 0x777777, 1);
        button.bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 8);
    }
    
    /**
     * Обновление текста подсказки управления
     */
    updateControlHint(mode) {
        if (!this.controlHintText || !this.controlHintText.scene) return;
        
        const hints = {
            'tap': 'Тапайте в направлении движения',
            'gyro': '📱 Наклоняйте устройство для управления',
            'tap+gyro': 'Тап или гироскоп (кнопка справа внизу)'
        };
        
        this.controlHintText.setText(hints[mode] || hints['tap']);
    }
    
    /**
     * Движение шарика
     */
    moveBall(direction) {
        if (!this.isGameActive || !this.ball || !this.ball.body) return;
        
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
    }
    
    /**
     * Обновление каждый кадр
     */
    update(time, delta) {
        // Постепенное замедление шарика
        if (this.ball && this.ball.body) {
            this.ball.body.velocity.x *= 0.95;
            this.ball.body.velocity.y *= 0.95;
        }
    }
    
    /**
     * Очистка
     */
    shutdown() {
        super.shutdown();
        
        // Останавливаем гироскоп
        if (typeof window.Telegram !== 'undefined' && 
            window.Telegram.WebApp && 
            window.Telegram.WebApp.Accelerometer) {
            try {
                window.Telegram.WebApp.Accelerometer.stop();
                console.log('📱 [MazeLockScene] Гироскоп остановлен');
            } catch (error) {
                console.warn('⚠️ [MazeLockScene] Ошибка остановки гироскопа:', error);
            }
        }
        
        // Очищаем обработчики клавиш
        if (this.input && this.input.keyboard) {
            this.input.keyboard.off('keydown-UP');
            this.input.keyboard.off('keydown-DOWN');
            this.input.keyboard.off('keydown-LEFT');
            this.input.keyboard.off('keydown-RIGHT');
            this.input.keyboard.off('keydown-W');
            this.input.keyboard.off('keydown-S');
            this.input.keyboard.off('keydown-A');
            this.input.keyboard.off('keydown-D');
        }
    }
}

