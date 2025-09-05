import Phaser from 'phaser';

/**
 * Компонент индикатора волны
 * Показывает текущую волну, прогресс и информацию о врагах
 */
export class WaveIndicator extends Phaser.GameObjects.Container {
    constructor(scene, x, y, options = {}) {
        super(scene, x, y);
        
        // Настройки по умолчанию
        this.options = {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 },
            showEnemyCount: true,
            showWaveProgress: true,
            ...options
        };
        
        // Состояние
        this.currentWave = 1;
        this.maxWaves = 10;
        this.enemyCount = 0;
        this.waveProgress = 0;
        this.waveName = '';
        
        // Создаем UI элементы
        this.createUI();
        
        // Добавляем в сцену
        scene.add.existing(this);
    }
    
    createUI() {
        // Фон индикатора (уменьшенный размер)
        this.background = this.scene.add.rectangle(0, 0, 250, 70, 0x000000, 0.8);
        this.background.setStrokeStyle(2, 0xffffff);
        this.add(this.background);
        
        // Название волны
        this.waveTitle = this.scene.add.text(0, -20, 'Волна 1', {
            fontFamily: this.options.fontFamily,
            fontSize: this.options.fontSize,
            color: this.options.color,
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.waveTitle);
        
        // Прогресс волны
        this.waveProgressBar = this.scene.add.rectangle(0, 0, 200, 8, 0x333333);
        this.waveProgressFill = this.scene.add.rectangle(-100, 0, 0, 8, 0x00ff00);
        this.add(this.waveProgressBar);
        this.add(this.waveProgressFill);
        
        // Счетчик врагов
        this.enemyCountText = this.scene.add.text(0, 20, 'Врагов: 0', {
            fontFamily: this.options.fontFamily,
            fontSize: '14px',
            color: this.options.color,
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.enemyCountText);
        
        // Индикатор сложности (маленький кружок)
        this.difficultyIndicator = this.scene.add.circle(0, 30, 6, 0x00ff00);
        this.difficultyIndicator.setStrokeStyle(1, 0xffffff);
        this.add(this.difficultyIndicator);
    }
    
    /**
     * Обновляет информацию о волне
     * @param {Object} waveData - данные о волне
     */
    updateWave(waveData) {
        this.currentWave = waveData.waveNumber || 1;
        this.waveName = waveData.waveName || `Волна ${this.currentWave}`;
        this.maxWaves = waveData.maxWaves || 10;
        
        this.waveTitle.setText(this.waveName);
        this.updateDifficultyIndicator();
    }
    
    /**
     * Обновляет прогресс волны
     * @param {number} progress - прогресс от 0 до 1
     */
    updateProgress(progress) {
        this.waveProgress = Math.max(0, Math.min(1, progress));
        
        // Обновляем прогресс-бар
        const barWidth = 200 * this.waveProgress;
        this.waveProgressFill.setSize(barWidth, 8);
        this.waveProgressFill.setPosition(-100 + barWidth / 2, 0);
        
        // Меняем цвет в зависимости от прогресса
        if (this.waveProgress < 0.3) {
            this.waveProgressFill.setFillStyle(0x00ff00); // Зеленый
        } else if (this.waveProgress < 0.7) {
            this.waveProgressFill.setFillStyle(0xffaa00); // Оранжевый
        } else {
            this.waveProgressFill.setFillStyle(0xff0000); // Красный
        }
    }
    
    /**
     * Обновляет счетчик врагов
     * @param {number} count - количество врагов на экране
     */
    updateEnemyCount(count) {
        this.enemyCount = count;
        this.enemyCountText.setText(`Врагов: ${count}`);
        
        // Меняем цвет в зависимости от количества врагов
        if (count < 5) {
            this.enemyCountText.setColor('#00ff00'); // Зеленый
        } else if (count < 15) {
            this.enemyCountText.setColor('#ffaa00'); // Оранжевый
        } else {
            this.enemyCountText.setColor('#ff0000'); // Красный
        }
    }
    
    /**
     * Обновляет индикатор сложности
     */
    updateDifficultyIndicator() {
        const difficulty = this.currentWave / this.maxWaves;
        
        if (difficulty < 0.3) {
            this.difficultyIndicator.setFillStyle(0x00ff00); // Зеленый - легко
        } else if (difficulty < 0.6) {
            this.difficultyIndicator.setFillStyle(0xffaa00); // Оранжевый - средне
        } else if (difficulty < 0.8) {
            this.difficultyIndicator.setFillStyle(0xff6600); // Темно-оранжевый - сложно
        } else {
            this.difficultyIndicator.setFillStyle(0xff0000); // Красный - очень сложно
        }
        
        // Добавляем пульсацию для высоких уровней сложности
        if (difficulty > 0.7) {
            this.scene.tweens.add({
                targets: this.difficultyIndicator,
                alpha: 0.5,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    /**
     * Показывает анимацию смены волны
     */
    showWaveTransition(newWaveData) {
        // Анимация исчезновения
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                // Обновляем данные
                this.updateWave(newWaveData);
                
                // Анимация появления
                this.scene.tweens.add({
                    targets: this,
                    alpha: 1,
                    duration: 200
                });
            }
        });
    }
    
    /**
     * Показывает предупреждение о высокой сложности
     */
    showDifficultyWarning() {
        // Эффект мерцания
        this.scene.tweens.add({
            targets: this.background,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.background.setAlpha(0.8);
            }
        });
        
        // Эффект тряски
        this.scene.tweens.add({
            targets: this,
            x: this.x + Phaser.Math.Between(-5, 5),
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.setPosition(this.x, this.y);
            }
        });
    }
    
    /**
     * Получает текущую волну
     */
    getCurrentWave() {
        return this.currentWave;
    }
    
    /**
     * Получает прогресс волны
     */
    getProgress() {
        return this.waveProgress;
    }
    
    /**
     * Получает количество врагов
     */
    getEnemyCount() {
        return this.enemyCount;
    }
    
    /**
     * Уничтожает индикатор
     */
    destroy() {
        super.destroy();
    }
}
