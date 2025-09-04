import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  private score = 0;
  private label!: Phaser.GameObjects.Text;

  constructor() {
    super('UI');
  }

  create(): void {
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

  private updateScore(delta: number): void {
    this.score += delta;
    this.label.setText(`Score: ${this.score}`);
  }
}


