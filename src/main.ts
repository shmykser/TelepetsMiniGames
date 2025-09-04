import Phaser from 'phaser';
import { settings } from '@config/settings';
import { BootScene } from '@/scenes/BootScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import { MainMenuScene } from '@/scenes/MainMenuScene';
import { GameScene } from '@/scenes/GameScene';
import { UIScene } from '@/scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: settings.backgroundColor,
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: settings.width,
    height: settings.height,
    parent: 'game'
  },
  physics: settings.physics,
  scene: [BootScene, PreloadScene, MainMenuScene, GameScene, UIScene],
  render: {
    pixelArt: false,
    antialias: true
  }
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
