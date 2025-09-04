import Phaser from 'phaser';
export class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }
    preload() {
        // Здесь можно загрузить минимальные ассеты для прелоадера (например, логотип)
    }
    create() {
        this.scene.start('Preload');
    }
}
