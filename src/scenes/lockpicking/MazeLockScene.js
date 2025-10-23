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
        
        // НОВЫЕ МЕХАНИКИ
        this.keys = []; // Ключи для сбора
        this.collectedKeys = 0;
        this.requiredKeys = 0;
        this.enemies = []; // Патрулирующие враги
        this.portals = []; // Парные порталы
        this.portalTimers = [];
        this.portalCooldown = false; // Защита от зацикливания
        this.fogRectangle = null; // Прямоугольник тумана
        this.fogMask = null; // Маска для тумана войны
        this.mazeGrid = null; // Сохраненная сетка лабиринта
        
        // Координаты лабиринта (для интерактивных областей)
        this.mazeStartX = 0;
        this.mazeStartY = 0;
        this.mazeWidth = 0;
        this.mazeHeight = 0;
        this.cellSize = 0;
    }
    
    /**
     * Создание сцены
     */
    create() {
        super.create();
        
        // ВАЖНО: Полная очистка состояния от предыдущего прохождения
        this.ball = null;
        this.exit = null;
        this.mazeWalls = null;
        this.keys = [];
        this.collectedKeys = 0;
        this.requiredKeys = this.config.keys || 0;
        this.enemies = [];
        this.portals = [];
        this.portalTimers = [];
        this.portalCooldown = false;
        this.fogRectangle = null;
        this.fogMask = null;
        this.mazeGrid = null;
        this.mazeStartX = 0;
        this.mazeStartY = 0;
        this.mazeWidth = 0;
        this.mazeHeight = 0;
        this.cellSize = 0;
        
        // Создаем базовый UI
        this.createBaseUI('🧩 ВЗЛОМ ЛАБИРИНТ-ЗАМКА');
        
        // Инструкция (адаптивная под механики)
        const { width } = this.scale;
        let instructionText = 'Проведите шарик к зеленому выходу!';
        
        if (this.requiredKeys > 0) {
            instructionText = `Соберите ${this.requiredKeys} ключа(ей), затем к выходу!`;
        }
        
        this.add.text(width / 2, 160, instructionText, {
            fontSize: '15px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
        
        // Дополнительные подсказки об активных механиках
        const hints = [];
        if (this.config.enemies > 0) {
            hints.push(`🔴 Враги: ${this.config.enemies}`);
        }
        if (this.config.portals > 0) {
            hints.push(`🌀 Порталы: ${this.config.portals}`);
        }
        if (this.config.fogOfWar) {
            hints.push('🌫️ Туман войны');
        }
        
        if (hints.length > 0) {
            this.add.text(width / 2, 180, hints.join(' | '), {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#ffaa00',
                stroke: '#000000',
                strokeThickness: 1,
                align: 'center'
            }).setOrigin(0.5).setDepth(10);
        }
        
        // Индикатор собранных ключей (если нужны ключи)
        if (this.requiredKeys > 0) {
            this.keysText = this.add.text(width / 2, 205, `🔑 Ключи: 0/${this.requiredKeys}`, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }).setOrigin(0.5).setDepth(100);
        }
        
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
        this.cellSize = cellSize;
        
        // Генерируем "идеальный" лабиринт с помощью алгоритма Recursive Backtracker
        const mazeGrid = MazeGenerator.generate(mazeSize, mazeSize);
        this.mazeGrid = mazeGrid; // Сохраняем для использования в других методах
        
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
                // Проверяем что собраны все ключи
                if (this.collectedKeys >= this.requiredKeys) {
                    this.onSuccess();
                } else {
                    console.log(`🔑 [MazeLockScene] Нужно собрать еще ${this.requiredKeys - this.collectedKeys} ключ(ей)`);
                }
            }
        });
        
        // НОВЫЕ МЕХАНИКИ: Создаем дополнительные элементы
        this.createKeys(mazeGrid, startX, startY, mazeSize, cellSize);
        this.createEnemies(mazeGrid, startX, startY, mazeSize, cellSize);
        this.createPortals(mazeGrid, startX, startY, mazeSize, cellSize);
        this.createFogOfWar(startX, startY, mazeSize, cellSize);
        
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
        
        // Обновляем туман войны каждый кадр
        this.updateFogOfWar();
        
        // Проверяем перекрытие шарика с порталами для сброса флага wasOverlapping
        if (this.ball && this.portals) {
            this.portals.forEach(portalData => {
                if (portalData.circle && portalData.circle.wasOverlapping) {
                    // Проверяем пересекается ли шарик с порталом
                    const overlapping = this.physics.overlap(this.ball, portalData.circle);
                    
                    // Если НЕ пересекается - сбрасываем флаг
                    if (!overlapping) {
                        portalData.circle.wasOverlapping = false;
                    }
                }
            });
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
        
        // Останавливаем все таймеры порталов
        this.portalTimers.forEach(timer => {
            if (timer) timer.remove();
        });
        
        // Полная очистка состояния
        this.ball = null;
        this.exit = null;
        this.mazeWalls = null;
        this.keys = [];
        this.collectedKeys = 0;
        this.requiredKeys = 0;
        this.enemies = [];
        this.portals = [];
        this.portalTimers = [];
        this.portalCooldown = false;
        this.fogRectangle = null;
        this.fogMask = null;
        this.mazeGrid = null;
        this.mazeStartX = 0;
        this.mazeStartY = 0;
        this.mazeWidth = 0;
        this.mazeHeight = 0;
        this.cellSize = 0;
        
        console.log('🧩 [MazeLockScene] Полная очистка состояния');
    }
    
    /**
     * МЕХАНИКА 1: Создание ключей для сбора
     */
    createKeys(mazeGrid, startX, startY, mazeSize, cellSize) {
        const keyCount = this.config.keys || 0;
        if (keyCount === 0) return;
        
        // Находим свободные клетки (не старт, не выход)
        const freeCells = [];
        for (let y = 0; y < mazeSize; y++) {
            for (let x = 0; x < mazeSize; x++) {
                // Пропускаем старт (0,0) и выход (mazeSize-1, mazeSize-1)
                if ((x === 0 && y === 0) || (x === mazeSize - 1 && y === mazeSize - 1)) continue;
                freeCells.push({ x, y });
            }
        }
        
        // Перемешиваем и берем первые keyCount клеток
        Phaser.Utils.Array.Shuffle(freeCells);
        
        for (let i = 0; i < Math.min(keyCount, freeCells.length); i++) {
            const cell = freeCells[i];
            const keyX = startX + cell.x * cellSize + cellSize / 2;
            const keyY = startY + cell.y * cellSize + cellSize / 2;
            
            // Создаем ключ (желтая звезда)
            const key = this.add.star(keyX, keyY, 6, 8, 16, 0xffff00).setDepth(7);
            this.physics.add.existing(key, true);
            
            // Анимация вращения
            this.tweens.add({
                targets: key,
                angle: 360,
                duration: 2000,
                repeat: -1,
                ease: 'Linear'
            });
            
            this.keys.push(key);
            
            // Коллизия с шариком
            this.physics.add.overlap(this.ball, key, () => {
                if (this.isGameActive) {
                    key.destroy();
                    this.collectedKeys++;
                    
                    if (this.keysText) {
                        this.keysText.setText(`🔑 Ключи: ${this.collectedKeys}/${this.requiredKeys}`);
                    }
                    
                    console.log(`🔑 [MazeLockScene] Собран ключ ${this.collectedKeys}/${this.requiredKeys}`);
                }
            });
        }
        
        console.log(`🔑 [MazeLockScene] Создано ${this.keys.length} ключей`);
    }
    
    /**
     * МЕХАНИКА 2: Создание патрулирующих врагов
     */
    createEnemies(mazeGrid, startX, startY, mazeSize, cellSize) {
        const enemyCount = this.config.enemies || 0;
        if (enemyCount === 0) return;
        
        // Находим свободные клетки для врагов
        const freeCells = [];
        for (let y = 0; y < mazeSize; y++) {
            for (let x = 0; x < mazeSize; x++) {
                // Пропускаем старт и выход
                if ((x === 0 && y === 0) || (x === mazeSize - 1 && y === mazeSize - 1)) continue;
                // Пропускаем клетки рядом со стартом
                if (x <= 1 && y <= 1) continue;
                freeCells.push({ x, y });
            }
        }
        
        Phaser.Utils.Array.Shuffle(freeCells);
        
        const enemySpeed = this.config.enemySpeed || 80;
        
        for (let i = 0; i < Math.min(enemyCount, freeCells.length); i++) {
            const cell = freeCells[i];
            const enemyX = startX + cell.x * cellSize + cellSize / 2;
            const enemyY = startY + cell.y * cellSize + cellSize / 2;
            
            // Создаем врага (красный квадрат)
            const enemy = this.add.rectangle(enemyX, enemyY, 18, 18, 0xff0000).setDepth(7);
            this.physics.add.existing(enemy);
            enemy.body.setCollideWorldBounds(true);
            enemy.body.setBounce(1, 1);
            
            // Случайное начальное направление
            const directions = [
                { x: enemySpeed, y: 0 },
                { x: -enemySpeed, y: 0 },
                { x: 0, y: enemySpeed },
                { x: 0, y: -enemySpeed }
            ];
            const dir = Phaser.Utils.Array.GetRandom(directions);
            enemy.body.setVelocity(dir.x, dir.y);
            
            // Сохраняем дополнительные данные
            enemy.gridX = cell.x;
            enemy.gridY = cell.y;
            enemy.patrolSpeed = enemySpeed;
            
            this.enemies.push(enemy);
            
            // Коллизия с стенами - меняем направление
            this.physics.add.collider(enemy, this.mazeWalls, () => {
                // Случайное новое направление
                const newDir = Phaser.Utils.Array.GetRandom(directions);
                enemy.body.setVelocity(newDir.x, newDir.y);
            });
            
            // Коллизия с шариком - перезапуск
            this.physics.add.overlap(this.ball, enemy, () => {
                if (this.isGameActive) {
                    this.resetBallPosition();
                }
            });
        }
        
        console.log(`🔴 [MazeLockScene] Создано ${this.enemies.length} врагов`);
    }
    
    /**
     * МЕХАНИКА 3: Создание парных порталов
     */
    createPortals(mazeGrid, startX, startY, mazeSize, cellSize) {
        const portalCount = this.config.portals || 0;
        if (portalCount === 0) return;
        
        // Убеждаемся что количество четное
        const actualCount = Math.floor(portalCount / 2) * 2;
        if (actualCount === 0) return;
        
        const portalDuration = this.config.portalDuration || 3000;
        const portalInterval = this.config.portalInterval || 5000;
        
        // Создаем первую волну парных порталов
        this.spawnPortals(mazeGrid, startX, startY, mazeSize, cellSize, actualCount);
        
        // Запускаем таймер для периодического появления новых порталов
        const timer = this.time.addEvent({
            delay: portalInterval,
            callback: () => {
                this.spawnPortals(mazeGrid, startX, startY, mazeSize, cellSize, actualCount);
            },
            loop: true
        });
        
        this.portalTimers.push(timer);
        
        const pairCount = actualCount / 2;
        console.log(`🌀 [MazeLockScene] Система парных порталов активирована (${actualCount} порталов = ${pairCount} пар)`);
    }
    
    /**
     * Создание парных порталов
     */
    spawnPortals(mazeGrid, startX, startY, mazeSize, cellSize, count) {
        // Удаляем старые порталы
        this.portals.forEach(portal => {
            if (portal && portal.circle) portal.circle.destroy();
        });
        this.portals = [];
        
        // Находим свободные клетки
        const freeCells = [];
        for (let y = 0; y < mazeSize; y++) {
            for (let x = 0; x < mazeSize; x++) {
                if ((x === 0 && y === 0) || (x === mazeSize - 1 && y === mazeSize - 1)) continue;
                freeCells.push({ x, y });
            }
        }
        
        Phaser.Utils.Array.Shuffle(freeCells);
        
        const portalDuration = this.config.portalDuration || 3000;
        const pairCount = count / 2;
        
        // Цвета для разных пар
        const colors = [
            0x00aaff, // Синий
            0xff00ff, // Пурпурный
            0x00ff88, // Бирюзовый
            0xffaa00, // Оранжевый
            0xff0088  // Розовый
        ];
        
        // Создаем пары порталов
        for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
            if (freeCells.length < 2) break;
            
            const color = colors[pairIndex % colors.length];
            
            // Первый портал пары
            const cell1 = freeCells.shift();
            const portal1X = startX + cell1.x * cellSize + cellSize / 2;
            const portal1Y = startY + cell1.y * cellSize + cellSize / 2;
            
            // Второй портал пары
            const cell2 = freeCells.shift();
            const portal2X = startX + cell2.x * cellSize + cellSize / 2;
            const portal2Y = startY + cell2.y * cellSize + cellSize / 2;
            
            // Создаем оба портала
            const portal1 = this.createSinglePortal(portal1X, portal1Y, color, portalDuration);
            const portal2 = this.createSinglePortal(portal2X, portal2Y, color, portalDuration);
            
            // Сохраняем информацию о парах
            const portalData1 = { 
                circle: portal1, 
                x: portal1X, 
                y: portal1Y, 
                pairIndex: pairIndex, 
                pairPortal: null // Заполним после создания второго
            };
            
            const portalData2 = { 
                circle: portal2, 
                x: portal2X, 
                y: portal2Y, 
                pairIndex: pairIndex, 
                pairPortal: portalData1 // Ссылка на первый портал
            };
            
            portalData1.pairPortal = portalData2; // Взаимная ссылка
            
            this.portals.push(portalData1, portalData2);
            
            // Настраиваем телепортацию для обоих порталов
            this.setupPortalTeleport(portal1, portalData2);
            this.setupPortalTeleport(portal2, portalData1);
        }
        
        console.log(`🌀 [MazeLockScene] Создано ${pairCount} пар порталов (${this.portals.length} штук)`);
    }
    
    /**
     * Создание одного портала с анимацией
     */
    createSinglePortal(x, y, color, duration) {
        const portal = this.add.circle(x, y, 12, color, 0.7).setDepth(7);
        this.physics.add.existing(portal, true);
        
        // Анимация пульсации
        this.tweens.add({
            targets: portal,
            scale: { from: 1, to: 1.3 },
            alpha: { from: 0.7, to: 0.3 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Удаляем портал через заданное время
        this.time.delayedCall(duration, () => {
            if (portal && portal.scene) {
                portal.destroy();
            }
        });
        
        return portal;
    }
    
    /**
     * Настройка телепортации для портала
     */
    setupPortalTeleport(portalCircle, targetPortalData) {
        // Флаг "был ли шарик внутри портала в прошлом кадре"
        portalCircle.wasOverlapping = false;
        
        const collider = this.physics.add.overlap(
            this.ball, 
            portalCircle, 
            // collideCallback - срабатывает когда processCallback вернул true
            () => {
                if (this.isGameActive) {
                    this.teleportToPairedPortal(targetPortalData);
                }
            },
            // processCallback - проверяет МОЖНО ЛИ телепортироваться
            () => {
                // Телепортация только если шарик ТОЛЬКО ЧТО вошел в портал
                if (!portalCircle.wasOverlapping && !this.portalCooldown) {
                    portalCircle.wasOverlapping = true;
                    return true; // Разрешаем телепортацию
                }
                return false; // Блокируем повторную телепортацию
            },
            this
        );
        
        // Сохраняем коллайдер
        portalCircle.collider = collider;
    }
    
    /**
     * Телепортация к парному порталу
     */
    teleportToPairedPortal(targetPortalData) {
        if (!targetPortalData) return;
        
        // Устанавливаем глобальный кулдаун
        this.portalCooldown = true;
        
        // Сбрасываем флаги wasOverlapping для ВСЕХ порталов
        // Это важно чтобы шарик мог сразу выйти из портала назначения
        this.portals.forEach(portalData => {
            if (portalData.circle) {
                portalData.circle.wasOverlapping = false;
            }
        });
        
        // Телепортируем шарик к парному порталу
        this.ball.setPosition(targetPortalData.x, targetPortalData.y);
        this.ball.body.setVelocity(0, 0);
        
        // Эффект телепортации
        this.cameras.main.flash(300, 0, 100, 255);
        
        console.log(`🌀 [MazeLockScene] Телепортация к парному порталу (пара ${targetPortalData.pairIndex})`);
        
        // Через 100мс устанавливаем флаг что шарик УЖЕ внутри портала назначения
        // Это предотвратит мгновенную обратную телепортацию
        this.time.delayedCall(100, () => {
            // Помечаем портал назначения как "занятый"
            if (targetPortalData.circle) {
                targetPortalData.circle.wasOverlapping = true;
            }
        });
        
        // Снимаем кулдаун через 500мс
        this.time.delayedCall(500, () => {
            this.portalCooldown = false;
            console.log('🌀 [MazeLockScene] Порталы снова активны');
        });
    }
    
    /**
     * Сброс позиции шарика на старт (при касании врага)
     */
    resetBallPosition() {
        const startX = this.mazeStartX + this.cellSize / 2;
        const startY = this.mazeStartY + this.cellSize / 2;
        
        this.ball.setPosition(startX, startY);
        this.ball.body.setVelocity(0, 0);
        
        // Эффект сброса
        this.cameras.main.shake(200, 0.01);
        
        // Сбрасываем собранные ключи
        if (this.collectedKeys > 0) {
            console.log(`🔴 [MazeLockScene] Касание врага! Потеряно ${this.collectedKeys} ключей!`);
            
            // Восстанавливаем ключи на карте
            this.respawnKeys();
            
            // Сбрасываем счетчик
            this.collectedKeys = 0;
            
            // Обновляем UI
            if (this.keysText) {
                this.keysText.setText(`🔑 Ключи: 0/${this.requiredKeys}`);
            }
        } else {
            console.log('🔴 [MazeLockScene] Касание врага! Возврат на старт');
        }
    }
    
    /**
     * Восстановление собранных ключей на карте
     */
    respawnKeys() {
        // Удаляем существующие ключи
        this.keys.forEach(key => {
            if (key && key.scene) {
                key.destroy();
            }
        });
        this.keys = [];
        
        // Создаем новые ключи
        const keyCount = this.config.keys || 0;
        if (keyCount === 0) return;
        
        const mazeSize = this.config.mazeSize || 5;
        
        // Находим свободные клетки (не старт, не выход)
        const freeCells = [];
        for (let y = 0; y < mazeSize; y++) {
            for (let x = 0; x < mazeSize; x++) {
                // Пропускаем старт (0,0) и выход (mazeSize-1, mazeSize-1)
                if ((x === 0 && y === 0) || (x === mazeSize - 1 && y === mazeSize - 1)) continue;
                freeCells.push({ x, y });
            }
        }
        
        // Перемешиваем и берем первые keyCount клеток
        Phaser.Utils.Array.Shuffle(freeCells);
        
        for (let i = 0; i < Math.min(keyCount, freeCells.length); i++) {
            const cell = freeCells[i];
            const keyX = this.mazeStartX + cell.x * this.cellSize + this.cellSize / 2;
            const keyY = this.mazeStartY + cell.y * this.cellSize + this.cellSize / 2;
            
            // Создаем ключ (желтая звезда)
            const key = this.add.star(keyX, keyY, 6, 8, 16, 0xffff00).setDepth(7);
            this.physics.add.existing(key, true);
            
            // Анимация вращения
            this.tweens.add({
                targets: key,
                angle: 360,
                duration: 2000,
                repeat: -1,
                ease: 'Linear'
            });
            
            this.keys.push(key);
            
            // Коллизия с шариком
            this.physics.add.overlap(this.ball, key, () => {
                if (this.isGameActive) {
                    key.destroy();
                    this.collectedKeys++;
                    
                    if (this.keysText) {
                        this.keysText.setText(`🔑 Ключи: ${this.collectedKeys}/${this.requiredKeys}`);
                    }
                    
                    console.log(`🔑 [MazeLockScene] Собран ключ ${this.collectedKeys}/${this.requiredKeys}`);
                }
            });
        }
        
        console.log(`🔄 [MazeLockScene] Восстановлено ${this.keys.length} ключей`);
    }
    
    /**
     * МЕХАНИКА 4: Туман войны
     */
    createFogOfWar(startX, startY, mazeSize, cellSize) {
        if (!this.config.fogOfWar) return;
        
        const fogRadius = this.config.fogRadius || 3;
        
        // Создаем темный прямоугольник поверх лабиринта
        this.fogRectangle = this.add.rectangle(
            startX + this.mazeWidth / 2,
            startY + this.mazeHeight / 2,
            this.mazeWidth,
            this.mazeHeight,
            0x000000,
            0.92
        ).setDepth(50);
        
        // Создаем графику для маски (круг видимости)
        this.fogMask = this.make.graphics();
        this.fogMask.fillStyle(0xffffff);
        
        // Применяем маску к прямоугольнику (инвертированная)
        const mask = this.fogMask.createGeometryMask();
        mask.invertAlpha = true; // Инвертируем: видно ГДЕ ЕСТЬ круг
        this.fogRectangle.setMask(mask);
        
        console.log(`🌫️ [MazeLockScene] Туман войны активирован (радиус: ${fogRadius} клеток)`);
    }
    
    /**
     * Обновление тумана войны каждый кадр
     */
    updateFogOfWar() {
        if (!this.config.fogOfWar || !this.fogMask || !this.ball) return;
        
        const fogRadius = this.config.fogRadius || 3;
        const visibleRadius = fogRadius * this.cellSize;
        
        // Очищаем и перерисовываем круг видимости в позиции шарика
        this.fogMask.clear();
        this.fogMask.fillStyle(0xffffff);
        this.fogMask.fillCircle(this.ball.x, this.ball.y, visibleRadius);
    }
}

