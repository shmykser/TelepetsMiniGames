export declare class GeometryUtils {
    static randomBetween(min: number, max: number): number;
    static randomFloat(min: number, max: number): number;
    static clamp(value: number, min: number, max: number): number;
    static distance(x1: number, y1: number, x2: number, y2: number): number;
    static normalize(x: number, y: number): { x: number; y: number };
    static degreesToRadians(degrees: number): number;
    static radiansToDegrees(radians: number): number;
    static directionFromDeltas(deltaX: number, deltaY: number): number;
    static isInDirection(deltaX: number, deltaY: number, direction: number, tolerance?: number): boolean;
    static roundToDecimal(value: number, decimals: number): number;
    static abs(value: number): number;
    static floor(value: number): number;
    static ceil(value: number): number;
    static min(a: number, b: number): number;
    static max(a: number, b: number): number;
    static calculateWaveOffset(time: number, frequency: number, amplitude: number): number;
    static calculateCircularPosition(centerX: number, centerY: number, radius: number, angle: number): { x: number; y: number };
    static generateRandomOffset(intensity: number): { x: number; y: number };
    static calculateZigzag(time: number, intensity: number): number;
    static calculateFlutter(time: number, intensity: number): number;
    static TWO_PI: number;
    static isInRadius(x: number, y: number, centerX: number, centerY: number, radius: number): boolean;
    static findObjectsInRadius<T>(objects: T[], centerX: number, centerY: number, radius: number, filterFn?: (obj: T) => boolean): T[];
    static findObjectsInDirection<T>(objects: T[], centerX: number, centerY: number, direction: number, range: number, filterFn?: (obj: T) => boolean): T[];
    static findFirstObjectInRadius<T>(objects: T[], centerX: number, centerY: number, radius: number, filterFn?: (obj: T) => boolean): T | null;
    static calculateHitRadius(object: any, objectType: string, targetSettings: any): number;
}
