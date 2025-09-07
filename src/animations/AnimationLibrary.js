import { GeometryUtils } from '../utils/GeometryUtils.js';

/**
 * Библиотека анимаций для игровых объектов и UI компонентов
 * Следует принципу Single Responsibility Principle
 */
export class AnimationLibrary {
    /**
     * Создает анимацию пульсации
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createPulseAnimation(scene, target, config = {}) {
        const defaultConfig = {
            scale: { from: 1, to: 1.2 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            duration: finalConfig.duration,
            yoyo: finalConfig.yoyo,
            repeat: finalConfig.repeat,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает анимацию вращения
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createRotationAnimation(scene, target, config = {}) {
        const defaultConfig = {
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            angle: finalConfig.angle,
            duration: finalConfig.duration,
            repeat: finalConfig.repeat,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает анимацию появления
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createFadeInAnimation(scene, target, config = {}) {
        const defaultConfig = {
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Power2.easeOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            alpha: finalConfig.alpha.to,
            duration: finalConfig.duration,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает анимацию исчезновения
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createFadeOutAnimation(scene, target, config = {}) {
        const defaultConfig = {
            alpha: { from: 1, to: 0 },
            duration: 500,
            ease: 'Power2.easeIn'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            alpha: finalConfig.alpha.to,
            duration: finalConfig.duration,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает анимацию движения
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createMoveAnimation(scene, target, config = {}) {
        const defaultConfig = {
            x: target.x,
            y: target.y,
            duration: 1000,
            ease: 'Power2.easeInOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            x: finalConfig.x,
            y: finalConfig.y,
            duration: finalConfig.duration,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает анимацию тряски
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createShakeAnimation(scene, target, config = {}) {
        const defaultConfig = {
            intensity: 10,
            duration: 200,
            repeat: 3,
            yoyo: true
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            x: target.x + finalConfig.intensity,
            duration: finalConfig.duration,
            repeat: finalConfig.repeat,
            yoyo: finalConfig.yoyo,
            ease: 'Power2.easeInOut'
        });
    }

    /**
     * Создает анимацию масштабирования
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createScaleAnimation(scene, target, config = {}) {
        const defaultConfig = {
            scale: { from: 1, to: 1.5 },
            duration: 300,
            yoyo: true,
            ease: 'Back.easeOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            duration: finalConfig.duration,
            yoyo: finalConfig.yoyo,
            ease: finalConfig.ease
        });
    }

    /**
     * Останавливает все анимации объекта
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     */
    static stopAllAnimations(scene, target) {
        scene.tweens.killTweensOf(target);
    }

    /**
     * Создает цепочку анимаций
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Array} animations - Массив конфигураций анимаций
     * @returns {Phaser.Tweens.Timeline} Созданная временная линия
     */
    static createAnimationChain(scene, target, animations) {
        const timeline = scene.tweens.timeline({
            targets: target,
            tweens: animations
        });

        return timeline;
    }

    /**
     * Создает эффект частиц для усиленных врагов
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект (враг)
     * @param {string} level - Уровень усиления ('elite' или 'champion')
     * @returns {Phaser.GameObjects.Particles.ParticleEmitter} Созданная система частиц
     */
    static createEnhancementParticles(scene, target, level) {
        const particleConfigs = {
            elite: {
                scale: { start: 0.2, end: 0 },
                speed: { min: 20, max: 50 },
                lifespan: 2000,
                quantity: 2,
                frequency: 500,
                alpha: { start: 1, end: 0 },
                emitZone: { radius: 30, quantity: 3 },
                tint: 0xffffff
            },
            champion: {
                scale: { start: 0.3, end: 0 },
                speed: { min: 30, max: 80 },
                lifespan: 2000,
                quantity: 3,
                frequency: 200,
                alpha: { start: 1, end: 0 },
                emitZone: { radius: 40, quantity: 5 },
                tint: 0xffaa00
            }
        };

        const config = particleConfigs[level];
        if (!config) {
            return null;
        }

        // Создаем зону эмиссии частиц
        const emitZone = {
            type: 'edge',
            source: new Phaser.Geom.Circle(0, 0, config.emitZone.radius),
            quantity: config.emitZone.quantity
        };

        // Создаем частицы в позиции цели
        const particles = scene.add.particles(target.x, target.y, 'sparkle', {
            scale: config.scale,
            speed: config.speed,
            lifespan: config.lifespan,
            quantity: config.quantity,
            frequency: config.frequency,
            alpha: config.alpha,
            emitZone: emitZone,
            tint: config.tint
        });

        return particles;
    }

