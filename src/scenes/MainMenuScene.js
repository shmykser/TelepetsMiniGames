import Phaser from 'phaser';
export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }
    create() {
        const { width, height } = this.scale;
        this.add.text(width / 2, height * 0.35, 'Telepets', {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5);
        const play = this.add.text(width / 2, height * 0.55, 'Играть', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#22c55e'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        play.on('pointerup', () => {
            this.scene.start('Game');
        });
    }
}
