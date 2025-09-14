/**
 * Сцена предзагрузки всех ассетов игры
 * Загружает спрайты врагов, защиты и другие ресурсы
 */
export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Создаем прогресс-бар загрузки
        this.createProgressBar();
        
        // Загружаем спрайты врагов
        this.loadEnemySprites();
        
        // Загружаем другие ассеты (если есть)
        this.loadOtherAssets();
        
        // Обработчики событий загрузки
        this.load.on('progress', this.updateProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
    }

    createProgressBar() {
        const { width, height } = this.scale;
        
        // Фон прогресс-бара
        const progressBg = this.add.rectangle(width / 2, height / 2, width * 0.8, 20, 0x333333);
        
        // Прогресс-бар
        const progressBar = this.add.rectangle(width / 2, height / 2, 0, 18, 0x00ff00);
        
        // Текст загрузки
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Загрузка...', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Сохраняем ссылки для обновления
        this.progressBar = progressBar;
        this.loadingText = loadingText;
    }

    loadEnemySprites() {
        // Список типов врагов из enemyTypes.js
        const enemyTypes = [
            'ant', 'bee', 'butterfly', 'dragonfly', 'fly', 
            'ladybug', 'mosquito', 'rhinoceros', 'spider'
        ];
        
        // Размеры спрайтов
        const sizes = ['32x32', '64x64', '128x128', '500x500'];
        
        // Загружаем все комбинации типов и размеров
        enemyTypes.forEach(enemyType => {
            sizes.forEach(size => {
                const textureKey = `${enemyType}_${size}`;
                const texturePath = `/TelepetsMiniGames/assets/graphics/sprites/enemy/${enemyType}_${size}.png`;
                
                this.load.image(textureKey, texturePath);
            });
        });
    }

    loadOtherAssets() {
        // Здесь можно добавить загрузку других ассетов
        // Например, спрайты защиты, UI элементы и т.д.
        
        // Загружаем спрайты защиты (если есть)
        this.loadDefenseSprites();
        
        // Загружаем текстуры фона
        this.loadBackgroundTextures();
    }

    loadDefenseSprites() {
        // Проверяем, есть ли спрайты защиты в папке
        const defenseTypes = ['sugar', 'stone', 'barrier', 'spikes'];
        const sizes = ['32x32', '64x64', '128x128'];
        
        defenseTypes.forEach(defenseType => {
            sizes.forEach(size => {
                const textureKey = `${defenseType}_${size}`;
                const texturePath = `/TelepetsMiniGames/assets/graphics/sprites/defense/${defenseType}_${size}.png`;
                
                // Пытаемся загрузить, но не критично если файла нет
                try {
                    this.load.image(textureKey, texturePath);
                } catch (error) {
                    console.log(`Defense sprite not found: ${texturePath}`);
                }
            });
        });
    }
    
    loadBackgroundTextures() {
        // Загружаем текстуру травы для тайлинга
        this.load.image('grass_texture', '/TelepetsMiniGames/assets/graphics/backgrounds/grass.png');
        
        // Можно добавить другие фоновые текстуры
        // this.load.image('dirt_texture', '/TelepetsMiniGames/assets/graphics/backgrounds/dirt.png');
        // this.load.image('stone_texture', '/TelepetsMiniGames/assets/graphics/backgrounds/stone.png');
    }

    updateProgress(progress) {
        if (this.progressBar) {
            const { width } = this.scale;
            this.progressBar.width = width * 0.8 * progress;
        }
        
        if (this.loadingText) {
            this.loadingText.setText(`Загрузка... ${Math.round(progress * 100)}%`);
        }
    }

    onLoadComplete() {
        // Переходим к главному меню
        this.scene.start('MenuScene');
    }
}