    /**
     * Обновляет позицию частиц усиления
     * @param {Phaser.GameObjects.Particles.ParticleEmitter} particles - Система частиц
     * @param {number} x - X координата
     * @param {number} y - Y координата
     */
    static updateParticlesPosition(particles, x, y) {
        if (particles && particles.active) {
            particles.setPosition(x, y);
        }
    }

    /**
     * Уничтожает систему частиц
     * @param {Phaser.GameObjects.Particles.ParticleEmitter} particles - Система частиц
     */
    static destroyParticles(particles) {
        if (particles) {
            particles.destroy();
        }
    }

    // ==================== БОЕВЫЕ ЭФФЕКТЫ ====================

    /**
     * Создает эффект исчезновения объекта
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createDisappearEffect(scene, target, config = {}) {
        const defaultConfig = {
            duration: 500,
            scale: { to: 0 },
            alpha: { to: 0 },
            ease: 'Power2.easeIn',
            onComplete: null
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            alpha: finalConfig.alpha.to,
            duration: finalConfig.duration,
            ease: finalConfig.ease,
            onComplete: finalConfig.onComplete
        });
    }

    /**
     * Создает эффект вспышки (масштабирование)
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createFlashEffect(scene, target, config = {}) {
        const defaultConfig = {
            scale: { to: 1.2 },
            duration: 200,
            yoyo: true,
            ease: 'Power2.easeOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            duration: finalConfig.duration,
            yoyo: finalConfig.yoyo,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает эффект тряски
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createShakeEffect(scene, target, config = {}) {
        const defaultConfig = {
            intensity: 5,
            duration: 50,
            repeat: 3,
            yoyo: true,
            ease: 'Power2.easeInOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            x: target.x + finalConfig.intensity,
            duration: finalConfig.duration,
            repeat: finalConfig.repeat,
            yoyo: finalConfig.yoyo,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает эффект взрыва (масштабирование с исчезновением)
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createExplosionEffect(scene, target, config = {}) {
        const defaultConfig = {
            scale: { to: 1.5 },
            alpha: { to: 0 },
            duration: 300,
            ease: 'Power2.easeOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            alpha: finalConfig.alpha.to,
            duration: finalConfig.duration,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает эффект волны (движение к цели)
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createWaveEffect(scene, target, config = {}) {
        const defaultConfig = {
            x: target.x,
            y: target.y,
            duration: 1000,
            ease: 'Power2.easeInOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            x: finalConfig.x,
            y: finalConfig.y,
            duration: finalConfig.duration,
            ease: finalConfig.ease
        });
    }

    // ==================== UI ЭФФЕКТЫ ====================

    /**
     * Создает эффект дрейфа текста (движение вверх с исчезновением)
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createTextDriftEffect(scene, target, config = {}) {
        const defaultConfig = {
            driftDistance: 50,
            duration: 1000,
            alpha: { to: 0 },
            ease: 'Power2.easeOut',
            onComplete: null
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            y: target.y - finalConfig.driftDistance,
            alpha: finalConfig.alpha.to,
            duration: finalConfig.duration,
            ease: finalConfig.ease,
            onComplete: finalConfig.onComplete
        });
    }

    /**
     * Создает эффект появления текста (масштабирование)
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createTextAppearEffect(scene, target, config = {}) {
        const defaultConfig = {
            scale: { to: 1.2 },
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            duration: finalConfig.duration,
            yoyo: finalConfig.yoyo,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает эффект пульсации текста
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createTextPulseEffect(scene, target, config = {}) {
        const defaultConfig = {
            scale: { to: 1.1 },
            duration: 150,
            yoyo: true,
            repeat: 2,
            ease: 'Power2.easeInOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            duration: finalConfig.duration,
            yoyo: finalConfig.yoyo,
            repeat: finalConfig.repeat,
            ease: finalConfig.ease
        });
    }

    // ==================== ЭФФЕКТЫ ПРЕДМЕТОВ ====================

    /**
     * Создает эффект появления предмета
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createItemAppearEffect(scene, target, config = {}) {
        const defaultConfig = {
            alpha: { to: 1 },
            scale: { to: 0.6 },
            duration: 300,
            ease: 'Back.easeOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            alpha: finalConfig.alpha.to,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            duration: finalConfig.duration,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает эффект пульсации предмета
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createItemPulseEffect(scene, target, config = {}) {
        const defaultConfig = {
            scale: { to: 0.7 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            duration: finalConfig.duration,
            yoyo: finalConfig.yoyo,
            repeat: finalConfig.repeat,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает эффект сбора предмета
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createItemCollectEffect(scene, target, config = {}) {
        const defaultConfig = {
            scale: { to: 1.2 },
            alpha: { to: 0 },
            duration: 200,
            ease: 'Power2.easeOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            alpha: finalConfig.alpha.to,
            duration: finalConfig.duration,
            ease: finalConfig.ease
        });
    }

    // ==================== ЭФФЕКТЫ ОБЪЕКТОВ ====================

    /**
     * Создает эффект свечения (масштабирование)
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createGlowEffect(scene, target, config = {}) {
        const defaultConfig = {
            scale: { to: 1.1 },
            duration: 200,
            yoyo: true,
            ease: 'Power2.easeInOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            scaleX: finalConfig.scale.to,
            scaleY: finalConfig.scale.to,
            duration: finalConfig.duration,
            yoyo: finalConfig.yoyo,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает эффект получения урона (изменение цвета)
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createDamageEffect(scene, target, config = {}) {
        const defaultConfig = {
            tint: 0xff0000,
            duration: 200,
            yoyo: true,
            ease: 'Power2.easeInOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            tint: finalConfig.tint,
            duration: finalConfig.duration,
            yoyo: finalConfig.yoyo,
            ease: finalConfig.ease
        });
    }

    /**
     * Создает эффект мерцания
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Phaser.Tweens.Tween} Созданная анимация
     */
    static createFlickerEffect(scene, target, config = {}) {
        const defaultConfig = {
            alpha: { to: 0.3 },
            duration: 100,
            yoyo: true,
            repeat: 3,
            ease: 'Power2.easeInOut'
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        return scene.tweens.add({
            targets: target,
            alpha: finalConfig.alpha.to,
            duration: finalConfig.duration,
            yoyo: finalConfig.yoyo,
            repeat: finalConfig.repeat,
            ease: finalConfig.ease
        });
    }

    // ==================== КОМБИНИРОВАННЫЕ ЭФФЕКТЫ ====================

    /**
     * Создает полный эффект индикатора урона (дрейф + появление + пульсация)
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Array} Массив созданных анимаций
     */
    static createDamageIndicatorEffect(scene, target, config = {}) {
        const defaultConfig = {
            driftDistance: 50,
            driftDuration: 1000,
            appearDuration: 200,
            pulseDuration: 150,
            pulseRepeat: 2
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        const animations = [];
        
        // Дрейф вверх с исчезновением
        animations.push(this.createTextDriftEffect(scene, target, {
            driftDistance: finalConfig.driftDistance,
            duration: finalConfig.driftDuration,
            onComplete: () => target.destroy()
        }));
        
        // Появление
        animations.push(this.createTextAppearEffect(scene, target, {
            duration: finalConfig.appearDuration
        }));
        
        // Пульсация
        animations.push(this.createTextPulseEffect(scene, target, {
            duration: finalConfig.pulseDuration,
            repeat: finalConfig.pulseRepeat
        }));
        
        return animations;
    }

    /**
     * Создает полный эффект сбора предмета (масштабирование + исчезновение + частицы)
     * @param {Phaser.Scene} scene - Сцена
     * @param {Phaser.GameObjects.GameObject} target - Целевой объект
     * @param {Object} config - Конфигурация анимации
     * @returns {Array} Массив созданных анимаций
     */
    static createItemCollectFullEffect(scene, target, config = {}) {
        const defaultConfig = {
            scale: { to: 1.2 },
            duration: 200,
            particleCount: 5,
            particleSpread: 50
        };

        const finalConfig = { ...defaultConfig, ...config };
        
        const animations = [];
        
        // Эффект сбора
        animations.push(this.createItemCollectEffect(scene, target, {
            scale: finalConfig.scale,
            duration: finalConfig.duration
        }));
        
        // Создаем частицы (если нужно)
        if (finalConfig.particleCount > 0) {
            for (let i = 0; i < finalConfig.particleCount; i++) {
                const particle = scene.add.circle(
                    target.x + GeometryUtils.randomBetween(-finalConfig.particleSpread, finalConfig.particleSpread),
                    target.y + GeometryUtils.randomBetween(-finalConfig.particleSpread, finalConfig.particleSpread),
                    2,
                    0xffffff
                );
                
                animations.push(scene.tweens.add({
                    targets: particle,
                    x: particle.x + GeometryUtils.randomBetween(-50, 50),
                    y: particle.y + GeometryUtils.randomBetween(-50, 50),
                    alpha: 0,
                    duration: 500,
                    ease: 'Power2.easeOut',
                    onComplete: () => particle.destroy()
                }));
            }
        }
        
        return animations;
    }
}
