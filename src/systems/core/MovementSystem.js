import { ISystem } from '../interfaces/ISystem.js';
import { GeometryUtils } from '../../utils/GeometryUtils.js';
import { OrbitalMovementStrategy } from '../strategies/movement/OrbitalMovementStrategy.js';
import { RandomPointMovementStrategy } from '../strategies/movement/RandomPointMovementStrategy.js';
import { SpawnerMovementStrategy } from '../strategies/movement/SpawnerMovementStrategy.js';
import { InertiaMovementStrategy } from '../strategies/movement/InertiaMovementStrategy.js';
import { JitteryMovementStrategy } from '../strategies/movement/JitteryMovementStrategy.js';
import { JumpingMovementStrategy } from '../strategies/movement/JumpingMovementStrategy.js';

/**
 * Универсальная система движения для игровых объектов
 * Поддерживает различные стратегии движения
 */
export class MovementSystem extends ISystem {
    constructor(gameObject, config) {
        super(gameObject, config);
        this.currentTarget = null;
        this.currentPath = null;
        this.pathIndex = 0;
        this.isMoving = false;
        this.lastUpdateTime = 0;
        this.updateInterval = this.getConfigValue('updateInterval', 16); // ~60 FPS
        
        // Стратегия движения
        this.strategy = null;
        // Читаем стратегию из movement конфигурации
        const movementConfig = this.config.get('movement', {});
        this.strategyType = movementConfig.strategy || this.getConfigValue('strategy', 'linear');
        
        this.initialize();
    }

    initialize() {
        this.setupStrategy();
        this.setupPhysics();
    }

    setupStrategy() {
        // Читаем стратегию из movement конфигурации
        const movementConfig = this.config.get('movement', {});
        this.strategyType = movementConfig.strategy || this.getConfigValue('strategy', 'linear');
        
        // Диагностический лог для комара
        if (this.gameObject.enemyType === 'mosquito') {
            console.log(`🦟 MOVEMENT SETUP: strategyType=${this.strategyType}, movementConfig=`, movementConfig);
        }
        
        // Создаем стратегию движения
        switch (this.strategyType) {
            case 'orbital':
                this.strategy = new OrbitalMovementStrategy(this.gameObject, this.config);
                break;
            case 'randomPoint':
                this.strategy = new RandomPointMovementStrategy(this.gameObject, this.config);
                break;
            case 'spawner':
                this.strategy = new SpawnerMovementStrategy(this.gameObject, this.config);
                break;
            case 'inertia':
                this.strategy = new InertiaMovementStrategy(this.gameObject, this.config);
                break;
            case 'jittery':
                this.strategy = new JitteryMovementStrategy(this.gameObject, this.config);
                break;
            case 'jumping':
                this.strategy = new JumpingMovementStrategy(this.gameObject, this.config);
                break;
            default:
                this.strategy = null;
                break;
        }
    }

    setupPhysics() {
        const physicsBody = this.gameObject.body || this.gameObject.physicsBody;
        if (!physicsBody) {
            console.warn('MovementSystem: GameObject has no physics body');
            return;
        }

        // Настройка физики для движения
        physicsBody.setCollideWorldBounds(true);
        physicsBody.setBounce(this.getConfigValue('bounce', 0.1));
        physicsBody.setDrag(
            this.getConfigValue('dragX', 50),
            this.getConfigValue('dragY', 50)
        );
    }

    updateSystem(time, delta) {
        if (time - this.lastUpdateTime < this.updateInterval) {
            return;
        }

        this.lastUpdateTime = time;

        if (this.strategy) {
            // Используем стратегию напрямую
            this.strategy.update(time, delta);
        } else {
            // Используем встроенную логику MovementSystem
            this.defaultMovement(time, delta);
        }
    }

