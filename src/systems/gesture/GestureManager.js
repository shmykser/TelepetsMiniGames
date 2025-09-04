import Hammer from 'hammerjs';
export class GestureManager {
    constructor(target, events = {}) {
        Object.defineProperty(this, "hammer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.hammer = new Hammer.Manager(target);
        const tap = new Hammer.Tap({ taps: 1 });
        const doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, interval: 300, posThreshold: 30 });
        const pan = new Hammer.Pan({ threshold: 3 });
        const swipe = new Hammer.Swipe({ velocity: 0.3, threshold: 10 });
        const pinch = new Hammer.Pinch();
        const rotate = new Hammer.Rotate();
        doubleTap.recognizeWith(tap);
        pinch.recognizeWith(rotate);
        this.hammer.add([tap, doubleTap, pan, swipe, pinch, rotate]);
        if (events.onTap)
            this.hammer.on('tap', events.onTap);
        if (events.onDoubleTap)
            this.hammer.on('doubletap', events.onDoubleTap);
        if (events.onPan)
            this.hammer.on('pan', events.onPan);
        if (events.onSwipe)
            this.hammer.on('swipe', events.onSwipe);
        if (events.onPinch)
            this.hammer.on('pinch pinchstart pinchend', events.onPinch);
        if (events.onRotate)
            this.hammer.on('rotate rotatestart rotateend', events.onRotate);
    }
    destroy() {
        this.hammer.stop(true);
        this.hammer.destroy();
        // @ts-expect-error explicit cleanup
        this.hammer = undefined;
    }
}
