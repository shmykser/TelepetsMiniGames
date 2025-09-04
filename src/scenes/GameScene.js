import Phaser from 'phaser';
export class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
        Object.defineProperty(this, "player", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cursors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    create() {
        const { width, height } = this.scale;
        // Генерируем простую текстуру игрока (кружок), чтобы не зависеть от ассетов
        const g = this.add.graphics({ x: 0, y: 0 });
        g.fillStyle(0x22c55e, 1);
        g.fillCircle(16, 16, 16);
        g.generateTexture('player', 32, 32);
        g.destroy();
        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setCircle(16).setBounce(0.2).setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        // Запускаем UI поверх
        this.scene.run('UI');
    }
    update() {
        if (!this.player)
            return;
        const speed = 200;
        this.player.setVelocity(0);
        if (this.cursors.left?.isDown)
            this.player.setVelocityX(-speed);
        else if (this.cursors.right?.isDown)
            this.player.setVelocityX(speed);
        if (this.cursors.up?.isDown)
            this.player.setVelocityY(-speed);
        else if (this.cursors.down?.isDown)
            this.player.setVelocityY(speed);
    }
}
