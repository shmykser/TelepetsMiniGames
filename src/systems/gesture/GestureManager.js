import Hammer from 'hammerjs';
/**
 * Менеджер жестов для Phaser игры
 * Основан на официальной документации Hammer.js
 */
export class GestureManager {
    constructor(scene, events = {}) {
        Object.defineProperty(this, "hammer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gameCanvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "instantTapHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.gameCanvas = scene.game.canvas;
        // Создаем Hammer Manager для canvas
        this.hammer = new Hammer.Manager(this.gameCanvas, {
            touchAction: 'auto',
            domEvents: false,
            enable: true
        });
        // Создаем распознаватели жестов согласно документации
        this.setupRecognizers();
        // Привязываем события
        this.bindEvents(events);
        // Отладочное логирование
        this.setupDebugLogging();
        // Добавляем мгновенный отклик на pointerdown для быстрых тапов
        this.setupInstantTapResponse(events);
        // Отключаем Hammer.js обработчик тапов, чтобы избежать дублирования
        this.setRecognizerEnabled('tap', false);
    }
    /**
     * Настройка распознавателей жестов согласно документации Hammer.js
     */
    setupRecognizers() {
        // 1. Tap - одинарный тап (быстрый отклик)
        const tap = new Hammer.Tap({
            event: 'tap',
            taps: 1,
            interval: 200, // Уменьшено с 300 до 200
            time: 100, // Уменьшено с 250 до 100 для быстрого отклика
            threshold: 2,
            posThreshold: 10
        });
        // 2. DoubleTap - двойной тап
        const doubleTap = new Hammer.Tap({
            event: 'doubletap',
            taps: 2,
            interval: 200, // Уменьшено с 300 до 200
            time: 100, // Уменьшено с 250 до 100
            threshold: 2,
            posThreshold: 10
        });
        // 3. Pan - удержание и перетаскивание (согласно документации)
        const pan = new Hammer.Pan({
            threshold: 10, // Согласно документации: default 10
            pointers: 1,
            direction: Hammer.DIRECTION_ALL
        });
        // 4. Swipe - быстрый свайп (согласно документации)
        const swipe = new Hammer.Swipe({
            velocity: 0.3, // Согласно документации: default 0.3
            threshold: 10, // Согласно документации: default 10
            direction: Hammer.DIRECTION_ALL
        });
        // 5. Pinch - щипок (масштабирование)
        const pinch = new Hammer.Pinch({
            threshold: 0.1
        });
        // 6. Rotate - вращение
        const rotate = new Hammer.Rotate({
            threshold: 0.1
        });
        // 7. Press - долгое нажатие
        const press = new Hammer.Press({
            time: 500,
            threshold: 5
        });
        // Добавляем распознаватели в менеджер
        this.hammer.add([tap, doubleTap, pan, swipe, pinch, rotate, press]);
        // Настройка приоритетов согласно документации Hammer.js
        this.setupRecognizerPriorities(tap, doubleTap, pan, swipe, pinch, rotate, press);
    }
    /**
     * Настройка приоритетов распознавателей согласно документации Hammer.js
     */
    setupRecognizerPriorities(tap, doubleTap, pan, swipe, pinch, rotate, press) {
        // Multi-tap приоритеты (согласно документации Hammer.js)
        // Правильный порядок: tripleTap -> doubleTap -> singleTap
        // doubleTap должен работать одновременно с tap, но tap должен ждать неудачи doubleTap
        doubleTap.recognizeWith(tap);
        tap.requireFailure(doubleTap);
        // Pinch и rotate работают вместе
        pinch.recognizeWith(rotate);
        // Press требует неудачи tap и doubleTap
        press.requireFailure([tap, doubleTap]);
        // Swipe и pan приоритеты (согласно документации)
        // Swipe должен иметь приоритет над pan для быстрых движений
        // НО: swipe должен работать одновременно с pan, а pan должен ждать неудачи swipe
        swipe.recognizeWith(pan);
        pan.requireFailure(swipe);
    }
    /**
     * Привязка событий к распознавателям
     */
    bindEvents(events) {
        if (events.onTap) {
            this.hammer.on('tap', this.wrapGestureEvent(events.onTap));
        }
        if (events.onDoubleTap) {
            this.hammer.on('doubletap', this.wrapGestureEvent(events.onDoubleTap));
        }
        if (events.onPan) {
            this.hammer.on('pan panstart panend', this.wrapGestureEvent(events.onPan));
        }
        if (events.onSwipe) {
            this.hammer.on('swipe', this.wrapGestureEvent(events.onSwipe));
        }
        if (events.onPinch) {
            this.hammer.on('pinch pinchstart pinchend', this.wrapGestureEvent(events.onPinch));
        }
        if (events.onRotate) {
            this.hammer.on('rotate rotatestart rotateend', this.wrapGestureEvent(events.onRotate));
        }
        if (events.onPress) {
            this.hammer.on('press pressup', this.wrapGestureEvent(events.onPress));
        }
    }
    /**
     * Обертка для преобразования Hammer координат в Phaser координаты
     */
    wrapGestureEvent(callback) {
        return (e) => {
            // Преобразуем координаты Hammer в координаты Phaser
            const phaserCoords = this.hammerToPhaserCoords(e.center.x, e.center.y);
            // Создаем расширенное событие с Phaser координатами
            const extendedEvent = {
                ...e,
                phaserX: phaserCoords.x,
                phaserY: phaserCoords.y
            };
            callback(extendedEvent);
        };
    }
    /**
     * Преобразование координат Hammer в координаты Phaser
     */
    hammerToPhaserCoords(hammerX, hammerY) {
        const canvas = this.gameCanvas;
        const rect = canvas.getBoundingClientRect();
        // Нормализуем координаты относительно canvas
        const x = (hammerX - rect.left) * (canvas.width / rect.width);
        const y = (hammerY - rect.top) * (canvas.height / rect.height);
        return { x, y };
    }
    /**
     * Получение направления свайпа в виде строки
     */
    getSwipeDirection(direction) {
        switch (direction) {
            case Hammer.DIRECTION_LEFT:
                return '←';
            case Hammer.DIRECTION_RIGHT:
                return '→';
            case Hammer.DIRECTION_UP:
                return '↑';
            case Hammer.DIRECTION_DOWN:
                return '↓';
            default:
                return '?';
        }
    }
    /**
     * Получение силы жеста
     */
    getGestureForce(e) {
        return e.force || 0;
    }
    /**
     * Получение масштаба щипка
     */
    getPinchScale(e) {
        return e.scale || 1;
    }
    /**
     * Получение угла поворота
     */
    getRotationAngle(e) {
        return e.rotation || 0;
    }
    /**
     * Настройка отладочного логирования
     */
    setupDebugLogging() {
        // Логирование всех событий Hammer
        this.hammer.on('hammer.input', (e) => {
            console.log('Hammer input:', {
                type: e.type,
                eventType: e.eventType,
                pointers: e.pointers.length,
                center: { x: e.center.x, y: e.center.y }
            });
        });
        // Логирование распознанных жестов
        this.hammer.on('tap doubletap pan panstart panend swipe pinch pinchstart pinchend rotate rotatestart rotateend press pressup', (e) => {
            console.log('Gesture recognized:', {
                type: e.type,
                center: { x: e.center.x, y: e.center.y },
                deltaX: e.deltaX,
                deltaY: e.deltaY,
                velocity: e.velocity,
                scale: e.scale,
                rotation: e.rotation
            });
        });
    }
    /**
     * Получение распознавателя по имени
     */
    getRecognizer(name) {
        return this.hammer.get(name);
    }
    /**
     * Обновление настроек распознавателя
     */
    updateRecognizer(name, options) {
        const recognizer = this.hammer.get(name);
        if (recognizer) {
            recognizer.set(options);
        }
    }
    /**
     * Включение/выключение распознавателя
     */
    setRecognizerEnabled(name, enabled) {
        const recognizer = this.hammer.get(name);
        if (recognizer) {
            recognizer.set({ enable: enabled });
        }
    }
    /**
     * Остановка текущего распознавания
     */
    stopRecognition(force = false) {
        this.hammer.stop(force);
    }
    /**
     * Настройка мгновенного отклика на pointerdown для быстрых тапов
     */
    setupInstantTapResponse(events) {
        if (!events.onTap)
            return;
        // Создаем обработчик pointerdown для мгновенного отклика
        this.instantTapHandler = (event) => {
            // Преобразуем координаты в Phaser координаты
            const rect = this.gameCanvas.getBoundingClientRect();
            const phaserX = event.clientX - rect.left;
            const phaserY = event.clientY - rect.top;
            // Создаем расширенное событие Hammer
            const hammerEvent = {
                type: 'tap',
                center: { x: phaserX, y: phaserY },
                deltaX: 0,
                deltaY: 0,
                velocity: 0,
                phaserX: phaserX,
                phaserY: phaserY
            };
            // Вызываем обработчик тапа мгновенно
            console.log(`Мгновенный тап в позиции: (${phaserX}, ${phaserY})`);
            if (events.onTap) {
                events.onTap(hammerEvent);
            }
        };
        // Добавляем обработчик
        this.gameCanvas.addEventListener('pointerdown', this.instantTapHandler, { passive: false });
    }
    /**
     * Уничтожение менеджера жестов
     */
    destroy() {
        // Удаляем обработчик мгновенного тапа
        if (this.instantTapHandler) {
            this.gameCanvas.removeEventListener('pointerdown', this.instantTapHandler);
            this.instantTapHandler = undefined;
        }
        if (this.hammer) {
            this.hammer.destroy();
            this.hammer = null;
        }
    }
}
