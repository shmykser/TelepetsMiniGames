import Phaser from 'phaser';
export class PreloadScene extends Phaser.Scene {
    constructor() {
        super('Preload');
    }
    preload() {
        const { width, height } = this.scale;
        const barBg = this.add.rectangle(width / 2, height / 2, width * 0.6, 10, 0x334155);
        const barFg = this.add.rectangle(barBg.x - barBg.width / 2, barBg.y, 1, 8, 0x22c55e).setOrigin(0, 0.5);
        this.load.on('progress', (value) => {
            barFg.width = Math.max(1, barBg.width * value);
        });
        // Пример ассетов (можно заменить)
        // this.load.image('logo', 'assets/logo.png');
    }
    create() {
        this.scene.start('MainMenu');
    }
}
