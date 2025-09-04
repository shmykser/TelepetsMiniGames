import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // Здесь можно загрузить минимальные ассеты для прелоадера (например, логотип)
  }

  create(): void {
    this.scene.start('Preload');
  }
}


