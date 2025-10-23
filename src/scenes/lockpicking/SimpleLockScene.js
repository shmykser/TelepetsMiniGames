/**
 * Сцена взлома простого замка
 * Мини-игра: подбор пинов - нажать кнопку когда индикатор в зеленой зоне
 */

import { BaseLockScene } from './BaseLockScene.js';
// HTMLButton удален - используем нативные Phaser компоненты

export class SimpleLockScene extends BaseLockScene {
    constructor() {
        super('SimpleLockScene');
        
        // Элементы игры
        this.pins = [];
        this.currentPin = 0;
        this.indicator = null;
        this.pickButton = null;
    }
    
    /**
     * Создание сцены
     */
    create() {
        super.create();
        
        // Создаем базовый UI
        this.createBaseUI('🔓 ВЗЛОМ ПРОСТОГО ЗАМКА');
        
        // Инструкция
        const { width } = this.scale;
        this.add.text(width / 2, 180, 'Нажми ВЗЛОМАТЬ когда индикатор в зеленой зоне!', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
        
        // Создаем пины
        this.createPins();
        
        // Создаем индикатор
        this.createIndicator();
        
        // Создаем кнопку взлома
        this.createPickButton();
        
        // Игра активна
        this.isGameActive = true;
        
        console.log('🔓 [SimpleLockScene] Игра начата');
    }
    
    /**
     * Создание пинов
     */
    createPins() {
        const { width, height } = this.scale;
        const numPins = this.config.pins || 1;
        const pinWidth = 50;
        const spacing = 70;
        const startX = width / 2 - (numPins - 1) * spacing / 2;
        const y = height / 2 - 20;
        
        for (let i = 0; i < numPins; i++) {
            const x = startX + i * spacing;
            
            // Основа пина
            const pinBase = this.add.rectangle(x, y, pinWidth, 80, 0x333333).setDepth(5);
            
            // Зеленая зона (успех)
            const tolerance = this.config.tolerance || 20;
            const greenZone = this.add.rectangle(x, y, pinWidth - 8, tolerance, 0x00ff00).setDepth(6);
            
            // Текст пина
            const pinText = this.add.text(x, y + 50, `Пин ${i + 1}`, {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(10);
            
            // Статус пина
            const status = this.add.text(x, y + 65, '⚪', {
                fontSize: '20px'
            }).setOrigin(0.5).setDepth(10);
            
            this.pins.push({
                base: pinBase,
                greenZone: greenZone,
                text: pinText,
                status: status,
                unlocked: false,
                x: x,
                y: y,
                tolerance: tolerance
            });
        }
        
        this.currentPin = 0;
        this.highlightCurrentPin();
    }
    
    /**
     * Подсветка текущего пина
     */
    highlightCurrentPin() {
        // Снимаем подсветку со всех
        this.pins.forEach((pin, index) => {
            pin.base.setFillStyle(0x333333);
            
            if (index === this.currentPin) {
                // Подсвечиваем текущий
                pin.base.setFillStyle(0x555555);
                
                // Добавляем желтую рамку
                if (pin.highlight) {
                    pin.highlight.destroy();
                }
                pin.highlight = this.add.rectangle(pin.x, pin.y, 54, 84, 0xffff00, 0).setDepth(4);
                pin.highlight.setStrokeStyle(2, 0xffff00);
            } else if (pin.highlight) {
                pin.highlight.destroy();
                pin.highlight = null;
            }
        });
    }
    
    /**
     * Создание индикатора
     */
    createIndicator() {
        if (!this.pins || !this.pins[this.currentPin]) return;
        
        const pin = this.pins[this.currentPin];
        
        this.indicator = this.add.rectangle(
            pin.x,
            pin.y + 40,
            40,
            8,
            0xff0000
        ).setDepth(7);
        
        // Анимация движения индикатора
        const speed = this.config.indicatorSpeed || 2;
        const duration = 1200 / speed;
        
        this.tweens.add({
            targets: this.indicator,
            y: pin.y - 40,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });
    }
    
    /**
     * Создание кнопки взлома
     */
    createPickButton() {
        const { width, height } = this.scale;
        
        this.pickButton = this.createButton(width / 2, height - 120, 250, 60, '🔓 ВЗЛОМАТЬ', {
            fontSize: '18px',
            backgroundColor: 0x4CAF50,
            borderColor: 0x45a049,
            hoverColor: 0x45a049
        });
        
        this.pickButton.container.on('pointerdown', () => this.tryPick());
        
        // МОБИЛЬНАЯ ПОДДЕРЖКА: тап по области игры (не по кнопкам)
        const gameArea = this.add.rectangle(width / 2, height / 2 - 80, width, 400, 0x000000, 0.01);
        gameArea.setInteractive();
        gameArea.on('pointerdown', (pointer) => {
            // Проверяем что тап не по кнопке
            if (pointer.y < height - 150) {
                this.tryPick();
            }
        });
        
        // Обработка клавиши пробела (для ПК)
        this.input.keyboard.on('keydown-SPACE', () => {
            this.tryPick();
        });
        
        // Инструкция для мобильных
        this.add.text(width / 2, height - 180, 'Тапайте по экрану или кнопке', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
    }
    
    /**
     * Попытка взлома
     */
    tryPick() {
        if (!this.isGameActive) return;
        if (!this.pins || !this.pins[this.currentPin]) return;
        
        const pin = this.pins[this.currentPin];
        
        // Проверяем попадание в зеленую зону
        const indicatorY = this.indicator.y;
        const greenZoneTop = pin.greenZone.y - pin.tolerance / 2;
        const greenZoneBottom = pin.greenZone.y + pin.tolerance / 2;
        
        const isSuccess = indicatorY >= greenZoneTop && indicatorY <= greenZoneBottom;
        
        console.log(`🔓 [SimpleLockScene] Попытка взлома пина ${this.currentPin + 1}:`, {
            indicatorY,
            greenZoneTop,
            greenZoneBottom,
            isSuccess
        });
        
        if (isSuccess) {
            // Успех!
            pin.unlocked = true;
            
            // Визуальный эффект успеха (проверяем что объект существует)
            if (pin.status && pin.status.scene) {
                pin.status.setText('✅');
                pin.status.setColor('#00ff00');
            }
            
            // Переходим к следующему пину
            this.currentPin++;
            
            if (this.currentPin >= this.pins.length) {
                // Все пины взломаны!
                this.onSuccess();
            } else {
                // Переключаемся на следующий пин
                this.highlightCurrentPin();
                this.updateIndicator();
            }
        } else {
            // Провал!
            this.incrementAttempts();
            
            // Визуальный эффект провала
            if (pin.status && pin.status.scene) {
                pin.status.setText('❌');
                pin.status.setColor('#ff0000');
            }
            
            this.time.delayedCall(500, () => {
                if (this.isGameActive && pin.status && pin.status.scene) {
                    pin.status.setText('⚪');
                    pin.status.setColor('#ffffff');
                }
            });
        }
    }
    
    /**
     * Обновление индикатора для нового пина
     */
    updateIndicator() {
        if (!this.indicator) return;
        if (!this.pins || !this.pins[this.currentPin]) return;
        
        const pin = this.pins[this.currentPin];
        
        // Останавливаем текущую анимацию
        this.tweens.killTweensOf(this.indicator);
        
        // Перемещаем индикатор к новому пину
        this.indicator.setPosition(pin.x, pin.y + 40);
        
        // Запускаем новую анимацию
        const speed = this.config.indicatorSpeed || 2;
        const duration = 1200 / speed;
        
        this.tweens.add({
            targets: this.indicator,
            y: pin.y - 40,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });
    }
    
    /**
     * Очистка
     */
    shutdown() {
        super.shutdown();
        
        // Останавливаем анимации
        if (this.indicator) {
            this.tweens.killTweensOf(this.indicator);
        }
        
        // Удаляем HTML кнопку
        if (this.pickButton) {
            this.pickButton.destroy();
            this.pickButton = null;
        }
        
        // Очищаем обработчики клавиш
        if (this.input && this.input.keyboard) {
            this.input.keyboard.off('keydown-SPACE');
        }
    }
}

