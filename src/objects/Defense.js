import { GameObject } from './GameObject';
import { defenseTypes } from '../types/defenseTypes';
import { PropertyUtils } from '../../utils/PropertyUtils.js';
import { GeometryUtils } from '../../utils/GeometryUtils.js';
import { PHYSICS_CONSTANTS, COLORS } from '../constants/GameConstants.js';

export class Defense extends GameObject {
    constructor(scene, config) {
        const defenseType = config.defenseType || 'sugar';
        const defenseData = defenseTypes[defenseType];
        
        // Настройки из типа защиты (приоритет у переданных значений)
        const defenseConfig = {
            health: config.health !== undefined ? config.health : defenseData.health,
            speed: 0, // Защитные сооружения неподвижны
            x: config.x,
            y: config.y,
            texture: config.texture || defenseData.texture, // fallback эмодзи
            spriteKey: config.spriteKey || defenseData.spriteKey // ключ для спрайта
        };
        
        super(scene, defenseConfig);
        
        // Специфичные для защиты свойства
        PropertyUtils.defineProperty(this, "_defenseType", undefined);
        PropertyUtils.defineProperty(this, "_defenseData", undefined);
        PropertyUtils.defineProperty(this, "_protectionRadius", undefined);
        PropertyUtils.defineProperty(this, "_repairRate", undefined);
        PropertyUtils.defineProperty(this, "_autoRepair", undefined);
        PropertyUtils.defineProperty(this, "_isRepairing", false);
        PropertyUtils.defineProperty(this, "_repairTimer", undefined);
        PropertyUtils.defineProperty(this, "_protectedObjects", []);
        PropertyUtils.defineProperty(this, "_id", undefined);
        
        // Инициализация свойств защиты
        this._id = `${defenseType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this._defenseType = defenseType;
        this._defenseData = defenseData;
        this._protectionRadius = config.protectionRadius || defenseData.radius * defenseData.size * 10; // конвертируем в пиксели
        this._repairRate = config.repairRate || 5; // Восстановление здоровья в секунду
        this._autoRepair = config.autoRepair !== false; // По умолчанию включено

        // Настраиваем физику для защитных сооружений
        this.physicsBody.setImmovable(true);
        this.physicsBody.setBounce(PHYSICS_CONSTANTS.DEFAULT_BOUNCE);
        this.physicsBody.setDrag(PHYSICS_CONSTANTS.DEFAULT_DRAG, PHYSICS_CONSTANTS.DEFAULT_DRAG);
        
        // Настраиваем поведение в зависимости от типа
        this.setupDefenseBehaviour();
        
        // Запускаем систему защиты
        this.startProtectionSystem();
    }

    /**
     * Настраивает поведение защиты в зависимости от типа
     */
    setupDefenseBehaviour() {
        // Настраиваем визуал в зависимости от типа защиты
        switch (this._defenseType) {
            case 'sugar':
                this.setTint(COLORS.YELLOW);
                break;
            case 'stone':
                this.setTint(COLORS.GRAY);
                this.setScale(1.5, 1.5); // Большой размер
                break;
            case 'crack':
                this.setTint(COLORS.DARK_GRAY);
                this.setScale(1.0, 2.0); // Длинная трещина
                break;
            case 'shell':
                this.setTint(COLORS.RED);
                this.setScale(1.2, 1.2);
                break;
            case 'madCucumber':
                this.setTint(COLORS.GREEN);
                break;
            case 'pit':
                this.setTint(COLORS.BLACK);
                break;
            default:
                this.setTint(COLORS.GRAY);
                break;
        }
    }

    /**
     * Запускает систему защиты
     */
    startProtectionSystem() {
        if (!this.scene) return;
        
        // Запускаем систему автоматического ремонта
        if (this._autoRepair) {
            this.startAutoRepair();
        }
        
        // Запускаем систему защиты объектов
        this.startObjectProtection();
    }

    /**
     * Запускает автоматический ремонт
     */
    startAutoRepair() {
        if (!this.scene) return;
        
        this._repairTimer = this.scene.time.addEvent({
            delay: 1000, // Каждую секунду
            callback: () => {
                if (this._isAlive && this.health < this._maxHealth && !this._isRepairing) {
                    this.repair();
                }
            },
            loop: true
        });
    }

    /**
     * Запускает защиту объектов
     */
    startObjectProtection() {
        if (!this.scene) return;
        
        // Проверяем защиту объектов каждые 500мс
        this.scene.time.addEvent({
            delay: 500,
            callback: () => {
                this.updateProtection();
            },
            loop: true
        });
    }

    /**
     * Ремонтирует защиту
     */
    repair() {
        if (!this._isAlive || this.health >= this._maxHealth) return;
        
        this._isRepairing = true;
        this.health = Math.min(this.health + this._repairRate, this._maxHealth);
        
        // Небольшая задержка перед следующим ремонтом
        this.scene.time.delayedCall(2000, () => {
            this._isRepairing = false;
        });
    }

    /**
     * Обновляет защиту объектов
     */
    updateProtection() {
        if (!this._isAlive || !this.scene) return;
        
        // Ищем объекты в радиусе защиты
        const protectedObjects = this.findProtectedObjects();
        
        // Применяем защиту к объектам
        protectedObjects.forEach(obj => {
            this.applyProtection(obj);
        });
        
        // Обновляем список защищаемых объектов
        this._protectedObjects = protectedObjects;
    }

    /**
     * Находит объекты в радиусе защиты
     */
    findProtectedObjects() {
        if (!this.scene) return [];
        
        const protectedObjects = [];
        const gameObjects = this.scene.children.list;
        
        for (const obj of gameObjects) {
            if (obj instanceof GameObject && obj.isAlive) {
                const distance = GeometryUtils.distance(this.x, this.y, obj.x, obj.y);
                if (distance <= this._protectionRadius) {
                    protectedObjects.push(obj);
                }
            }
        }
        
        return protectedObjects;
    }

    /**
     * Применяет защиту к объекту
     * Базовая реализация - можно переопределить в дочерних классах
     */
    applyProtection(obj) {
        // Базовая защита - можно переопределить в дочерних классах
        // По умолчанию ничего не делаем
    }

    /**
     * Переопределяем получение урона для защиты
     */
    takeDamage(damage) {
        if (!this._isAlive || !this.scene) return;
        
        // Защитные сооружения получают меньше урона
        const reducedDamage = damage * 0.7; // 30% снижение урона
        this.health -= reducedDamage;
        this.emit('damage', reducedDamage, this.health);
    }

    // Геттеры
    get defenseType() { return this._defenseType; }
    get defenseData() { return this._defenseData; }
    get protectionRadius() { return this._protectionRadius; }
    get repairRate() { return this._repairRate; }
    get autoRepair() { return this._autoRepair; }
    get isRepairing() { return this._isRepairing; }
    get protectedObjects() { return this._protectedObjects; }
    get id() { return this._id; }

    // Сеттеры
    set defenseType(value) {
        this._defenseType = value;
        this._defenseData = defenseTypes[value];
        this.setupDefenseBehaviour();
    }
    set protectionRadius(value) { this._protectionRadius = Math.max(0, value); }
    set repairRate(value) { this._repairRate = Math.max(0, value); }
    set autoRepair(value) {
        this._autoRepair = value;
        if (value && !this._repairTimer) {
            this.startAutoRepair();
        } else if (!value && this._repairTimer) {
            this._repairTimer.destroy();
            this._repairTimer = undefined;
        }
    }

    /**
     * Статический метод для создания защиты с полной настройкой
     */
    static createDefense(scene, defenseType, x, y, enhancementMultiplier = 1) {
        const defenseData = defenseTypes[defenseType];
        
        // Применяем усиление к характеристикам
        const enhancedHealth = defenseData.health * enhancementMultiplier;
        const enhancedSize = defenseData.size * enhancementMultiplier;
        
        // Создаем защиту с усиленными характеристиками
        const defense = new Defense(scene, {
            x, y, defenseType,
            ...defenseData, // Сначала все базовые данные из defenseTypes
            health: enhancedHealth, // Переопределяем усиленными значениями
            size: enhancedSize
        });
        
        // Настраиваем размер на основе усиленного размера
        const defenseSize = PHYSICS_CONSTANTS.BASE_ENEMY_SIZE * enhancedSize;
        defense.setScale(defenseSize / PHYSICS_CONSTANTS.DEFAULT_TEXTURE_SIZE);
        
        // Создаем полосу здоровья (если у защиты есть здоровье)
        if (defenseData.health > 0) {
            defense.createHealthBar({
                showWhenFull: false,
                showWhenEmpty: true,
                offsetY: -(defenseSize / 2 + PHYSICS_CONSTANTS.HEALTH_BAR_OFFSET),
                colors: {
                    background: COLORS.BLACK,
                    health: COLORS.HEALTH_GREEN,
                    border: COLORS.WHITE
                }
            });
        }
        
        return defense;
    }

    /**
     * Уничтожение с очисткой таймеров
     */
    destroy() {
        if (this._repairTimer) {
            this._repairTimer.destroy();
            this._repairTimer = undefined;
        }
        super.destroy();
    }
}