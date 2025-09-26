/**
 * Стратегия прыгающего движения (блоха)
 * Быстрые прыжки с остановками между ними
 */
export class JumpingMovementStrategy {
    constructor(gameObject, config) {
        this.gameObject = gameObject;
        this.config = config;
        
        // Получаем конфигурацию движения
        const movementConfig = config.get('movement', {});
        
        // Параметры движения
        this.speed = movementConfig.speed || config.get('speed', 150);
        this.rotationSpeed = movementConfig.rotationSpeed || config.get('rotationSpeed', 0.2);
        this.attackRange = movementConfig.attackRange || config.get('attackRange', 30);
        
        // Параметры прыжков
        this.jumpDuration = movementConfig.jumpDuration || config.get('jumpDuration', 200);
        this.restDuration = movementConfig.restDuration || config.get('restDuration', 500);
        this.jumpHeight = movementConfig.jumpHeight || config.get('jumpHeight', 30);
        this.jumpArc = movementConfig.jumpArc || config.get('jumpArc', 0.6);
        this.mass = movementConfig.mass || config.get('mass', 0.5);
        this.bounce = movementConfig.bounce || config.get('bounce', 0.3);
        this.drag = movementConfig.drag || config.get('drag', 0.98);
        
        // Состояние движения
        this.currentTarget = null;
        this.isJumping = false;
        this.isResting = false;
        this.wasJumping = false;
        this.wasResting = false;
        this.jumpStartTime = 0;
        this.restStartTime = 0;
        this.jumpStartPosition = { x: 0, y: 0 };
        this.jumpTargetPosition = { x: 0, y: 0 };
        this.jumpDirection = { x: 0, y: 0 };
        
        // Настраиваем физику
        this.setupPhysics();
    }

    /**
     * Настройка физики Phaser
     */
    setupPhysics() {
        if (this.gameObject.body) {
            this.gameObject.body.setCollideWorldBounds(true);
            this.gameObject.body.setBounce(this.bounce);
            this.gameObject.body.setDrag(this.drag);
            this.gameObject.body.setMass(this.mass);
            this.gameObject.body.setMaxVelocity(this.speed);
            
            // Диагностический лог для блохи
            if (this.gameObject.enemyType === 'flea') {
                console.log(`🦗 JUMPING: Настроена физика, скорость: ${this.speed}, масса: ${this.mass}, сопротивление: ${this.drag}`);
            }
        } else {
            console.error(`🦗 JUMPING: У объекта ${this.gameObject.enemyType} нет физического тела!`);
        }
    }

    /**
     * Обновление стратегии
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    update(time, delta) {
        if (!this.currentTarget) {
            // Диагностический лог для блохи
            if (this.gameObject.enemyType === 'flea' && Date.now() % 2000 < 100) {
                console.log(`🦗 JUMPING: Нет цели, враг: ${this.gameObject.enemyType}`);
            }
            return;
        }

        const deltaSeconds = delta / 1000;
        
        // Диагностический лог для блохи (только при смене состояния)
        if (this.gameObject.enemyType === 'flea' && this.isJumping && !this.wasJumping) {
            console.log(`🦗 JUMPING: Начинаем прыжок`);
        }
        if (this.gameObject.enemyType === 'flea' && this.isResting && !this.wasResting) {
            console.log(`🦗 JUMPING: Начинаем отдых`);
        }
        this.wasJumping = this.isJumping;
        this.wasResting = this.isResting;
        
        // Обновляем состояние прыжка
        this.updateJumpState(time);
        
        // Выполняем прыжок или отдых
        if (this.isJumping) {
            this.performJump(time, deltaSeconds);
        } else if (this.isResting) {
            this.performRest(time, deltaSeconds);
        } else {
            this.prepareNextJump();
        }
        
        // Поворачиваем спрайт к цели
        this.rotateToTarget();
    }

    /**
     * Обновление состояния прыжка
     * @param {number} time - Текущее время
     */
    updateJumpState(time) {
        if (this.isJumping) {
            const jumpElapsed = time - this.jumpStartTime;
            
            // Диагностический лог для блохи (только при завершении)
            if (this.gameObject.enemyType === 'flea' && jumpElapsed >= this.jumpDuration - 50) {
                console.log(`🦗 JUMPING: Прыжок завершается через ${this.jumpDuration - jumpElapsed}мс`);
            }
            
            if (jumpElapsed >= this.jumpDuration) {
                // Завершаем прыжок
                this.isJumping = false;
                this.isResting = true;
                this.restStartTime = time;
                
                // Останавливаем движение
                if (this.gameObject.body) {
                    this.gameObject.body.setVelocity(0, 0);
                }
                
                // Диагностический лог для блохи
                if (this.gameObject.enemyType === 'flea') {
                    console.log(`🦗 JUMPING: Прыжок завершен, начинаем отдых`);
                }
            }
        } else if (this.isResting) {
            const restElapsed = time - this.restStartTime;
            
            // Диагностический лог для блохи (только при завершении)
            if (this.gameObject.enemyType === 'flea' && restElapsed >= this.restDuration - 50) {
                console.log(`🦗 JUMPING: Отдых завершается через ${this.restDuration - restElapsed}мс`);
            }
            
            if (restElapsed >= this.restDuration) {
                // Завершаем отдых
                this.isResting = false;
                
                // Диагностический лог для блохи
                if (this.gameObject.enemyType === 'flea') {
                    console.log(`🦗 JUMPING: Отдых завершен, готовим следующий прыжок`);
                }
            }
        }
    }

