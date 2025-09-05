import Phaser from 'phaser';
import { ActionManager } from '../systems/actions/ActionManager';
import { GestureManager } from '../systems/gesture/GestureManager';
import { ItemDropManager } from '../systems/ItemDropManager';
import { TextureManager } from '../core/TextureManager';
import { WaveManager } from '../core/WaveManager';
import { GameTimer, WaveIndicator } from '../components';
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
        
        // Настраиваем обработчики событий
        this.setupGameEvents();
        
        // Инициализируем менеджеры
        this.initializeManagers();
        
        // Запускаем игру
        this.startGame();
    }
    createUI() {
        const { width, height } = this.scale;
        
        // Создаем индикатор волны (вверху слева)
        this.waveIndicator = new WaveIndicator(this, 125, 60, settings.game.ui.waveIndicator);
        
        // Создаем таймер игры (вверху справа)
        this.gameTimer = new GameTimer(this, width - 75, 60, settings.game.ui.timer);
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
            this.gameTimer.start(gameData.duration);
        });
        
        // Обработчик смены минуты
        this.events.on('minuteChanged', (minuteData) => {
            
            // Обновляем индикатор волны
            this.waveIndicator.updateWave({
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
            this.gameTimer.stop();
        });
        
        // Обработчики таймера
        this.gameTimer.on('warningTime', () => {
            this.waveIndicator.showDifficultyWarning();
        });
        
        this.gameTimer.on('criticalTime', () => {
            this.waveIndicator.showDifficultyWarning();
        });
        
        this.gameTimer.on('timeUp', () => {
        });
    }

    initializeManagers() {
        // Создаем ItemDropManager
        this.itemDropManager = new ItemDropManager(this, this.egg);
        
        // Создаем ActionManager с врагами из менеджера волн и яйцом
        this.actionManager = new ActionManager(this, this.waveManager.enemies, [], this.egg, this.itemDropManager);
        
        // Создаем GestureManager с обработчиками жестов
        this.gestureManager = new GestureManager(this, {
            onTap: (gesture) => {
                console.log(`👆 Тап в позиции: (${gesture.x}, ${gesture.y})`);
                this.actionManager.handleGesture(gesture);
            },
            onDoubleTap: (gesture) => {
                console.log(`👆👆 Двойной тап в позиции: (${gesture.x}, ${gesture.y})`);
                this.actionManager.handleGesture(gesture);
            },
            onLongTap: (gesture) => {
                console.log(`👆⏰ Долгий тап в позиции: (${gesture.x}, ${gesture.y})`);
                this.actionManager.handleGesture(gesture);
            },
            onSwipe: (gesture) => {
                console.log(`👆➡️ Свайп ${gesture.direction} в позиции: (${gesture.x}, ${gesture.y})`);
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
        if (this.waveIndicator && this.waveManager) {
            this.waveIndicator.updateEnemyCount(this.waveManager.currentEnemiesOnScreen);
        }
    }
    update() {
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
