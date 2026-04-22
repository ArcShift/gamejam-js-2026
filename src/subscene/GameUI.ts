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
        gameScene.events.on('cell-selected', (data: { unit: any, scrap: any, canAttack?: boolean, attackCost?: number }) => {
            this.sidebar.updateDetails(data.unit, data.scrap);
            
            // Check if we should show the collect button
            // If selecting a cell with both player AND scrap
            if (data.unit && data.unit.name === 'CORE-01' && data.scrap) {
                this.sidebar.showCollectButton(true, data.scrap.value);
            } else {
                this.sidebar.showCollectButton(false);
            }

            if (data.canAttack) {
                this.sidebar.showAttackButton(true, data.attackCost);
            } else {
                this.sidebar.showAttackButton(false);
            }
        });

        // Forward collect request to Game scene
        this.events.on('collect-scrap-request', () => {
            gameScene.events.emit('collect-scrap-action');
        });

        // Forward attack request to Game scene
        this.events.on('attack-request', () => {
            gameScene.events.emit('attack-action');
        });

        // Forward switch weapon request to Game scene
        this.events.on('switch-weapon-request', () => {
            gameScene.events.emit('switch-weapon-action');
        });

        // Forward summon request to Game scene
        this.events.on('open-summon-panel-request', () => {
            gameScene.events.emit('open-summon-action');
        });

        this.events.on('cancel-summon-request', () => {
            gameScene.events.emit('cancel-summon-action');
        });

        this.events.on('select-machine-to-summon', (index: number) => {
            gameScene.events.emit('select-machine-action', index);
        });

        this.events.on('toggle-auto-request', () => {
            gameScene.events.emit('toggle-auto-action');
        });

        this.events.on('wait-request', () => {
            gameScene.events.emit('wait-action');
        });

        // Listen for panel open from game
        gameScene.events.on('summon-panel-opened', (data: { machines: any[], scrap: number }) => {
            this.sidebar.openSummonPanel(data.machines, data.scrap);
        });

        gameScene.events.on('summon-panel-closed', () => {
            this.sidebar.closeSummonPanel();
        });

        // Listen for AP updates from the Game scene
        gameScene.events.on('ap-updated', (data: { ap: number, turn: number, activeUnitName: string }) => {
            this.sidebar.updateAP(data.ap, data.turn, data.activeUnitName);
        });

        gameScene.events.on('auto-toggled', (isEnabled: boolean) => {
            this.sidebar.updateAutoButton(isEnabled);
        });

        // Clear details when mission restarts or UI is reset
        this.events.on('shutdown', () => {
            gameScene.events.off('cell-selected');
            gameScene.events.off('ap-updated');
            gameScene.events.off('collect-scrap-action');
        });
    }
}
