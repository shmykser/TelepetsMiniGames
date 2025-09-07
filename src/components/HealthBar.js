import Phaser from 'phaser';
import { BaseUIComponent } from '../core/BaseUIComponent.js';
import { PropertyUtils } from '../utils/PropertyUtils.js';
/**
 * Универсальный компонент полосы здоровья
 * Может использоваться для врагов, яйца, защиты и любых других объектов
 */
export class HealthBar extends BaseUIComponent {
    constructor(scene, targetObject, options = {}) {
        super(scene, 0, 0, options);
        
        // Используем утилитарную функцию для определения свойств
        PropertyUtils.defineProperty(this, "backgroundBar", undefined);
        PropertyUtils.defineProperty(this, "healthBar", undefined);
        PropertyUtils.defineProperty(this, "borderBar", undefined);
        PropertyUtils.defineProperty(this, "targetObject", undefined);
        // Настройки полосы здоровья - используем утилитарную функцию
        PropertyUtils.defineProperty(this, "barWidth", undefined);
        PropertyUtils.defineProperty(this, "barHeight", undefined);
        PropertyUtils.defineProperty(this, "offsetY", undefined);
        PropertyUtils.defineProperty(this, "offsetX", undefined);
        PropertyUtils.defineProperty(this, "showWhenFull", undefined);
        PropertyUtils.defineProperty(this, "showWhenEmpty", undefined);
        this.targetObject = targetObject;
        // Настройки по умолчанию
        this.barWidth = options.barWidth || this.calculateBarWidth();
        this.barHeight = options.barHeight || 6;
        this.offsetY = options.offsetY || -40;
        this.offsetX = options.offsetX || 0;
        this.showWhenFull = options.showWhenFull || false;
        this.showWhenEmpty = options.showWhenEmpty || true;
        // Цвета по умолчанию
        const colors = {
            background: 0x000000,
            health: 0x00ff00,
            border: 0xffffff,
            ...options.colors
        };
        // Создаем графические элементы
        this.backgroundBar = scene.add.graphics();
        this.healthBar = scene.add.graphics();
        this.borderBar = scene.add.graphics();
        // Добавляем в контейнер
        this.add([this.backgroundBar, this.healthBar, this.borderBar]);
        // Настраиваем цвета
        this.setColors(colors);
        // Позиционируем относительно объекта
        this.updatePosition();
        // Добавляем в сцену
        scene.add.existing(this);
        // Обновляем отображение
        this.updateHealth();
    }
    /**
     * Вычисляет ширину полосы на основе размера объекта
     */
    calculateBarWidth() {
        const objectWidth = this.targetObject.objectWidth || 64;
        const objectScale = this.targetObject.objectScaleX || 1;
        return Math.max(40, objectWidth * objectScale * 0.8);
    }
    /**
     * Устанавливает цвета полосы здоровья
     */
    setColors(colors) {
        this.backgroundBar.clear();
        this.healthBar.clear();
        this.borderBar.clear();
        // Фон (центрируем по горизонтали)
        this.backgroundBar.fillStyle(colors.background, 0.8);
        this.backgroundBar.fillRect(-this.barWidth / 2, 0, this.barWidth, this.barHeight);
        // Граница (центрируем по горизонтали)
        this.borderBar.lineStyle(1, colors.border, 1);
        this.borderBar.strokeRect(-this.barWidth / 2, 0, this.barWidth, this.barHeight);
    }
    /**
     * Обновляет позицию полосы здоровья относительно объекта
     */
    updatePosition() {
        this.x = this.targetObject.x + this.offsetX;
        this.y = this.targetObject.y + this.offsetY;
    }
    /**
     * Обновляет отображение полосы здоровья
     */
    updateHealth() {
        const healthPercent = this.targetObject.health / this.targetObject.maxHealth;
        // Определяем, нужно ли показывать полосу
        const shouldShow = this.shouldShowBar(healthPercent);
        this.setVisible(shouldShow);
        if (!shouldShow)
            return;
        // Обновляем позицию
        this.updatePosition();
        // Очищаем полосу здоровья
        this.healthBar.clear();
        // Вычисляем ширину полосы здоровья
        const healthWidth = this.barWidth * healthPercent;
        // Определяем цвет в зависимости от процента здоровья
        const healthColor = this.getHealthColor(healthPercent);
        // Рисуем полосу здоровья (центрируем по горизонтали)
        this.healthBar.fillStyle(healthColor, 0.9);
        this.healthBar.fillRect(-this.barWidth / 2, 0, healthWidth, this.barHeight);
    }
    /**
     * Определяет, нужно ли показывать полосу здоровья
     */
    shouldShowBar(healthPercent) {
        if (healthPercent <= 0)
            return this.showWhenEmpty;
        if (healthPercent >= 1)
            return this.showWhenFull;
        return true; // Показываем, если здоровье не полное и не пустое
    }
    /**
     * Определяет цвет полосы здоровья в зависимости от процента
     */
    getHealthColor(healthPercent) {
        if (healthPercent > 0.6)
            return 0x00ff00; // Зеленый
        if (healthPercent > 0.3)
            return 0xffff00; // Желтый
        return 0xff0000; // Красный
    }
    /**
     * Устанавливает новый целевой объект
     */
    setTargetObject(targetObject) {
        this.targetObject = targetObject;
        this.barWidth = this.calculateBarWidth();
        this.updateHealth();
    }
    /**
     * Обновляет настройки отображения
     */
    updateSettings(options) {
        if (options.showWhenFull !== undefined) {
            this.showWhenFull = options.showWhenFull;
        }
        if (options.showWhenEmpty !== undefined) {
            this.showWhenEmpty = options.showWhenEmpty;
        }
        if (options.offsetY !== undefined) {
            this.offsetY = options.offsetY;
        }
        if (options.offsetX !== undefined) {
            this.offsetX = options.offsetX;
        }
        this.updateHealth();
    }
    /**
     * Уничтожение компонента
     */
    destroy() {
        this.backgroundBar.destroy();
        this.healthBar.destroy();
        this.borderBar.destroy();
        super.destroy();
    }
}
