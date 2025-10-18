import { MovementSystem } from './MovementSystem.js';
import { AttackSystem } from './AttackSystem.js';
import { CollisionSystem } from './CollisionSystem.js';
import { PathfindingSystem } from './PathfindingSystem.js';
import { SystemConfig } from '../config/SystemConfig.js';
import { StealthStrategy } from '../strategies/stealth/StealthStrategy.js';
import { BurrowStealthStrategy } from '../strategies/stealth/BurrowStealthStrategy.js';
import { TargetPointSystem } from './TargetPointSystem.js';

/**
 * Координатор систем ИИ
 * Управляет всеми системами игрового объекта и координирует их работу
 */
export class AICoordinator {
    constructor(gameObject, config) {
        this.gameObject = gameObject;
        this.config = config;
        this.systems = new Map();
        this.isActive = true;
        this.updateInterval = 16; // ~60 FPS
        this.lastUpdateTime = 0;
        
        // Цель для всех систем
        this.currentTarget = null;
        
        // Стратегии
        this.stealthStrategy = null;
        this.targetPointSystem = null;
        
        // Состояние ИИ
        this.state = 'idle'; // idle, moving, attacking, pathfinding
        this.lastStateChange = 0;
        
        this.initialize();
    }

    initialize() {
        this.setupSystems();
        this.setupStrategies();
        this.setupEventListeners();
    }

    setupSystems() {
        // Создаем конфигурации для каждой системы
        const movementConfig = new SystemConfig([
            this.config.get('movement', {}),
            this.config.get('behaviorParams', {}),
            this.config
        ]);

        const attackConfig = new SystemConfig([
            this.config.get('attack', {}),
            this.config.get('behaviorParams', {}),
            this.config
        ]);

        const collisionConfig = new SystemConfig([
            this.config.get('collision', {}),
            this.config.get('behaviorParams', {}),
            this.config
        ]);

        const pathfindingConfig = new SystemConfig([
            this.config.get('pathfinding', {}),
            this.config.get('behaviorParams', {}),
            this.config
        ]);

        // Создаем системы только если gameObject существует
        if (this.gameObject) {
            this.systems.set('movement', new MovementSystem(this.gameObject, movementConfig));
            this.systems.set('attack', new AttackSystem(this.gameObject, attackConfig));
            this.systems.set('collision', new CollisionSystem(this.gameObject, collisionConfig));
            this.systems.set('pathfinding', new PathfindingSystem(this.gameObject, pathfindingConfig));
        }
    }

    setupStrategies() {
        // Инициализируем систему целевых точек
        if (this.gameObject && this.gameObject.scene) {
            this.targetPointSystem = new TargetPointSystem(this.gameObject.scene);
        }

        // Настраиваем стратегию движения
        const movementSystem = this.systems.get('movement');
        if (movementSystem) {
            const movementStrategy = this.config.get('movement.strategy', 'linear');
            movementSystem.setStrategy(movementStrategy);
        }

        // Настраиваем стратегию атаки
        const attackSystem = this.systems.get('attack');
        if (attackSystem) {
            // Получаем конфигурацию атаки
            const attackConfig = this.config.get('attack', {});
            const attackStrategy = attackConfig.strategy || this.config.get('strategy', 'simple');
            
            
            attackSystem.setStrategy(attackStrategy);
            
            // Настраиваем условный спавн для крота
            if (attackStrategy === 'spawn' && attackConfig.conditionalSpawn) {
                const spawnAttack = attackSystem.strategy;
                if (spawnAttack && spawnAttack.setConditionCallback) {
                    // Устанавливаем условие: спавнить только когда на поверхности
                    spawnAttack.setConditionCallback(() => {
                        const isOnSurface = this.stealthStrategy && this.stealthStrategy.isOnSurfaceNow();
                        return isOnSurface;
                    });
                }
            }
        }

        // Настраиваем стратегию стелса
        const stealthConfig = this.config.get('stealth', {});
        if (stealthConfig && stealthConfig.strategy) {
            const stealthSystemConfig = new SystemConfig([stealthConfig, this.config]);
            
            if (stealthConfig.strategy === 'stealth') {
                this.stealthStrategy = new StealthStrategy(this.gameObject, stealthSystemConfig);
            } else if (stealthConfig.strategy === 'burrow') {
                this.stealthStrategy = new BurrowStealthStrategy(this.gameObject, stealthSystemConfig);
        }
            
            if (this.stealthStrategy) {
                this.stealthStrategy.activate();
            }
        }
    }

