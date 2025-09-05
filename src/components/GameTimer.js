import Phaser from 'phaser';

/**
 * Компонент таймера игры
 * Показывает оставшееся время до конца игры
 */
export class GameTimer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y);
        
        // Настройки по умолчанию
        this.options = {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 },
            showMilliseconds: false,
            warningTime: 60000, // 1 минута до конца
            criticalTime: 30000, // 30 секунд до конца
            ...options
        };
        
        // Состояние
        this.totalTime = 0;
        this.remainingTime = 0;
        this.isRunning = false;
        this.isWarning = false;
        this.isCritical = false;
        
        // Создаем UI элементы
        this.createUI();
        
        // Добавляем в сцену
        scene.add.existing(this);
    }
    
    createUI() {
        // Фон таймера (уменьшенный размер)
        this.background = this.scene.add.rectangle(0, 0, 150, 45, 0x000000, 0.8);
        this.background.setStrokeStyle(2, 0xffffff);
        this.add(this.background);
        
        // Текст таймера
        this.timerText = this.scene.add.text(0, 0, '10:00', {
            fontFamily: this.options.fontFamily,
            fontSize: this.options.fontSize,
            color: this.options.color,
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.timerText);
        
        // Индикатор состояния (цветная полоска)
        this.statusBar = this.scene.add.rectangle(0, 22, 150, 4, 0x00ff00);
        this.add(this.statusBar);
    }
    
    /**
     * Запускает таймер
     * @param {number} totalTime - общее время игры в миллисекундах
     */
    start(totalTime) {
        this.totalTime = totalTime;
        this.remainingTime = totalTime;
        this.isRunning = true;
        this.isWarning = false;
        this.isCritical = false;
        
        this.updateDisplay();
        this.startUpdateLoop();
    }
    
    /**
     * Останавливает таймер
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * Паузит/возобновляет таймер
     */
    togglePause() {
        this.isRunning = !this.isRunning;
    }
    
    /**
     * Запускает цикл обновления
     */
    startUpdateLoop() {
        this.updateTimer = this.scene.time.addEvent({
            delay: 100, // Обновляем каждые 100мс
            callback: this.update,
            callbackScope: this,
            loop: true
        });
    }
    
    /**
     * Обновляет таймер
     */
    update() {
        if (!this.isRunning) return;
        
        this.remainingTime -= 100;
        
        // Проверяем предупреждения
        this.checkWarnings();
        
        // Обновляем отображение
        this.updateDisplay();
        
        // Проверяем окончание времени
        if (this.remainingTime <= 0) {
            this.remainingTime = 0;
            this.isRunning = false;
            this.emit('timeUp');
        }
    }
    
    /**
     * Проверяет предупреждения
     */
    checkWarnings() {
        const wasWarning = this.isWarning;
        const wasCritical = this.isCritical;
        
        this.isWarning = this.remainingTime <= this.options.warningTime;
        this.isCritical = this.remainingTime <= this.options.criticalTime;
        
        // Эмитим события при изменении состояния
        if (!wasWarning && this.isWarning) {
            this.emit('warningTime');
        }
        if (!wasCritical && this.isCritical) {
            this.emit('criticalTime');
        }
    }
    
    /**
     * Обновляет отображение
     */
    updateDisplay() {
        const minutes = Math.floor(this.remainingTime / 60000);
        const seconds = Math.floor((this.remainingTime % 60000) / 1000);
        const milliseconds = Math.floor((this.remainingTime % 1000) / 100);
        
        let timeString;
        if (this.options.showMilliseconds) {
            timeString = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
        } else {
            timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        this.timerText.setText(timeString);
        
        // Обновляем цвета в зависимости от состояния
        if (this.isCritical) {
            this.timerText.setColor('#ff0000');
            this.statusBar.setFillStyle(0xff0000);
            this.background.setStrokeStyle(2, 0xff0000);
        } else if (this.isWarning) {
            this.timerText.setColor('#ffaa00');
            this.statusBar.setFillStyle(0xffaa00);
            this.background.setStrokeStyle(2, 0xffaa00);
        } else {
            this.timerText.setColor(this.options.color);
            this.statusBar.setFillStyle(0x00ff00);
            this.background.setStrokeStyle(2, 0xffffff);
        }
        
        // Обновляем прогресс-бар
        const progress = this.remainingTime / this.totalTime;
        this.statusBar.setScale(progress, 1);
    }
    
    /**
     * Получает оставшееся время в миллисекундах
     */
    getRemainingTime() {
        return this.remainingTime;
    }
    
    /**
     * Получает прогресс игры (0-1)
     */
    getProgress() {
        return 1 - (this.remainingTime / this.totalTime);
    }
    
    /**
     * Получает оставшееся время в секундах
     */
    getRemainingSeconds() {
        return Math.ceil(this.remainingTime / 1000);
    }
    
    /**
     * Уничтожает таймер
     */
    destroy() {
        if (this.updateTimer) {
            this.updateTimer.destroy();
        }
        super.destroy();
    }
}
