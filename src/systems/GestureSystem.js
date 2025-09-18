import { GeometryUtils } from '../utils/GeometryUtils.js';
import { GESTURE_CONSTANTS } from '../constants/GameConstants.js';

/**
 * Система жестов на основе Phaser Input Events
 * Поддерживает: tap, doubleTap, longTap
 */
export class GestureSystem {
    constructor(scene, callbacks = {}) {
        this.scene = scene;
        this.callbacks = callbacks;
        
        // Отслеживание активных жестов (по примеру EffectSystem)
        this.activeGestures = new Map();
        this.gestureStats = {
            totalGestures: 0,
            gesturesByType: {}
        };
        
        // Настройки жестов из констант
        this.settings = {
            tap: {
                maxDuration: GESTURE_CONSTANTS.TAP.MAX_DURATION,
                maxDistance: GESTURE_CONSTANTS.TAP.MAX_DISTANCE
            },
            doubleTap: {
                maxInterval: GESTURE_CONSTANTS.DOUBLE_TAP.MAX_INTERVAL,
                maxDistance: GESTURE_CONSTANTS.DOUBLE_TAP.MAX_DISTANCE
            },
            longTap: {
                minDuration: GESTURE_CONSTANTS.LONG_TAP.MIN_DURATION,
                maxDistance: GESTURE_CONSTANTS.LONG_TAP.MAX_DISTANCE
            }
        };
        
        // Состояние жестов
        this.gestureState = {
            isPointerDown: false,
            startTime: 0,
            startX: 0,
            startY: 0,
            lastTapTime: 0,
            lastTapX: 0,
            lastTapY: 0,
            currentX: 0,
            currentY: 0,
            moveDistance: 0
        };
        
        this.setupInputHandlers();
    }
    
    /**
     * Настройка обработчиков Phaser Input Events
     */
    setupInputHandlers() {
        // Начало касания
        this.scene.input.on('pointerdown', (pointer, currentlyOver, event) => {
            if (event && event.defaultPrevented) return;
            this.handlePointerDown(pointer);
        });
        
        // Движение пальца
        this.scene.input.on('pointermove', (pointer, currentlyOver, event) => {
            if (event && event.defaultPrevented) return;
            this.handlePointerMove(pointer);
        });
        
        // Конец касания
        this.scene.input.on('pointerup', (pointer, currentlyOver, event) => {
            if (event && event.defaultPrevented) return;
            this.handlePointerUp(pointer);
        });
        
        // Выход за пределы экрана
        this.scene.input.on('pointerupoutside', (pointer, event) => {
            if (event && event.defaultPrevented) return;
            this.handlePointerUp(pointer);
        });
    }
    
    /**
     * Обработка начала касания
     */
    handlePointerDown(pointer) {
        this.gestureState.isPointerDown = true;
        this.gestureState.startTime = this.scene.time.now;
        this.gestureState.startX = pointer.x;
        this.gestureState.startY = pointer.y;
        this.gestureState.currentX = pointer.x;
        this.gestureState.currentY = pointer.y;
        this.gestureState.moveDistance = 0;
    }
    
    /**
     * Обработка движения пальца
     */
    handlePointerMove(pointer) {
        if (!this.gestureState.isPointerDown) return;
        
        this.gestureState.currentX = pointer.x;
        this.gestureState.currentY = pointer.y;
        
        // Вычисляем общее расстояние движения
        const distance = GeometryUtils.distance(
            this.gestureState.startX, 
            this.gestureState.startY, 
            pointer.x, 
            pointer.y
        );
        this.gestureState.moveDistance = distance;
    }
    
    /**
     * Обработка окончания касания
     */
    handlePointerUp(pointer) {
        if (!this.gestureState.isPointerDown) return;
        
        const currentTime = this.scene.time.now;
        const duration = currentTime - this.gestureState.startTime;
        const distance = this.gestureState.moveDistance;
        
        
        // Определяем тип жеста
        const gesture = this.detectGesture(duration, distance, pointer);
        
        if (gesture) {
            this.executeGesture(gesture, pointer);
        }
        
        // Сбрасываем состояние
        this.gestureState.isPointerDown = false;
    }
    
