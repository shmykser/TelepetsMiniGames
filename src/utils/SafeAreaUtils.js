/**
 * Утилиты для работы с Safe Area на мобильных устройствах
 * Обеспечивает корректное отображение UI элементов с учетом челки и островков камеры
 */
export class SafeAreaUtils {
    /**
     * Получает значение safe-area-inset-top из CSS
     * @returns {number} Значение safe-area-inset-top в пикселях
     */
    static getSafeAreaTop() {
        if (typeof window === 'undefined') {
            return 0;
        }
        
        try {
            const computedStyle = getComputedStyle(document.documentElement);
            const safeAreaTop = computedStyle.getPropertyValue('env(safe-area-inset-top)');
            return parseInt(safeAreaTop) || 0;
        } catch (error) {
            console.warn('SafeAreaUtils: Не удалось получить safe-area-inset-top:', error);
            return 0;
        }
    }
    
    /**
     * Получает значение safe-area-inset-bottom из CSS
     * @returns {number} Значение safe-area-inset-bottom в пикселях
     */
    static getSafeAreaBottom() {
        if (typeof window === 'undefined') {
            return 0;
        }
        
        try {
            const computedStyle = getComputedStyle(document.documentElement);
            const safeAreaBottom = computedStyle.getPropertyValue('env(safe-area-inset-bottom)');
            return parseInt(safeAreaBottom) || 0;
        } catch (error) {
            console.warn('SafeAreaUtils: Не удалось получить safe-area-inset-bottom:', error);
            return 0;
        }
    }
    
    /**
     * Получает значение safe-area-inset-left из CSS
     * @returns {number} Значение safe-area-inset-left в пикселях
     */
    static getSafeAreaLeft() {
        if (typeof window === 'undefined') {
            return 0;
        }
        
        try {
            const computedStyle = getComputedStyle(document.documentElement);
            const safeAreaLeft = computedStyle.getPropertyValue('env(safe-area-inset-left)');
            return parseInt(safeAreaLeft) || 0;
        } catch (error) {
            console.warn('SafeAreaUtils: Не удалось получить safe-area-inset-left:', error);
            return 0;
        }
    }
    
    /**
     * Получает значение safe-area-inset-right из CSS
     * @returns {number} Значение safe-area-inset-right в пикселях
     */
    static getSafeAreaRight() {
        if (typeof window === 'undefined') {
            return 0;
        }
        
        try {
            const computedStyle = getComputedStyle(document.documentElement);
            const safeAreaRight = computedStyle.getPropertyValue('env(safe-area-inset-right)');
            return parseInt(safeAreaRight) || 0;
        } catch (error) {
            console.warn('SafeAreaUtils: Не удалось получить safe-area-inset-right:', error);
            return 0;
        }
    }
    
    /**
     * Получает все значения safe-area
     * @returns {Object} Объект с значениями safe-area
     */
    static getAllSafeAreas() {
        return {
            top: this.getSafeAreaTop(),
            bottom: this.getSafeAreaBottom(),
            left: this.getSafeAreaLeft(),
            right: this.getSafeAreaRight()
        };
    }
    
    /**
     * Проверяет, поддерживается ли safe-area на текущем устройстве
     * @returns {boolean} true если safe-area поддерживается
     */
    static isSafeAreaSupported() {
        if (typeof window === 'undefined') {
            return false;
        }
        
        try {
            const computedStyle = getComputedStyle(document.documentElement);
            const safeAreaTop = computedStyle.getPropertyValue('env(safe-area-inset-top)');
            return safeAreaTop !== '';
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Вычисляет безопасную Y-координату для элемента в верхней части экрана
     * @param {number} baseY - Базовая Y-координата
     * @param {number} elementHeight - Высота элемента
     * @returns {number} Безопасная Y-координата
     */
    static getSafeTopPosition(baseY, elementHeight = 0) {
        const safeAreaTop = this.getSafeAreaTop();
        return Math.max(baseY, safeAreaTop + 10); // Минимум 10px отступ от safe-area
    }
    
    /**
     * Вычисляет безопасную Y-координату для элемента в нижней части экрана
     * @param {number} screenHeight - Высота экрана
     * @param {number} baseY - Базовая Y-координата
     * @param {number} elementHeight - Высота элемента
     * @returns {number} Безопасная Y-координата
     */
    static getSafeBottomPosition(screenHeight, baseY, elementHeight = 0) {
        const safeAreaBottom = this.getSafeAreaBottom();
        return Math.min(baseY, screenHeight - safeAreaBottom - elementHeight - 10);
    }
    
    /**
     * Вычисляет безопасную X-координату для элемента в левой части экрана
     * @param {number} baseX - Базовая X-координата
     * @param {number} elementWidth - Ширина элемента
     * @returns {number} Безопасная X-координата
     */
    static getSafeLeftPosition(baseX, elementWidth = 0) {
        const safeAreaLeft = this.getSafeAreaLeft();
        return Math.max(baseX, safeAreaLeft + 10); // Минимум 10px отступ от safe-area
    }
    
    /**
     * Вычисляет безопасную X-координату для элемента в правой части экрана
     * @param {number} screenWidth - Ширина экрана
     * @param {number} baseX - Базовая X-координата
     * @param {number} elementWidth - Ширина элемента
     * @returns {number} Безопасная X-координата
     */
    static getSafeRightPosition(screenWidth, baseX, elementWidth = 0) {
        const safeAreaRight = this.getSafeAreaRight();
        return Math.min(baseX, screenWidth - safeAreaRight - elementWidth - 10);
    }
}