    setupEventListeners() {
        // Слушаем события от систем
        if (this.gameObject && this.gameObject.scene && this.gameObject.scene.events) {
            this.gameObject.scene.events.on('movement:targetReached', this.onTargetReached.bind(this));
            this.gameObject.scene.events.on('movement:pathCompleted', this.onPathCompleted.bind(this));
            this.gameObject.scene.events.on('attack:attackPerformed', this.onAttackPerformed.bind(this));
            this.gameObject.scene.events.on('collision:collision', this.onCollision.bind(this));
            this.gameObject.scene.events.on('pathfinding:pathCompleted', this.onPathfindingCompleted.bind(this));
        }
    }

    /**
     * Обновление координатора
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    update(time, delta) {
        if (!this.isActive || !this.gameObject || !this.gameObject.isAlive) {
            return;
        }

        if (time - this.lastUpdateTime < this.updateInterval) {
            return;
        }

        this.lastUpdateTime = time;

        // Обновляем все системы
        this.systems.forEach(system => {
            if (system.isActive) {
                system.update(time, delta);
            }
        });

        // Обновляем стратегию стелса
        if (this.stealthStrategy) {
            this.stealthStrategy.update(time, delta);
        }

        // Координируем работу систем
        this.coordinateSystems(time, delta);
    }

    /**
     * Координация работы систем
     * @param {number} time - Текущее время
     * @param {number} delta - Время с последнего обновления
     */
    coordinateSystems(time, delta) {
        const movementSystem = this.systems.get('movement');
        const attackSystem = this.systems.get('attack');
        const pathfindingSystem = this.systems.get('pathfinding');

        // Обновляем стратегию стелса
        if (this.stealthStrategy && this.stealthStrategy.update) {
            this.stealthStrategy.update(time, delta);
        }

        if (!this.currentTarget) {
            this.setState('idle');
            return;
        }


        // Проверяем, можем ли атаковать (только если стратегия атаки не 'none')
        const attackConfig = this.config.get('attack', {});
        const attackStrategy = attackConfig.strategy || 'simple';
        
        if (attackSystem && attackStrategy !== 'none' && attackSystem.isInRange && attackSystem.isInRange()) {
            this.setState('attacking');
            attackSystem.attack(this.currentTarget);
            return;
        }

        // Если не можем атаковать, ищем путь
        if (pathfindingSystem && this.shouldUsePathfinding()) {
            console.log(`🤖 [AICoordinator] Используем pathfinding для ${this.gameObject.constructor.name} (canFly: ${this.gameObject.canFly})`);
            // Если уже есть активный путь, не пересчитываем каждый кадр
            const existingPathActive = movementSystem.currentPath && movementSystem.pathIndex < movementSystem.currentPath.length;
            const path = existingPathActive ? movementSystem.currentPath : pathfindingSystem.findPath(this.currentTarget);
            if (path && path.length > 0) {
                console.log(`🤖 [AICoordinator] Найден путь длиной ${path.length} для ${this.gameObject.constructor.name}`);
                this.setState('pathfinding');
                if (!existingPathActive) {
                    pathfindingSystem.setPath(path);
                    movementSystem.moveAlongPath(path);
                }
                return;
            } else {
                console.log(`🤖 [AICoordinator] Путь не найден для ${this.gameObject.constructor.name} - останавливаемся`);
                // НЕ пытаемся двигаться напрямую - это приведет к движению через препятствия
                this.setState('idle');
                movementSystem.stopMovement();
                return;
            }
        } else {
            console.log(`🤖 [AICoordinator] Pathfinding не используется для ${this.gameObject.constructor.name} (pathfindingSystem: ${!!pathfindingSystem}, shouldUse: ${this.shouldUsePathfinding()}, canFly: ${this.gameObject.canFly})`);
        }

        // Проверяем тип стратегии движения
        const movementStrategy = this.config.get('movement.strategy', 'linear');
        
        if (movementStrategy === 'randomPoint' || movementStrategy === 'spawner') {
            // Для этих стратегий не передаем внешнюю цель
            // Они работают со своими внутренними целями
            // Не устанавливаем состояние moving для этих стратегий
            return;
        }
        
        // Движение для обычных стратегий (только если pathfinding не используется)
        this.setState('moving');
        movementSystem.moveTo(this.currentTarget);
    }

