import { GeometryUtils } from '../../utils/GeometryUtils.js';

/**
 * Общие стратегии движения для насекомых
 * Реализует паттерн Strategy для различных типов движения
 */
export class MovementStrategies {
    /**
     * Линейное движение - прямо к цели
     */
    static linear(x, y, targetX, targetY, deltaTime, context, params = {}) {
        const baseSpeed = context.enemyData?.speed || 5;
        const speed = baseSpeed * deltaTime * 0.01;
        const direction = GeometryUtils.normalize(targetX - x, targetY - y);
        
        return {
            x: x + direction.x * speed,
            y: y + direction.y * speed
        };
    }

    /**
     * Волновое движение - синусоидальные колебания
     */
    static wave(x, y, targetX, targetY, deltaTime, context, params = {}) {
        const baseSpeed = context.enemyData?.speed || 5;
        const speed = baseSpeed * deltaTime * 0.01;
        const direction = GeometryUtils.normalize(targetX - x, targetY - y);
        
        const amplitude = params.amplitude || 1.5;
        const frequency = params.frequency || 0.1;
        const offset = params.offset || 0.5;
        
        const waveOffset = GeometryUtils.calculateWaveOffset(context.time, frequency, amplitude);
        
        return {
            x: x + (direction.x + waveOffset) * speed,
            y: y + (direction.y + waveOffset * offset) * speed
        };
    }

    /**
     * Рывковое движение - периодические ускорения
     */
    static burst(x, y, targetX, targetY, deltaTime, context, params = {}) {
        const baseSpeed = context.enemyData?.speed || 5;
        const speed = baseSpeed * deltaTime * 0.01;
        const direction = GeometryUtils.normalize(targetX - x, targetY - y);
        
        const intensity = params.intensity || 2.5;
        const duration = params.duration || 300;
        const period = params.period || 1500;
        
        const burst = context.time % period < duration ? intensity : 0.3;
        
        return {
            x: x + direction.x * speed * burst,
            y: y + direction.y * speed * burst
        };
    }

    /**
     * Порхающее движение - плавные колебания
     */
    static flutter(x, y, targetX, targetY, deltaTime, context, params = {}) {
        const baseSpeed = context.enemyData?.speed || 5;
        const speed = baseSpeed * deltaTime * 0.01;
        const direction = GeometryUtils.normalize(targetX - x, targetY - y);
        
        const intensity = params.intensity || 0.6;
        const influence = params.influence || 1.5;
        
        const flutter = GeometryUtils.calculateFlutter(context.time, intensity);
        
        return {
            x: x + (direction.x + flutter.x * influence) * speed,
            y: y + (direction.y + flutter.y * influence) * speed
        };
    }

    /**
     * Зигзагообразное движение - резкие изменения направления
     */
    static zigzag(x, y, targetX, targetY, deltaTime, context, params = {}) {
        const baseSpeed = context.enemyData?.speed || 5;
        const speed = baseSpeed * deltaTime * 0.01;
        const direction = GeometryUtils.normalize(targetX - x, targetY - y);
        
        const amplitude = params.amplitude || 1.2;
        const influence = params.influence || 0.8;
        
        const zigzag = GeometryUtils.calculateZigzag(context.time, amplitude);
        
        return {
            x: x + (direction.x + zigzag.x * influence) * speed,
            y: y + (direction.y + zigzag.y * influence) * speed
        };
    }

    /**
     * Хаотичное движение - случайные отклонения
     */
    static chaos(x, y, targetX, targetY, deltaTime, context, params = {}) {
        const baseSpeed = context.enemyData?.speed || 5;
        const speed = baseSpeed * deltaTime * 0.01;
        
        const intensity = params.intensity || 2.0;
        const targetInfluence = params.targetInfluence || 0.7;
        const period = params.period || 1500;
        
        const chaosOffset = GeometryUtils.generateRandomOffset(intensity);
        const chaosX = chaosOffset.x;
        const chaosY = chaosOffset.y;
        
        const targetInfluenceFactor = context.time % period < period / 2 ? 
            targetInfluence : targetInfluence * 0.5;
        const direction = GeometryUtils.normalize(targetX - x, targetY - y);
        
        return {
            x: x + (chaosX + direction.x * targetInfluenceFactor) * speed,
            y: y + (chaosY + direction.y * targetInfluenceFactor) * speed
        };
    }

    /**
     * Комбинированное движение - смешивает несколько стратегий
     */
    static combined(x, y, targetX, targetY, deltaTime, context, params = {}) {
        const strategies = params.strategies || [];
        const weights = params.weights || [];
        
        if (strategies.length === 0) {
            return this.linear(x, y, targetX, targetY, deltaTime, context, params);
        }
        
        let resultX = 0, resultY = 0;
        let totalWeight = 0;
        
        strategies.forEach((strategy, index) => {
            const weight = weights[index] || 1;
            const strategyResult = this[strategy](x, y, targetX, targetY, deltaTime, context, params);
            
            resultX += strategyResult.x * weight;
            resultY += strategyResult.y * weight;
            totalWeight += weight;
        });
        
        return {
            x: resultX / totalWeight,
            y: resultY / totalWeight
        };
    }

    // Вспомогательные методы (перенесены в GeometryUtils)
}

