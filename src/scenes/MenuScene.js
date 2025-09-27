import { BackgroundUtils } from '../utils/BackgroundUtils.js';
import { DEPTH_CONSTANTS } from '../settings/GameSettings.js';
import { HTMLButton } from '../components/HTMLButton.js';
import { EggDefense } from './EggDefense.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.buttons = [];
    }

    create() {
        const { width, height } = this.scale;
        
        // Определяем размеры для мобильных устройств
        const isMobile = width < 600 || height < 800;
        const isSmallMobile = width < 400 || height < 600;
        
        // Адаптивные размеры шрифтов (уменьшены в 2 раза + еще на 20% для кнопок)
        const titleFontSize = isSmallMobile ? '14px' : (isMobile ? '18px' : '24px');
        const subtitleFontSize = isSmallMobile ? '8px' : (isMobile ? '10px' : '12px');
        const buttonFontSize = isSmallMobile ? '8px' : (isMobile ? '9.6px' : '12.8px');
        const instructionFontSize = isSmallMobile ? '7px' : (isMobile ? '8px' : '9px');
        
        // Адаптивные отступы (уменьшены в 2 раза)
        const buttonPadding = isSmallMobile ? { x: 7.5, y: 5 } : (isMobile ? { x: 9, y: 6 } : { x: 10, y: 7.5 });
        const buttonSpacing = isSmallMobile ? 30 : (isMobile ? 35 : 40);
        
        // Создаем травяной фон
        this.grassBackground = BackgroundUtils.createGrassBackground(this, {
            tileSize: 64, // Размер тайла травы
            animate: false // Без анимации в меню для лучшей производительности
        });
        this.grassBackground.setDepth(DEPTH_CONSTANTS.BACKGROUND);
        
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
        const gameButtonY = subtitleY + (isSmallMobile ? 40 : (isMobile ? 50 : 60));
        const gameButton = new HTMLButton(this, width / 2, gameButtonY, {
            text: 'ИГРАТЬ',
            width: 100,
            height: 22.5,
            fontSize: buttonFontSize,
            fontWeight: 'bold'
        });
        gameButton.setOnClick(() => {
            this.clearButtons();
            
            // Добавляем EggDefense вручную
            this.scene.add('EggDefense', EggDefense);
            this.scene.start('EggDefense');
            
            // Запускаем игру после загрузки сцены
            this.scene.get('EggDefense').events.once('create', () => {
                this.scene.get('EggDefense').startGameFromMenu();
            });
        });
        this.buttons.push(gameButton);
        
        // Кнопка тестирования эффектов
        const testButtonY = gameButtonY + 32.5;
        const testButton = new HTMLButton(this, width / 2, testButtonY, {
            text: 'ТЕСТ ЭФФЕКТОВ',
            width: 100,
            height: 22.5,
            fontSize: buttonFontSize,
            fontWeight: 'bold'
        });
        testButton.setOnClick(() => {
            this.clearButtons();
            this.scene.start('TestEffects');
        });
        this.buttons.push(testButton);
        
        // Кнопка тестирования спрайтов
        const spriteTestButtonY = testButtonY + 32.5;
        const spriteTestButton = new HTMLButton(this, width / 2, spriteTestButtonY, {
            text: 'ТЕСТ СПРАЙТОВ',
            width: 100,
            height: 22.5,
            fontSize: buttonFontSize,
            fontWeight: 'bold'
        });
        spriteTestButton.setOnClick(() => {
            this.clearButtons();
            this.scene.start('SpriteTestScene');
        });
        this.buttons.push(spriteTestButton);
        
        // Кнопка демо компонентов
        const demoButtonY = spriteTestButtonY + 32.5;
        const demoButton = new HTMLButton(this, width / 2, demoButtonY, {
            text: 'ДЕМО КОМПОНЕНТОВ',
            width: 100,
            height: 22.5,
            fontSize: buttonFontSize,
            fontWeight: 'bold'
        });
        demoButton.setOnClick(() => {
            this.clearButtons();
            this.scene.start('DemoComponents');
        });
        this.buttons.push(demoButton);
        
        // Кнопка тестирования жестов
        const gesturesButtonY = demoButtonY + 32.5;
        const gesturesButton = new HTMLButton(this, width / 2, gesturesButtonY, {
            text: 'ТЕСТ ЖЕСТОВ $Q',
            width: 100,
            height: 22.5,
            fontSize: buttonFontSize,
            fontWeight: 'bold'
        });
        gesturesButton.setOnClick(() => {
            this.clearButtons();
            this.scene.start('TestGestures');
        });
        this.buttons.push(gesturesButton);
        
        // Кнопка тестирования поведений
        const behaviorsButtonY = gesturesButtonY + 32.5;
        const behaviorsButton = new HTMLButton(this, width / 2, behaviorsButtonY, {
            text: 'ТЕСТ ПОВЕДЕНИЙ',
            width: 100,
            height: 22.5,
            fontSize: buttonFontSize,
            fontWeight: 'bold'
        });
        behaviorsButton.setOnClick(() => {
            this.clearButtons();
            this.scene.start('TestBehaviors');
        });
        this.buttons.push(behaviorsButton);
        
        // Кнопка перезагрузки ассетов
        const reloadButtonY = behaviorsButtonY + 32.5;
        const reloadButton = new HTMLButton(this, width / 2, reloadButtonY, {
            text: 'ОБНОВИТЬ СПРАЙТЫ',
            width: 100,
            height: 22.5,
            fontSize: buttonFontSize,
            fontWeight: 'bold'
        });
        reloadButton.setOnClick(() => {
            this.clearButtons();
            this.scene.start('PreloadScene');
        });
        this.buttons.push(reloadButton);
        
        // Инструкции по управлению
        const instructionY = reloadButtonY + 32.5;
        this.add.text(width / 2, instructionY, 'Управление:', {
            fontSize: instructionFontSize,
            fill: '#ffffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, instructionY + 15, '• Тап - атака врагов', {
            fontSize: instructionFontSize,
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, instructionY + 27.5, '• Двойной тап - лечение яйца', {
            fontSize: instructionFontSize,
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, instructionY + 40, '• Долгий тап - защита яйца', {
            fontSize: instructionFontSize,
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, instructionY + 52.5, '• Свайп - волна урона', {
            fontSize: instructionFontSize,
            fill: '#bdc3c7',
            align: 'center'
        }).setOrigin(0.5);
        
        // HTMLButton уже имеет встроенные hover эффекты
        
        // HTMLButton уже имеет встроенные эффекты нажатия
    }
    
    update() {
        // Обновляем позиции HTML кнопок
        this.buttons.forEach(button => {
            if (button && button.updatePosition) {
                button.updatePosition();
            }
        });
    }
    
    /**
     * Очистить все кнопки перед переходом к новой сцене
     */
    clearButtons() {
        this.buttons.forEach(button => {
            if (button && button.destroy) {
                button.destroy();
            }
        });
        this.buttons = [];
    }
    
    destroy() {
        // Очищаем все HTML кнопки при уничтожении сцены
        this.buttons.forEach(button => {
            if (button && button.destroy) {
                button.destroy();
            }
        });
        this.buttons = [];
        
        // Вызываем родительский destroy
        super.destroy();
    }
}