    defaultMovement(time, delta) {
        if (!this.currentTarget) {
            this.stopMovement();
            return;
        }

        // Специальная логика для разных типов врагов
        switch (this.strategyType) {
            case 'flying':
                // Летающие враги с колебаниями
                this.handleFlyingBehavior(time, delta);
                break;
            case 'jittery':
                // Дерганое движение (комар)
                this.handleJitteryBehavior(time, delta);
                break;
            case 'jumping':
                // Прыгающее движение (блоха)
                this.handleJumpingBehavior(time, delta);
                break;
            case 'stealth':
                // Невидимый слизень
                this.handleStealthBehavior(time, delta);
                break;
            case 'burrow':
                // Крот под землей
                this.handleBurrowBehavior(time, delta);
                break;
            case 'shell':
                // Улитка с раковиной
                this.handleShellBehavior(time, delta);
                break;
            default:
                // Обычное линейное движение (включая самку паука)
                this.moveToTarget(this.currentTarget);
        }
    }


    /**
     * Поведение дерганого движения (комар)
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    handleJitteryBehavior(time, delta) {
        // Используем стратегию jittery
        if (this.strategy && this.strategy.update) {
            this.strategy.update(time, delta);
        } else {
            // Fallback к обычному движению
            this.moveToTarget(this.currentTarget);
        }
    }

    /**
     * Обработка прыгающего поведения
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    handleJumpingBehavior(time, delta) {
        // Используем стратегию jumping
        if (this.strategy && this.strategy.update) {
            this.strategy.update(time, delta);
        } else {
            // Fallback к обычному движению
            this.moveToTarget(this.currentTarget);
        }
    }

    /**
     * Поведение летающих врагов
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    handleFlyingBehavior(time, delta) {
        if (!this.currentTarget) {
            this.stopMovement();
            return;
        }

        // Проверяем расстояние до цели
        const distance = GeometryUtils.distance(this.gameObject.x, this.gameObject.y, this.currentTarget.x, this.currentTarget.y);
        const movementConfig = this.config.get('movement', {});
        const attackRange = movementConfig.attackRange || this.getConfigValue('attackRange', 30);

        // Если цель в радиусе атаки, останавливаемся
        if (distance <= attackRange) {
            this.stopMovement();
            this.onTargetReached(this.currentTarget);
            return;
        }

        // Летающие враги с колебаниями
        if (!this.flightTime) {
            this.flightTime = 0;
        }
        this.flightTime += delta;
        
        const direction = this.getFlyingDirection();
        const speed = movementConfig.speed || this.getConfigValue('speed', 120);
        
        const velocityX = direction.x * speed;
        const velocityY = direction.y * speed;
        
        if (this.gameObject.body) {
            this.gameObject.body.setVelocity(velocityX, velocityY);
        } else if (this.gameObject.physicsBody) {
            this.gameObject.physicsBody.setVelocity(velocityX, velocityY);
        }
        
        this.rotateToDirection(direction);
    }

    /**
     * Получение направления для летающих врагов с колебаниями
     * @returns {Object} Направление {x, y}
     */
    getFlyingDirection() {
        const dx = this.currentTarget.x - this.gameObject.x;
        const dy = this.currentTarget.y - this.gameObject.y;
        const baseDirection = GeometryUtils.normalize(dx, dy);
        
        // Добавляем колебания (читаем из конфигурации)
        const movementConfig = this.config.get('movement', {});
        const oscillationSpeed = movementConfig.oscillationSpeed || 0.02;
        const amplitude = (movementConfig.amplitude || 35) * 0.01; // Конвертируем в пиксели
        
        const time = this.flightTime * oscillationSpeed;
        const oscillationX = Math.cos(time) * amplitude;
        const oscillationY = Math.sin(time) * amplitude;
        
        
        return {
            x: baseDirection.x + oscillationX,
            y: baseDirection.y + oscillationY
        };
    }

