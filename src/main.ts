import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Campaign } from './scenes/Campaign';
import { Pause } from './subscene/Pause';
import { GameUI } from './subscene/GameUI';
import { Narration } from './scenes/Narration';
import { AUTO, Game, GameObjects } from 'phaser';
import { Preloader } from './scenes/Preloader';

// Set Orbitron as the default font for all Phaser Text objects
// @ts-ignore
GameObjects.TextStyle.prototype.fontFamily = 'Orbitron';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig

export const GW: number = 1024;
export const GH: number = 768;
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: GW,
    height: GH,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Campaign,
        Narration,
        MainGame,
        GameOver,
        Pause,
        GameUI
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

document.addEventListener('DOMContentLoaded', () => {

    StartGame('game-container');

});