import { settings } from '../../config/settings.js';
import { Enemy } from './objects/Enemy';
import { enemyTypes } from './types/enemyTypes';

/**
 * Менеджер волн в стиле Vampire Survivors
 * Управляет временными волнами, сложностью и спавном врагов
 */
export class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.gameSettings = settings.game;
        
        // Состояние игры
        this.gameStartTime = 0;
        this.currentMinute = 1;
        this.isGameActive = false;
        this.isGameEnded = false;
        
        // Статистика
        this.totalEnemiesSpawned = 0;
        this.totalEnemiesKilled = 0;
        this.currentEnemiesOnScreen = 0;
        
        // Настройки спавна
        this.spawnTimer = null;
        this.currentSpawnRate = this.gameSettings.spawn.baseRate;
        
        // Список врагов на экране
        this.enemies = [];
        
        // Цель для врагов (яйцо)
        this.target = null;
        
        // Привязываем методы
        this.update = this.update.bind(this);
        this.spawnEnemy = this.spawnEnemy.bind(this);
    }
    
    /**
     * Запускает игру
     */
    startGame() {
        this.gameStartTime = this.scene.time.now;
        this.isGameActive = true;
        this.isGameEnded = false;
        this.currentMinute = 1;
        this.totalEnemiesSpawned = 0;
        this.totalEnemiesKilled = 0;
        this.currentEnemiesOnScreen = 0;
        this.enemies = [];
        
        
        // Запускаем спавн врагов
        this.startSpawning();
        
        // Эмитим событие начала игры
        this.scene.events.emit('gameStarted', {
            duration: this.gameSettings.duration,
            maxWaves: this.gameSettings.maxWaves
        });
    }
    
    /**
     * Останавливает игру
     */
    stopGame() {
        this.isGameActive = false;
        this.isGameEnded = true;
        
        // Останавливаем спавн
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
            this.spawnTimer = null;
        }
        
        
        // Эмитим событие окончания игры
        this.scene.events.emit('gameEnded', {
            totalEnemiesSpawned: this.totalEnemiesSpawned,
            totalEnemiesKilled: this.totalEnemiesKilled,
            gameTime: this.scene.time.now - this.gameStartTime
        });
    }
    
    /**
     * Запускает спавн врагов
     */
    startSpawning() {
        this.scheduleNextSpawn();
    }
    
    /**
     * Планирует следующий спавн
     */
    scheduleNextSpawn() {
        if (!this.isGameActive) return;
        
        // Проверяем лимит врагов на экране
        if (this.currentEnemiesOnScreen >= this.gameSettings.spawn.maxEnemiesOnScreen) {
            // Если достигли лимита, ждем немного и пробуем снова
            this.spawnTimer = this.scene.time.delayedCall(500, this.scheduleNextSpawn);
            return;
        }
        
        // Вычисляем задержку до следующего спавна
        const delay = this.calculateSpawnDelay();
        
        this.spawnTimer = this.scene.time.delayedCall(delay, () => {
            this.spawnEnemy();
            this.scheduleNextSpawn();
        });
    }
    
    /**
     * Вычисляет задержку до следующего спавна
     */
    calculateSpawnDelay() {
        const gameProgress = this.getGameProgress(); // 0-1
        const minRate = this.gameSettings.spawn.minRate;
        const baseRate = this.gameSettings.spawn.baseRate;
        
        // Экспоненциальное ускорение спавна
        const currentRate = baseRate * Math.pow(this.gameSettings.spawn.rateMultiplier, gameProgress * 10);
        const finalRate = Math.max(minRate, currentRate);
        
        // Добавляем небольшую случайность
        const randomFactor = Phaser.Math.FloatBetween(0.8, 1.2);
        
        return finalRate * randomFactor;
    }
    
    /**
     * Создает врага
     */
    spawnEnemy() {
        if (!this.isGameActive) {
            return;
        }
        
        // Выбираем тип врага
        const enemyType = this.selectEnemyType();
        if (!enemyType) {
            return;
        }
        
        // Выбираем позицию спавна
        const position = this.getSpawnPosition();
        
        // Создаем врага
        const enemy = this.createEnemy(enemyType, position.x, position.y);
        if (!enemy) {
            return;
        }
        
        
        // Добавляем в список
        this.enemies.push(enemy);
        this.currentEnemiesOnScreen++;
        this.totalEnemiesSpawned++;
        
        // Настраиваем обработчик смерти
        enemy.on('enemyKilled', this.onEnemyKilled.bind(this));
        
        // Устанавливаем цель для врага (яйцо)
        if (this.target) {
            enemy.setTarget(this.target);
        }
        
        // Эмитим событие спавна
        this.scene.events.emit('enemySpawned', {
            enemyType: enemyType,
            position: position,
            totalSpawned: this.totalEnemiesSpawned
        });
    }
    
    /**
     * Выбирает тип врага для спавна
     */
    selectEnemyType() {
        const availableTypes = this.getAvailableEnemyTypes();
        if (availableTypes.length === 0) {
            return null;
        }
        
        // Получаем веса для доступных типов
        const weights = availableTypes.map(type => this.gameSettings.waves.enemyWeights[type] || 1);
        
        // Выбираем случайный тип с учетом весов (используем простой метод)
        const selectedType = this.selectRandomWithWeights(availableTypes, weights);
        
        return selectedType;
    }
    
    /**
     * Выбирает случайный элемент с учетом весов
     */
    selectRandomWithWeights(items, weights) {
        if (items.length === 0) return null;
        if (items.length === 1) return items[0];
        
        // Вычисляем общий вес
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        // Генерируем случайное число
        const random = Phaser.Math.Between(0, totalWeight - 1);
        
        // Находим элемент по весу
        let currentWeight = 0;
        for (let i = 0; i < items.length; i++) {
            currentWeight += weights[i];
            if (random < currentWeight) {
                return items[i];
            }
        }
        
        // Fallback - возвращаем последний элемент
        return items[items.length - 1];
    }
    
    /**
     * Получает доступные типы врагов для текущей минуты
     */
    getAvailableEnemyTypes() {
        const enemyTypesByMinute = this.gameSettings.waves.enemyTypesByMinute;
        // Находим все типы врагов, доступные до текущей минуты
        const availableTypes = [];
        for (let minute = 1; minute <= this.currentMinute; minute++) {
            if (enemyTypesByMinute[minute]) {
                availableTypes.push(...enemyTypesByMinute[minute]);
            }
        }
        
        // Убираем дубликаты
        const uniqueTypes = [...new Set(availableTypes)];
        
        return uniqueTypes;
    }
    
    /**
     * Получает позицию для спавна врага
     */
    getSpawnPosition() {
        const { width, height } = this.scene.scale;
        const margin = 50;
        
        // Спавним по краям экрана
        const side = Phaser.Math.Between(0, 3); // 0-верх, 1-право, 2-низ, 3-лево
        
        let x, y;
        switch (side) {
            case 0: // Верх
                x = Phaser.Math.Between(margin, width - margin);
                y = -margin;
                break;
            case 1: // Право
                x = width + margin;
                y = Phaser.Math.Between(margin, height - margin);
                break;
            case 2: // Низ
                x = Phaser.Math.Between(margin, width - margin);
                y = height + margin;
                break;
            case 3: // Лево
                x = -margin;
                y = Phaser.Math.Between(margin, height - margin);
                break;
        }
        
        return { x, y };
    }
    
    /**
     * Создает врага с модификаторами сложности
     */
    createEnemy(enemyType, x, y) {
        const enemyData = enemyTypes[enemyType];
        if (!enemyData) return null;
        
        // Применяем модификаторы сложности
        const gameProgress = this.getGameProgress();
        const healthMultiplier = Math.pow(this.gameSettings.difficulty.healthMultiplier, gameProgress * 5);
        const speedMultiplier = Math.pow(this.gameSettings.difficulty.speedMultiplier, gameProgress * 3);
        const damageMultiplier = Math.pow(this.gameSettings.difficulty.damageMultiplier, gameProgress * 4);
        
        const modifiedHealth = Math.floor(enemyData.health * healthMultiplier);
        const modifiedSpeed = Math.floor(enemyData.speed * speedMultiplier);
        const modifiedDamage = Math.floor(enemyData.damage * damageMultiplier);
        
        // Создаем врага
        const enemy = Enemy.CreateEnemy(this.scene, enemyType, x, y);
        
        // Применяем модификаторы
        enemy.health = modifiedHealth;
        enemy.speed = modifiedSpeed;
        enemy.damage = modifiedDamage;
        
        // Устанавливаем кулдаун (в миллисекундах)
        enemy.cooldown = enemyData.cooldown * 1000;
        
        // Устанавливаем радиус атаки
        enemy.attackRange = enemyData.attackRange;
        
        return enemy;
    }
    
    /**
     * Обработчик смерти врага
     */
    onEnemyKilled(enemy) {
        console.log(`💀 WaveManager.onEnemyKilled: враг ${enemy.enemyType || 'неизвестный'} убит`);
        this.totalEnemiesKilled++;
        this.currentEnemiesOnScreen--;
        
        // Удаляем из списка
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            console.log(`💀 WaveManager.onEnemyKilled: враг удален из списка, осталось врагов: ${this.enemies.length}`);
        }
        
        // Эмитим событие смерти
        console.log(`💀 WaveManager.onEnemyKilled: эмитим событие enemyKilled в сцену`);
        this.scene.events.emit('enemyKilled', {
            enemy: enemy,
            enemyType: enemy.enemyType,
            totalKilled: this.totalEnemiesKilled
        });
    }
    
    /**
     * Обновляет состояние менеджера
     */
    update() {
        if (!this.isGameActive) return;
        
        // Проверяем окончание игры
        const gameTime = this.scene.time.now - this.gameStartTime;
        if (gameTime >= this.gameSettings.duration) {
            this.stopGame();
            return;
        }
        
        // Обновляем текущую минуту
        const newMinute = Math.floor(gameTime / this.gameSettings.waveDuration) + 1;
        if (newMinute !== this.currentMinute) {
            this.currentMinute = newMinute;
            this.onMinuteChanged();
        }
        
        // Очищаем мертвых врагов
        this.enemies = this.enemies.filter(enemy => enemy && enemy.isAlive);
    }
    
    /**
     * Обработчик смены минуты
     */
    onMinuteChanged() {
        const availableTypes = this.getAvailableEnemyTypes();
        
        // Эмитим событие смены минуты
        this.scene.events.emit('minuteChanged', {
            minute: this.currentMinute,
            availableEnemyTypes: availableTypes,
            gameProgress: this.getGameProgress()
        });
    }
    
    /**
     * Получает прогресс игры (0-1)
     */
    getGameProgress() {
        if (!this.isGameActive) return 0;
        
        const gameTime = this.scene.time.now - this.gameStartTime;
        return Math.min(1, gameTime / this.gameSettings.duration);
    }
    
    /**
     * Получает оставшееся время в миллисекундах
     */
    getRemainingTime() {
        if (!this.isGameActive) return 0;
        
        const gameTime = this.scene.time.now - this.gameStartTime;
        return Math.max(0, this.gameSettings.duration - gameTime);
    }
    
    /**
     * Устанавливает цель для всех врагов
     */
    setTarget(target) {
        this.target = target;
        
        // Устанавливаем цель для всех существующих врагов
        this.enemies.forEach(enemy => {
            if (enemy && enemy.setTarget) {
                enemy.setTarget(target);
            }
        });
        
    }

    /**
     * Получает информацию о текущем состоянии
     */
    getGameInfo() {
        return {
            isActive: this.isGameActive,
            isEnded: this.isGameEnded,
            currentMinute: this.currentMinute,
            gameProgress: this.getGameProgress(),
            remainingTime: this.getRemainingTime(),
            totalEnemiesSpawned: this.totalEnemiesSpawned,
            totalEnemiesKilled: this.totalEnemiesKilled,
            currentEnemiesOnScreen: this.currentEnemiesOnScreen,
            availableEnemyTypes: this.getAvailableEnemyTypes()
        };
    }
    
    /**
     * Уничтожает менеджер
     */
    destroy() {
        this.stopGame();
        
        // Уничтожаем всех врагов
        this.enemies.forEach(enemy => {
            if (enemy && enemy.destroy) {
                enemy.destroy();
            }
        });
        
        this.enemies = [];
    }
}
