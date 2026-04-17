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
    }
}
