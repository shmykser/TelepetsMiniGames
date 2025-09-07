import Phaser from 'phaser';
import { ActionManager } from '../systems/actions/ActionManager';
import { GestureManager } from '../systems/gesture/GestureManager';
import { ItemDropManager } from '../systems/ItemDropManager';
import { MovementSystem } from '../systems/movement/MovementSystem';
import { TextureManager } from '../core/TextureManager';
import { WaveManager } from '../core/WaveManager';
// import { GameTimer, WaveIndicator } from '../components';
import { Egg } from '../core/objects/Egg';
import { settings } from '../../config/settings';
/**
 * Сцена для тестирования жестов с врагами
 */
export class GestureTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GestureTestScene' });
        Object.defineProperty(this, "waveManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "actionManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gameTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "waveIndicator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "egg", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    create() {
        const { width, height } = this.scale;
        // Создаем все текстуры
        TextureManager.createAllTextures(this);
        // Создаем фон
        this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);
        
        // Создаем UI компоненты
        this.createUI();
        
        // Создаем яйцо в центре экрана
        this.createEgg();
        
        // Создаем менеджер волн
        this.waveManager = new WaveManager(this);
        
        // Создаем систему движения
        this.movementSystem = new MovementSystem(this);
        
        // Настраиваем обработчики событий
        this.setupGameEvents();
        
        // Инициализируем менеджеры
        this.initializeManagers();
        
        // Запускаем игру
        this.startGame();
    }
    createUI() {
        const { width, height } = this.scale;
        
        // Создаем простой индикатор волны (вверху слева)
        this.waveText = this.add.text(10, 10, 'Волна 1', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0);
        
        // Создаем счетчик врагов под волной
        this.enemyCountText = this.add.text(10, 35, 'Враги: 0', {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0, 0);
        
        // Создаем простой таймер игры (вверху справа, под кнопкой Menu)
        this.timerText = this.add.text(width - 10, 35, '10:00', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0);
        
        // Создаем кнопку возврата в меню (вверху справа)
        const menuButton = this.add.text(width - 10, 10, 'Menu', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#34495e',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0).setInteractive();
        
        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        // Уникальное движение включено по умолчанию
        this.uniqueMovementEnabled = true;
        
        // Добавляем обработчик для усиленных врагов
        this.events.on('enhancedEnemySpawned', (data) => {
        });
        
    }

    createEgg() {
        const { width, height } = this.scale;
        
        // Создаем яйцо в центре экрана
        this.egg = Egg.CreateEgg(this, width / 2, height / 2, {
            health: 100,
            texture: 'egg'
        });
        
    }

    setupGameEvents() {
        // Обработчик начала игры
        this.events.on('gameStarted', (gameData) => {
            
            // Запускаем таймер
            this.startTimer(gameData.duration);
        });
        
        // Обработчик смены минуты
        this.events.on('minuteChanged', (minuteData) => {
            
            // Обновляем индикатор волны
            this.updateWaveIndicator({
                waveNumber: minuteData.minute,
                waveName: `Минута ${minuteData.minute}`,
                maxWaves: settings.game.maxWaves
            });
        });
        
        // Обработчик спавна врага
        this.events.on('enemySpawned', (spawnData) => {
            // Обновляем счетчик врагов
            this.updateEnemyCount();
        });
        
        // Обработчик смерти врага
        this.events.on('enemyKilled', (killData) => {
            // Обрабатываем дроп предметов
            this.itemDropManager.onEnemyKilled(killData.enemy);
            this.updateEnemyCount();
        });
        
        // Обработчик окончания игры
        this.events.on('gameEnded', (endData) => {
            
            // Останавливаем таймер
            this.stopTimer();
        });
        
        // Простые методы для таймера и индикатора волны
    }

    initializeManagers() {
        // Создаем ItemDropManager
        this.itemDropManager = new ItemDropManager(this, this.egg);
        
        // Создаем ActionManager с врагами из менеджера волн и яйцом
        this.actionManager = new ActionManager(this, this.waveManager.enemies, [], this.egg, this.itemDropManager);
        
        // Создаем GestureManager с обработчиками жестов
        this.gestureManager = new GestureManager(this, {
            onTap: (gesture) => {
                this.actionManager.handleGesture(gesture);
            },
            onDoubleTap: (gesture) => {
                this.actionManager.handleGesture(gesture);
            },
            onLongTap: (gesture) => {
                this.actionManager.handleGesture(gesture);
            },
            onSwipe: (gesture) => {
                this.actionManager.handleGesture(gesture);
            }
        });
    }

    startGame() {
        // Устанавливаем яйцо как цель для врагов
        if (this.egg && this.waveManager) {
            this.waveManager.setTarget(this.egg);
        }
        
        // Запускаем игру через менеджер волн
        this.waveManager.startGame();
    }

    updateEnemyCount() {
        // Обновляем счетчик врагов
        if (this.enemyCountText && this.waveManager) {
            const enemyCount = this.waveManager.currentEnemiesOnScreen || 0;
            this.enemyCountText.setText(`Враги: ${enemyCount}`);
        }
    }
    
    /**
     * Переключает уникальное движение для всех врагов
     */
    toggleUniqueMovement() {
        this.uniqueMovementEnabled = !this.uniqueMovementEnabled;
        
        // Применяем настройку ко всем существующим врагам
        if (this.waveManager && this.waveManager.enemies) {
            this.waveManager.enemies.forEach(enemy => {
                if (enemy && enemy.setUniqueMovement) {
                    enemy.setUniqueMovement(this.uniqueMovementEnabled);
                }
            });
        }
    }
    
    /**
     * Запускает простой таймер
     */
    startTimer(duration) {
        this.gameStartTime = this.time.now;
        this.gameDuration = duration;
        this.timerRunning = true;
    }
    
    /**
     * Останавливает таймер
     */
    stopTimer() {
        this.timerRunning = false;
    }
    
    /**
     * Обновляет индикатор волны
     */
    updateWaveIndicator(data) {
        if (this.waveText) {
            this.waveText.setText(`Волна ${data.waveNumber}`);
        }
    }
    
    update() {
        // Обновляем таймер
        if (this.timerRunning && this.timerText) {
            const elapsed = this.time.now - this.gameStartTime;
            const remaining = Math.max(0, this.gameDuration - elapsed);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            
            // Проверяем окончание времени
            if (remaining <= 0) {
                this.timerRunning = false;
                this.events.emit('gameEnded', { reason: 'timeUp' });
            }
        }
        
        // Обновляем менеджер волн
        if (this.waveManager) {
            this.waveManager.update();
        }
        
        // Обновляем врагов (для движения к цели)
        if (this.waveManager && this.waveManager.enemies) {
            this.waveManager.enemies.forEach(enemy => {
                if (enemy && enemy.update) {
                    enemy.update(this.time.now, this.game.loop.delta);
                }
            });
        }
        
        // Обновляем списки объектов в ActionManager
        if (this.actionManager && this.waveManager) {
            this.actionManager.updateObjects(this.waveManager.enemies, []);
        }
        
        // Обновляем ItemDropManager
        if (this.itemDropManager) {
            this.itemDropManager.update(this.time.now, this.game.loop.delta);
        }
        
        // Обновляем прогресс волны
        if (this.waveIndicator && this.waveManager) {
            const gameInfo = this.waveManager.getGameInfo();
            this.waveIndicator.updateProgress(gameInfo.gameProgress);
        }
    }
}
