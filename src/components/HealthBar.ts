import Phaser from 'phaser';

/**
 * Интерфейс для объектов с здоровьем
 */
export interface HealthObject {
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  objectWidth?: number;
  objectHeight?: number;
  objectScaleX?: number;
  objectScaleY?: number;
}

/**
 * Универсальный компонент полосы здоровья
 * Может использоваться для врагов, яйца, защиты и любых других объектов
 */
export class HealthBar extends Phaser.GameObjects.Container {
  private backgroundBar: Phaser.GameObjects.Graphics;
  private healthBar: Phaser.GameObjects.Graphics;
  private borderBar: Phaser.GameObjects.Graphics;
  private targetObject: HealthObject;
  
  // Настройки полосы здоровья
  private barWidth: number;
  private barHeight: number;
  private offsetY: number;
  private showWhenFull: boolean;
  private showWhenEmpty: boolean;

  constructor(
    scene: Phaser.Scene,
    targetObject: HealthObject,
    options: {
      barWidth?: number;
      barHeight?: number;
      offsetY?: number;
      showWhenFull?: boolean;
      showWhenEmpty?: boolean;
      colors?: {
        background?: number;
        health?: number;
        border?: number;
      };
    } = {}
  ) {
    super(scene, 0, 0);
    
    this.targetObject = targetObject;
    
    // Настройки по умолчанию
    this.barWidth = options.barWidth || this.calculateBarWidth();
    this.barHeight = options.barHeight || 6;
    this.offsetY = options.offsetY || -40;
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
  private calculateBarWidth(): number {
    const objectWidth = this.targetObject.objectWidth || 64;
    const objectScale = this.targetObject.objectScaleX || 1;
    return Math.max(40, objectWidth * objectScale * 0.8);
  }

  /**
   * Устанавливает цвета полосы здоровья
   */
  setColors(colors: { background: number; health: number; border: number }): void {
    this.backgroundBar.clear();
    this.healthBar.clear();
    this.borderBar.clear();
    
    // Фон
    this.backgroundBar.fillStyle(colors.background, 0.8);
    this.backgroundBar.fillRect(0, 0, this.barWidth, this.barHeight);
    
    // Граница
    this.borderBar.lineStyle(1, colors.border, 1);
    this.borderBar.strokeRect(0, 0, this.barWidth, this.barHeight);
  }

  /**
   * Обновляет позицию полосы здоровья относительно объекта
   */
  updatePosition(): void {
    this.x = this.targetObject.x;
    this.y = this.targetObject.y + this.offsetY;
  }

  /**
   * Обновляет отображение полосы здоровья
   */
  updateHealth(): void {
    const healthPercent = this.targetObject.health / this.targetObject.maxHealth;
    
    // Определяем, нужно ли показывать полосу
    const shouldShow = this.shouldShowBar(healthPercent);
    this.setVisible(shouldShow);
    
    if (!shouldShow) return;
    
    // Обновляем позицию
    this.updatePosition();
    
    // Очищаем полосу здоровья
    this.healthBar.clear();
    
    // Вычисляем ширину полосы здоровья
    const healthWidth = this.barWidth * healthPercent;
    
    // Определяем цвет в зависимости от процента здоровья
    const healthColor = this.getHealthColor(healthPercent);
    
    // Рисуем полосу здоровья
    this.healthBar.fillStyle(healthColor, 0.9);
    this.healthBar.fillRect(0, 0, healthWidth, this.barHeight);
  }

  /**
   * Определяет, нужно ли показывать полосу здоровья
   */
  private shouldShowBar(healthPercent: number): boolean {
    if (healthPercent <= 0) return this.showWhenEmpty;
    if (healthPercent >= 1) return this.showWhenFull;
    return true; // Показываем, если здоровье не полное и не пустое
  }

  /**
   * Определяет цвет полосы здоровья в зависимости от процента
   */
  private getHealthColor(healthPercent: number): number {
    if (healthPercent > 0.6) return 0x00ff00; // Зеленый
    if (healthPercent > 0.3) return 0xffff00; // Желтый
    return 0xff0000; // Красный
  }

  /**
   * Устанавливает новый целевой объект
   */
  setTargetObject(targetObject: HealthObject): void {
    this.targetObject = targetObject;
    this.barWidth = this.calculateBarWidth();
    this.updateHealth();
  }

  /**
   * Обновляет настройки отображения
   */
  updateSettings(options: {
    showWhenFull?: boolean;
    showWhenEmpty?: boolean;
    offsetY?: number;
  }): void {
    if (options.showWhenFull !== undefined) {
      this.showWhenFull = options.showWhenFull;
    }
    if (options.showWhenEmpty !== undefined) {
      this.showWhenEmpty = options.showWhenEmpty;
    }
    if (options.offsetY !== undefined) {
      this.offsetY = options.offsetY;
    }
    this.updateHealth();
  }

  /**
   * Уничтожение компонента
   */
  override destroy(): void {
    this.backgroundBar.destroy();
    this.healthBar.destroy();
    this.borderBar.destroy();
    super.destroy();
  }
}
