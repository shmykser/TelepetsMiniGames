/**
 * Стратегия дерганого движения (комар)
 * Линейное движение к цели с случайными отклонениями
 */
export class JitteryMovementStrategy {
    constructor(gameObject, config) {
        this.gameObject = gameObject;
        this.config = config;
        
        // Получаем конфигурацию движения
        const movementConfig = config.get('movement', {});
        
        // Параметры движения
        this.speed = movementConfig.speed || config.get('speed', 80);
        this.rotationSpeed = movementConfig.rotationSpeed || config.get('rotationSpeed', 0.15);
        
        // Получаем attackRange из конфигурации атаки, а не движения
        const attackConfig = config.get('attack', {});
        this.attackRange = attackConfig.range || config.get('attackRange', 30);
        
        // Параметры дерганого движения
        this.jitterIntensity = movementConfig.jitterIntensity || config.get('jitterIntensity', 20); // Максимальное отклонение в пикселях
        this.jitterFrequency = movementConfig.jitterFrequency || config.get('jitterFrequency', 0.1); // Частота смены направления (0-1)
        this.jitterSmoothness = movementConfig.jitterSmoothness || config.get('jitterSmoothness', 0.3); // Плавность перехода (0=резкий, 1=очень плавный)
        
        // Состояние движения
        this.currentTarget = null;
        this.currentJitter = { x: 0, y: 0 };
        this.targetJitter = { x: 0, y: 0 };
        this.jitterTimer = 0;
        this.lastJitterChange = 0;
        this.targetReachedEmitted = false;
        
    }

    /**
     * Обновление стратегии
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    update(time, delta) {
        if (!this.currentTarget) return;

        const deltaSeconds = delta / 1000;
        
        // Проверяем расстояние до цели
        const distance = Math.sqrt(
            Math.pow(this.currentTarget.x - this.gameObject.x, 2) + 
            Math.pow(this.currentTarget.y - this.gameObject.y, 2)
        );
        
        // Если цель в радиусе атаки, останавливаемся
        if (distance <= this.attackRange) {
            // Эмитируем событие достижения цели только один раз
            if (!this.targetReachedEmitted && this.gameObject.scene && this.gameObject.scene.events) {
                console.log(`🪰 [JitteryMovement] Муха достигла цели! Расстояние: ${distance.toFixed(1)}, attackRange: ${this.attackRange}`);
                this.gameObject.scene.events.emit('movement:targetReached', this.currentTarget);
                this.targetReachedEmitted = true;
            }
            return;
        }
        
        // Обновляем дерганое движение
        this.updateJitter(time, deltaSeconds);
        
        // Вычисляем базовое направление к цели (без дерга)
        const baseDirection = this.calculateBaseDirection();
        
        // Применяем базовое движение к цели
        this.applyMovement(baseDirection, deltaSeconds);
        
        // Применяем дерг как смещение позиции (очень сильное)
        this.applyJitterOffset(deltaSeconds);
        
        // Поворачиваем спрайт к направлению движения
        this.rotateToDirection(baseDirection);
    }

    /**
     * Обновление дерганого движения
     * @param {number} time - Текущее время
     * @param {number} deltaSeconds - Время в секундах
     */
    updateJitter(time, deltaSeconds) {
        // Проверяем, нужно ли изменить направление дерга
        const timeSinceLastChange = time - this.lastJitterChange;
        const changeInterval = (1 - this.jitterFrequency) * 200; // Интервал в миллисекундах (уменьшен для более частого дерга)
        
        if (timeSinceLastChange > changeInterval) {
            // Генерируем новое случайное направление дерга
            const angle = Math.random() * Math.PI * 2;
            const intensity = this.jitterIntensity; // Используем полную интенсивность
            
            this.targetJitter = {
                x: Math.cos(angle) * intensity,
                y: Math.sin(angle) * intensity
            };
            
            this.lastJitterChange = time;
        }
        
        // Плавно переходим к целевому дергу
        // jitterSmoothness: 0 = мгновенный переход (резкий), 1 = очень плавный переход
        const smoothness = this.jitterSmoothness * deltaSeconds * 20; // Увеличена скорость перехода
        this.currentJitter.x += (this.targetJitter.x - this.currentJitter.x) * smoothness;
        this.currentJitter.y += (this.targetJitter.y - this.currentJitter.y) * smoothness;
    }

    /**
     * Вычисление базового направления к цели (без дерга)
     * @returns {Object} Направление {x, y}
     */
    calculateBaseDirection() {
        if (!this.currentTarget) return { x: 0, y: 0 };

        const dx = this.currentTarget.x - this.gameObject.x;
        const dy = this.currentTarget.y - this.gameObject.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return { x: 0, y: 0 };
        
        return {
            x: dx / distance,
            y: dy / distance
        };
    }



    /**
     * Поворот спрайта к цели
     * @param {Object} direction - Направление движения
     */
    rotateToDirection(direction) {
        if (direction.x === 0 && direction.y === 0) return;

        const targetAngle = Math.atan2(direction.y, direction.x);
        const currentAngle = this.gameObject.rotation;
        const angleDiff = this.normalizeAngle(targetAngle - currentAngle);
        
        if (Math.abs(angleDiff) > 0.01) {
            const newAngle = currentAngle + angleDiff * this.rotationSpeed;
            this.gameObject.setRotation(newAngle);
        } else {
            this.gameObject.setRotation(targetAngle);
        }
    }

    /**
     * Применение движения
     * @param {Object} direction - Направление движения
     * @param {number} deltaSeconds - Время в секундах
     */
    applyMovement(direction, deltaSeconds) {
        const moveX = direction.x * this.speed * deltaSeconds;
        const moveY = direction.y * this.speed * deltaSeconds;
        
        this.gameObject.x += moveX;
        this.gameObject.y += moveY;
    }

    /**
     * Применение дерга как смещения позиции
     * @param {number} deltaSeconds - Время в секундах
     */
    applyJitterOffset(deltaSeconds) {
        // Применяем дерг как смещение позиции
        // Убираем deltaSeconds чтобы дерг был мгновенным, но видимым
        const jitterX = this.currentJitter.x;
        const jitterY = this.currentJitter.y;
        
        this.gameObject.x += jitterX;
        this.gameObject.y += jitterY;
    }


    /**
     * Нормализация угла в диапазон [-π, π]
     * @param {number} angle - Угол в радианах
     * @returns {number} Нормализованный угол
     */
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }

    /**
     * Установка цели
     * @param {Object} target - Цель для движения
     */
    setTarget(target) {
        this.currentTarget = target;
        
        if (target) {
            // Сбрасываем дерг при смене цели
            this.currentJitter = { x: 0, y: 0 };
            this.targetJitter = { x: 0, y: 0 };
            this.targetReachedEmitted = false;
        }
    }

    /**
     * Получение текущего состояния движения
     * @returns {Object}
     */
    getMovementState() {
        return {
            speed: this.speed,
            currentJitter: this.currentJitter,
            targetJitter: this.targetJitter,
            hasTarget: !!this.currentTarget
        };
    }

    /**
     * Сброс стратегии
     */
    reset() {
        this.currentTarget = null;
        this.currentJitter = { x: 0, y: 0 };
        this.targetJitter = { x: 0, y: 0 };
        this.jitterTimer = 0;
        this.lastJitterChange = 0;
        this.targetReachedEmitted = false;
    }
}
