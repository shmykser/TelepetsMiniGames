import { Button } from '../components/Button.js';
import { HealthBar } from '../components/HealthBar.js';
import { GameTimer } from '../components/GameTimer.js';
import { DamageIndicator } from '../components/DamageIndicator.js';
import { ResultsTable, createResultsTable } from '../components/ResultsTable.js';
import { UI_THEME } from '../utils/UITheme.js';

/**
 * Сцена демонстрации всех UI компонентов
 * Показывает возможности различных элементов интерфейса
 */
export class DemoComponents extends Phaser.Scene {
    constructor() {
        super({ key: 'DemoComponents' });
        
        this.components = [];
        this.currentDemo = 0;
        this.demos = [
            'results',
            'buttons',
            'health',
            'timer',
            'damage'
        ];
    }

    create() {
        // Создаем фон
        this.createBackground();
        
        // Создаем заголовок
        this.createTitle();
        
        // Создаем навигацию
        this.createNavigation();
        
        // Показываем первый демо
        this.showDemo(this.demos[this.currentDemo]);
    }

    createBackground() {
        // Создаем градиентный фон
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x0b1221, 0x1a1a2e, 0x16213e, 0x0f3460, 1);
        graphics.fillRect(0, 0, this.scale.width, this.scale.height);
        
