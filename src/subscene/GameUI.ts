import { Scene } from 'phaser';
import { Sidebar } from '../ui/Sidebar';

export class GameUI extends Scene {
    sidebar: Sidebar;

    constructor() {
        super('GameUI');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const sidebarWidth = 250;

        this.sidebar = new Sidebar(this, width - sidebarWidth, 0, sidebarWidth, height);

        // Listen for selection events from the Game scene
        const gameScene = this.scene.get('Game');
        gameScene.events.on('cell-selected', (data: { unit: any, scrap: any }) => {
            this.sidebar.updateDetails(data.unit, data.scrap);
        });

        // Clear details when mission restarts or UI is reset
        this.events.on('shutdown', () => {
            gameScene.events.off('cell-selected');
        });
    }
}
