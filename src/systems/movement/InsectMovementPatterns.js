/**
 * Рефакторенная система паттернов движения для насекомых
 * Использует паттерны Strategy + Factory + Template Method
 * Основана на лучших практиках геймдева и принципах DRY
 */
import { MovementStrategies } from './MovementStrategies.js';
import { GeometryUtils } from '../../utils/GeometryUtils.js';
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

    // Вспомогательные методы (перенесены в GeometryUtils)






    updateEnergy(deltaTime) {
        // Энергия уменьшается со временем
        this.energy = GeometryUtils.max(0, this.energy - deltaTime * 0.01);
        
        // Восстановление энергии при покое
        if (this.state === 'resting') {
            this.energy = GeometryUtils.min(100, this.energy + deltaTime * 0.05);
        }
    }

    updateState(x, y, targetX, targetY, context) {
        const distance = GeometryUtils.distance(x, y, targetX, targetY);
        
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
