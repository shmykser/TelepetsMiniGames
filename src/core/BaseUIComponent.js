import Phaser from 'phaser';
import { PropertyUtils } from '../utils/PropertyUtils.js';

/**
 * Базовый класс для UI компонентов
 * Следует принципу Open/Closed Principle
 */
export class BaseUIComponent extends Phaser.GameObjects.Container {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y);
        
        this.visible = true;
        this.active = true;
        this.alpha = 1;
        this.scale = 1;
        
        // Применяем конфигурацию
        this.applyConfig(config);
        
        // Инициализация компонента
        this.init();
    }

    /**
     * Применяет конфигурацию к компоненту
     * @param {Object} config - Конфигурация
     */
    applyConfig(config) {
        Object.keys(config).forEach(key => {
            if (this.hasOwnProperty(key) || key in this) {
                this[key] = config[key];
            }
        });
    }

    /**
     * Инициализация компонента (переопределяется в наследниках)
     */
    init() {
        // Базовая реализация
    }

    /**
     * Обновление компонента
     * @param {number} time - Время
     * @param {number} delta - Дельта времени
     */
    update(time, delta) {
        if (!this.active) return;
        this.onUpdate(time, delta);
    }

    /**
     * Переопределяемый метод обновления
     * @param {number} time - Время
     * @param {number} delta - Дельта времени
     */
    onUpdate(time, delta) {
        // Переопределяется в наследниках
    }

    /**
     * Показывает компонент
     */
    show() {
        this.visible = true;
        this.onShow();
    }

    /**
     * Скрывает компонент
     */
    hide() {
        this.visible = false;
        this.onHide();
    }

    /**
     * Активирует компонент
     */
    activate() {
        this.active = true;
        this.onActivate();
    }

    /**
     * Деактивирует компонент
     */
    deactivate() {
        this.active = false;
        this.onDeactivate();
    }

    /**
     * Уничтожает компонент
     */
    destroy() {
        this.onDestroy();
        this.scene = null;
    }

    // Переопределяемые методы жизненного цикла
    onShow() {}
    onHide() {}
    onActivate() {}
    onDeactivate() {}
    onDestroy() {}

    /**
     * Устанавливает позицию компонента
     * @param {number} x - X координата
     * @param {number} y - Y координата
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.onPositionChanged(x, y);
    }

    /**
     * Переопределяемый метод изменения позиции
     * @param {number} x - X координата
     * @param {number} y - Y координата
     */
    onPositionChanged(x, y) {
        // Переопределяется в наследниках
    }

    /**
     * Устанавливает альфу компонента
     * @param {number} alpha - Значение альфы (0-1)
     */
    setAlpha(alpha) {
        this.alpha = PropertyUtils.clamp(alpha, 0, 1);
        this.onAlphaChanged(this.alpha);
    }

    /**
     * Переопределяемый метод изменения альфы
     * @param {number} alpha - Значение альфы
     */
    onAlphaChanged(alpha) {
        // Переопределяется в наследниках
    }

    /**
     * Устанавливает масштаб компонента
     * @param {number} scale - Значение масштаба
     */
    setScale(scale) {
        this.scale = PropertyUtils.isPositiveNumber(scale) ? scale : 1;
        this.onScaleChanged(this.scale);
    }

    /**
     * Переопределяемый метод изменения масштаба
     * @param {number} scale - Значение масштаба
     */
    onScaleChanged(scale) {
        // Переопределяется в наследниках
    }
}