    /**
     * Определение типа жеста
     */
    detectGesture(duration, distance, pointer) {
        const settings = this.settings;
        
        // Проверяем долгий тап
        if (duration >= settings.longTap.minDuration && 
            distance <= settings.longTap.maxDistance) {
            return this.createLongTapGesture(pointer);
        }
        
        // Проверяем обычный тап
        if (duration <= settings.tap.maxDuration && 
            distance <= settings.tap.maxDistance) {
            
            // Проверяем двойной тап
            if (this.isDoubleTap(pointer)) {
                return this.createDoubleTapGesture(pointer);
            }
            
            return this.createTapGesture(pointer);
        }
        
        return null;
    }
    
    /**
     * Проверка на двойной тап
     */
    isDoubleTap(pointer) {
        const currentTime = this.scene.time.now;
        const timeSinceLastTap = currentTime - this.gestureState.lastTapTime;
        const distanceFromLastTap = GeometryUtils.distance(
            this.gestureState.lastTapX,
            this.gestureState.lastTapY,
            pointer.x,
            pointer.y
        );
        
        return timeSinceLastTap <= this.settings.doubleTap.maxInterval &&
               distanceFromLastTap <= this.settings.doubleTap.maxDistance;
    }
    
    /**
     * Создание жеста тапа
     */
    createTapGesture(pointer) {
        return {
            type: 'tap',
            x: pointer.x,
            y: pointer.y,
            duration: this.scene.time.now - this.gestureState.startTime
        };
    }
    
    /**
     * Создание жеста двойного тапа
     */
    createDoubleTapGesture(pointer) {
        return {
            type: 'doubleTap',
            x: pointer.x,
            y: pointer.y,
            duration: this.scene.time.now - this.gestureState.startTime
        };
    }
    
    /**
     * Создание жеста долгого тапа
     */
    createLongTapGesture(pointer) {
        return {
            type: 'longTap',
            x: pointer.x,
            y: pointer.y,
            duration: this.scene.time.now - this.gestureState.startTime
        };
    }
    
    /**
     * Выполнение жеста
     */
    executeGesture(gesture, pointer) {
        // Отслеживаем статистику жестов
        this.trackGesture(gesture);
        
        // Обновляем время последнего тапа для двойного тапа
        if (gesture.type === 'tap' || gesture.type === 'doubleTap') {
            this.gestureState.lastTapTime = this.scene.time.now;
            this.gestureState.lastTapX = gesture.x;
            this.gestureState.lastTapY = gesture.y;
        }
        
        // Вызываем соответствующий callback
        const callback = this.callbacks[`on${gesture.type.charAt(0).toUpperCase() + gesture.type.slice(1)}`];
        if (callback && typeof callback === 'function') {
            callback(gesture);
        }
    }
    
    /**
     * Отслеживает выполненный жест (по примеру EffectSystem)
     */
    trackGesture(gesture) {
        this.gestureStats.totalGestures++;
        
        if (!this.gestureStats.gesturesByType[gesture.type]) {
            this.gestureStats.gesturesByType[gesture.type] = 0;
        }
        this.gestureStats.gesturesByType[gesture.type]++;
        
        // Сохраняем последний жест с временной меткой
        this.activeGestures.set('last', {
            gesture: gesture,
            timestamp: this.scene.time.now
        });
    }

    /**
     * Получает статистику жестов (по примеру EffectSystem)
     */
    getStats() {
        return {
            totalGestures: this.gestureStats.totalGestures,
            gesturesByType: { ...this.gestureStats.gesturesByType },
            activeGestures: this.activeGestures.size
        };
    }

    /**
     * Очищает статистику жестов
     */
    clearStats() {
        this.gestureStats.totalGestures = 0;
        this.gestureStats.gesturesByType = {};
        this.activeGestures.clear();
    }

    /**
     * Уничтожение системы жестов
     */
    destroy() {
        // Удаляем обработчики событий
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointermove');
        this.scene.input.off('pointerup');
        this.scene.input.off('pointerupoutside');
        
        // Очищаем отслеживание состояния
        this.activeGestures.clear();
        this.gestureStats = null;
    }
}
