import Phaser from 'phaser';
import { PHASER_SETTINGS } from '@/settings/GameSettings';
import { PreloadScene } from '@/scenes/PreloadScene';
import { MenuScene } from '@/scenes/MenuScene';
import { EggDefense } from '@/scenes/EggDefense';
import { TestEffects } from '@/scenes/TestEffects';
import { SpriteTestScene } from '@/scenes/SpriteTestScene';
import { DemoComponents } from '@/scenes/DemoComponents';
import { TestGestures } from '@/scenes/TestGestures';
import { initTelegram } from './telegram/TelegramInit';
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
    scene: [PreloadScene, MenuScene, EggDefense, TestEffects, SpriteTestScene, DemoComponents, TestGestures],
    render: {
        pixelArt: false,
        antialias: true
    }
};

// Инициализируем Telegram WebApp SDK (мягко в вебе)
initTelegram();

// eslint-disable-next-line no-new
new Phaser.Game(config);
