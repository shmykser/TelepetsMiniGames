/**
 * Утилитарные функции для геометрических вычислений
 * Следует принципу Single Responsibility Principle
 */
export class GeometryUtils {
    /**
     * Вычисляет расстояние между двумя точками
     * @param {number} x1 - X координата первой точки
     * @param {number} y1 - Y координата первой точки
     * @param {number} x2 - X координата второй точки
     * @param {number} y2 - Y координата второй точки
     * @returns {number} Расстояние между точками
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Вычисляет угол между двумя точками в радианах
     * @param {number} x1 - X координата первой точки
     * @param {number} y1 - Y координата первой точки
     * @param {number} x2 - X координата второй точки
     * @param {number} y2 - Y координата второй точки
     * @returns {number} Угол в радианах
     */
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Нормализует вектор
     * @param {number} x - X компонент вектора
     * @param {number} y - Y компонент вектора
     * @returns {Object} Нормализованный вектор {x, y}
     */
    static normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }

    /**
     * Проверяет, находится ли точка внутри прямоугольника
     * @param {number} x - X координата точки
     * @param {number} y - Y координата точки
     * @param {number} rectX - X координата прямоугольника
     * @param {number} rectY - Y координата прямоугольника
     * @param {number} rectWidth - Ширина прямоугольника
     * @param {number} rectHeight - Высота прямоугольника
     * @returns {boolean} true если точка внутри прямоугольника
     */
    static pointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
        return x >= rectX && x <= rectX + rectWidth && 
               y >= rectY && y <= rectY + rectHeight;
    }

    /**
     * Проверяет, находится ли точка внутри круга
     * @param {number} x - X координата точки
     * @param {number} y - Y координата точки
     * @param {number} circleX - X координата центра круга
     * @param {number} circleY - Y координата центра круга
     * @param {number} radius - Радиус круга
     * @returns {boolean} true если точка внутри круга
     */
    static pointInCircle(x, y, circleX, circleY, radius) {
        const distance = this.distance(x, y, circleX, circleY);
        return distance <= radius;
    }

    /**
     * Вычисляет точку на окружности по углу
     * @param {number} centerX - X координата центра
     * @param {number} centerY - Y координата центра
     * @param {number} radius - Радиус
     * @param {number} angle - Угол в радианах
     * @returns {Object} Точка {x, y}
     */
    static pointOnCircle(centerX, centerY, radius, angle) {
        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        };
    }

    /**
     * Ограничивает значение в заданном диапазоне
     * @param {number} value - Значение для ограничения
     * @param {number} min - Минимальное значение
     * @param {number} max - Максимальное значение
     * @returns {number} Ограниченное значение
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Линейная интерполяция между двумя значениями
     * @param {number} a - Начальное значение
     * @param {number} b - Конечное значение
     * @param {number} t - Параметр интерполяции (0-1)
     * @returns {number} Интерполированное значение
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
}
