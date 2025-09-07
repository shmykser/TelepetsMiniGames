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
}
