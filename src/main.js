import Phaser from 'phaser';
import { PHASER_SETTINGS } from './settings/GameSettings.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { EggDefense } from './scenes/EggDefense.js';
import { TestEffects } from './scenes/TestEffects.js';
import { SpriteTestScene } from './scenes/SpriteTestScene.js';
import { DemoComponents } from './scenes/DemoComponents.js';
import { TestGestures } from './scenes/TestGestures.js';
import { TestBehaviors } from './scenes/TestBehaviors.js';
import { initTelegram } from './telegram/TelegramInit.js';
const config = {
    type: Phaser.AUTO,
    backgroundColor: PHASER_SETTINGS.backgroundColor,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: PHASER_SETTINGS.width,
        height: PHASER_SETTINGS.height,
        parent: 'game',
        min: {
            width: PHASER_SETTINGS.responsive.minWidth,
            height: PHASER_SETTINGS.responsive.minHeight
        },
        max: {
            width: PHASER_SETTINGS.responsive.maxWidth,
            height: PHASER_SETTINGS.responsive.maxHeight
        }
    },
    physics: PHASER_SETTINGS.physics,
    scene: [PreloadScene, MenuScene, TestEffects, SpriteTestScene, DemoComponents, TestGestures, TestBehaviors],
    render: {
        pixelArt: false,
        antialias: true
    }
};

// Инициализируем Telegram WebApp SDK (мягко в вебе)
initTelegram();

// eslint-disable-next-line no-new
new Phaser.Game(config);
