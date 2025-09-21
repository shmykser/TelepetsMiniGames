import Phaser from 'phaser';
import { Egg } from '../objects/Egg';
import { Enemy } from '../objects/Enemy';
import { WaveSystem } from '../systems/WaveSystem';
import { GestureSystem } from '../systems/GestureSystem';
import { GestureActionSystem } from '../systems/GestureActionSystem';
import { ProbabilitySystem } from '../systems/ProbabilitySystem';
import { EffectSystem } from '../systems/EffectSystem';
import { EventSystem } from '../systems/EventSystem.js';
import { AbilitySystem } from '../systems/AbilitySystem.js';
import { EffectHandler } from '../handlers/EffectHandler.js';
import { EVENT_TYPES } from '../types/EventTypes.js';
import { BACKGROUND_SETTINGS } from '../settings/GameSettings.js';
import { ABILITIES } from '../types/abilityTypes.js';
import { BackgroundUtils } from '../utils/BackgroundUtils.js';
import { AbilitiesDisplay } from '../components/AbilitiesDisplay.js';

/**
 * Основная игровая сцена EggDefense
 * Конструктор из готовых классов и компонентов
 */
export class EggDefense extends Phaser.Scene {
    constructor() {
        super({ key: 'EggDefense' });
        this.isGameEnded = false;
    }

    create() {
        // Сбрасываем флаг окончания игры для корректного рестарта
        this.isGameEnded = false;
        
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
        
        // Система способностей
        this.abilitySystem = new AbilitySystem(this);
        
        // Система вероятности (централизованная)
        this.probabilitySystem = new ProbabilitySystem(this);
        this.probabilitySystem.init();
        
        // Система эффектов (для совместимости)
        this.effectSystem = new EffectSystem(this);
        
        // Массив защитных объектов (ям)
        this.defenses = [];
        
        // Обработчик эффектов (Event-Driven Architecture)
        this.effectHandler = new EffectHandler(this, this.eventSystem);
        
        // Инициализируем системы в классе Enemy
        Enemy.initDropSystems(this, this.egg, this.probabilitySystem, this.abilitySystem);
        Enemy.initEventSystem(this.eventSystem);
        
        // Система волн для спавна врагов
        this.waveSystem = new WaveSystem(this, this.probabilitySystem);
        
        // Система жестов
        this.gestureSystem = new GestureSystem(this, {
            onTap: (gesture) => this.handleGesture(gesture),
            onLongTap: (gesture) => this.handleGesture(gesture),
            onLine: (gesture) => this.handleGesture(gesture),
            onCircle: (gesture) => this.handleGesture(gesture),
            onTriangle: (gesture) => this.handleGesture(gesture)
        });
        
        // Система обработки жестов
        this.gestureActionSystem = new GestureActionSystem(
            this, 
            this.waveSystem.enemies, 
            this.defenses, // Передаем реальный массив защитных объектов
            this.egg,
            Enemy.itemDropSystem, // Передаем ItemDropSystem для обработки предметов
            this.abilitySystem // Передаем AbilitySystem для получения актуальных значений
        );
        
        // Передаем систему способностей яйцу
        if (this.egg && this.abilitySystem) {
            this.egg.abilitySystem = this.abilitySystem;
            this.egg.scene.events.on('ability:upgraded', this.egg.onAbilityUpgraded, this.egg);
            
            // Инициализируем способности если они разблокированы
            this.egg.updateAura();
            this.egg.updateEggExplosion();
            
            // Для тестирования - прокачиваем взрыв яйца
            if (this.egg.eggExplosion <= 0) {
                this.abilitySystem.upgradeAbility('EGG_EXPLOSION');
                this.egg.updateEggExplosion();
            }
        }
        
        // Устанавливаем яйцо как цель для волновой системы
        this.waveSystem.setTarget(this.egg);
    }

    /**
     * Создание игровых объектов
     */
    createGameObjects() {
        // Создание травяного фона
        this.grassBackground = BackgroundUtils.createAnimatedGrassBackground(this, BACKGROUND_SETTINGS);
        
        // Устанавливаем фон на самый нижний слой
        this.grassBackground.setDepth(-100);
        
        // Создание яйца в центре экрана (abilitySystem будет передан позже)
        this.egg = Egg.CreateEgg(
            this, 
            this.scale.width / 2, 
            this.scale.height / 2,
            {
                health: ABILITIES.EGG_HEALTH.baseValue,
                texture: '🥚',
                spriteKey: 'egg',
                size: 2
            }
        );
        
    }

    /**
     * Настройка UI
     */
    setupUI() {
        // Создаем дисплей способностей в правом верхнем углу
        this.abilitiesDisplay = new AbilitiesDisplay(
            this,
            this.scale.width - 100, // Сдвинули левее от правого края
            100, // Отступ от верхнего края
            this.abilitySystem // Передаем систему способностей
        );
        
        // Устанавливаем высокую глубину, чтобы было поверх игры
        this.abilitiesDisplay.setDepth(1000);
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
            this.defenses // Передаем реальный массив защитных объектов
        );
        
        // Обрабатываем жест
        const success = this.gestureActionSystem.handleGesture(gesture);
        
