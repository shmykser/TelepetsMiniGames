import { InsectMovementPatterns } from './InsectMovementPatterns.js';

/**
 * Система управления движением врагов
 * Управляет паттернами движения для всех типов врагов
 */
export class MovementSystem {
    constructor(scene) {
        this.scene = scene;
        this.patterns = new Map(); // Кэш паттернов для каждого врага
        this.context = {
            otherEnemies: [],
            pheromones: [],
            obstacles: []
        };
    }

    /**
     * Получить или создать паттерн движения для врага
     * @param {string} enemyType - Тип врага
     * @param {string} enemyId - Уникальный ID врага
     * @returns {InsectMovementPatterns} Паттерн движения
     */
    getPattern(enemyType, enemyId) {
        if (!this.patterns.has(enemyId)) {
            const pattern = new InsectMovementPatterns(enemyType);
            this.patterns.set(enemyId, pattern);
            console.log(`🔄 Created movement pattern for ${enemyType} (ID: ${enemyId})`);
        }
        return this.patterns.get(enemyId);
    }

    /**
     * Обновить движение врага
     * @param {Enemy} enemy - Объект врага
     * @param {GameObject} target - Цель (яйцо)
     * @param {number} deltaTime - Время с последнего обновления
     */
    updateEnemyMovement(enemy, target, deltaTime) {
        const pattern = this.getPattern(enemy.enemyType, enemy.id);
        
        // Отладочный лог для проверки паттерна
        if (enemy.enemyType === 'ant' && Math.random() < 0.05) {
            console.log(`🐜 MovementSystem Pattern Debug:`, {
                enemyType: enemy.enemyType,
                patternType: pattern.type,
                patternParams: pattern.params,
                hasPattern: !!pattern
            });
        }
        
        // Обновляем контекст
        this.updateContext(enemy, target);
        
        // Добавляем enemyData в контекст для доступа к базовым параметрам
        this.context.enemyData = enemy.enemyData;
        
        // Получаем новую позицию
        const newPosition = pattern.update(
            enemy.x,
            enemy.y,
            target.x,
            target.y,
            deltaTime,
            this.context
        );
        
        // Применяем движение через Phaser Physics
        const direction = this.normalizeDirection(newPosition.x - enemy.x, newPosition.y - enemy.y);
        const baseSpeed = 10; // Базовая скорость
        const actualSpeed = baseSpeed * enemy.speed;
        
        // Отладочные логи для муравья
        if (enemy.enemyType === 'ant' && Math.random() < 0.1) {
            console.log(`🐜 MovementSystem Debug:`, {
                enemyType: enemy.enemyType,
                position: `(${enemy.x.toFixed(1)}, ${enemy.y.toFixed(1)})`,
                target: `(${target.x.toFixed(1)}, ${target.y.toFixed(1)})`,
                newPosition: `(${newPosition.x.toFixed(1)}, ${newPosition.y.toFixed(1)})`,
                direction: `(${direction.x.toFixed(3)}, ${direction.y.toFixed(3)})`,
                speed: {
                    base: baseSpeed,
                    enemy: enemy.speed,
                    actual: actualSpeed.toFixed(1)
                },
                velocity: `(${(direction.x * actualSpeed).toFixed(1)}, ${(direction.y * actualSpeed).toFixed(1)})`,
                deltaTime: deltaTime
            });
        }
        
        enemy.physicsBody.setVelocity(
            direction.x * actualSpeed,
            direction.y * actualSpeed
        );
    }

    /**
     * Обновить контекст для паттернов движения
     * @param {Enemy} currentEnemy - Текущий враг
     * @param {GameObject} target - Цель
     */
    updateContext(currentEnemy, target) {
        // Собираем информацию о других врагах
        this.context.otherEnemies = this.scene.enemies?.getChildren() || [];
        
        // Фильтруем текущего врага
        this.context.otherEnemies = this.context.otherEnemies.filter(
            enemy => enemy.id !== currentEnemy.id
        );
        
        // Обновляем информацию о препятствиях (можно добавить позже)
        this.context.obstacles = [];
        
        // Обновляем феромоны (можно добавить позже)
        this.context.pheromones = [];
    }

    /**
     * Удалить паттерн движения врага
     * @param {string} enemyId - ID врага
     */
    removePattern(enemyId) {
        this.patterns.delete(enemyId);
    }

    /**
     * Очистить все паттерны
     */
    clearAllPatterns() {
        this.patterns.clear();
    }

    /**
     * Получить статистику системы движения
     * @returns {Object} Статистика
     */
    getStats() {
        return {
            activePatterns: this.patterns.size,
            patternTypes: Array.from(this.patterns.values()).map(p => p.type)
        };
    }
    
    /**
     * Нормализует направление
     * @param {number} dx - Изменение по X
     * @param {number} dy - Изменение по Y
     * @returns {Object} Нормализованное направление
     */
    normalizeDirection(dx, dy) {
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return { x: 0, y: 0 };
        return { x: dx / length, y: dy / length };
    }
}
