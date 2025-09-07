import Phaser from 'phaser';
import { BaseUIComponent } from './BaseUIComponent.js';
import { UIUtils } from '../utils/UIUtils.js';
import { UI_THEME } from '../utils/UITheme.js';
import { AnimationLibrary } from '../animations/AnimationLibrary.js';

/**
 * Компонент индикатора волны
 * Показывает текущую волну, прогресс и информацию о врагах
 */
export class WaveIndicator extends BaseUIComponent {
    constructor(scene, x, y, options = {}) {
        const defaultConfig = {
            fontSize: UI_THEME.fonts.sizes.medium,
            fontFamily: UI_THEME.fonts.family,
            color: UI_THEME.colors.text,
            backgroundColor: UI_THEME.colors.background,
            padding: { x: 12, y: 6 },
            showEnemyCount: true,
            showWaveProgress: true,
            ...options
        };
        
        super(scene, x, y, defaultConfig);
        
        // Состояние
        this.currentWave = 1;
        this.maxWaves = 10;
        this.enemyCount = 0;
        this.waveProgress = 0;
        this.waveName = '';
        
        // Создаем UI элементы
        this.createUI();
        
        // Создаем контейнер с автоматическим добавлением в сцену
        this.createContainer();
    }
    
    createUI() {
        // Создаем индикатор через UIUtils
        const indicatorElements = UIUtils.createIndicator(
            this.scene, 
            0, 
            0, 
            'Волна 1', 
            {
                width: UI_THEME.sizes.indicator.width,
                height: UI_THEME.sizes.indicator.height,
                backgroundColor: this.backgroundColor,
                textColor: this.color,
                fontSize: this.fontSize,
                fontFamily: this.fontFamily,
                strokeColor: UI_THEME.colors.border,
                strokeWidth: UI_THEME.spacing.border.width
            }
        );
        
        this.background = indicatorElements.background;
        this.waveTitle = indicatorElements.text;
        this.waveTitle.setPosition(0, -20);
        
        this.add([this.background, this.waveTitle]);
        
        // Прогресс волны через UIUtils
        this.waveProgressBar = UIUtils.createBackground(
            this.scene, 
            200, 
            8, 
            0x333333, 
            1, 
            null, 
            0
        );
        this.waveProgressFill = UIUtils.createProgressBar(
            this.scene, 
            0, 
            8, 
            0, 
            UI_THEME.colors.success
        );
        this.waveProgressFill.setPosition(-100, 0);
        
        this.add([this.waveProgressBar, this.waveProgressFill]);
        
        // Счетчик врагов через UIUtils
        this.enemyCountText = UIUtils.createText(
            this.scene, 
            'Врагов: 0', 
            {
                fontFamily: this.fontFamily,
                fontSize: UI_THEME.fonts.sizes.small,
                color: this.color
            }
        );
        this.enemyCountText.setPosition(0, 20);
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
        
        // Добавляем пульсацию для высоких уровней сложности через AnimationLibrary
        if (difficulty > 0.7) {
            AnimationLibrary.createFlickerEffect(this.scene, this.difficultyIndicator, {
                alpha: { to: 0.5 },
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
        // Анимация исчезновения через AnimationLibrary
        AnimationLibrary.createFadeOutAnimation(this.scene, this, {
            duration: 200,
            onComplete: () => {
                // Обновляем данные
                this.updateWave(newWaveData);
                
                // Анимация появления через AnimationLibrary
                AnimationLibrary.createFadeInAnimation(this.scene, this, {
                    duration: 200
                });
            }
        });
    }
    
    /**
     * Показывает предупреждение о высокой сложности
     */
    showDifficultyWarning() {
        // Эффект мерцания через AnimationLibrary
        AnimationLibrary.createFlickerEffect(this.scene, this.background, {
            alpha: { to: 0.3 },
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => this.background.setAlpha(0.8)
        });
        
        // Эффект тряски через AnimationLibrary
        AnimationLibrary.createShakeEffect(this.scene, this, {
            intensity: 5,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => this.setPosition(this.x, this.y)
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
