import Phaser from 'phaser';
import { HealthBar } from '../components/HealthBar';
import { PropertyUtils } from '../utils/PropertyUtils.js';
import { PHYSICS_CONSTANTS } from '../constants/GameConstants.js';

export class GameObject extends Phaser.GameObjects.Sprite {
    constructor(scene, config) {
        // Определяем текстуру для использования (спрайт или эмодзи)
        const textureKey = GameObject.selectTexture(scene, config);
        
        super(scene, config.x || 0, config.y || 0, textureKey);
        // Только базовые свойства для всех объектов
        PropertyUtils.defineProperty(this, "_health", undefined);
        PropertyUtils.defineProperty(this, "_maxHealth", undefined);
        PropertyUtils.defineProperty(this, "_isAlive", true);
        PropertyUtils.defineProperty(this, "_body", undefined);
        PropertyUtils.defineProperty(this, "_healthBar", undefined);
        
        // Инициализация базовых свойств
        this._health = config.health;
        this._maxHealth = config.health;
        
        // Добавляем в сцену и физику
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this._body = this.body;
        this._body.setCollideWorldBounds(true);
        this._body.setBounce(PHYSICS_CONSTANTS.DEFAULT_BOUNCE);
        this._body.setDrag(PHYSICS_CONSTANTS.DEFAULT_DRAG, PHYSICS_CONSTANTS.DEFAULT_DRAG);
        
        // Настраиваем события физики
        this._body.onOverlap = true;
    }
    
    // Геттеры - только базовые для всех объектов
    get health() { return this._health; }
    get maxHealth() { return this._maxHealth; }
    get isAlive() { return this._isAlive; }
    get physicsBody() { return this._body; }
    
    // Сеттеры - только базовые для всех объектов
    set health(value) {
        this._health = Math.max(0, Math.min(value, this._maxHealth));
        this.updateHealthBar();
        if (this._health <= 0) {
            this.die();
        }
    }
    
    // Базовые методы
    stopMovement() {
        this._body.setVelocity(0, 0);
    }
    
    takeDamage(damage) {
        if (!this._isAlive || !this.scene) return;
        
        this.health -= damage;
        this.emit('damage', damage, this._health);
    }
    
    die() {
        this._isAlive = false;
        this.stopMovement();
        this.destroyHealthBar();
        
        this.emit('death', this);
        if (this.enemyType) {
            this.emit('enemyKilled', this);
        }
        this.destroy();
    }
    
    update(_time, _delta) {
        if (!this._isAlive) return;
    }
    
    destroy() {
        this.destroyHealthBar();
        this.emit('destroy', this);
        super.destroy();
    }
    
    // setTarget удален - нужен только врагам
    
    // Методы для работы с HealthBar
    createHealthBar(options) {
        if (this._healthBar) {
            this._healthBar.destroy();
        }
        this._healthBar = new HealthBar(this.scene, this, options);
    }
    
    updateHealthBar() {
        if (this._healthBar) {
            this._healthBar.updateHealth();
        }
    }
    
    destroyHealthBar() {
        if (this._healthBar) {
            this._healthBar.destroy();
            this._healthBar = undefined;
        }
    }
    

//#### TEXTURE #########################################################
    // Статические методы для работы с текстурами (спрайты и эмодзи)
    static selectTexture(scene, config) {
        // Если есть spriteKey, пытаемся использовать спрайт
        if (config.spriteKey && config.size !== undefined) {
            const spriteKey = GameObject.selectSpriteKey(config);
            if (scene.textures.exists(spriteKey)) {
                return spriteKey;
            }
        }
        
        // Если спрайт не найден, используем эмодзи как fallback
        if (config.texture && GameObject.isEmoji(config.texture)) {
            GameObject.createEmojiTexture(scene, config.texture);
            return config.texture;
        }
        
        // Возвращаем переданную текстуру или пустую строку
        return config.texture || '';
    }
    
    static selectSpriteKey(config) {
        if (!config.spriteKey) return '';
        
        // Выбираем размер спрайта на основе размера объекта
        const size = GameObject.calculateSpriteSize(config.size);
        return `${config.spriteKey}_${size}`;
    }
    
    static calculateSpriteSize(size) {
        // Маппинг размера объекта на размер спрайта
        if (size <= 1) return '32x32';
        if (size <= 2) return '64x64';
        if (size <= 3) return '128x128';
        //return '500x500';
    }
    
    static isEmoji(text) {
        // Проверка на эмодзи - расширенный диапазон Unicode
        return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1FAB0}-\u{1FABF}]|[\u{1FAC0}-\u{1FAFF}]|[\u{1FAD0}-\u{1FAFF}]|[\u{1FAE0}-\u{1FAFF}]|[\u{1FAF0}-\u{1FAFF}]/u.test(text);
    }
    
    static createEmojiTexture(scene, emoji) {
        // Проверяем, существует ли уже текстура
        if (scene.textures.exists(emoji)) {
            return; // Текстура уже существует
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
        renderTexture.saveTexture(emoji);
        
        // Очищаем
        text.destroy();
        renderTexture.destroy();
    }
}
