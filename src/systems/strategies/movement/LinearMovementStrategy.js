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
    }

    /**
     * Обновление стратегии
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    update(time, delta) {
        // Простое линейное движение к цели
        if (this.gameObject.target) {
            this.moveToTarget(this.gameObject.target);
        } else {
            // Логируем для муравья
            if (this.gameObject.enemyType === 'ant') {

            }
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
        if (this.isTargetReached(target)) {
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
        const effectiveRange = GeometryUtils.effectiveAttackRange(this.gameObject, target, this.attackRange);
        const reached = distance <= effectiveRange;
        
        
        return reached;
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
