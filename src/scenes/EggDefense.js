import Phaser from 'phaser';
import { Egg } from '../objects/Egg';
import { Enemy } from '../objects/Enemy';
import { WaveSystem } from '../systems/WaveSystem';
import { GestureSystem } from '../systems/GestureSystem';
import { GestureActionSystem } from '../systems/GestureActionSystem';
import { ProbabilitySystem } from '../systems/ProbabilitySystem';
import { EffectSystem } from '../systems/EffectSystem';
import { EventSystem } from '../systems/EventSystem.js';
import { EffectHandler } from '../handlers/EffectHandler.js';
import { EVENT_TYPES } from '../types/EventTypes.js';
import { settings } from '../../config/settings.js';
import { BackgroundUtils } from '../utils/BackgroundUtils.js';

/**
 * Основная игровая сцена EggDefense
 * Конструктор из готовых классов и компонентов
 */
export class EggDefense extends Phaser.Scene {
    constructor() {
        super({ key: 'EggDefense' });
    }

    create() {
        // Создание игровых объектов
        this.createGameObjects();
        
        // Инициализация игровых систем
        this.initGameSystems();
        
        // Настройка UI
        this.setupUI();
        
        // Запуск игры
        this.startGame();
    }

    /**
     * Инициализация игровых систем
     */
    initGameSystems() {
        // Система событий (центральная)
        this.eventSystem = new EventSystem();
        
        // Система вероятности (централизованная)
        this.probabilitySystem = new ProbabilitySystem(this);
        this.probabilitySystem.init();
        
        // Система эффектов (для совместимости)
        this.effectSystem = new EffectSystem(this);
        
        // Обработчик эффектов (Event-Driven Architecture)
        this.effectHandler = new EffectHandler(this, this.eventSystem);
        
        // Инициализируем системы в классе Enemy
        Enemy.initDropSystems(this, this.egg, this.probabilitySystem);
        Enemy.initEventSystem(this.eventSystem);
        
        // Система волн для спавна врагов
        this.waveSystem = new WaveSystem(this, this.probabilitySystem);
        
        // Система жестов
        this.gestureSystem = new GestureSystem(this, {
            onTap: (gesture) => this.handleGesture(gesture),
            onDoubleTap: (gesture) => this.handleGesture(gesture),
            onLongTap: (gesture) => this.handleGesture(gesture),
            onSwipe: (gesture) => this.handleGesture(gesture)
        });
        
        // Система обработки жестов
        this.gestureActionSystem = new GestureActionSystem(
            this, 
            this.waveSystem.enemies, 
            [], // defenses - пока пустой
            this.egg
        );
        
        // Устанавливаем яйцо как цель для волновой системы
        this.waveSystem.setTarget(this.egg);
    }

    /**
     * Создание игровых объектов
     */
    createGameObjects() {
        // Создание травяного фона
        this.grassBackground = BackgroundUtils.createAnimatedGrassBackground(this, {
            tileSize: 64, // Размер тайла травы
            animate: true, // Включаем анимацию ветра
            animation: {
                speedX: 8,   // Легкое горизонтальное движение
                speedY: 4,   // Легкое вертикальное движение
                duration: 20000 // 20 секунд на цикл
            }
        });
        
        // Устанавливаем фон на самый нижний слой
        this.grassBackground.setDepth(-100);
        
        // Создание яйца в центре экрана
        this.egg = Egg.CreateEgg(
            this, 
            this.scale.width / 2, 
            this.scale.height / 2,
            {
                health: 100,
                texture: '🥚'
            }
        );
        
        console.log('Травяной фон создан:', this.grassBackground);
        console.log('Яйцо создано:', this.egg);
        console.log('Позиция яйца:', this.egg.x, this.egg.y);
        console.log('Размер экрана Phaser:', this.scale.width, this.scale.height);
    }

    /**
     * Настройка UI
     */
    setupUI() {
        // UI удален по запросу пользователя
    }

    /**
     * Запуск игры
     */
    startGame() {
        // Отправляем событие начала игры
        this.eventSystem.emit(EVENT_TYPES.GAME_START, {
            scene: this
        });
        
        // Запускаем волновую систему
        this.waveSystem.startGame();
    }

    /**
     * Обработка жестов
     */
    handleGesture(gesture) {
        // Обновляем списки объектов в системе действий
        this.gestureActionSystem.updateObjects(
            this.waveSystem.enemies, 
            [] // defenses - пока пустой
        );
        
        // Обрабатываем жест
        const success = this.gestureActionSystem.handleGesture(gesture);
        
        if (success) {
            // Можно добавить визуальную обратную связь через EffectSystem
            console.log(`Жест ${gesture.type} выполнен успешно`);
        }
    }

    /**
     * Окончание игры
     */
    endGame() {
        // Отправляем событие окончания игры
        const won = this.egg && this.egg.health > 0;
        this.eventSystem.emit(EVENT_TYPES.GAME_END, {
            scene: this,
            won: won
        });
        
        // Останавливаем все системы
        this.waveSystem.endGame();
        
        // Показываем результат
        console.log('Игра окончена!');
        console.log(`Убито врагов: ${this.waveSystem.totalEnemiesKilled}`);
        
        // Возвращаемся в меню через 3 секунды
        this.time.delayedCall(3000, () => {
            this.scene.start('MenuScene');
        });
    }

    /**
     * Обновление сцены
     */
    update(time, delta) {
        // Обновляем систему вероятности
        if (this.probabilitySystem) {
            this.probabilitySystem.update(time, delta);
        }
        
        // Обновляем волновую систему
        if (this.waveSystem) {
            this.waveSystem.update(time, delta);
        }
        
        // Обновляем всех врагов (для движения к цели)
        if (this.waveSystem && this.waveSystem.enemies) {
            this.waveSystem.enemies.forEach(enemy => {
                if (enemy && enemy.isAlive && enemy.update) {
                    enemy.update(time, delta);
                }
            });
        }
    }

    /**
     * Очистка при уничтожении сцены
     */
    destroy() {
        // Очищаем EventSystem
        if (this.eventSystem) {
            this.eventSystem.clear();
        }
        
        // Очищаем EffectHandler
        if (this.effectHandler) {
            this.effectHandler.destroy();
        }
        
        // Уничтожаем все системы
        if (this.waveSystem) {
            this.waveSystem.destroy();
        }
        
        if (this.gestureSystem) {
            this.gestureSystem.destroy();
        }
        
        if (this.itemDropSystem) {
            this.itemDropSystem.destroy();
        }
        
        if (this.effectSystem) {
            this.effectSystem.clearAllEffects();
        }
    }
}
