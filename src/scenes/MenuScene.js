import { settings } from '../../config/settings.js';
import { BackgroundUtils } from '../utils/BackgroundUtils.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.scale;
        
        // Определяем размеры для мобильных устройств
        const isMobile = width < 600 || height < 800;
        const isSmallMobile = width < 400 || height < 600;
        
        // Адаптивные размеры шрифтов
        const titleFontSize = isSmallMobile ? '28px' : (isMobile ? '36px' : '48px');
        const subtitleFontSize = isSmallMobile ? '16px' : (isMobile ? '20px' : '24px');
        const buttonFontSize = isSmallMobile ? '20px' : (isMobile ? '24px' : '32px');
        const instructionFontSize = isSmallMobile ? '14px' : (isMobile ? '16px' : '18px');
        
        // Адаптивные отступы
        const buttonPadding = isSmallMobile ? { x: 15, y: 10 } : (isMobile ? { x: 18, y: 12 } : { x: 20, y: 15 });
        const buttonSpacing = isSmallMobile ? 60 : (isMobile ? 70 : 80);
        
        // Создаем травяной фон
        this.grassBackground = BackgroundUtils.createGrassBackground(this, {
            tileSize: 64, // Размер тайла травы
            animate: false // Без анимации в меню для лучшей производительности
        });
        this.grassBackground.setDepth(-100);
        
        // Добавляем темный оверлей для лучшей читаемости текста
        this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50).setAlpha(0.3).setDepth(-50);
        
        // Заголовок (адаптивная позиция)
        const titleY = isSmallMobile ? height * 0.25 : (isMobile ? height * 0.28 : height / 3);
        this.add.text(width / 2, titleY, 'Telepets Mini Games', {
            fontSize: titleFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // Подзаголовок (адаптивная позиция)
        const subtitleY = titleY + (isSmallMobile ? 40 : (isMobile ? 50 : 60));
        this.add.text(width / 2, subtitleY, 'Защитите яйцо от врагов!', {
            fontSize: subtitleFontSize,
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);
        
        // Кнопка запуска игры
        const gameButtonY = subtitleY + (isSmallMobile ? 80 : (isMobile ? 100 : 120));
        const gameButton = this.add.rectangle(width / 2, gameButtonY, 250, 60, 0x27ae60)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('EggDefense');
            });
        
        this.add.text(width / 2, gameButtonY, 'ИГРАТЬ', {
            fontSize: buttonFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // Кнопка тестирования эффектов
        const testButtonY = gameButtonY + 80;
        const testButton = this.add.rectangle(width / 2, testButtonY, 250, 60, 0x8e44ad)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('TestEffects');
            });
        
        this.add.text(width / 2, testButtonY, 'ТЕСТ ЭФФЕКТОВ', {
            fontSize: buttonFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // Кнопка тестирования спрайтов
        const spriteTestButtonY = testButtonY + 80;
        const spriteTestButton = this.add.rectangle(width / 2, spriteTestButtonY, 250, 60, 0x16a085)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('SpriteTestScene');
            });
        
        this.add.text(width / 2, spriteTestButtonY, 'ТЕСТ СПРАЙТОВ', {
            fontSize: buttonFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // Кнопка демо компонентов
        const demoButtonY = spriteTestButtonY + 80;
        const demoButton = this.add.rectangle(width / 2, demoButtonY, 250, 60, 0x3498db)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('DemoComponents');
            });
        
        this.add.text(width / 2, demoButtonY, 'ДЕМО КОМПОНЕНТОВ', {
            fontSize: buttonFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // Кнопка тестирования жестов
        const gesturesButtonY = demoButtonY + 80;
        const gesturesButton = this.add.rectangle(width / 2, gesturesButtonY, 250, 60, 0x8e44ad)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('TestGestures');
            });
        
        this.add.text(width / 2, gesturesButtonY, 'ТЕСТ ЖЕСТОВ $Q', {
            fontSize: buttonFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // Кнопка перезагрузки ассетов
        const reloadButtonY = gesturesButtonY + 80;
        const reloadButton = this.add.rectangle(width / 2, reloadButtonY, 250, 60, 0xe67e22)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('PreloadScene');
            });
        
        this.add.text(width / 2, reloadButtonY, 'ОБНОВИТЬ СПРАЙТЫ', {
            fontSize: buttonFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // Инструкции по управлению
        const instructionY = reloadButtonY + 80;
        this.add.text(width / 2, instructionY, 'Управление:', {
            fontSize: instructionFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, instructionY + 30, '• Тап - атака врагов', {
            fontSize: instructionFontSize,
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, instructionY + 55, '• Двойной тап - лечение яйца', {
            fontSize: instructionFontSize,
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, instructionY + 80, '• Долгий тап - защита яйца', {
            fontSize: instructionFontSize,
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, instructionY + 105, '• Свайп - волна урона', {
            fontSize: instructionFontSize,
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);
        
        // Добавляем эффекты наведения (только для десктопа)
        if (!isMobile) {
            gameButton.on('pointerover', () => {
                gameButton.setScale(1.05);
            });
            
            gameButton.on('pointerout', () => {
                gameButton.setScale(1);
            });
            
            testButton.on('pointerover', () => {
                testButton.setScale(1.05);
            });
            
            testButton.on('pointerout', () => {
                testButton.setScale(1);
            });
            
            spriteTestButton.on('pointerover', () => {
                spriteTestButton.setScale(1.05);
            });
            
            spriteTestButton.on('pointerout', () => {
                spriteTestButton.setScale(1);
            });
            
            demoButton.on('pointerover', () => {
                demoButton.setScale(1.05);
            });
            
            demoButton.on('pointerout', () => {
                demoButton.setScale(1);
            });
            
            gesturesButton.on('pointerover', () => {
                gesturesButton.setScale(1.05);
            });
            
            gesturesButton.on('pointerout', () => {
                gesturesButton.setScale(1);
            });
            
            reloadButton.on('pointerover', () => {
                reloadButton.setScale(1.05);
            });
            
            reloadButton.on('pointerout', () => {
                reloadButton.setScale(1);
            });
        }
        
        // Добавляем тактильную обратную связь для мобильных устройств
        if (isMobile) {
            gameButton.on('pointerdown', () => {
                gameButton.setScale(0.95);
                this.time.delayedCall(100, () => {
                    gameButton.setScale(1);
                });
            });
            
            testButton.on('pointerdown', () => {
                testButton.setScale(0.95);
                this.time.delayedCall(100, () => {
                    testButton.setScale(1);
                });
            });
            
            spriteTestButton.on('pointerdown', () => {
                spriteTestButton.setScale(0.95);
                this.time.delayedCall(100, () => {
                    spriteTestButton.setScale(1);
                });
            });
            
            demoButton.on('pointerdown', () => {
                demoButton.setScale(0.95);
                this.time.delayedCall(100, () => {
                    demoButton.setScale(1);
                });
            });
            
            gesturesButton.on('pointerdown', () => {
                gesturesButton.setScale(0.95);
                this.time.delayedCall(100, () => {
                    gesturesButton.setScale(1);
                });
            });
            
            reloadButton.on('pointerdown', () => {
                reloadButton.setScale(0.95);
                this.time.delayedCall(100, () => {
                    reloadButton.setScale(1);
                });
            });
        }
    }
}