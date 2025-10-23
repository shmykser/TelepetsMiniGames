/**
 * Тестовая сцена для проверки всех типов замков
 * Использует только нативные Phaser компоненты (без HTML)
 */

import { LOCK_TYPES, LOCK_LEVELS, LOCK_CONFIGS } from '../types/lockTypes.js';

export class TestLocks extends Phaser.Scene {
    constructor() {
        super({ key: 'TestLocks' });
        
        this.selectedType = LOCK_TYPES.SIMPLE;
        this.selectedLevel = LOCK_LEVELS.EASY;
        this.typeButtons = [];
        this.levelButtons = [];
    }

    create() {
        const { width, height } = this.scale;

        // Заголовок
        this.add.text(width / 2, 60, '🔒 ТЕСТ ЗАМКОВ', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Создаем тестового питомца (бесконечные отмычки)
        this.createTestPet();

        // UI выбора
        this.createTypeSelector();
        this.createLevelSelector();
        this.createActionButtons();
    }

    /**
     * Создает тестового питомца с бесконечными отмычками
     */
    createTestPet() {
        this.testPet = {
            inventory: {
                items: {
                    lockpicks: Infinity // Бесконечные отмычки для тестирования
                },
                get(key) {
                    return this.items[key];
                },
                set(key, value) {
                    // Для тестирования не изменяем количество
                    console.log(`🎒 [TestPet] Попытка установить ${key}: ${value} (игнорируется)`);
                }
            },
            scene: this
        };
    }

    /**
     * Создает кнопку на основе Phaser Graphics и Text
     */
    createButton(x, y, width, height, text, style = {}) {
        // Фон кнопки - Graphics с абсолютными координатами
        const bg = this.add.graphics();
        bg.fillStyle(style.backgroundColor || 0x333333, 1);
        bg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
        bg.lineStyle(style.borderWidth || 2, style.borderColor || 0x666666, 1);
        bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 8);
        
        // Текст кнопки
        const label = this.add.text(x, y, text, {
            fontSize: style.fontSize || '16px',
            fontFamily: 'Arial',
            color: style.color || '#ffffff',
            fontStyle: style.fontWeight || 'normal'
        }).setOrigin(0.5);
        
        // Делаем Graphics интерактивным напрямую
        bg.setInteractive(
            new Phaser.Geom.Rectangle(x - width/2, y - height/2, width, height), 
            Phaser.Geom.Rectangle.Contains
        );
        
        // Эффекты наведения
        bg.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(style.hoverColor || 0x555555, 1);
            bg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
            bg.lineStyle(style.borderWidth || 2, style.borderColor || 0x666666, 1);
            bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 8);
        });
        
        bg.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(style.backgroundColor || 0x333333, 1);
            bg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
            bg.lineStyle(style.borderWidth || 2, style.borderColor || 0x666666, 1);
            bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 8);
        });
        
        // Возвращаем объект с bg как container для совместимости
        return { container: bg, bg, label, x, y, width, height };
    }

    /**
     * Обновляет стиль кнопки
     */
    updateButtonStyle(button, style) {
        const { bg, x, y, width, height } = button;
        
        bg.clear();
        bg.fillStyle(style.backgroundColor || 0x333333, 1);
        bg.fillRoundedRect(x - width/2, y - height/2, width, height, 8);
        bg.lineStyle(style.borderWidth || 2, style.borderColor || 0x666666, 1);
        bg.strokeRoundedRect(x - width/2, y - height/2, width, height, 8);
    }

    /**
     * Выбор типа замка
     */
    createTypeSelector() {
        const { width } = this.scale;
        const y = 150;

        this.add.text(width / 2, y, 'ТИП ЗАМКА:', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffff00'
        }).setOrigin(0.5);

        const types = [
            { type: LOCK_TYPES.SIMPLE, label: '🔓 Простой' },
            { type: LOCK_TYPES.MAZE, label: '🧩 Лабиринт' },
            { type: LOCK_TYPES.PATTERN, label: '🎯 Паттерн' }
        ];

        types.forEach((item, index) => {
            const button = this.createButton(
                width / 2 - 110 + index * 110, 
                y + 50, 
                100, 
                60, 
                item.label,
                {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: 0x333333,
                    borderColor: 0x666666,
                    hoverColor: 0x555555
                }
            );
            
            button.container.on('pointerdown', () => {
                this.selectedType = item.type;
                this.updateButtons();
            });

            this.typeButtons.push({ button, type: item.type });
        });

        this.updateButtons();
    }

    /**
     * Выбор уровня сложности
     */
    createLevelSelector() {
        const { width } = this.scale;
        const y = 280;

        this.add.text(width / 2, y, 'СЛОЖНОСТЬ:', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffff00'
        }).setOrigin(0.5);

        const levels = [
            { level: LOCK_LEVELS.EASY, label: 'Лёгкий' },
            { level: LOCK_LEVELS.MEDIUM, label: 'Средний' },
            { level: LOCK_LEVELS.HARD, label: 'Сложный' }
        ];

        levels.forEach((item, index) => {
            const button = this.createButton(
                width / 2 - 110 + index * 110, 
                y + 50, 
                100, 
                50, 
                item.label,
                {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: 0x333333,
                    borderColor: 0x666666,
                    hoverColor: 0x555555
                }
            );
            
            button.container.on('pointerdown', () => {
                this.selectedLevel = item.level;
                this.updateButtons();
            });

            this.levelButtons.push({ button, level: item.level });
        });

        this.updateButtons();
    }

    /**
     * Кнопки действий
     */
    createActionButtons() {
        const { width, height } = this.scale;

        // Кнопка запуска
        const startButton = this.createButton(
            width / 2, 
            height - 120, 
            200, 
            60, 
            '🔓 ТЕСТИРОВАТЬ',
            {
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: 0x4CAF50,
                borderColor: 0x45a049,
                hoverColor: 0x45a049
            }
        );
        startButton.container.on('pointerdown', () => this.startTest());

        // Кнопка выхода
        const exitButton = this.createButton(
            width / 2, 
            height - 50, 
            150, 
            40, 
            '❌ Отмена',
            {
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: 0xf44336,
                borderColor: 0xda190b,
                hoverColor: 0xda190b
            }
        );
        exitButton.container.on('pointerdown', () => this.scene.start('MenuScene'));
    }

    /**
     * Обновление подсветки кнопок
     */
    updateButtons() {
        // Подсветка типов
        this.typeButtons.forEach(({ button, type }) => {
            const isSelected = type === this.selectedType;
            this.updateButtonStyle(button, {
                backgroundColor: isSelected ? 0x2196F3 : 0x333333,
                borderColor: isSelected ? 0xffff00 : 0x666666,
                borderWidth: isSelected ? 3 : 2
            });
        });

        // Подсветка уровней
        this.levelButtons.forEach(({ button, level }) => {
            const isSelected = level === this.selectedLevel;
            this.updateButtonStyle(button, {
                backgroundColor: isSelected ? 0x2196F3 : 0x333333,
                borderColor: isSelected ? 0xffff00 : 0x666666,
                borderWidth: isSelected ? 3 : 2
            });
        });
    }

    /**
     * Запуск теста
     */
    startTest() {
        console.log('🔓 [TestLocks] Запуск:', this.selectedType, 'уровень', this.selectedLevel);

        // Получаем конфигурацию замка
        const lockConfig = LOCK_CONFIGS[this.selectedType];
        const difficultyConfig = lockConfig.difficulty[this.selectedLevel];

        // Определяем сцену по типу замка
        const sceneMap = {
            [LOCK_TYPES.SIMPLE]: 'SimpleLockScene',
            [LOCK_TYPES.MAZE]: 'MazeLockScene',
            [LOCK_TYPES.PATTERN]: 'PatternLockScene'
        };
        const sceneKey = sceneMap[this.selectedType];

        // Усыпляем текущую сцену (останавливает update И рендеринг)
        this.scene.sleep();

        // Запускаем сцену взлома с параметрами
        this.scene.launch(sceneKey, {
            pet: this.testPet,
            lockType: this.selectedType,
            lockLevel: this.selectedLevel,
            config: difficultyConfig,
            cost: 0, // Стоимость 0 для тестирования (не тратим отмычки)
            lock: {
                type: this.selectedType,
                level: this.selectedLevel,
                onPickSuccess: () => {
                    console.log('✅ [TestLocks] Успех!');
                },
                onPickFailed: () => {
                    console.log('❌ [TestLocks] Провал!');
                }
            }
        });

        // Слушаем возврат
        const lockScene = this.scene.get(sceneKey);
        if (lockScene) {
            lockScene.events.once('shutdown', () => {
                // Пробуждаем сцену (восстанавливает update И рендеринг)
                this.scene.wake();
            });
        }
    }
}
