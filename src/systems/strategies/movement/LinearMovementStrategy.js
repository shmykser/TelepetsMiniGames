import { GeometryUtils } from '../../../utils/GeometryUtils.js';

/**
 * Стратегия линейного движения
 * Простое движение по прямой к цели
 */
export class LinearMovementStrategy {
    constructor(gameObject, config) {
        this.gameObject = gameObject;
        this.config = config;
        // Получаем конфигурацию движения
        const movementConfig = config.get('movement', {});
        
        this.speed = movementConfig.speed || config.get('speed', 100);
        this.attackRange = movementConfig.attackRange || config.get('attackRange', 30);
    }

    /**
     * Обновление стратегии
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    update(time, delta) {
        // Эта стратегия не требует дополнительной логики
        // Вся логика движения обрабатывается в MovementSystem
    }

    /**
     * Получение направления к цели
     * @param {Object} target - Цель {x, y}
     * @returns {Object} Направление {x, y}
     */
    getDirection(target) {
        const dx = target.x - this.gameObject.x;
        const dy = target.y - this.gameObject.y;
        return GeometryUtils.normalize(dx, dy);
    }

    /**
     * Проверка, достигнута ли цель
     * @param {Object} target - Цель
     * @returns {boolean}
     */
    isTargetReached(target) {
        const distance = GeometryUtils.distance(
            this.gameObject.x, 
            this.gameObject.y, 
            target.x, 
            target.y
        );
        return distance <= this.attackRange;
    }

    /**
     * Получение скорости движения
     * @returns {number}
     */
    getSpeed() {
        return this.speed;
    }

    /**
     * Установка скорости
     * @param {number} speed - Скорость
     */
    setSpeed(speed) {
        this.speed = speed;
    }

    /**
     * Уничтожение стратегии
     */
    destroy() {
        this.gameObject = null;
        this.config = null;
    }
}