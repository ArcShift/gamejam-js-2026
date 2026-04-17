import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Campaign } from './scenes/Campaign';
import { Pause } from './subscene/Pause';
import { GameUI } from './subscene/GameUI';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

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