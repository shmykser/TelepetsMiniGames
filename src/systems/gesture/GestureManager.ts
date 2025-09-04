import Hammer from 'hammerjs';
import Phaser from 'phaser';

export type GestureEvents = {
  onTap?: (e: HammerInput) => void;
  onDoubleTap?: (e: HammerInput) => void;
  onPan?: (e: HammerInput) => void;
  onSwipe?: (e: HammerInput) => void;
  onPinch?: (e: HammerInput) => void;
  onRotate?: (e: HammerInput) => void;
};

export class GestureManager {
  private hammer: HammerManager;
  private scene: Phaser.Scene;
  private gameCanvas: HTMLCanvasElement;

  constructor(scene: Phaser.Scene, events: GestureEvents = {}) {
    this.scene = scene;
    this.gameCanvas = scene.game.canvas;
    
    // Создаем Hammer Manager для canvas
    this.hammer = new Hammer.Manager(this.gameCanvas);

    // Настройка жестов согласно документации Hammer.js
    const singleTap = new Hammer.Tap({ 
      event: 'singletap',
      taps: 1,
      interval: 300,
      time: 250,
      threshold: 2,
      posThreshold: 10
    });
    
    const doubleTap = new Hammer.Tap({ 
      event: 'doubletap', 
      taps: 2, 
      interval: 300,
      time: 250,
      threshold: 2,
      posThreshold: 10
    });
    
    const pan = new Hammer.Pan({ 
      threshold: 10,
      pointers: 1,
      direction: Hammer.DIRECTION_ALL
    });
    
    const swipe = new Hammer.Swipe({ 
      velocity: 0.3, 
      threshold: 10,
      direction: Hammer.DIRECTION_ALL
    });
    
    const pinch = new Hammer.Pinch({
      threshold: 0.1
    });
    
    const rotate = new Hammer.Rotate({
      threshold: 0.1
    });

    // Правильные приоритеты согласно документации Hammer.js
    // Для multi-tap: двойной тап работает с одинарным
    doubleTap.recognizeWith(singleTap);
    
    // Одинарный тап ждет неудачи двойного тапа
    singleTap.requireFailure(doubleTap);
    
    // Swipe и pan работают независимо
    // pinch и rotate работают вместе
    pinch.recognizeWith(rotate);

    this.hammer.add([singleTap, doubleTap, pan, swipe, pinch, rotate]);

    // Привязка событий
    if (events.onTap) this.hammer.on('singletap', this.wrapGestureEvent(events.onTap));
    if (events.onDoubleTap) this.hammer.on('doubletap', this.wrapGestureEvent(events.onDoubleTap));
    if (events.onPan) this.hammer.on('pan panstart panend', this.wrapGestureEvent(events.onPan));
    if (events.onSwipe) this.hammer.on('swipe', this.wrapGestureEvent(events.onSwipe));
    if (events.onPinch) this.hammer.on('pinch pinchstart pinchend', this.wrapGestureEvent(events.onPinch));
    if (events.onRotate) this.hammer.on('rotate rotatestart rotateend', this.wrapGestureEvent(events.onRotate));

    // Отладочное логирование всех событий Hammer
    this.hammer.on('hammer.input', (e: any) => {
      console.log('Hammer input:', e.type, e.eventType, e.pointers.length, 'recognizers:', e.recognizers?.map((r: any) => r.options.event));
    });
    
    // Логирование всех распознанных жестов
    this.hammer.on('singletap doubletap pan panstart panend swipe pinch pinchstart pinchend rotate rotatestart rotateend', (e: any) => {
      console.log('Gesture recognized:', e.type, 'at', e.center.x, e.center.y);
    });
  }

  // Обертка для преобразования Hammer координат в Phaser координаты
  private wrapGestureEvent(callback: (e: HammerInput) => void) {
    return (e: HammerInput) => {
      // Преобразуем координаты Hammer в координаты Phaser
      const phaserCoords = this.hammerToPhaserCoords(e.center.x, e.center.y);
      
      // Создаем расширенный объект события с Phaser координатами
      const enhancedEvent = {
        ...e,
        phaserX: phaserCoords.x,
        phaserY: phaserCoords.y,
        phaserCoords: phaserCoords
      };
      
      callback(enhancedEvent as unknown as HammerInput);
    };
  }

  // Преобразование координат Hammer в координаты Phaser
  private hammerToPhaserCoords(hammerX: number, hammerY: number): Phaser.Math.Vector2 {
    const canvasRect = this.gameCanvas.getBoundingClientRect();
    const scaleX = this.scene.scale.width / canvasRect.width;
    const scaleY = this.scene.scale.height / canvasRect.height;
    
    return new Phaser.Math.Vector2(
      (hammerX - canvasRect.left) * scaleX,
      (hammerY - canvasRect.top) * scaleY
    );
  }

  // Получение направления свайпа в Phaser формате
  getSwipeDirection(e: HammerInput): Phaser.Math.Vector2 {
    const direction = e.direction;
    let x = 0, y = 0;
    
    if (direction === Hammer.DIRECTION_LEFT) x = -1;
    else if (direction === Hammer.DIRECTION_RIGHT) x = 1;
    else if (direction === Hammer.DIRECTION_UP) y = -1;
    else if (direction === Hammer.DIRECTION_DOWN) y = 1;
    
    return new Phaser.Math.Vector2(x, y);
  }

  // Получение силы жеста (для пан и свайп)
  getGestureForce(e: HammerInput): number {
    return e.velocity || 0;
  }

  // Получение масштаба пинча
  getPinchScale(e: HammerInput): number {
    return e.scale || 1;
  }

  // Получение угла поворота
  getRotationAngle(e: HammerInput): number {
    return e.rotation || 0;
  }

  destroy(): void {
    this.hammer.stop(true);
    this.hammer.destroy();
    // @ts-expect-error explicit cleanup
    this.hammer = undefined;
  }
}


