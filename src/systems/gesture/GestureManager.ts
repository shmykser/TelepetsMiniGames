import Hammer from 'hammerjs';
import Phaser from 'phaser';

/**
 * Расширенный интерфейс для событий жестов с Phaser координатами
 */
export interface ExtendedHammerInput extends HammerInput {
  phaserX: number;
  phaserY: number;
}

/**
 * Интерфейс для событий жестов
 */
export interface GestureEvents {
  onTap?: (e: ExtendedHammerInput) => void;
  onDoubleTap?: (e: ExtendedHammerInput) => void;
  onPan?: (e: ExtendedHammerInput) => void;
  onSwipe?: (e: ExtendedHammerInput) => void;
  onPinch?: (e: ExtendedHammerInput) => void;
  onRotate?: (e: ExtendedHammerInput) => void;
  onPress?: (e: ExtendedHammerInput) => void;
}

/**
 * Менеджер жестов для Phaser игры
 * Основан на официальной документации Hammer.js
 */
export class GestureManager {
  private hammer: HammerManager;
  private gameCanvas: HTMLCanvasElement;

  constructor(scene: Phaser.Scene, events: GestureEvents = {}) {
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
  }

  /**
   * Настройка распознавателей жестов согласно документации Hammer.js
   */
  private setupRecognizers(): void {
    // 1. Tap - одинарный тап (согласно документации)
    const tap = new Hammer.Tap({
      event: 'tap',
      taps: 1,
      interval: 300,
      time: 250,
      threshold: 2, // Согласно документации: "a minimal movement is ok, but keep it low"
      posThreshold: 10
    });

    // 2. DoubleTap - двойной тап (согласно документации)
    const doubleTap = new Hammer.Tap({
      event: 'doubletap',
      taps: 2,
      interval: 300,
      time: 250,
      threshold: 2, // Согласно документации: "a minimal movement is ok, but keep it low"
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
  private setupRecognizerPriorities(
    tap: any,
    doubleTap: any,
    pan: any,
    swipe: any,
    pinch: any,
    rotate: any,
    press: any
  ): void {
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
  private bindEvents(events: GestureEvents): void {
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
  private wrapGestureEvent(callback: (e: ExtendedHammerInput) => void) {
    return (e: HammerInput) => {
      // Преобразуем координаты Hammer в координаты Phaser
      const phaserCoords = this.hammerToPhaserCoords(e.center.x, e.center.y);
      
      // Создаем расширенное событие с Phaser координатами
      const extendedEvent: ExtendedHammerInput = {
        ...e,
        phaserX: phaserCoords.x,
        phaserY: phaserCoords.y
      } as ExtendedHammerInput;
      
      callback(extendedEvent);
    };
  }

  /**
   * Преобразование координат Hammer в координаты Phaser
   */
  private hammerToPhaserCoords(hammerX: number, hammerY: number): { x: number; y: number } {
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
  getSwipeDirection(direction: number): string {
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
  getGestureForce(e: ExtendedHammerInput): number {
    return (e as any).force || 0;
  }

  /**
   * Получение масштаба щипка
   */
  getPinchScale(e: ExtendedHammerInput): number {
    return (e as any).scale || 1;
  }

  /**
   * Получение угла поворота
   */
  getRotationAngle(e: ExtendedHammerInput): number {
    return (e as any).rotation || 0;
  }

  /**
   * Настройка отладочного логирования
   */
  private setupDebugLogging(): void {
    // Логирование всех событий Hammer
    this.hammer.on('hammer.input', (e: any) => {
      console.log('Hammer input:', {
        type: e.type,
        eventType: e.eventType,
        pointers: e.pointers.length,
        center: { x: e.center.x, y: e.center.y }
      });
    });
    
    // Логирование распознанных жестов
    this.hammer.on('tap doubletap pan panstart panend swipe pinch pinchstart pinchend rotate rotatestart rotateend press pressup', (e: any) => {
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
  getRecognizer(name: string): any {
    return this.hammer.get(name);
  }

  /**
   * Обновление настроек распознавателя
   */
  updateRecognizer(name: string, options: any): void {
    const recognizer = this.hammer.get(name);
    if (recognizer) {
      recognizer.set(options);
    }
  }

  /**
   * Включение/выключение распознавателя
   */
  setRecognizerEnabled(name: string, enabled: boolean): void {
    const recognizer = this.hammer.get(name);
    if (recognizer) {
      recognizer.set({ enable: enabled });
    }
  }

  /**
   * Остановка текущего распознавания
   */
  stopRecognition(force: boolean = false): void {
    this.hammer.stop(force);
  }


  /**
   * Уничтожение менеджера жестов
   */
  destroy(): void {
    if (this.hammer) {
      this.hammer.destroy();
      this.hammer = null as any;
    }
  }
}