    /**
     * Поведение невидимого слизня
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    handleStealthBehavior(time, delta) {
        // Невидимый слизень движется медленно
        this.moveToTarget(this.currentTarget);
        
        // Устанавливаем прозрачность
        if (!this.stealthInitialized) {
            this.gameObject.setAlpha(0.05); // 95% прозрачность
            this.stealthInitialized = true;
        }
    }

    /**
     * Поведение крота под землей
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    handleBurrowBehavior(time, delta) {
        // Крот движется под землей
        this.moveToTarget(this.currentTarget);
        
        // Устанавливаем полупрозрачность
        if (!this.burrowInitialized) {
            this.gameObject.setAlpha(0.3);
            this.burrowInitialized = true;
        }
    }

    /**
     * Поведение улитки с раковиной
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    handleShellBehavior(time, delta) {
        // Улитка движется медленно
        this.moveToTarget(this.currentTarget);
    }

    /**
     * Движение к цели
     * @param {Object} target - Цель {x, y}
     */
    moveTo(target) {
        this.currentTarget = target;
        this.isMoving = true;
        this.setState('moving');
        
        // Передаем цель в стратегию движения только для стратегий, которые используют внешние цели
        if (this.strategy && this.strategy.setTarget && 
            this.strategyType !== 'randomPoint' && this.strategyType !== 'spawner') {
            this.strategy.setTarget(target);
            
            // Диагностический лог для блохи
            if (this.gameObject.enemyType === 'flea') {
                console.log(`🦗 MOVEMENT: Передаем цель в стратегию jumping (${target.x.toFixed(1)}, ${target.y.toFixed(1)})`);
            }
        }
    }

    /**
     * Движение к позиции
     * @param {number} x - X координата
     * @param {number} y - Y координата
     */
    moveToPosition(x, y) {
        this.moveTo({ x, y });
    }

    /**
     * Движение по пути
     * @param {Array} path - Массив точек пути [{x, y}, ...]
     */
    moveAlongPath(path) {
        if (!path || path.length === 0) {
            this.stopMovement();
            return;
        }

        this.currentPath = path;
        this.pathIndex = 0;
        this.moveTo(path[0]);
    }

    /**
     * Остановка движения
     */
    stopMovement() {
        this.currentTarget = null;
        this.currentPath = null;
        this.pathIndex = 0;
        this.isMoving = false;
        
        // Останавливаем движение через физику
        if (this.gameObject.body) {
            this.gameObject.body.setVelocity(0, 0);
        } else if (this.gameObject.physicsBody) {
            this.gameObject.physicsBody.setVelocity(0, 0);
        }
        
        this.setState('idle');
    }

    /**
     * Движение к текущей цели
     * @param {Object} target - Цель
     */
    moveToTarget(target) {
        if (!target || !this.gameObject.isAlive) {
            this.stopMovement();
            return;
        }

        const distance = GeometryUtils.distance(this.gameObject.x, this.gameObject.y, target.x, target.y);
        const attackRange = this.getConfigValue('attackRange', 30);


        // Если цель в радиусе атаки, останавливаемся
        if (distance <= attackRange) {
            this.stopMovement();
            this.onTargetReached(target);
            return;
        }

        // Вычисляем направление и скорость
        const direction = GeometryUtils.normalize(target.x - this.gameObject.x, target.y - this.gameObject.y);
        const speed = this.getConfigValue('speed', 100);
        
        const velocityX = direction.x * speed;
        const velocityY = direction.y * speed;


        if (this.gameObject.body) {
            this.gameObject.body.setVelocity(velocityX, velocityY);
        } else if (this.gameObject.physicsBody) {
            this.gameObject.physicsBody.setVelocity(velocityX, velocityY);
        } else {
            console.warn('MovementSystem: No body or physicsBody for setting velocity');
        }

        // Поворачиваем объект в направлении движения
        this.rotateToDirection(direction);

        // Проверяем, достигли ли следующей точки пути
        this.checkPathProgress();
    }

