import Phaser from 'phaser';
import { settings } from '@config/settings';
import { MenuScene } from '@/scenes/MenuScene';
import { GestureTestScene } from '@/scenes/GestureTestScene';
import { MovementTestScene } from '@/scenes/MovementTestScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: settings.backgroundColor,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: settings.width,
    height: settings.height,
    parent: 'game',
    min: {
      width: settings.responsive.minWidth,
      height: settings.responsive.minHeight
    },
    max: {
      width: settings.responsive.maxWidth,
      height: settings.responsive.maxHeight
    }
  },
  physics: settings.physics,
  scene: [MenuScene, GestureTestScene, MovementTestScene],
  render: {
    pixelArt: false,
    antialias: true
  }
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