    /**
     * Проверка, нужно ли использовать поиск пути
     * @returns {boolean}
     */
    shouldUsePathfinding() {
        const pathfindingSystem = this.systems.get('pathfinding');
        if (!pathfindingSystem) {
            return false;
        }

        // Для летающих объектов не используем pathfinding, если они игнорируют наземные препятствия
        if (this.gameObject.canFly && pathfindingSystem.ignoreGroundObstacles) {
            console.log(`🤖 [AICoordinator] Летающий объект игнорирует наземные препятствия, pathfinding не нужен`);
            return false;
        }

        // Используем ObstacleInteractionSystem для проверки препятствий
        const obstacleSystem = this.gameObject.scene.obstacleInteractionSystem;
        if (obstacleSystem && obstacleSystem.obstacles && obstacleSystem.obstacles.length > 0) {
            console.log(`🤖 [AICoordinator] shouldUsePathfinding: найдено ${obstacleSystem.obstacles.length} препятствий`);
            return true;
        }

        // Fallback: проверяем сцену напрямую
        const hasObstacles = this.gameObject && this.gameObject.scene && 
            this.gameObject.scene.children.list.some(obj => 
                obj.isObstacle || (obj.defenseData && obj.defenseData.isObstacle)
            );
        
        console.log(`🤖 [AICoordinator] shouldUsePathfinding: canFly=${this.gameObject.canFly}, ignoreGroundObstacles=${pathfindingSystem.ignoreGroundObstacles}, hasObstacles=${hasObstacles}`);
        return hasObstacles;
    }

    /**
     * Установка цели для всех систем
     * @param {Object} target - Цель
     */
    setTarget(target) {
        this.currentTarget = target;
        
        // Уведомляем системы о новой цели
        const movementSystem = this.systems.get('movement');
        const attackSystem = this.systems.get('attack');
        const pathfindingSystem = this.systems.get('pathfinding');
        
        // При смене цели (например, на сахар) сбрасываем активный путь,
        // чтобы немедленно перестроить маршрут к новой цели
        if (pathfindingSystem && pathfindingSystem.clearPath) {
            pathfindingSystem.clearPath();
        }
        if (movementSystem) {
            movementSystem.currentPath = null;
            movementSystem.pathIndex = 0;
        }
        
        // Проверяем тип стратегии движения
        const movementConfig = this.config.get('movement', {});
        const movementStrategy = movementConfig.strategy || this.config.get('movement.strategy', 'linear');
        
        
        if (movementSystem && movementStrategy !== 'randomPoint' && movementStrategy !== 'spawner') {
            movementSystem.moveTo(target);
            
            // Для inertia стратегии передаем cooldown атаки
            if (movementStrategy === 'inertia' && movementSystem.strategy && movementSystem.strategy.updateAttackCooldown) {
                const attackConfig = this.config.get('attack', {});
                const cooldown = attackConfig.cooldown || 5000; // Используем значение из конфигурации рино
                movementSystem.strategy.updateAttackCooldown(cooldown);
            }
        }
        
        if (attackSystem) {
            attackSystem.setTarget(target);
        }

        if (this.gameObject) {
            this.emit('targetChanged', {
                oldTarget: this.currentTarget,
                newTarget: target,
                gameObject: this.gameObject
            });
        }
    }

    /**
     * Получение текущей цели
     * @returns {Object|null}
     */
    getTarget() {
        return this.currentTarget;
    }

    /**
     * Установка состояния ИИ
     * @param {string} state - Состояние
     */
    setState(state) {
        if (this.state === state) {
            return;
        }

        const oldState = this.state;
        this.state = state;
        this.lastStateChange = (this.gameObject && this.gameObject.scene && this.gameObject.scene.time) ? 
            this.gameObject.scene.time.now : Date.now();

        // Проверяем, что gameObject существует перед эмитом события
        if (this.gameObject) {
            this.emit('stateChanged', {
                oldState,
                newState: state,
                gameObject: this.gameObject
            });
        }
    }

    /**
     * Получение состояния ИИ
     * @returns {string}
     */
    getState() {
        return this.state;
    }

    /**
     * Активация координатора
     */
    activate() {
        this.isActive = true;
        this.systems.forEach(system => system.activate());
        if (this.gameObject) {
            this.emit('activated', { gameObject: this.gameObject });
        }
    }

    /**
     * Деактивация координатора
     */
    deactivate() {
        this.isActive = false;
        this.systems.forEach(system => system.deactivate());
        if (this.gameObject) {
            this.emit('deactivated', { gameObject: this.gameObject });
        }
    }

    /**
     * Получение системы по имени
     * @param {string} systemName - Имя системы
     * @returns {Object|null}
     */
    getSystem(systemName) {
        return this.systems.get(systemName) || null;
    }

    /**
     * Включение/выключение системы
     * @param {string} systemName - Имя системы
     * @param {boolean} enabled - Включена ли система
     */
    setSystemEnabled(systemName, enabled) {
        const system = this.systems.get(systemName);
        if (system) {
            system.setEnabled(enabled);
        }
    }

