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
        
        // Получаем базовый радиус ТОЛЬКО из attack.range
        const attackConfig = config.get('attack', {});
        this.attackRange = attackConfig.range || 0;

        // Поддержка внешней цели (waypoint) от MovementSystem
        this.currentTarget = null;
    }

    /**
     * Обновление стратегии
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    update(time, delta) {
        // Простое линейное движение к цели: приоритет внешнему waypoint
        const target = this.currentTarget || this.gameObject.target;
        
        if (target) {
            this.moveToTarget(target);
        }
    }

    /**
     * Движение к цели
     * @param {Object} target - Цель {x, y}
     */
    moveToTarget(target) {
        if (!target || !this.gameObject.isAlive) {
            this.stopMovement();
            return;
        }

        // Проверяем, достигнута ли цель
        const targetReached = this.isTargetReached(target);
        
        if (targetReached) {
            this.stopMovement();
            return;
        }

        // Получаем направление к цели
        const direction = this.getDirection(target);
        
        // Вычисляем скорость
        const velocityX = direction.x * this.speed;
        const velocityY = direction.y * this.speed;
        
        // Применяем движение
        this.gameObject.setVelocity(velocityX, velocityY);
        
        // Поворачиваем спрайт к цели
        this.rotateToTarget(target);
    }

    /**
     * Установка внешней цели (waypoint) от MovementSystem
     * @param {Object} target - Цель {x, y}
     */
    setTarget(target) {
        this.currentTarget = target;
    }

    /**
     * Остановка движения
     */
    stopMovement() {
        this.gameObject.setVelocity(0, 0);
    }

    /**
     * Поворот к цели
     * @param {Object} target - Цель {x, y}
     */
    rotateToTarget(target) {
        const angle = GeometryUtils.angleToTarget(this.gameObject.x, this.gameObject.y, target.x, target.y);
        this.gameObject.setRotation(angle);
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
        if (!target || !this.gameObject) return false;
        const distance = GeometryUtils.distance(this.gameObject.x, this.gameObject.y, target.x, target.y);
        
        // Используем фиксированный tolerance для достижения точек движения (waypoints или финальной цели)
        // Это НЕ то же самое что attack range - радиус атаки проверяется в AttackSystem.isInRange()
        // Задача стратегии движения - просто довести объект до точки назначения, а не проверять радиус атаки
        const MOVEMENT_TOLERANCE = 10;
        
        return distance <= MOVEMENT_TOLERANCE;
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
