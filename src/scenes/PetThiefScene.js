/**
 * Основная игровая сцена Pet Thief
 * Открытый мир с питомцем, жилищами и сокровищами
 */

import Phaser from 'phaser';
import { WorldGenerator } from '../systems/world/WorldGenerator.js';
import { WorldRenderer } from '../systems/world/WorldRenderer.js';
import { Pet } from '../objects/Pet.js';
import { PetControlSystem } from '../systems/PetControlSystem.js';
import { EventSystem } from '../systems/EventSystem.js';
import { ObstacleInteractionSystem } from '../systems/ObstacleInteractionSystem.js';
import { WORLD_SIZE, WORLD_CONSTANTS, WORLD_GENERATION } from '../types/worldTypes.js';
import { SafeAreaUtils } from '../utils/SafeAreaUtils.js';

export class PetThiefScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PetThiefScene' });
        
        // Состояние игры
        this.isGameActive = false;
        this.world = null;
        this.pet = null;
        
        // Системы
        this.worldGenerator = null;
        this.worldRenderer = null;
        this.petControlSystem = null;
        this.eventSystem = null;
        this.obstacleInteractionSystem = null;
        
        // UI элементы
        this.inventoryUI = null;
        
        console.log('🎮 [PetThiefScene] Сцена создана');
    }
    
    /**
     * Создание сцены
     * @param {Object} data - Данные переданные из другой сцены
     */
    create(data) {
        console.log('🎮 [PetThiefScene] Начало инициализации сцены...');
        
        // 1. Генерация или загрузка мира
        this.initializeWorld(data);
        
        // 2. Рендеринг мира
        this.renderWorld();
        
        // 3. Создание питомца
        this.createPet(data);
        
        // 4. Настройка камеры
        this.setupCamera();
        
        // 5. Инициализация систем
        this.initializeSystems();
        
        // 6. Настройка UI
        this.setupUI();
        
        // 7. Настройка обработчиков событий
        this.setupEventHandlers();
        
        // 8. Запуск игры
        this.startGame();
        
        console.log('🎮 [PetThiefScene] Сцена инициализирована');
    }
    
    /**
     * Инициализация мира
     * @param {Object} data 
     */
    initializeWorld(data) {
        // Если мир уже передан, используем его
        if (data && data.world) {
            this.world = data.world;
            console.log('🗺️ [PetThiefScene] Загружен существующий мир');
        } else {
            // Генерируем новый мир
            const seed = data && data.seed ? data.seed : WORLD_GENERATION.getSeed();
            this.worldGenerator = new WorldGenerator(seed);
            this.world = this.worldGenerator.generate();
            console.log('🗺️ [PetThiefScene] Сгенерирован новый мир');
        }
    }
    
    /**
     * Рендеринг мира
     */
    renderWorld() {
        this.worldRenderer = new WorldRenderer(this, this.world);
        this.worldRenderer.render();
    }
    
    /**
     * Создание питомца
     * @param {Object} data 
     */
    createPet(data) {
        // Определяем стартовую позицию
        const startPos = data && data.returnPosition 
            ? data.returnPosition 
            : this.world.playerHouse.position;
        
        // Создаем питомца
        this.pet = Pet.CreatePet(this, startPos.x, startPos.y);
        
        console.log(`🐾 [PetThiefScene] Питомец создан в позиции (${startPos.x}, ${startPos.y})`);
    }
    
    /**
     * Настройка камеры
     */
    setupCamera() {
        const camera = this.cameras.main;
        
        // Устанавливаем границы камеры = границы мира
        camera.setBounds(0, 0, WORLD_SIZE.width, WORLD_SIZE.height);
        
        // Камера следует за питомцем с плавностью
        camera.startFollow(
            this.pet, 
            true, // roundPixels
            WORLD_CONSTANTS.CAMERA.FOLLOW_LERP, // lerpX
            WORLD_CONSTANTS.CAMERA.FOLLOW_LERP  // lerpY
        );
        
        // Устанавливаем зум
        camera.setZoom(WORLD_CONSTANTS.CAMERA.ZOOM);
        
        console.log('📷 [PetThiefScene] Камера настроена');
    }
    
    /**
     * Инициализация игровых систем
     */
    initializeSystems() {
        // Система событий
        this.eventSystem = new EventSystem();
        
        // Система управления питомцем
        this.petControlSystem = new PetControlSystem(this, this.pet);
        
        // Система взаимодействия с препятствиями
        this.obstacleInteractionSystem = new ObstacleInteractionSystem(this);
        this.obstacleInteractionSystem.initialize();
        
        // Добавляем препятствия в систему
        const obstacles = this.worldRenderer.getObstacles();
        obstacles.forEach(obstacle => {
            if (obstacle.getData('obstacleData')) {
                this.obstacleInteractionSystem.addObstacle(obstacle);
            }
        });
        
        console.log('⚙️ [PetThiefScene] Системы инициализированы');
    }
    
    /**
     * Настройка UI
     */
    setupUI() {
        // Создаем UI инвентаря
        this.createInventoryUI();
        
        console.log('🖼️ [PetThiefScene] UI настроен');
    }
    
    /**
     * Создание UI инвентаря
     */
    createInventoryUI() {
        // Позиция с учетом safe area
        const x = SafeAreaUtils.getSafeLeftPosition(20, 20);
        const y = SafeAreaUtils.getSafeTopPosition(20, 20);
        
        // Инициализируем объект для отслеживания собранных предметов
        this.collectedItems = {
            coins: 0,
            jewels: 0,
            keys: 0
        };
        
        // Создаем контейнер для инвентаря
        this.inventoryUI = this.add.container(x, y);
        
        // Фон
        const background = this.add.rectangle(0, 0, 150, 80, 0x000000, 0.7);
        background.setOrigin(0);
        
        // Заголовок
        const title = this.add.text(10, 5, 'Инвентарь', {
            fontSize: '14px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        
        // Текст с монетами
        this.coinsText = this.add.text(10, 25, '💰 Монеты: 0', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffff00'
        });
        
        // Текст с драгоценностями (пока скрыт)
        this.jewelsText = this.add.text(10, 42, '💎 Драгоценности: 0', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#00ffff'
        });
        this.jewelsText.setVisible(false);
        
        // Текст с ключами (пока скрыт)
        this.keysText = this.add.text(10, 59, '🔑 Ключи: 0', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        this.keysText.setVisible(false);
        
        // Текст с отмычками (пока скрыт)
        this.lockpicksText = this.add.text(10, 76, '🔧 Отмычки: 0', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#00ffff'
        });
        this.lockpicksText.setVisible(false);
        
        
        // Добавляем элементы в контейнер
        this.inventoryUI.add([background, title, this.coinsText, this.jewelsText, this.keysText, this.lockpicksText]);
        
        // Устанавливаем глубину
        this.inventoryUI.setDepth(WORLD_CONSTANTS.DEPTH.UI);
        
        // Делаем неподвижным относительно камеры
        this.inventoryUI.setScrollFactor(0);
    }
    
    
    /**
     * Обновление UI инвентаря
     */
    updateInventoryUI() {
        if (!this.pet || !this.coinsText) return;
        
        const inventory = this.pet.inventory;
        
        // Обновляем текст монет
        this.coinsText.setText(`💰 Монеты: ${inventory.get('coins')}`);
        
        // Показываем драгоценности если они есть
        if (inventory.get('jewels') > 0 && this.jewelsText) {
            this.jewelsText.setVisible(true);
            this.jewelsText.setText(`💎 Драгоценности: ${inventory.get('jewels')}`);
        }
        
        // Показываем ключи если они есть
        if (inventory.get('keys') > 0 && this.keysText) {
            this.keysText.setVisible(true);
            this.keysText.setText(`🔑 Ключи: ${inventory.get('keys')}`);
        }
        
        // Показываем отмычки если они есть
        if (inventory.get('lockpicks') > 0 && this.lockpicksText) {
            this.lockpicksText.setVisible(true);
            this.lockpicksText.setText(`🔧 Отмычки: ${inventory.get('lockpicks')}`);
        } else if (this.lockpicksText) {
            // Скрываем если нет
            this.lockpicksText.setVisible(false);
        }
    }
    
    /**
     * Настройка обработчиков событий
     */
    setupEventHandlers() {
        // Обработка сбора монет
        this.events.on('pet:coinsCollected', (data) => {
            this.updateInventoryUI();
            console.log(`💰 [PetThiefScene] Собрано монет: +${data.amount} (всего: ${data.total})`);
        });
        
        // Обработка входа в дом
        this.events.on('pet:enterHouse', (data) => {
            console.log('🏠 [PetThiefScene] Вход в дом:', data);
            this.enterHouse(data.house);
        });
        
        // Обработка достижения цели
        this.events.on('pet:targetReached', (data) => {
            console.log('🎯 [PetThiefScene] Цель достигнута');
        });
        
        console.log('📡 [PetThiefScene] Обработчики событий настроены');
    }
    
    /**
     * Показать сообщение на экране
     * @param {string} message 
     */
    showMessage(message) {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        
        const messageText = this.add.text(centerX, centerY, message, {
            fontSize: '24px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);
        
        // Исчезает через 2 секунды
        this.tweens.add({
            targets: messageText,
            alpha: 0,
            duration: 1000,
            delay: 1000,
            onComplete: () => {
                messageText.destroy();
            }
        });
    }
    
    /**
     * Запуск игры
     */
    startGame() {
        this.isGameActive = true;
        console.log('🎮 [PetThiefScene] Игра запущена');
        
        // Показываем приветственное сообщение
        this.showMessage('Добро пожаловать в Pet Thief!');
    }
    
    /**
     * Обновление сцены (каждый кадр)
     * @param {number} time 
     * @param {number} delta 
     */
    update(time, delta) {
        if (!this.isGameActive) return;
        
        // Обновляем системы
        if (this.petControlSystem) {
            this.petControlSystem.update(time, delta);
        }
        
        if (this.worldRenderer) {
            this.worldRenderer.update(time, delta);
        }
        
        // Обновляем питомца
        if (this.pet && this.pet.isAlive) {
            this.pet.update(time, delta);
        }
    }
    
    /**
     * Вход в дом
     * @param {Object} house - Данные дома
     */
    enterHouse(house) {
        console.log('🚪 [PetThiefScene] Попытка входа в дом:', house);
        
        // Сохраняем позицию питомца
        const petPosition = {
            x: this.pet.x,
            y: this.pet.y
        };
        
        // Проверяем замок
        const hasLock = house.security && house.security.level > 0;
        const isPlayerHouse = house.isPlayerHouse;
        
        // Свой дом всегда открыт
        if (isPlayerHouse) {
            console.log('🏡 [PetThiefScene] Это свой дом, входим без проверки');
            this.enterHouseInterior(house, petPosition);
            return;
        }
        
        // Если есть замок - нужно взломать
        if (hasLock) {
            console.log('🔒 [PetThiefScene] Дом заперт! Уровень замка:', house.security.level);
            this.showMessage(`🔒 Дом заперт! Уровень замка: ${house.security.level}`);
            
        // Создаем замок для двери и запускаем взлом
        this.startDoorLockpicking(house, petPosition);
        } else {
            // Дом не заперт - входим свободно
            console.log('🚪 [PetThiefScene] Дом не заперт, входим свободно');
            this.showMessage('🚪 Дом не заперт, входим свободно');
            this.enterHouseInterior(house, petPosition);
        }
    }
    
    /**
     * Вход в интерьер дома (после успешного взлома или если не заперт)
     * @param {Object} house - Данные дома
     * @param {Object} petPosition - Позиция питомца
     */
    enterHouseInterior(house, petPosition) {
        console.log('✅ [PetThiefScene] Вход в интерьер дома');
        
        // Останавливаем сцену (но не уничтожаем)
        this.scene.pause('PetThiefScene');
        
        // Запускаем сцену интерьера с данными
        this.scene.launch('HouseInteriorScene', {
            house: house,
            petPosition: petPosition,
            worldData: this.world,
            collectedItems: this.collectedItems,
            pet: this.pet // Передаем ссылку на питомца
        });
    }
    
    /**
     * Запуск взлома замка двери
     * @param {Object} house - Данные дома
     * @param {Object} petPosition - Позиция питомца
     */
    startDoorLockpicking(house, petPosition) {
        console.log('🔓 [PetThiefScene] Запуск взлома двери');
        
        // Проверяем наличие отмычек
        const lockpicks = this.pet.inventory.get('lockpicks');
        const cost = house.security.level; // Стоимость = уровень замка
        
        if (lockpicks < cost) {
            this.showMessage(`❌ Нужно ${cost} отмычек! У вас: ${lockpicks}`);
            return;
        }
        
        // Создаем временный замок для двери
        const doorLock = {
            type: 'simple', // Пока только простые замки для дверей
            level: house.security.level,
            config: {
                pins: house.security.level,
                indicatorSpeed: 2 + (house.security.level - 1) * 0.5,
                tolerance: 15,
                maxAttempts: 3 + house.security.level,
                timeLimit: 0
            },
            cost: cost,
            onPickSuccess: () => {
                console.log('✅ [PetThiefScene] Дверь взломана!');
                this.enterHouseInterior(house, petPosition);
            },
            onPickFailed: () => {
                console.log('❌ [PetThiefScene] Провал взлома двери');
                // Обновляем отмычки
                this.pet.inventory.set('lockpicks', this.pet.inventory.get('lockpicks') - cost);
                this.updateInventoryUI();
            }
        };
        
        // Останавливаем основную сцену
        this.scene.pause('PetThiefScene');
        
        // Запускаем универсальную сцену взлома
        this.scene.launch('UniversalLockpickingScene', {
            lock: doorLock,
            pet: this.pet,
            lockType: doorLock.type,
            lockLevel: doorLock.level,
            config: doorLock.config,
            cost: doorLock.cost
        });
    }
    
    /**
     * Возврат из дома
     * @param {Object} data - Данные возврата (собранные предметы)
     */
    onReturnFromHouse(data) {
        console.log('🚪 [PetThiefScene] Возврат из дома, собрано:', data.collectedItems);
        
        // Обновляем локальный счетчик
        this.collectedItems.coins += data.collectedItems.coins;
        this.collectedItems.jewels += data.collectedItems.jewels;
        this.collectedItems.keys += data.collectedItems.keys;
        
        // Добавляем в инвентарь питомца
        if (this.pet) {
            if (data.collectedItems.coins > 0) {
                this.pet.addCoins(data.collectedItems.coins);
            }
            if (data.collectedItems.jewels > 0) {
                this.pet.addJewels(data.collectedItems.jewels);
            }
            if (data.collectedItems.keys > 0) {
                this.pet.addKeys(data.collectedItems.keys);
            }
        }
        
        // Обновляем UI
        this.updateInventoryUI();
        
        // Показываем сообщение если что-то собрано
        if (data.collectedItems.coins > 0 || data.collectedItems.jewels > 0 || data.collectedItems.keys > 0) {
            const message = this.formatCollectedMessage(data.collectedItems);
            this.showMessage(message);
        }
    }
    
    /**
     * Форматирование сообщения о собранных предметах
     */
    formatCollectedMessage(items) {
        let parts = [];
        if (items.coins > 0) parts.push(`+${items.coins} 💰`);
        if (items.jewels > 0) parts.push(`+${items.jewels} 💎`);
        if (items.keys > 0) parts.push(`+${items.keys} 🔑`);
        return `Украдено: ${parts.join(', ')}`;
    }
    
    /**
     * Очистка ресурсов при уничтожении сцены
     */
    shutdown() {
        console.log('🎮 [PetThiefScene] Завершение работы сцены...');
        
        // Очищаем системы
        if (this.petControlSystem) {
            this.petControlSystem.destroy();
        }
        
        if (this.worldRenderer) {
            this.worldRenderer.destroy();
        }
        
        if (this.obstacleInteractionSystem) {
            this.obstacleInteractionSystem.destroy();
        }
        
        if (this.eventSystem) {
            this.eventSystem.clear();
        }
        
        // Удаляем обработчики событий
        this.events.off('pet:coinsCollected');
        this.events.off('pet:enterHouse');
        this.events.off('pet:targetReached');
        
        this.isGameActive = false;
        
        console.log('🎮 [PetThiefScene] Сцена завершена');
    }
}

