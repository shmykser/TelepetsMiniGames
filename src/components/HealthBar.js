import Phaser from 'phaser';
import { BaseUIComponent } from './BaseUIComponent.js';
import { PropertyUtils } from '../utils/PropertyUtils.js';
import { COLORS, DEPTH_CONSTANTS } from '../settings/GameSettings.js';
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
        PropertyUtils.defineProperty(this, "healthText", undefined);
        PropertyUtils.defineProperty(this, "targetObject", undefined);
        // Настройки полосы здоровья - используем утилитарную функцию
        PropertyUtils.defineProperty(this, "barWidth", undefined);
        PropertyUtils.defineProperty(this, "barHeight", undefined);
        PropertyUtils.defineProperty(this, "offsetY", undefined);
        PropertyUtils.defineProperty(this, "offsetX", undefined);
        PropertyUtils.defineProperty(this, "showWhenFull", undefined);
        PropertyUtils.defineProperty(this, "showWhenEmpty", undefined);
        PropertyUtils.defineProperty(this, "showBar", undefined);
        PropertyUtils.defineProperty(this, "showDigits", undefined);
        this.targetObject = targetObject;
        // Настройки по умолчанию
        this.barWidth = options.barWidth || this.calculateBarWidth();
        this.barHeight = options.barHeight || 6;
        this.offsetY = options.offsetY || -40;
        this.offsetX = options.offsetX || 0;
        this.showWhenFull = options.showWhenFull || false;
        this.showWhenEmpty = options.showWhenEmpty || true;
        this.showBar = options.showBar !== false; // По умолчанию включено
        this.showDigits = options.showDigits || false; // По умолчанию выключено
        // Цвета по умолчанию
        const colors = {
            background: COLORS.BLACK,
            health: COLORS.GREEN,
            border: COLORS.WHITE,
            ...options.colors
        };
        // Создаем графические элементы
        this.backgroundBar = scene.add.graphics();
        this.healthBar = scene.add.graphics();
        this.borderBar = scene.add.graphics();
        
        // Создаем текстовый элемент для цифрового отображения
        this.healthText = scene.add.text(0, 0, '', {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5, 0.5);
        
        // Добавляем в контейнер
        this.add([this.backgroundBar, this.healthBar, this.borderBar, this.healthText]);
        // Настраиваем цвета
        this.setColors(colors);
        // Позиционируем относительно объекта
        this.updatePosition();
        // Добавляем в сцену
        scene.add.existing(this);
        // Устанавливаем высокий depth, чтобы HealthBar был поверх всех объектов
        this.setDepth(DEPTH_CONSTANTS.HEALTH_BAR);
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
        
        // Определяем, нужно ли показывать компонент
        const shouldShow = this.shouldShowBar(healthPercent);
        this.setVisible(shouldShow);
        if (!shouldShow)
            return;
        
        // Обновляем позицию
        this.updatePosition();
        
        // Обновляем полосу здоровья
        if (this.showBar) {
            this.updateHealthBar(healthPercent);
        } else {
            this.hideHealthBar();
        }
        
        // Обновляем цифровое отображение
        if (this.showDigits) {
            this.updateHealthText();
        } else {
            this.hideHealthText();
        }
    }
    
    /**
     * Обновляет размер полосы здоровья при изменении размера объекта
     */
    updateBarSize() {
        // Пересчитываем ширину на основе нового размера объекта
        this.barWidth = this.calculateBarWidth();
        // Перерисовываем полосу с новыми размерами
        this.setColors({
            background: COLORS.BLACK,
            health: COLORS.GREEN,
            border: COLORS.WHITE
        });
        // Обновляем отображение здоровья
        this.updateHealth();
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
     * Обновляет полосу здоровья
     */
    updateHealthBar(healthPercent) {
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
     * Скрывает полосу здоровья
     */
    hideHealthBar() {
        this.backgroundBar.clear();
        this.healthBar.clear();
        this.borderBar.clear();
    }
    
    /**
     * Обновляет цифровое отображение здоровья
     */
    updateHealthText() {
        const currentHealth = Math.ceil(this.targetObject.health);
        const maxHealth = Math.ceil(this.targetObject.maxHealth);
        
        this.healthText.setText(`${currentHealth}/${maxHealth}`);
        this.healthText.setVisible(true);
        
        // Позиционируем текст
        if (this.showBar) {
            // Если показывается полоса - текст сверху
            this.healthText.y = -this.barHeight - 8;
        } else {
            // Если только цифры - текст по центру
            this.healthText.y = 0;
        }
    }
    
    /**
     * Скрывает цифровое отображение
     */
    hideHealthText() {
        this.healthText.setVisible(false);
    }
    
    /**
     * Определяет цвет полосы здоровья в зависимости от процента
     */
    getHealthColor(healthPercent) {
        if (healthPercent > 0.6)
            return COLORS.GREEN; // Зеленый
        if (healthPercent > 0.3)
            return COLORS.YELLOW; // Желтый
        return COLORS.RED; // Красный
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
        if (options.showBar !== undefined) {
            this.showBar = options.showBar;
        }
        if (options.showDigits !== undefined) {
            this.showDigits = options.showDigits;
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
        this.healthText.destroy();
        super.destroy();
    }
}