        if (success) {
            // Можно добавить визуальную обратную связь через EffectSystem
        }
    }

    /**
     * Проверка окончания игры
     */
    checkGameEnd() {
        if (this.isGameEnded) return;
        
        const timeUp = this.waveSystem.getRemainingTime() <= 0;
        const eggDestroyed = !this.egg || this.egg.health <= 0;
        
        if (timeUp || eggDestroyed) {
            this.gameOver(timeUp && !eggDestroyed);
        }
    }
    
    /**
     * Окончание игры с результатом
     */
    gameOver(won = false) {
        this.isGameEnded = true;
        
        // Отправляем событие окончания игры
        this.eventSystem.emit(EVENT_TYPES.GAME_END, {
            scene: this,
            won: won,
            stats: this.getGameStats()
        });
        
        // Останавливаем все системы
        this.waveSystem.stopGame();
        
        // Очищаем все предметы с экрана
        if (Enemy.itemDropSystem) {
            Enemy.itemDropSystem.clearAllItems();
        }
        
        // Показываем результат
        this.showGameResult(won);
        
        // Возвращаемся в меню через заданное время
        // this.time.delayedCall(GAME_SETTINGS.endGameDelay, () => {
        //     this.scene.start('MenuScene');
        // });
    }
    
    /**
     * Отображение результата игры
     */
    showGameResult(won) {
        const stats = this.getGameStats();
        const resultText = won ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ!';
        const resultColor = won ? '#00ff00' : '#ff0000';
        
        // Создаем результирующий экран
        const resultBg = this.add.rectangle(
            this.scale.width / 2, 
            this.scale.height / 2, 
            this.scale.width - 40, 
            250, 
            0x000000, 
            0.8
        );
        
        const titleText = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2 - 70, 
            resultText, 
            {
                fontSize: '32px',
                fill: resultColor,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        const statsText = this.add.text(
            this.scale.width / 2, 
            this.scale.height / 2 - 20, 
            `Убито врагов: ${stats.enemiesKilled}\nВремя: ${stats.gameTimeText}`, 
            {
                fontSize: '18px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Кнопка рестарта
        const restartButton = this.add.rectangle(
            this.scale.width / 2 - 80, 
            this.scale.height / 2 + 50, 
            140, 
            40, 
            0x27ae60
        )
        .setInteractive()
        .on('pointerdown', () => {
            this.restartGame();
        })
        .on('pointerover', () => restartButton.setAlpha(0.8))
        .on('pointerout', () => restartButton.setAlpha(1));
        
        this.add.text(
            this.scale.width / 2 - 80, 
            this.scale.height / 2 + 50, 
            'РЕСТАРТ', 
            {
                fontSize: '16px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        
        // Кнопка возврата в меню
        const menuButton = this.add.rectangle(
            this.scale.width / 2 + 80, 
            this.scale.height / 2 + 50, 
            140, 
            40, 
            0xe74c3c
        )
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('MenuScene');
        })
        .on('pointerover', () => menuButton.setAlpha(0.8))
        .on('pointerout', () => menuButton.setAlpha(1));
        
        this.add.text(
            this.scale.width / 2 + 80, 
            this.scale.height / 2 + 50, 
            'В МЕНЮ', 
            {
                fontSize: '16px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
    }
    
    /**
     * Получение статистики игры
     */
    getGameStats() {
        const gameTime = this.time.now - (this.waveSystem?.gameStartTime || 0);
        const minutes = Math.floor(gameTime / 60000);
        const seconds = Math.floor((gameTime % 60000) / 1000);
        
        return {
            enemiesKilled: this.waveSystem?.totalEnemiesKilled || 0,
            gameTime: gameTime,
            gameTimeText: `${minutes}:${seconds.toString().padStart(2, '0')}`,
            survived: this.egg && this.egg.health > 0
        };
    }
    
    /**
     * Пауза игры
     */
    pauseGame() {
        this.scene.pause();
    }
    
    /**
     * Возобновление игры
     */
    resumeGame() {
        this.scene.resume();
    }
    
    /**
     * Перезапуск игры
     */
    restartGame() {
        // Очищаем текущую сцену
        this.scene.restart();
    }
    
    /**
     * Окончание игры (устаревший метод для совместимости)
     */
    endGame() {
        this.gameOver(false);
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
        
        // Обновляем всех врагов через WaveSystem
        if (this.waveSystem) {
            this.waveSystem.updateEnemies(time, delta);
        }
        
        // Обновляем дисплей способностей
        if (this.abilitiesDisplay) {
            this.abilitiesDisplay.update(time, delta);
        }
        
        // Проверяем условия окончания игры
        this.checkGameEnd();
    }

    /**
     * Очищает все защитные объекты (ямы)
     */
    clearDefenses() {
        if (this.defenses && this.defenses.length > 0) {
            console.log(`🧹 Очищаем ${this.defenses.length} защитных объектов`);
            this.defenses.forEach(defense => {
                if (defense && defense.destroy) {
                    defense.destroy();
                }
            });
            this.defenses = [];
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
        if (this.abilitySystem) {
            this.abilitySystem.destroy();
        }
        
        if (this.waveSystem) {
            this.waveSystem.destroy();
        }
        
        if (this.gestureSystem) {
            this.gestureSystem.destroy();
        }
        
        if (this.itemDropSystem) {
            this.itemDropSystem.destroy();
        }
        
        // Очищаем защитные объекты (ямы)
        this.clearDefenses();
        
        if (this.effectSystem) {
            this.effectSystem.clearAllEffects();
        }
        
        if (this.abilitiesDisplay) {
            this.abilitiesDisplay.destroy();
        }
    }
}
