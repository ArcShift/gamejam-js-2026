import { Scene } from 'phaser';
import { Sidebar } from '../ui/Sidebar';
import { Map } from '../ui/Map';
import { ICampaign } from '../entity/Campaign';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    sidebar: Sidebar;
    map: Map;
    mission: ICampaign;

    constructor ()
    {
        super('Game');
    }

    init (data: { mission: ICampaign })
    {
        this.mission = data.mission;
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x0a0a0a);

        const width = this.scale.width;
        const height = this.scale.height;
        const sidebarWidth = 250;

        // Initialize Map
        if (this.mission) {
            this.map = new Map(this, 50, 50, this.mission);
            
            // Basic camera bounds based on map size
            this.camera.setBounds(0, 0, this.map.width + 100 + sidebarWidth, this.map.height + 100);
            
            // Make map draggable for large maps
            this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
                if (!pointer.isDown) return;
                this.camera.scrollX -= (pointer.x - pointer.prevPosition.x) / this.camera.zoom;
                this.camera.scrollY -= (pointer.y - pointer.prevPosition.y) / this.camera.zoom;
            });
        }

        // Sidebar stays fixed to screen
        this.sidebar = new Sidebar(this, width - sidebarWidth, 0, sidebarWidth, height);
        this.sidebar.setScrollFactor(0);
    }
}