        // Добавляем статичную траву
        this.add.tileSprite(0, 0, this.scale.width, 200, 'grass')
            .setOrigin(0, 0)
            .setAlpha(0.3);
    }

    createTitle() {
        this.title = this.add.text(
            this.scale.width / 2,
            50,
            '🎨 Демо UI Компонентов',
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.title.setOrigin(0.5, 0.5);
    }

    createNavigation() {
        const navY = this.scale.height - 80;
        const navWidth = this.scale.width - 100;
        
        // Фон навигации
        const navBg = this.add.graphics();
        navBg.fillStyle(0x000000, 0.7);
        navBg.fillRoundedRect(50, navY - 30, navWidth, 60, 10);
        navBg.lineStyle(2, 0xffffff);
        navBg.strokeRoundedRect(50, navY - 30, navWidth, 60, 10);
        
        // Кнопка "Назад"
        this.backButton = new Button(this, 120, navY, {
            width: 100,
            height: 40,
            text: '◀ Назад',
            backgroundColor: 0x4a4a6a,
            textColor: '#ffffff',
            fontSize: '16px'
        });
        this.backButton.onButtonClick = () => this.previousDemo();
        
        // Информация о текущем демо
        this.demoInfo = this.add.text(
            this.scale.width / 2,
            navY,
            this.getDemoTitle(this.demos[this.currentDemo]),
            {
                fontSize: '18px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                align: 'center'
            }
        );
        this.demoInfo.setOrigin(0.5, 0.5);
        
        // Кнопка "Вперед"
        this.nextButton = new Button(this, this.scale.width - 120, navY, {
            width: 100,
            height: 40,
            text: 'Вперед ▶',
            backgroundColor: 0x4a4a6a,
            textColor: '#ffffff',
            fontSize: '16px'
        });
        this.nextButton.onButtonClick = () => this.nextDemo();
        
        // Кнопка "В меню"
        this.menuButton = new Button(this, this.scale.width / 2, navY + 60, {
            width: 150,
            height: 40,
            text: '🏠 В меню',
            backgroundColor: 0x2d5a27,
            textColor: '#ffffff',
            fontSize: '16px'
        });
        this.menuButton.onButtonClick = () => this.scene.start('MenuScene');
    }

    getDemoTitle(demoType) {
        const titles = {
            'results': '📊 Таблица результатов',
            'buttons': '🔘 Кнопки',
            'health': '❤️ Полоска здоровья',
            'timer': '⏱️ Таймер',
            'damage': '💥 Индикатор урона'
        };
        return titles[demoType] || demoType;
    }

    showDemo(demoType) {
        // Очищаем предыдущие компоненты
        this.clearComponents();
        
        // Обновляем информацию о демо
        this.demoInfo.setText(this.getDemoTitle(demoType));
        
        // Показываем соответствующий демо
        switch (demoType) {
            case 'results':
                this.showResultsDemo();
                break;
            case 'buttons':
                this.showButtonsDemo();
                break;
            case 'health':
                this.showHealthDemo();
                break;
            case 'timer':
                this.showTimerDemo();
                break;
            case 'damage':
                this.showDamageDemo();
                break;
        }
    }

    showResultsDemo() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        
        // Отладочная информация
        console.log('Creating results demo at:', centerX, centerY);
        
        // Простой тест - создаем простую таблицу
        const simpleData = {
            'Тест': 'Значение',
            'Время': '3:25'
        };
        
        this.resultsTable1 = new ResultsTable(this, centerX, centerY, {
            title: 'Тест',
            data: simpleData,
            width: 300,
            height: 150,
            backgroundColor: 0x8B0000,
            backgroundAlpha: 0.9,
            borderColor: 0xFF6B6B,
            titleColor: '#FFB6C1',
            textColor: '#FFE4E1'
        });
        
        console.log('Created resultsTable1:', this.resultsTable1);
        this.components.push(this.resultsTable1);
        
        // Простой тест - создаем прямоугольник для проверки
        const testRect = this.add.rectangle(centerX, centerY, 200, 100, 0x00ff00);
        testRect.setDepth(200);
        console.log('Created test rectangle at:', centerX, centerY);
        this.components.push(testRect);
        
        // Простой тест - создаем текст для проверки
        const testText = this.add.text(centerX, centerY + 150, 'Тест текста', {
            fontSize: '24px',
            fill: '#ffffff'
        });
        testText.setOrigin(0.5, 0.5);
        testText.setDepth(200);
        console.log('Created test text at:', centerX, centerY + 150);
        this.components.push(testText);
    }

    showButtonsDemo() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        
        // Различные стили кнопок
        const buttonStyles = [
            {
                text: 'Основная кнопка',
                backgroundColor: 0x4CAF50,
                textColor: '#ffffff',
                y: centerY - 100
            },
            {
                text: 'Предупреждение',
                backgroundColor: 0xFF9800,
                textColor: '#ffffff',
                y: centerY - 50
            },
            {
                text: 'Опасность',
                backgroundColor: 0xF44336,
                textColor: '#ffffff',
                y: centerY
            },
            {
                text: 'Информация',
                backgroundColor: 0x2196F3,
                textColor: '#ffffff',
                y: centerY + 50
            },
            {
                text: 'Вторичная',
                backgroundColor: 0x9E9E9E,
                textColor: '#ffffff',
                y: centerY + 100
            }
        ];
        
        buttonStyles.forEach((style, index) => {
            const button = new Button(this, centerX, style.y, {
                width: 200,
                height: 45,
                text: style.text,
                backgroundColor: style.backgroundColor,
                textColor: style.textColor,
                fontSize: '16px',
                borderRadius: 8
            });
            
            button.onButtonClick = () => {
                this.showButtonFeedback(button, style.text);
            };
            
            this.components.push(button);
            
            // Анимация появления
            button.setAlpha(0);
            button.setScale(0.8);
            this.tweens.add({
                targets: button,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 300,
                delay: index * 100,
                ease: 'Back.easeOut'
            });
        });
    }

    showButtonFeedback(button, text) {
        // Анимация нажатия
        this.tweens.add({
            targets: button,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 100,
            yoyo: true,
            ease: 'Power2.easeInOut'
        });
        
        // Показываем сообщение
        const feedback = this.add.text(
            button.x,
            button.y - 60,
            `Нажата: ${text}`,
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        feedback.setOrigin(0.5, 0.5);
        
        this.tweens.add({
            targets: feedback,
            alpha: 0,
            y: feedback.y - 30,
            duration: 1000,
            ease: 'Power2.easeOut',
            onComplete: () => feedback.destroy()
        });
    }

    showHealthDemo() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        
        // Полоска здоровья с разными уровнями
        const healthLevels = [
            { health: 100, label: 'Полное здоровье', color: 0x00FF00 },
            { health: 75, label: 'Хорошее здоровье', color: 0x80FF00 },
            { health: 50, label: 'Среднее здоровье', color: 0xFFFF00 },
            { health: 25, label: 'Низкое здоровье', color: 0xFF8000 },
            { health: 10, label: 'Критическое здоровье', color: 0xFF0000 }
        ];
        
        healthLevels.forEach((level, index) => {
            const y = centerY - 120 + (index * 60);
            
            // Подпись
            const label = this.add.text(
                centerX - 150,
                y,
                level.label,
                {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    fill: '#ffffff',
                    align: 'left'
                }
            );
            label.setOrigin(0, 0.5);
            this.components.push(label);
            
        // Полоска здоровья
        const mockTarget = { health: level.health, maxHealth: 100 };
        const healthBar = new HealthBar(this, mockTarget, {
            barWidth: 200,
            barHeight: 20,
            offsetX: centerX + 50 - this.scale.width / 2,
            offsetY: y - this.scale.height / 2,
            backgroundColor: 0x333333,
            healthColor: level.color,
            borderColor: 0xffffff,
            borderWidth: 1,
            showText: true
        });
            
            this.components.push(healthBar);
            
            // Анимация появления
            healthBar.setAlpha(0);
            this.tweens.add({
                targets: healthBar,
                alpha: 1,
                duration: 500,
                delay: index * 200,
                ease: 'Power2.easeOut'
            });
        });
    }

    showTimerDemo() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        
        // Таймер обратного отсчета
        this.gameTimer = new GameTimer(this, centerX, centerY - 50, {
            timeLimit: 30,
            backgroundColor: 0x1a1a2e,
            color: '#ffffff',
            fontSize: '24px',
            borderColor: 0x4a4a6a,
            borderWidth: 2,
            showProgress: true
        });
        
        this.components.push(this.gameTimer);
        
        // Кнопки управления
        const startButton = new Button(this, centerX - 120, centerY + 50, {
            width: 100,
            height: 40,
            text: 'Старт',
            backgroundColor: 0x4CAF50,
            textColor: '#ffffff'
        });
        startButton.onButtonClick = () => {
            this.gameTimer.start(30);
        };
        
        const pauseButton = new Button(this, centerX, centerY + 50, {
            width: 100,
            height: 40,
            text: 'Стоп',
            backgroundColor: 0xFF9800,
            textColor: '#ffffff'
        });
        pauseButton.onButtonClick = () => {
            this.gameTimer.stop();
        };
        
        const resetButton = new Button(this, centerX + 120, centerY + 50, {
            width: 100,
            height: 40,
            text: 'Перезапуск',
            backgroundColor: 0xF44336,
            textColor: '#ffffff'
        });
        resetButton.onButtonClick = () => {
            this.gameTimer.start(30);
        };
        
        this.components.push(startButton, pauseButton, resetButton);
        
        // Анимация появления
        this.components.forEach((component, index) => {
            component.setAlpha(0);
            component.setScale(0.8);
            this.tweens.add({
                targets: component,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 400,
                delay: index * 150,
                ease: 'Back.easeOut'
            });
        });
    }

    showDamageDemo() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        
        // Индикатор урона
        this.damageIndicator = new DamageIndicator(this, centerX, centerY, 0);
        
        // Кнопки для демонстрации
        const damageButton = new Button(this, centerX - 150, centerY + 100, {
            width: 120,
            height: 40,
            text: 'Урон -50',
            backgroundColor: 0xF44336,
            textColor: '#ffffff'
        });
        damageButton.onButtonClick = () => {
            DamageIndicator.showDamage(this, { x: centerX, y: centerY - 100 }, -50);
        };
        
        const healButton = new Button(this, centerX, centerY + 100, {
            width: 120,
            height: 40,
            text: 'Лечение +30',
            backgroundColor: 0x4CAF50,
            textColor: '#ffffff'
        });
        healButton.onButtonClick = () => {
            DamageIndicator.showDamage(this, { x: centerX, y: centerY - 100 }, 30);
        };
        
        const critButton = new Button(this, centerX + 150, centerY + 100, {
            width: 120,
            height: 40,
            text: 'Крит -100',
            backgroundColor: 0x9C27B0,
            textColor: '#ffffff'
        });
        critButton.onButtonClick = () => {
            DamageIndicator.showDamage(this, { x: centerX, y: centerY - 100 }, -100);
        };
        
        this.components.push(damageButton, healButton, critButton);
        
        // Анимация появления
        this.components.forEach((component, index) => {
            component.setAlpha(0);
            component.setScale(0.8);
            this.tweens.add({
                targets: component,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 400,
                delay: index * 150,
                ease: 'Back.easeOut'
            });
        });
    }

    clearComponents() {
        this.components.forEach(component => {
            if (component && component.destroy) {
                component.destroy();
            }
        });
        this.components = [];
    }

    nextDemo() {
        this.currentDemo = (this.currentDemo + 1) % this.demos.length;
        this.showDemo(this.demos[this.currentDemo]);
    }

    previousDemo() {
        this.currentDemo = (this.currentDemo - 1 + this.demos.length) % this.demos.length;
        this.showDemo(this.demos[this.currentDemo]);
    }

    update() {
        // Обновляем компоненты
        this.components.forEach(component => {
            if (component && component.update) {
                component.update();
            }
        });
    }
}
