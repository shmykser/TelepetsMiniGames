import { GeometryUtils } from '../../utils/GeometryUtils.js';

/**
 * Менеджер жестов на основе Phaser Input Events
 * Поддерживает: tap, doubleTap, longTap, swipe
 */
export class GestureManager {
    constructor(scene, callbacks = {}) {
        this.scene = scene;
        this.callbacks = callbacks;
        
        // Настройки жестов
        this.settings = {
            tap: {
                maxDuration: 200,      // Максимальная длительность тапа (мс)
                maxDistance: 10        // Максимальное расстояние для тапа (пиксели)
            },
            doubleTap: {
                maxInterval: 300,      // Максимальный интервал между тапами (мс)
                maxDistance: 20        // Максимальное расстояние между тапами (пиксели)
            },
            longTap: {
                minDuration: 500,      // Минимальная длительность долгого тапа (мс)
                maxDistance: 10        // Максимальное расстояние для долгого тапа (пиксели)
            },
            swipe: {
                minDistance: 50,       // Минимальное расстояние для свайпа (пиксели)
                maxDuration: 300,      // Максимальная длительность свайпа (мс)
                minVelocity: 0.3       // Минимальная скорость для свайпа (пиксели/мс)
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
        this.scene.input.on('pointerdown', (pointer) => {
            this.handlePointerDown(pointer);
        });
        
        // Движение пальца
        this.scene.input.on('pointermove', (pointer) => {
            this.handlePointerMove(pointer);
        });
        
        // Конец касания
        this.scene.input.on('pointerup', (pointer) => {
            this.handlePointerUp(pointer);
        });
        
        // Выход за пределы экрана
        this.scene.input.on('pointerupoutside', (pointer) => {
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
        
        // Проверяем свайп (приоритет над другими жестами)
        if (distance >= settings.swipe.minDistance && 
            duration <= settings.swipe.maxDuration) {
            
            const velocity = distance / duration;
            if (velocity >= settings.swipe.minVelocity) {
                return this.createSwipeGesture(pointer);
            }
        }
        
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
        const distanceFromLastTap = Phaser.Math.Distance.Between(
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
            duration: this.scene.time.now - this.gestureState.startTime,
            target: this.getTargetAtPosition(pointer.x, pointer.y)
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
            duration: this.scene.time.now - this.gestureState.startTime,
            target: this.getTargetAtPosition(pointer.x, pointer.y)
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
            duration: this.scene.time.now - this.gestureState.startTime,
            target: this.getTargetAtPosition(pointer.x, pointer.y)
        };
    }
    
    /**
     * Создание жеста свайпа
     */
    createSwipeGesture(pointer) {
        const deltaX = pointer.x - this.gestureState.startX;
        const deltaY = pointer.y - this.gestureState.startY;
        
        // Определяем направление свайпа
        let direction = 'unknown';
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        return {
            type: 'swipe',
            x: pointer.x,
            y: pointer.y,
            startX: this.gestureState.startX,
            startY: this.gestureState.startY,
            direction: direction,
            distance: this.gestureState.moveDistance,
            duration: this.scene.time.now - this.gestureState.startTime,
            target: this.getTargetAtPosition(pointer.x, pointer.y)
        };
    }
    
    /**
     * Выполнение жеста
     */
    executeGesture(gesture, pointer) {
        
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
     * Определение цели жеста (враг, яйцо, поле)
     */
    getTargetAtPosition(x, y) {
        // Здесь можно добавить логику определения цели
        // Пока возвращаем простую структуру
        return {
            type: 'field', // 'enemy', 'egg', 'field'
            x: x,
            y: y
        };
    }
    
    /**
     * Установка callback'ов для жестов
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }
    
    /**
     * Обновление настроек жестов
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
    
    /**
     * Уничтожение менеджера жестов
     */
    destroy() {
        // Удаляем обработчики событий
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointermove');
        this.scene.input.off('pointerup');
        this.scene.input.off('pointerupoutside');
    }
}