    /**
     * Обработчик достижения цели
     * @param {Object} event - Событие
     */
    onTargetReached(event) {
        this.setState('idle');
        if (this.gameObject) {
            this.emit('targetReached', event);
        }
    }

    /**
     * Обработчик завершения пути
     * @param {Object} event - Событие
     */
    onPathCompleted(event) {
        this.setState('idle');
        if (this.gameObject) {
            this.emit('pathCompleted', event);
        }
    }

    /**
     * Обработчик выполненной атаки
     * @param {Object} event - Событие
     */
    onAttackPerformed(event) {
        if (this.gameObject) {
            this.emit('attackPerformed', event);
        }
    }

    /**
     * Обработчик коллизии
     * @param {Object} event - Событие
     */
    onCollision(event) {
        if (this.gameObject) {
            this.emit('collision', event);
        }
    }

    /**
     * Обработчик завершения поиска пути
     * @param {Object} event - Событие
     */
    onPathfindingCompleted(event) {
        this.setState('moving');
        if (this.gameObject) {
            this.emit('pathfindingCompleted', event);
        }
    }

    /**
     * Получение состояния всех систем
     * @returns {Object}
     */
    getSystemsState() {
        const state = {};
        this.systems.forEach((system, name) => {
            state[name] = system.getState ? system.getState() : {
                isActive: system.isActive,
                enabled: system.enabled
            };
        });
        return state;
    }

    /**
     * Получение общего состояния ИИ
     * @returns {Object}
     */
    getAIState() {
        return {
            isActive: this.isActive,
            state: this.state,
            currentTarget: this.currentTarget,
            lastStateChange: this.lastStateChange,
            systems: this.getSystemsState()
        };
    }

    /**
     * Эмит события
     * @param {string} event - Событие
     * @param {Object} data - Данные
     */
    emit(event, data) {
        if (this.gameObject && this.gameObject.scene && this.gameObject.scene.events) {
            this.gameObject.scene.events.emit(`ai:${event}`, data);
        } else {
            console.warn(`AICoordinator: Cannot emit event '${event}' - scene not available`);
        }
    }

    /**
     * Обработка достижения цели
     * @param {number} time - Текущее время
     */
    onTargetReached(time) {
        
        // Проверяем, можем ли атаковать
        const attackSystem = this.systems.get('attack');
        
        if (!attackSystem) {
            return;
        }
        
        // Получаем конфигурацию атаки безопасно
        const attackConfig = this.config ? this.config.get('attack', {}) : {};
        const attackStrategy = attackConfig.strategy || 'simple';
        
        
        // Устанавливаем цель для системы атаки перед проверкой isInRange
        if (this.currentTarget) {
            attackSystem.setTarget(this.currentTarget);
        }
        
        if (attackStrategy !== 'none' && attackSystem.isInRange && attackSystem.isInRange()) {
            this.setState('attacking');
            attackSystem.attack(this.currentTarget);
            return;
        } else {
        }
        
        // Если у нас есть стратегия стелса burrow, выводим крота на поверхность
        if (this.stealthStrategy && this.stealthStrategy.goSurface) {
            this.stealthStrategy.goSurface(time);
        }
    }

    /**
     * Уничтожение координатора
     */
    destroy() {
        this.deactivate();
        
        // Уничтожаем все системы
        this.systems.forEach(system => {
            if (system.destroy) {
                system.destroy();
            }
        });
        this.systems.clear();

        // Очищаем слушатели событий
        if (this.gameObject && this.gameObject.scene && this.gameObject.scene.events) {
            this.gameObject.scene.events.off('movement:targetReached', this.onTargetReached);
            this.gameObject.scene.events.off('movement:pathCompleted', this.onPathCompleted);
            this.gameObject.scene.events.off('attack:attackPerformed', this.onAttackPerformed);
            this.gameObject.scene.events.off('collision:collision', this.onCollision);
            this.gameObject.scene.events.off('pathfinding:pathCompleted', this.onPathfindingCompleted);
        }

        // Уничтожаем стратегию стелса
        if (this.stealthStrategy) {
            this.stealthStrategy.destroy();
            this.stealthStrategy = null;
        }

        // Уничтожаем систему целевых точек
        if (this.targetPointSystem) {
            this.targetPointSystem.destroy();
            this.targetPointSystem = null;
        }

        this.gameObject = null;
        this.config = null;
        this.currentTarget = null;
    }

    /**
     * Обработка урона
     * @param {number} damage - Урон
     * @param {number} time - Текущее время
     */
    takeDamage(damage, time) {
        // Передаем урон в стратегию стелса
        if (this.stealthStrategy) {
            this.stealthStrategy.takeDamage(damage, time);
        }
    }
}
