import Phaser from 'phaser';
export class UIScene extends Phaser.Scene {
    constructor() {
        super('UI');
        Object.defineProperty(this, "score", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    create() {
        this.label = this.add.text(12, 12, `Score: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff'
        }).setScrollFactor(0);
        const inc = this.add.text(12, 40, '+1', { color: '#22c55e', fontSize: '20px' })
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0);
        inc.on('pointerup', () => this.updateScore(1));
    }
    updateScore(delta) {
        this.score += delta;
        this.label.setText(`Score: ${this.score}`);
    }
}
