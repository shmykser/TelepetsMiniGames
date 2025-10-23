/**
 * Рендерер открытого мира для Pet Thief
 * Отрисовывает мир, управляет камерой
 */

import { BIOME_VISUALS, WORLD_CONSTANTS, OBSTACLE_TYPES } from '../../types/worldTypes.js';
import { BACKGROUND_SETTINGS } from '../../settings/GameSettings.js';

export class WorldRenderer {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        
        // Группы объектов для удобного управления
        this.backgroundGroup = null;
        this.obstacleGroup = null;
        this.houseGroup = null;
        this.coinGroup = null;
        
        console.log('🎨 [WorldRenderer] Инициализирован');
    }
    
    /**
     * Отрисовывает мир
     */
    render() {
        console.log('🎨 [WorldRenderer] Начало отрисовки мира...');
        
        // 1. Создаем фон
        this.renderBackground();
        
        // 2. Отрисовываем препятствия
        this.renderObstacles();
        
        // 3. Отрисовываем монеты
        this.renderCoins();
        
        // 4. Отрисовываем отмычки
        this.renderLockpicks();
        
        // 5. Отрисовываем жилища
        this.renderHouses();
        
        // 5. Отрисовываем дом игрока
        this.renderPlayerHouse();
        
        console.log('🎨 [WorldRenderer] Мир отрисован');
    }
    
    /**
     * Создает фон мира
     */
    renderBackground() {
        const biomeVisuals = BIOME_VISUALS[this.world.biome];
        
        console.log(`🎨 [WorldRenderer] Создание фона биома: ${biomeVisuals.name}`);
        
        // Создаем группу для фона
        this.backgroundGroup = this.scene.add.group();
        
        let background;
        
        // Проверяем наличие текстуры
        if (this.scene.textures.exists('grass_texture')) {
            // Создаем TileSprite для травяного фона на весь мир
            background = this.scene.add.tileSprite(
                this.world.size.width / 2,
                this.world.size.height / 2,
                this.world.size.width,
                this.world.size.height,
                'grass_texture'
            );
            
            // Применяем тонировку в зависимости от биома
            if (biomeVisuals.tintColor !== 0xffffff && biomeVisuals.tintColor !== 0x4a7c2e) {
                background.setTint(biomeVisuals.tintColor);
            }
            
            // Устанавливаем глубину
            background.setDepth(WORLD_CONSTANTS.DEPTH.BACKGROUND);
            
            // Добавляем легкую анимацию травы
            if (BACKGROUND_SETTINGS.animate) {
                this.scene.tweens.add({
                    targets: background,
                    tilePositionX: { from: 0, to: BACKGROUND_SETTINGS.animation.speedX },
                    tilePositionY: { from: 0, to: BACKGROUND_SETTINGS.animation.speedY },
                    duration: BACKGROUND_SETTINGS.animation.duration,
                    repeat: -1,
                    ease: 'Linear'
                });
            }
        } else {
            // Fallback: создаем цветной прямоугольник
            console.warn(`🎨 [WorldRenderer] Текстура травы не найдена! Используем fallback цвет`);
            background = this.scene.add.rectangle(
                this.world.size.width / 2,
                this.world.size.height / 2,
                this.world.size.width,
                this.world.size.height,
                biomeVisuals.backgroundColor
            );
            background.setDepth(WORLD_CONSTANTS.DEPTH.BACKGROUND);
        }
        
        this.backgroundGroup.add(background);
    }
    
    /**
     * Отрисовывает препятствия
     */
    renderObstacles() {
        console.log(`🎨 [WorldRenderer] Отрисовка ${this.world.obstacles.length} препятствий...`);
        
        this.obstacleGroup = this.scene.add.group();
        
        this.world.obstacles.forEach(obstacleData => {
            const obstacle = this.createObstacle(obstacleData);
            if (obstacle) {
                this.obstacleGroup.add(obstacle);
            }
        });
    }
    
    /**
     * Создает объект препятствия
     * @param {Object} data 
     * @returns {Phaser.GameObjects.Text|null}
     */
    createObstacle(data) {
        // Получаем конфигурацию препятствия
        const obstacleConfig = OBSTACLE_TYPES[data.type.toUpperCase()];
        
        if (!obstacleConfig) {
            console.warn(`🎨 [WorldRenderer] Неизвестный тип препятствия: ${data.type}`);
            return null;
        }
        
        // Создаем текстовый объект с эмодзи
        const obstacle = this.scene.add.text(
            data.position.x,
            data.position.y,
            obstacleConfig.texture,
            {
                fontSize: `${32 * obstacleConfig.size}px`,
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);
        
        // Устанавливаем глубину
        obstacle.setDepth(WORLD_CONSTANTS.DEPTH.OBSTACLES);
        
        // Добавляем физику если нужна коллизия
        if (obstacleConfig.collision) {
            this.scene.physics.add.existing(obstacle, true); // true = immovable
            
            // Настраиваем размер тела для коллизий
            if (obstacle.body) {
                const bodySize = 32 * obstacleConfig.size * 0.8;
                obstacle.body.setSize(bodySize, bodySize);
                obstacle.body.setOffset(
                    (obstacle.width - bodySize) / 2,
                    (obstacle.height - bodySize) / 2
                );
            }
        }
        
        // Сохраняем данные для дальнейшего использования
        obstacle.setData('obstacleData', data);
        obstacle.setData('isObstacle', true);
        
        return obstacle;
    }
    
    /**
     * Отрисовывает монеты
     */
    renderCoins() {
        console.log(`🎨 [WorldRenderer] Отрисовка ${this.world.coins.length} монет...`);
        
        this.coinGroup = this.scene.add.group();
        
        this.world.coins.forEach(coinData => {
            const coin = this.createCoin(coinData);
            if (coin) {
                this.coinGroup.add(coin);
            }
        });
    }
    
    /**
     * Создает объект монеты
     * @param {Object} data 
     * @returns {Phaser.GameObjects.Text}
     */
    createCoin(data) {
        const coin = this.scene.add.text(
            data.position.x,
            data.position.y,
            '💰',
            {
                fontSize: '24px',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);
        
        // Устанавливаем глубину
        coin.setDepth(WORLD_CONSTANTS.DEPTH.ITEMS);
        
        // Добавляем физику
        this.scene.physics.add.existing(coin);
        
        if (coin.body) {
            coin.body.setSize(24, 24);
            coin.body.setImmovable(true);
        }
        
        // Сохраняем данные
        coin.setData('coinData', data);
        coin.setData('isCoin', true);
        coin.setData('collected', false);
        
        // Простая анимация (пульсация)
        this.scene.tweens.add({
            targets: coin,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return coin;
    }
    
    /**
     * Отрисовывает отмычки
     */
    renderLockpicks() {
        if (!this.world.lockpicks || this.world.lockpicks.length === 0) {
            console.log('🎨 [WorldRenderer] Нет отмычек для отрисовки');
            return;
        }
        
        console.log(`🎨 [WorldRenderer] Отрисовка ${this.world.lockpicks.length} отмычек...`);
        
        this.lockpickGroup = this.scene.add.group();
        
        this.world.lockpicks.forEach(lockpickData => {
            if (!lockpickData.collected) {
                const lockpick = this.createLockpick(lockpickData);
                if (lockpick) {
                    this.lockpickGroup.add(lockpick);
                }
            }
        });
    }
    
    /**
     * Создает объект отмычки
     * @param {Object} data 
     * @returns {Phaser.GameObjects.Text}
     */
    createLockpick(data) {
        const lockpick = this.scene.add.text(
            data.position.x,
            data.position.y,
            '🔧',
            {
                fontSize: '28px',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);
        
        // Устанавливаем глубину
        lockpick.setDepth(WORLD_CONSTANTS.DEPTH.ITEMS);
        
        // Добавляем физику
        this.scene.physics.add.existing(lockpick);
        
        if (lockpick.body) {
            lockpick.body.setSize(28, 28);
            lockpick.body.setImmovable(true);
        }
        
        // Сохраняем данные
        lockpick.setData('lockpickData', data);
        lockpick.setData('isLockpick', true);
        lockpick.setData('collected', false);
        
        // Вращение
        this.scene.tweens.add({
            targets: lockpick,
            angle: 360,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Пульсация (немного меньше чем у монет)
        this.scene.tweens.add({
            targets: lockpick,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return lockpick;
    }
    
    /**
     * Отрисовывает жилища других игроков
     */
    renderHouses() {
        console.log(`🎨 [WorldRenderer] Отрисовка ${this.world.houses.length} жилищ...`);
        
        this.houseGroup = this.scene.add.group();
        
        this.world.houses.forEach(houseData => {
            const house = this.createHouse(houseData);
            if (house) {
                this.houseGroup.add(house);
            }
        });
    }
    
    /**
     * Создает объект жилища
     * @param {Object} data 
     * @returns {Phaser.GameObjects.Container}
     */
    createHouse(data) {
        // Создаем контейнер для дома
        const container = this.scene.add.container(data.position.x, data.position.y);
        
        // Иконка дома
        const houseIcon = this.scene.add.text(0, 0, data.texture, {
            fontSize: '48px',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Имя владельца
        const ownerName = this.scene.add.text(0, 35, data.ownerName, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        
        // Индикатор типа замка (если есть)
        let lockIndicator = null;
        if (data.security && data.security.lockType) {
            const lockEmojis = {
                'simple': '🔓',
                'maze': '🧩', 
                'pattern': '🎯'
            };
            const lockEmoji = lockEmojis[data.security.lockType] || '🔒';
            const lockLevel = data.security.level || 1;
            
            lockIndicator = this.scene.add.text(0, 50, `${lockEmoji}${lockLevel}`, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5);
        }
        
        const elements = [houseIcon, ownerName];
        if (lockIndicator) {
            elements.push(lockIndicator);
        }
        container.add(elements);
        
        // Устанавливаем глубину
        container.setDepth(WORLD_CONSTANTS.DEPTH.HOUSES);
        
        // Добавляем физику к контейнеру
        this.scene.physics.add.existing(container);
        
        if (container.body) {
            container.body.setSize(48, 48);
            container.body.setImmovable(true);
        }
        
        // Сохраняем данные
        container.setData('houseData', data);
        container.setData('isHouse', true);
        
        // Интерактивность (для будущего взаимодействия)
        container.setSize(48, 48);
        container.setInteractive();
        
        return container;
    }
    
    /**
     * Отрисовывает дом игрока
     */
    renderPlayerHouse() {
        console.log('🎨 [WorldRenderer] Отрисовка дома игрока...');
        
        const data = this.world.playerHouse;
        
        // Создаем контейнер для дома игрока
        const container = this.scene.add.container(data.position.x, data.position.y);
        
        // Иконка дома
        const houseIcon = this.scene.add.text(0, 0, data.texture, {
            fontSize: '56px',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Надпись "Мой дом"
        const label = this.scene.add.text(0, 40, 'Мой дом', {
            fontSize: '14px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            backgroundColor: '#00aa00',
            padding: { x: 6, y: 3 }
        }).setOrigin(0.5);
        
        container.add([houseIcon, label]);
        
        // Устанавливаем глубину
        container.setDepth(WORLD_CONSTANTS.DEPTH.HOUSES);
        
        // Добавляем физику
        this.scene.physics.add.existing(container);
        
        if (container.body) {
            container.body.setSize(56, 56);
            container.body.setImmovable(true);
        }
        
        // Сохраняем данные
        container.setData('houseData', data);
        container.setData('isPlayerHouse', true);
        
        // Интерактивность
        container.setSize(56, 56);
        container.setInteractive();
        
        // Сохраняем ссылку
        this.playerHouse = container;
    }
    
    /**
     * Обновление рендерера (вызывается каждый кадр)
     */
    update(time, delta) {
        // Здесь можно добавить анимации или обновление визуальных эффектов
    }
    
    /**
     * Получить группу монет
     */
    getCoins() {
        return this.coinGroup ? this.coinGroup.getChildren() : [];
    }
    
    /**
     * Получить группу препятствий
     */
    getObstacles() {
        return this.obstacleGroup ? this.obstacleGroup.getChildren() : [];
    }
    
    /**
     * Получить группу жилищ
     */
    getHouses() {
        return this.houseGroup ? this.houseGroup.getChildren() : [];
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        if (this.backgroundGroup) {
            this.backgroundGroup.destroy(true);
        }
        if (this.obstacleGroup) {
            this.obstacleGroup.destroy(true);
        }
        if (this.houseGroup) {
            this.houseGroup.destroy(true);
        }
        if (this.coinGroup) {
            this.coinGroup.destroy(true);
        }
        
        console.log('🎨 [WorldRenderer] Уничтожен');
    }
}

