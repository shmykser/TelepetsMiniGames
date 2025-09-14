import Phaser from 'phaser';
import { settings } from '@config/settings';
import { PreloadScene } from '@/scenes/PreloadScene';
import { MenuScene } from '@/scenes/MenuScene';
import { EggDefense } from '@/scenes/EggDefense';
import { TestEffects } from '@/scenes/TestEffects';
import { SpriteTestScene } from '@/scenes/SpriteTestScene';
import { initTelegram } from './telegram/TelegramInit';
const config = {
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
    scene: [PreloadScene, MenuScene, EggDefense, TestEffects, SpriteTestScene],
    render: {
        pixelArt: false,
        antialias: true
    }
};

// Инициализируем Telegram WebApp SDK (мягко в вебе)
initTelegram();

// eslint-disable-next-line no-new
new Phaser.Game(config);
