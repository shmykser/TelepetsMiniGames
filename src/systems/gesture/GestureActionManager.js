import { GESTURE_ACTIONS, ACTION_SETTINGS } from '../../core/types/gestureActions';
import { Defence } from '../../core/objects/Defence';
/**
 * Менеджер действий по жестам
 * Обрабатывает комбинации жестов и объектов для выполнения игровых действий
 */
export class GestureActionManager {
    constructor(scene) {
        Object.defineProperty(this, "scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "enemies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "defences", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "egg", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.scene = scene;
    }
    /**
     * Установить ссылки на игровые объекты
     */
    setGameObjects(enemies, defences, egg) {
        this.enemies = enemies;
        this.defences = defences;
        this.egg = egg;
    }
    /**
     * Обработать жест и выполнить соответствующее действие
     */
    handleGesture(gesture, x, y) {
        const targetObject = this.getObjectAtPosition(x, y);
        const actionKey = `${gesture}_${targetObject.type}`;
        const action = GESTURE_ACTIONS[actionKey];
        if (!action) {
            return {
                success: false,
                message: `Действие не найдено для жеста "${gesture}" по объекту "${targetObject.type}"`
            };
        }
        const context = {
            gesture,
            targetObject: targetObject.type,
            targetInstance: targetObject.instance,
            coordinates: { x, y },
            metadata: targetObject.metadata
        };
        return this.executeAction(action.action, context);
    }
    /**
     * Выполнить конкретное действие
     */
    executeAction(actionType, context) {
        switch (actionType) {
            case 'damage':
                return this.damageEnemy(context);
            case 'expand':
                return this.expandPit(context);
            case 'placeDefence':
                return this.placeDefence(context);
            case 'placeSugar':
                return this.placeSugar(context);
            default:
                return {
                    success: false,
                    message: `Неизвестное действие: ${actionType}`
                };
        }
    }
    /**
     * Нанести урон врагу
     */
    damageEnemy(context) {
        const enemy = context.targetInstance;
        if (!enemy || !enemy.isAlive) {
            return {
                success: false,
                message: 'Враг не найден или уже мертв'
            };
        }
        const damage = ACTION_SETTINGS.enemy.defaultDamage;
        enemy.takeDamage(damage);
        return {
            success: true,
            message: `Нанесен урон ${damage} врагу ${enemy.enemyData.name}`,
            data: { damage, enemyName: enemy.enemyData.name }
        };
    }
    /**
     * Увеличить яму
     */
    expandPit(context) {
        const defence = context.targetInstance;
        if (!defence || !defence.isAlive || defence.defenceData.name !== 'Яма') {
            return {
                success: false,
                message: 'Яма не найдена или это не яма'
            };
        }
        // Проверяем максимальный размер
        const currentSize = defence.defenceData.size || 1;
        if (currentSize >= ACTION_SETTINGS.pit.maxSize) {
            return {
                success: false,
                message: 'Яма уже максимального размера'
            };
        }
        // Увеличиваем размер ямы
        const newSize = Math.min(currentSize + ACTION_SETTINGS.pit.expansionAmount, ACTION_SETTINGS.pit.maxSize);
        // Обновляем визуальный размер
        defence.setScale(newSize / currentSize);
        // Обновляем радиус защиты
        defence.defenceData.radius = (defence.defenceData.radius || 25) * (newSize / currentSize);
        return {
            success: true,
            message: `Яма увеличена до размера ${newSize}`,
            data: { newSize, oldSize: currentSize }
        };
    }
    /**
     * Установить защиту на поле
     */
    placeDefence(context) {
        const defenceType = ACTION_SETTINGS.field.defaultDefenceType;
        return this.createDefenceAtPosition(context.coordinates.x, context.coordinates.y, defenceType);
    }
    /**
     * Установить сахар на поле
     */
    placeSugar(context) {
        const defenceType = ACTION_SETTINGS.field.sugarDefenceType;
        return this.createDefenceAtPosition(context.coordinates.x, context.coordinates.y, defenceType);
    }
    /**
     * Создать защиту в указанной позиции
     */
    createDefenceAtPosition(x, y, defenceType) {
        // Проверяем, что позиция свободна
        const existingDefence = this.getDefenceAtPosition(x, y);
        if (existingDefence) {
            return {
                success: false,
                message: 'В этой позиции уже есть защита'
            };
        }
        // Создаем новую защиту
        const defence = new Defence(this.scene, {
            x,
            y,
            texture: 'defence',
            defenceType: defenceType,
            protectionRadius: 25,
            health: 100,
            damage: 0,
            speed: 0,
            cooldown: 0
        });
        this.defences.push(defence);
        return {
            success: true,
            message: `Установлена защита "${defenceType}" в позиции (${Math.round(x)}, ${Math.round(y)})`,
            data: { defenceType, position: { x, y } }
        };
    }
    /**
     * Получить объект в указанной позиции
     */
    getObjectAtPosition(x, y) {
        // Проверяем яйцо
        if (this.egg && this.egg.isAlive) {
            const distance = Phaser.Math.Distance.Between(x, y, this.egg.x, this.egg.y);
            if (distance <= 20) {
                return {
                    type: 'egg',
                    instance: this.egg,
                    metadata: { name: 'Яйцо' }
                };
            }
        }
        // Проверяем врагов
        for (const enemy of this.enemies) {
            if (enemy && enemy.isAlive) {
                const distance = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (distance <= 15) {
                    return {
                        type: 'enemy',
                        instance: enemy,
                        metadata: { name: enemy.enemyData.name }
                    };
                }
            }
        }
        // Проверяем защитные объекты
        for (const defence of this.defences) {
            if (defence && defence.isAlive) {
                const distance = Phaser.Math.Distance.Between(x, y, defence.x, defence.y);
                if (distance <= 20) {
                    return {
                        type: 'defence',
                        instance: defence,
                        metadata: { name: defence.defenceData.name }
                    };
                }
            }
        }
        // Если ничего не найдено - это поле
        return {
            type: 'field',
            metadata: { name: 'Поле' }
        };
    }
    /**
     * Получить защиту в указанной позиции
     */
    getDefenceAtPosition(x, y) {
        for (const defence of this.defences) {
            if (defence && defence.isAlive) {
                const distance = Phaser.Math.Distance.Between(x, y, defence.x, defence.y);
                if (distance <= 30) { // Больший радиус для проверки коллизий
                    return defence;
                }
            }
        }
        return null;
    }
    /**
     * Получить список доступных действий
     */
    getAvailableActions() {
        return Object.keys(GESTURE_ACTIONS);
    }
    /**
     * Получить описание действия
     */
    getActionDescription(gesture, target) {
        const actionKey = `${gesture}_${target}`;
        const action = GESTURE_ACTIONS[actionKey];
        return action ? action.description : null;
    }
}