    /**
     * Поворот объекта в направлении движения
     * @param {Object} direction - Направление {x, y}
     */
    rotateToDirection(direction) {
        if (direction.x === 0 && direction.y === 0) return;

        const targetAngle = Math.atan2(direction.y, direction.x);
        const currentAngle = this.gameObject.rotation;
        
        // Плавный поворот
        // Получаем конфигурацию движения
        const movementConfig = this.config.get('movement', {});
        const rotationSpeed = movementConfig.rotationSpeed || this.getConfigValue('rotationSpeed', 0.1); // Скорость поворота
        const angleDiff = this.normalizeAngle(targetAngle - currentAngle);
        
        if (Math.abs(angleDiff) > 0.01) { // Если разница больше 0.01 радиана
            const newAngle = currentAngle + angleDiff * rotationSpeed;
            this.gameObject.setRotation(newAngle);
        } else {
            this.gameObject.setRotation(targetAngle);
        }
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
     * Проверка прогресса по пути
     */
    checkPathProgress() {
        if (!this.currentPath || this.pathIndex >= this.currentPath.length - 1) {
            return;
        }

        const currentTarget = this.currentPath[this.pathIndex];
        const distance = GeometryUtils.distance(this.gameObject.x, this.gameObject.y, currentTarget.x, currentTarget.y);
        const threshold = this.getConfigValue('pathThreshold', 10);

        if (distance <= threshold) {
            this.pathIndex++;
            if (this.pathIndex < this.currentPath.length) {
                this.moveTo(this.currentPath[this.pathIndex]);
            } else {
                this.stopMovement();
                this.onPathCompleted();
            }
        }
    }

    /**
     * Обработчик достижения цели
     * @param {Object} target - Достигнутая цель
     */
    onTargetReached(target) {
        this.emit('targetReached', { target, gameObject: this.gameObject });
    }

    /**
     * Обработчик завершения пути
     */
    onPathCompleted() {
        this.emit('pathCompleted', { gameObject: this.gameObject });
    }

    /**
     * Установка состояния движения
     * @param {string} state - Состояние
     */
    setState(state) {
        this.state = state;
        this.emit('stateChanged', { 
            state, 
            gameObject: this.gameObject,
            system: 'MovementSystem'
        });
    }

    /**
     * Эмит события
     * @param {string} event - Событие
     * @param {Object} data - Данные
     */
    emit(event, data) {
        if (this.gameObject.scene && this.gameObject.scene.events) {
            this.gameObject.scene.events.emit(`movement:${event}`, data);
        }
    }

    /**
     * Получение текущего состояния
     * @returns {Object}
     */
    getMovementState() {
        return {
            isMoving: this.isMoving,
            currentTarget: this.currentTarget,
            currentPath: this.currentPath,
            pathIndex: this.pathIndex,
            state: this.state,
            strategy: this.strategyType
        };
    }

    /**
     * Установка стратегии движения
     * @param {string} strategyType - Тип стратегии
     */
    setStrategy(strategyType) {
        this.strategyType = strategyType;
        this.setupStrategy();
    }

    /**
     * Получение скорости движения
     * @returns {number}
     */
    getSpeed() {
        return this.getConfigValue('speed', 100);
    }

    /**
     * Установка скорости движения
     * @param {number} speed - Скорость
     */
    setSpeed(speed) {
        this.config.setOverride('speed', speed);
    }

    /**
     * Проверка, движется ли объект
     * @returns {boolean}
     */
    isMovingToTarget() {
        return this.isMoving && this.currentTarget !== null;
    }

    /**
     * Получение расстояния до текущей цели
     * @returns {number}
     */
    getDistanceToTarget() {
        if (!this.currentTarget) return Infinity;
        return GeometryUtils.distance(this.gameObject.x, this.gameObject.y, this.currentTarget.x, this.currentTarget.y);
    }

    destroy() {
        this.stopMovement();
        if (this.strategy && this.strategy.destroy) {
            this.strategy.destroy();
        }
        super.destroy();
    }
}