    /**
     * Выполнение прыжка
     * @param {number} time - Текущее время
     * @param {number} deltaSeconds - Время в секундах
     */
    performJump(time, deltaSeconds) {
        if (!this.gameObject.body) return;
        
        const jumpProgress = (time - this.jumpStartTime) / this.jumpDuration;
        
        // Вычисляем направление и скорость
        const dx = this.jumpTargetPosition.x - this.jumpStartPosition.x;
        const dy = this.jumpTargetPosition.y - this.jumpStartPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Нормализуем направление
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Вычисляем скорость с учетом прогресса прыжка
            const speedMultiplier = this.easeInOutQuad(jumpProgress);
            const currentSpeed = this.speed * speedMultiplier;
            
            // Устанавливаем скорость через физику
            this.gameObject.body.setVelocity(
                dirX * currentSpeed,
                dirY * currentSpeed
            );
            
            // Диагностический лог для блохи (только в середине прыжка)
            if (this.gameObject.enemyType === 'flea' && Math.floor(jumpProgress * 10) === 5) {
                console.log(`🦗 JUMPING: Прыжок прогресс: ${(jumpProgress * 100).toFixed(1)}%, скорость: ${currentSpeed.toFixed(1)}`);
            }
        }
    }

    /**
     * Выполнение отдыха
     * @param {number} time - Текущее время
     * @param {number} deltaSeconds - Время в секундах
     */
    performRest(time, deltaSeconds) {
        // Во время отдыха блоха стоит на месте
        // Можно добавить небольшую анимацию покачивания
    }

    /**
     * Подготовка следующего прыжка
     */
    prepareNextJump() {
        if (!this.currentTarget) return;

        // Вычисляем направление к цели
        const dx = this.currentTarget.x - this.gameObject.x;
        const dy = this.currentTarget.y - this.gameObject.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        // Нормализуем направление
        this.jumpDirection = {
            x: dx / distance,
            y: dy / distance
        };
        
        // Вычисляем целевую позицию прыжка
        // speed в пикселях/секунду, jumpDuration в миллисекундах
        const jumpDistance = this.speed * (this.jumpDuration / 1000);
        this.jumpTargetPosition = {
            x: this.gameObject.x + this.jumpDirection.x * jumpDistance,
            y: this.gameObject.y + this.jumpDirection.y * jumpDistance
        };
        
        // Запоминаем стартовую позицию
        this.jumpStartPosition = {
            x: this.gameObject.x,
            y: this.gameObject.y
        };
        
        // Начинаем прыжок
        this.isJumping = true;
        this.jumpStartTime = this.gameObject.scene.time.now;
        
        // Диагностический лог для блохи
        if (this.gameObject.enemyType === 'flea') {
            console.log(`🦗 JUMPING: Начинаем прыжок к (${this.jumpTargetPosition.x.toFixed(1)}, ${this.jumpTargetPosition.y.toFixed(1)}), isJumping: ${this.isJumping}, время: ${this.jumpStartTime}`);
        }
    }

    /**
     * Поворот спрайта к цели
     */
    rotateToTarget() {
        if (!this.currentTarget) return;

        const dx = this.currentTarget.x - this.gameObject.x;
        const dy = this.currentTarget.y - this.gameObject.y;
        
        if (dx === 0 && dy === 0) return;

        const targetAngle = Math.atan2(dy, dx);
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
     * Линейная интерполяция
     * @param {number} start - Начальное значение
     * @param {number} end - Конечное значение
     * @param {number} t - Параметр интерполяции (0-1)
     * @returns {number} Интерполированное значение
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Функция плавности для прыжка (ease-in-out quadratic)
     * @param {number} t - Параметр (0-1)
     * @returns {number} Плавное значение
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
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
        if (!target) {
            this.currentTarget = null;
            return;
        }
        
        // Проверяем, изменилась ли цель значительно
        const targetChanged = !this.currentTarget || 
            Math.abs(this.currentTarget.x - target.x) > 5 || 
            Math.abs(this.currentTarget.y - target.y) > 5;
        
        this.currentTarget = target;
        
        if (targetChanged) {
            // Сбрасываем состояние только при значительной смене цели
            this.isJumping = false;
            this.isResting = false;
            
            // Диагностический лог для блохи
            if (this.gameObject.enemyType === 'flea') {
                console.log(`🦗 JUMPING: Установлена новая цель (${target.x.toFixed(1)}, ${target.y.toFixed(1)})`);
            }
        }
    }

    /**
     * Получение текущего состояния движения
     * @returns {Object}
     */
    getMovementState() {
        return {
            speed: this.speed,
            isJumping: this.isJumping,
            isResting: this.isResting,
            hasTarget: !!this.currentTarget,
            jumpProgress: this.isJumping ? (this.gameObject.scene.time.now - this.jumpStartTime) / this.jumpDuration : 0
        };
    }

    /**
     * Сброс стратегии
     */
    reset() {
        this.currentTarget = null;
        this.isJumping = false;
        this.isResting = false;
        this.jumpStartTime = 0;
        this.restStartTime = 0;
        this.jumpStartPosition = { x: 0, y: 0 };
        this.jumpTargetPosition = { x: 0, y: 0 };
        this.jumpDirection = { x: 0, y: 0 };
    }
}
