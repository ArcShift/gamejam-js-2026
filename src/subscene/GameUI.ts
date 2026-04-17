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
            
            // Check if we should show the collect button
            // If selecting a cell with both player AND scrap
            if (data.unit && data.unit.name === 'CORE-01' && data.scrap) {
                this.sidebar.showCollectButton(true, data.scrap.value);
            } else {
                this.sidebar.showCollectButton(false);
            }
        });

        // Forward collect request to Game scene
        this.events.on('collect-scrap-request', () => {
            gameScene.events.emit('collect-scrap-action');
        });

        // Listen for AP updates from the Game scene
        gameScene.events.on('ap-updated', (data: { ap: number, turn: number, activeUnitName: string }) => {
            this.sidebar.updateAP(data.ap, data.turn, data.activeUnitName);
        });

        // Clear details when mission restarts or UI is reset
        this.events.on('shutdown', () => {
            gameScene.events.off('cell-selected');
            gameScene.events.off('ap-updated');
            gameScene.events.off('collect-scrap-action');
        });
    }
}
