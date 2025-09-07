/**
 * Менеджер текстур для создания эмодзи-текстур
 */
export class TextureManager {
    /**
     * Создает все необходимые эмодзи-текстуры для игры
     */
    static createAllTextures(scene) {
        // Проверяем, инициализированы ли уже текстуры
        if (scene.textures.exists('egg')) {
            return; // Текстуры уже созданы
        }
        
        TextureManager.createEmojiTexture(scene, '🥚', 'egg');
        // Создаем текстуры для врагов
        TextureManager.createEmojiTexture(scene, '🕷️', 'spider');
        TextureManager.createEmojiTexture(scene, '🐞', 'beetle');
        TextureManager.createEmojiTexture(scene, '🐜', 'ant');
        TextureManager.createEmojiTexture(scene, '🐛', 'rhinoceros');
        TextureManager.createEmojiTexture(scene, '🪰', 'fly');
        TextureManager.createEmojiTexture(scene, '🦟', 'mosquito');
        TextureManager.createEmojiTexture(scene, '🐝', 'bee');
        TextureManager.createEmojiTexture(scene, '🦋', 'butterfly');
        TextureManager.createEmojiTexture(scene, '🪲', 'dragonfly');
        
        // Создаем текстуры для защитных объектов
        TextureManager.createEmojiTexture(scene, '🍯', 'sugar'); // Сахар
        TextureManager.createEmojiTexture(scene, '🪨', 'stone'); // Камень
        TextureManager.createEmojiTexture(scene, '⚡', 'crack'); // Трещина/молния
        TextureManager.createEmojiTexture(scene, '🔺', 'spikes'); // Шипы
        TextureManager.createEmojiTexture(scene, '🥒', 'madCucumber'); // Бешеный огурец
        TextureManager.createEmojiTexture(scene, '🕳️', 'pit'); // Яма
        
        // Создаем текстуры для предметов
        TextureManager.createEmojiTexture(scene, '❤️', 'heart');
        TextureManager.createEmojiTexture(scene, '🍀', 'clover');
        
        // Создаем текстуры для эффектов усиления
        TextureManager.createEmojiTexture(scene, '✨', 'sparkle');
    }
    /**
     * Создает одну эмодзи-текстуру
     */
    static createEmojiTexture(scene, emoji, textureKey) {
        // Проверяем, существует ли уже текстура
        if (scene.textures.exists(textureKey)) {
            return; // Текстура уже существует, не создаем заново
        }
        
        // Создаем RenderTexture для рендеринга эмодзи
        const renderTexture = scene.add.renderTexture(0, 0, 64, 64);
        // Создаем текстовый объект с эмодзи
        const text = scene.add.text(32, 32, emoji, {
            fontSize: '48px',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        // Рендерим текст в текстуру
        renderTexture.draw(text);
        // Сохраняем как текстуру
        renderTexture.saveTexture(textureKey);
        // Очищаем
        text.destroy();
        renderTexture.destroy();
    }
}
