/**
 * Рефакторенная система паттернов движения для насекомых
 * Использует паттерны Strategy + Factory + Template Method
 * Основана на лучших практиках геймдева и принципах DRY
 */
import { MovementStrategies } from './MovementStrategies.js';
import { MovementPatternFactory } from './MovementPatternFactory.js';

export class InsectMovementPatterns {
    constructor(type, params = {}) {
        // Создаем паттерн через фабрику
        this.pattern = MovementPatternFactory.createPattern(type, params);
        this.type = type;
        this.time = 0;
        this.state = 'idle';
        this.lastDirection = { x: 1, y: 0 };
        this.targetPosition = null;
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        this.energy = 100; // Энергия для реалистичного поведения
        this.aggression = 0; // Уровень агрессии
    }

    /**
     * Template Method - основной алгоритм движения
     * Определяет общую структуру, делегируя конкретную реализацию стратегиям
     */
    update(x, y, targetX, targetY, deltaTime, context = {}) {
        // Проверяем на валидность входных данных
        if (!isFinite(x) || !isFinite(y) || !isFinite(targetX) || !isFinite(targetY) || !isFinite(deltaTime)) {
            console.warn('Invalid input parameters:', { x, y, targetX, targetY, deltaTime });
            return { x: x || 0, y: y || 0 };
        }
        
        // Обновляем внутреннее состояние
        this.time += deltaTime;
        this.updateEnergy(deltaTime);
        this.updateState(x, y, targetX, targetY, context);
        
        // Добавляем время в контекст для стратегий
        const enrichedContext = { ...context, time: this.time };
        
        // Выполняем движение через стратегию
        const result = this.executeMovementStrategy(x, y, targetX, targetY, deltaTime, enrichedContext);
        
        // Проверяем результат на валидность
        if (!isFinite(result.x) || !isFinite(result.y)) {
            console.warn('Invalid result from pattern:', this.type, result);
            return { x: x, y: y };
        }
        
        return result;
    }

    /**
     * Выполняет движение через выбранную стратегию
     */
    executeMovementStrategy(x, y, targetX, targetY, deltaTime, context) {
        const strategy = this.pattern.strategy;
        const params = this.pattern.params;
        
        // Проверяем, что стратегия существует
        if (typeof MovementStrategies[strategy] !== 'function') {
            console.warn(`Unknown movement strategy: ${strategy}, falling back to linear`);
            return MovementStrategies.linear(x, y, targetX, targetY, deltaTime, context, params);
        }
        
        // Выполняем стратегию
        return MovementStrategies[strategy](x, y, targetX, targetY, deltaTime, context, params);
    }

    /**
     * Создает новый паттерн движения для другого типа насекомого
     */
    createPatternForType(type, customParams = {}) {
        this.pattern = MovementPatternFactory.createPattern(type, customParams);
        this.type = type;
        this.time = 0;
        this.state = 'idle';
        this.energy = 100;
        this.aggression = 0;
    }

    /**
     * Создает кастомный паттерн с указанной стратегией
     */
    createCustomPattern(strategy, params = {}) {
        this.pattern = MovementPatternFactory.createCustomPattern(strategy, params);
        this.type = 'custom';
        this.time = 0;
        this.state = 'idle';
        this.energy = 100;
        this.aggression = 0;
    }

    /**
     * Получает информацию о текущем паттерне
     */
    getPatternInfo() {
        return {
            type: this.type,
            strategy: this.pattern.strategy,
            params: this.pattern.params,
            state: this.state,
            energy: this.energy,
            aggression: this.aggression
        };
    }

    // Вспомогательные методы (делегируем в MovementStrategies)
    normalizeDirection(dx, dy) {
        return MovementStrategies.normalizeDirection(dx, dy);
    }

    calculateZigzag(time, intensity) {
        return MovementStrategies.calculateZigzag(time, intensity);
    }

    calculateFlutter(time, intensity) {
        return MovementStrategies.calculateFlutter(time, intensity);
    }

    calculateSeasonalBehavior(time) {
        const season = Math.floor(time / 10000) % 4; // Смена сезона каждые 10 секунд
        const seasonalIntensity = [0.2, 0.8, 0.5, 0.1][season]; // весна, лето, осень, зима
        return {
            x: (Math.random() - 0.5) * seasonalIntensity,
            y: (Math.random() - 0.5) * seasonalIntensity
        };
    }

    calculateColonyDirection(x, y, otherAnts) {
        if (!otherAnts || otherAnts.length === 0) return { x: 0, y: 0 };
        
        let avgX = 0, avgY = 0;
        otherAnts.forEach(ant => {
            avgX += ant.x - x;
            avgY += ant.y - y;
        });
        
        return this.normalizeDirection(avgX / otherAnts.length, avgY / otherAnts.length);
    }

    calculateSwarmCenter(otherMosquitoes) {
        if (!otherMosquitoes || otherMosquitoes.length === 0) return { x: 0, y: 0 };
        
        let avgX = 0, avgY = 0;
        otherMosquitoes.forEach(mosquito => {
            avgX += mosquito.x;
            avgY += mosquito.y;
        });
        
        return {
            x: avgX / otherMosquitoes.length,
            y: avgY / otherMosquitoes.length
        };
    }

    calculatePatrolDirection(x, y) {
        // Простое патрулирование по кругу
        const angle = this.time * 0.001;
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    calculatePheromoneInfluence(x, y, pheromones) {
        if (!pheromones || pheromones.length === 0) return { x: 0, y: 0 };
        
        let influenceX = 0, influenceY = 0;
        pheromones.forEach(pheromone => {
            const distance = Math.sqrt((pheromone.x - x) ** 2 + (pheromone.y - y) ** 2);
            if (distance < 100) {
                const strength = pheromone.strength / (distance + 1);
                influenceX += (pheromone.x - x) * strength;
                influenceY += (pheromone.y - y) * strength;
            }
        });
        
        return this.normalizeDirection(influenceX, influenceY);
    }

    updateEnergy(deltaTime) {
        // Энергия уменьшается со временем
        this.energy = Math.max(0, this.energy - deltaTime * 0.01);
        
        // Восстановление энергии при покое
        if (this.state === 'resting') {
            this.energy = Math.min(100, this.energy + deltaTime * 0.05);
        }
    }

    updateState(x, y, targetX, targetY, context) {
        const distance = Math.sqrt((targetX - x) ** 2 + (targetY - y) ** 2);
        
        // Переходы состояний на основе энергии и расстояния
        if (this.energy < 20 && this.state !== 'resting') {
            this.state = 'resting';
        } else if (this.energy > 50 && this.state === 'resting') {
            this.state = 'active';
        }
    }

    // Сброс состояния
    reset() {
        this.time = 0;
        this.state = 'idle';
        this.energy = 100;
        this.aggression = 0;
    }
}
