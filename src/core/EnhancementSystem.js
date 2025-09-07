/**
 * Система усиления врагов
 * Следует принципу Single Responsibility Principle
 */
import { GeometryUtils } from '../utils/GeometryUtils.js';
import { AnimationLibrary } from '../animations/AnimationLibrary.js';

export class EnhancementSystem {
    /**
     * Уровни усиления врагов
     */
    static ENHANCEMENT_LEVELS = {
        NORMAL: { 
            multiplier: 1, 
            weight: 70, 
            name: '', 
            suffix: '',
            tint: 0xffffff,
            particleConfig: null
        },
        ELITE: {
            multiplier: 2,
            weight: 25,
            name: 'Элитный',
            suffix: '_elite',
            tint: 0xffffaa,
            particleLevel: 'elite'
        },
        CHAMPION: {
            multiplier: 3,
            weight: 5,
            name: 'Чемпион',
            suffix: '_champion',
            tint: 0xffaa00,
            particleLevel: 'champion'
        }
    };

    /**
     * Усиливает врага с определенной вероятностью
     * @param {Enemy} enemy - Враг для усиления
     * @param {string} baseEnemyType - Базовый тип врага
     * @param {number} gameTime - Время игры в миллисекундах
     * @returns {Enemy} Усиленный или обычный враг
     */
    static enhanceEnemy(enemy, baseEnemyType, gameTime = 0) {
        const enhancementLevel = this.rollEnhancement(gameTime);
        
        if (enhancementLevel === this.ENHANCEMENT_LEVELS.NORMAL) {
            return enemy; // Возвращаем без изменений
        }
        
        return this.applyEnhancement(enemy, baseEnemyType, enhancementLevel);
    }

    /**
     * Определяет уровень усиления на основе вероятности и времени игры
     * @param {number} gameTime - Время игры в миллисекундах
     * @returns {Object} Уровень усиления
     */
    static rollEnhancement(gameTime) {
        const weights = this.getEnhancementWeights(gameTime);
        const random = Math.random() * 100;
        let cumulative = 0;
        
        // Проверяем каждый уровень усиления
        for (const [levelName, level] of Object.entries(this.ENHANCEMENT_LEVELS)) {
            cumulative += weights[levelName.toLowerCase()];
            if (random <= cumulative) {
                return level;
            }
        }
        
        return this.ENHANCEMENT_LEVELS.NORMAL;
    }

    /**
     * Получает веса усиления в зависимости от времени игры
     * @param {number} gameTime - Время игры в миллисекундах
     * @returns {Object} Веса для каждого уровня
     */
    static getEnhancementWeights(gameTime) {
        const minutes = GeometryUtils.floor(gameTime / 60000);
        
        if (minutes < 2) {
            return { normal: 95, elite: 5, champion: 0 };
            //return { normal: 0, elite: 0, champion: 100 };
        } else if (minutes < 5) {
            return { normal: 80, elite: 15, champion: 5 };
        } else {
            return { normal: 70, elite: 20, champion: 10 };
        }
    }

    /**
     * Применяет усиление к врагу
     * @param {Enemy} enemy - Враг для усиления
     * @param {string} baseEnemyType - Базовый тип врага
     * @param {Object} enhancementLevel - Уровень усиления
     * @returns {Enemy} Усиленный враг
     */
    static applyEnhancement(enemy, baseEnemyType, enhancementLevel) {
        // Сохраняем оригинальные характеристики
        enemy._originalHealth = enemy.health;
        enemy._originalMaxHealth = enemy._maxHealth;
        enemy._originalDamage = enemy.damage;
        enemy._originalSize = enemy.size;
        
        // Модифицируем характеристики (сначала maxHealth, потом health)
        enemy._maxHealth *= enhancementLevel.multiplier;
        enemy.health *= enhancementLevel.multiplier;
        enemy.damage *= enhancementLevel.multiplier;
        enemy.size *= enhancementLevel.multiplier;
        
        
        // Обновляем визуальные характеристики
        const newScale = enemy.scaleX * enhancementLevel.multiplier;
        enemy.setScale(newScale);
        
        // Обновляем размер HealthBar для усиленных врагов
        if (enemy.healthBar && enemy.healthBar.updateBarSize) {
            enemy.healthBar.updateBarSize();
        }
        
        // Добавляем визуальные эффекты
        this.addEnhancementEffects(enemy, enhancementLevel);
        
        // Обновляем имя
        enemy.displayName = `${enhancementLevel.name} ${enemy._enemyData.name}`.trim();
        
        // Сохраняем уровень усиления
        enemy.enhancementLevel = enhancementLevel;
        
        // Уведомляем о появлении усиленного врага
        this.notifyEnhancement(enemy, enhancementLevel);
        
        return enemy;
    }

    /**
     * Добавляет визуальные эффекты усиления
     * @param {Enemy} enemy - Враг
     * @param {Object} enhancementLevel - Уровень усиления
     */
    static addEnhancementEffects(enemy, enhancementLevel) {
        // Применяем оттенок
        enemy.setTint(enhancementLevel.tint);
        
        // Добавляем частицы если есть уровень
        if (enhancementLevel.particleLevel) {
            this.addParticleEffects(enemy, enhancementLevel.particleLevel);
        }
        
        // Добавляем анимацию для чемпионов
        // if (enhancementLevel === this.ENHANCEMENT_LEVELS.CHAMPION) {
        //     this.addChampionAnimation(enemy);
        // }
    }

    /**
     * Добавляет эффекты частиц
     * @param {Enemy} enemy - Враг
     * @param {string} particleLevel - Уровень частиц ('elite' или 'champion')
     */
    static addParticleEffects(enemy, particleLevel) {
        // Создаем частицы через AnimationLibrary
        const particles = AnimationLibrary.createEnhancementParticles(enemy.scene, enemy, particleLevel);
        
        if (particles) {
            // Привязываем частицы к врагу
            enemy.enhancementParticles = particles;

        }
    }

    /**
     * Добавляет анимацию для чемпионов
     * @param {Enemy} enemy - Враг
     */
    static addChampionAnimation(enemy) {
        // Используем AnimationLibrary для пульсации
        AnimationLibrary.createPulseAnimation(enemy.scene, enemy, {
            scale: { from: 1, to: 1.1 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Уведомляет о появлении усиленного врага
     * @param {Enemy} enemy - Враг
     * @param {Object} enhancementLevel - Уровень усиления
     */
    static notifyEnhancement(enemy, enhancementLevel) {
        if (enemy.scene && enemy.scene.events) {
            enemy.scene.events.emit('enhancedEnemySpawned', {
                enemy: enemy,
                level: enhancementLevel,
                position: { x: enemy.x, y: enemy.y }
            });
        }
    }

    /**
     * Очищает эффекты усиления
     * @param {Enemy} enemy - Враг
     */
    static cleanupEnhancement(enemy) {
        if (enemy.enhancementParticles) {
            enemy.enhancementParticles.destroy();
            enemy.enhancementParticles = null;
        }
        
        // Останавливаем анимации через AnimationLibrary
        if (enemy.scene) {
            AnimationLibrary.stopAllAnimations(enemy.scene, enemy);
        }
    }
}
