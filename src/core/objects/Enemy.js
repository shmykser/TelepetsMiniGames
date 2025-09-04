import { GameObject } from '../GameObject';
import { enemyTypes } from '../types/enemyTypes';
export class Enemy extends GameObject {
    constructor(scene, config) {
        const enemyType = config.enemyType || 'ant';
        const enemyData = enemyTypes[enemyType];
        // Настройки из типа врага
        const enemyConfig = {
            health: config.health || enemyData.health,
            damage: config.damage || enemyData.damage,
            speed: config.speed || enemyData.speed * 20, // конвертируем 1-10 в пиксели
            cooldown: config.cooldown || enemyData.cooldown * 1000, // конвертируем секунды в мс
            attackRange: config.attackRange || 40,
            x: config.x,
            y: config.y,
            texture: config.texture
        };
        super(scene, enemyConfig);
        Object.defineProperty(this, "_enemyType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_detectionRange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_enemyData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_lastPlayerPosition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "_isChasing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_chaseTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._id = `${enemyType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this._enemyType = enemyType;
        this._detectionRange = config.detectionRange || 150;
        this._enemyData = enemyData;
        // Настраиваем свойства из типа врага
        this._size = enemyData.size;
        this._canFly = enemyData.canFly;
        // Настраиваем поведение в зависимости от типа
        this.setupEnemyBehavior();
    }
    setupEnemyBehavior() {
        // Создаем анимации для врага
        this.createAnimations();
        // Настраиваем физику
        this.physicsBody.setBounce(0.1);
        this.physicsBody.setDrag(50, 50);
    }
    createAnimations() {
        // Создаем анимации в зависимости от типа врага
        switch (this._enemyType) {
            case 'ant':
                this.createAntAnimations();
                break;
            case 'beetle':
                this.createBeetleAnimations();
                break;
            case 'spider':
                this.createSpiderAnimations();
                break;
            case 'fly':
                this.createFlyAnimations();
                break;
            case 'mosquito':
                this.createMosquitoAnimations();
                break;
            case 'rhinoceros':
                this.createRhinocerosAnimations();
                break;
        }
    }
    createAntAnimations() {
        // Анимация ходьбы муравья
        this.scene.anims.create({
            key: `ant_walk_${this.id}`,
            frames: [
                { key: 'ant_walk_0' },
                { key: 'ant_walk_1' },
                { key: 'ant_walk_2' },
                { key: 'ant_walk_3' }
            ],
            frameRate: 8,
            repeat: -1
        });
        // Анимация атаки муравья
        this.scene.anims.create({
            key: `ant_attack_${this.id}`,
            frames: [
                { key: 'ant' },
                { key: 'ant_walk_1' },
                { key: 'ant' }
            ],
            frameRate: 12,
            repeat: 0
        });
    }
    createBeetleAnimations() {
        this.scene.anims.create({
            key: `beetle_walk_${this.id}`,
            frames: [
                { key: 'beetle_walk_0' },
                { key: 'beetle_walk_1' },
                { key: 'beetle_walk_2' },
                { key: 'beetle_walk_3' }
            ],
            frameRate: 6,
            repeat: -1
        });
        this.scene.anims.create({
            key: `beetle_attack_${this.id}`,
            frames: [
                { key: 'beetle' },
                { key: 'beetle_walk_1' },
                { key: 'beetle' }
            ],
            frameRate: 10,
            repeat: 0
        });
    }
    createSpiderAnimations() {
        this.scene.anims.create({
            key: `spider_walk_${this.id}`,
            frames: [
                { key: 'spider_walk_0' },
                { key: 'spider_walk_1' },
                { key: 'spider_walk_2' },
                { key: 'spider_walk_3' }
            ],
            frameRate: 4,
            repeat: -1
        });
        this.scene.anims.create({
            key: `spider_attack_${this.id}`,
            frames: [
                { key: 'spider' },
                { key: 'spider_walk_1' },
                { key: 'spider' }
            ],
            frameRate: 8,
            repeat: 0
        });
    }
    createFlyAnimations() {
        this.scene.anims.create({
            key: `fly_hover_${this.id}`,
            frames: [
                { key: 'fly_hover_0' },
                { key: 'fly_hover_1' },
                { key: 'fly_hover_2' },
                { key: 'fly_hover_3' }
            ],
            frameRate: 12,
            repeat: -1
        });
        this.scene.anims.create({
            key: `fly_attack_${this.id}`,
            frames: [
                { key: 'fly' },
                { key: 'fly_hover_1' },
                { key: 'fly' }
            ],
            frameRate: 15,
            repeat: 0
        });
    }
    createMosquitoAnimations() {
        // Комар использует простую анимацию покачивания
        this.scene.anims.create({
            key: `mosquito_hover_${this.id}`,
            frames: [
                { key: 'mosquito' }
            ],
            frameRate: 1,
            repeat: -1
        });
        this.scene.anims.create({
            key: `mosquito_attack_${this.id}`,
            frames: [
                { key: 'mosquito' }
            ],
            frameRate: 1,
            repeat: 0
        });
    }
    createRhinocerosAnimations() {
        // Носорог использует статичную анимацию
        this.scene.anims.create({
            key: `rhinoceros_idle_${this.id}`,
            frames: [
                { key: 'rhinoceros' }
            ],
            frameRate: 1,
            repeat: -1
        });
        this.scene.anims.create({
            key: `rhinoceros_attack_${this.id}`,
            frames: [
                { key: 'rhinoceros' }
            ],
            frameRate: 1,
            repeat: 0
        });
    }
    // Переопределяем update для ИИ поведения
    update(_time, _delta) {
        if (!this._isAlive || !this.scene)
            return;
        // Ищем игрока в сцене
        const player = this.findPlayer();
        if (!player)
            return;
        const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        // Логика поведения в зависимости от расстояния
        if (distanceToPlayer <= this._detectionRange) {
            this.handlePlayerDetected(player, distanceToPlayer);
        }
        else {
            this.handlePlayerLost();
        }
        // Вызываем родительский update для базовой логики
        super.update(_time, _delta);
    }
    findPlayer() {
        // Базовый поиск игрока - можно переопределить в дочерних классах
        return this._target;
    }
    handlePlayerDetected(player, distance) {
        this._isChasing = true;
        this._lastPlayerPosition = new Phaser.Math.Vector2(player.x, player.y);
        if (distance <= this.attackRange) {
            // В радиусе атаки - атакуем
            this.stopMovement();
            this.attack(player);
        }
        else {
            // Вне радиуса атаки - преследуем
            this.chasePlayer(player);
        }
    }
    handlePlayerLost() {
        if (this._isChasing) {
            // Игрок потерян - продолжаем преследование последней известной позиции
            if (this._lastPlayerPosition) {
                this.startMovementToPoint(this._lastPlayerPosition.x, this._lastPlayerPosition.y);
                // Через некоторое время прекращаем преследование
                if (this._chaseTimer) {
                    this._chaseTimer.destroy();
                }
                this._chaseTimer = this.scene.time.delayedCall(3000, () => {
                    this._isChasing = false;
                    this._lastPlayerPosition = null;
                    this.stopMovement();
                    this.playIdleAnimation();
                });
            }
        }
        else {
            // Если не преследуем, воспроизводим анимацию покоя
            this.playIdleAnimation();
        }
    }
    chasePlayer(player) {
        // Базовое преследование - движемся к игроку
        this.startMovementToPoint(player.x, player.y);
        // Воспроизводим анимацию движения
        this.playMovementAnimation();
    }
    playMovementAnimation() {
        const animationKey = this.getMovementAnimationKey();
        if (animationKey && !this.anims.isPlaying) {
            this.play(animationKey);
        }
    }
    playIdleAnimation() {
        const animationKey = this.getIdleAnimationKey();
        if (animationKey && !this.anims.isPlaying) {
            this.play(animationKey);
        }
    }
    getMovementAnimationKey() {
        switch (this._enemyType) {
            case 'ant': return `ant_walk_${this.id}`;
            case 'beetle': return `beetle_walk_${this.id}`;
            case 'spider': return `spider_walk_${this.id}`;
            case 'fly': return `fly_hover_${this.id}`;
            case 'mosquito': return `mosquito_hover_${this.id}`;
            case 'rhinoceros': return `rhinoceros_idle_${this.id}`;
            default: return null;
        }
    }
    getIdleAnimationKey() {
        switch (this._enemyType) {
            case 'ant': return 'ant';
            case 'beetle': return 'beetle';
            case 'spider': return 'spider';
            case 'fly': return 'fly';
            case 'mosquito': return 'mosquito';
            case 'rhinoceros': return 'rhinoceros';
            default: return null;
        }
    }
    getAttackAnimationKey() {
        switch (this._enemyType) {
            case 'ant': return `ant_attack_${this.id}`;
            case 'beetle': return `beetle_attack_${this.id}`;
            case 'spider': return `spider_attack_${this.id}`;
            case 'fly': return `fly_attack_${this.id}`;
            case 'mosquito': return `mosquito_attack_${this.id}`;
            case 'rhinoceros': return `rhinoceros_attack_${this.id}`;
            default: return null;
        }
    }
    // Переопределяем атаку для разных типов врагов
    attack(target) {
        if (!this._isAlive || !this.scene)
            return false;
        const attackTarget = target || this._target;
        if (!attackTarget || !attackTarget.isAlive)
            return false;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, attackTarget.x, attackTarget.y);
        if (distance > this.attackRange)
            return false;
        // Базовая атака для всех типов врагов
        this.performBasicAttack(attackTarget);
        return true;
    }
    performBasicAttack(target) {
        // Воспроизводим анимацию атаки
        const attackAnimationKey = this.getAttackAnimationKey();
        if (attackAnimationKey) {
            this.play(attackAnimationKey);
        }
        // Базовая атака
        target.takeDamage(this.damage);
        this.emit('attack', target, this.damage);
        // Эффект атаки
        this.shake(100, 2);
    }
    /**
     * Получает реакцию врага на защитный объект
     */
    getReactionToDefence(defenceType) {
        const reactions = this._enemyData.reactions;
        switch (defenceType) {
            case 'sugar': return reactions.sugar;
            case 'stone': return reactions.stone;
            case 'crack': return reactions.crack;
            case 'spikes': return reactions.spikes;
            case 'madCucumber': return reactions.madCucumber;
            case 'pit': return reactions.pit;
            default: return 'ignore';
        }
    }
    // Геттеры
    get id() { return this._id; }
    get enemyType() { return this._enemyType; }
    get detectionRange() { return this._detectionRange; }
    get isChasing() { return this._isChasing; }
    get enemyData() { return this._enemyData; }
    // Сеттеры
    set enemyType(value) {
        this._enemyType = value;
        this._enemyData = enemyTypes[value];
        this.setupEnemyBehavior();
    }
    set detectionRange(value) { this._detectionRange = Math.max(0, value); }
    // Уничтожение с очисткой таймеров
    destroy() {
        if (this._chaseTimer) {
            this._chaseTimer.destroy();
            this._chaseTimer = undefined;
        }
        super.destroy();
    }
}
