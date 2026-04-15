import { Scene, GameObjects } from 'phaser';
import { ICampaign } from '../entity/Campaign';

export class Map extends GameObjects.Container {
    private cellSize: number = 64;
    private gap: number = 4;

    constructor(scene: Scene, x: number, y: number, campaign: ICampaign) {
        super(scene, x, y);

        const totalCellSize = this.cellSize + this.gap;
        const gridWidth = campaign.map_width * totalCellSize - this.gap;
        const gridHeight = campaign.map_height * totalCellSize - this.gap;

        // Background shadow/container area
        const bg = scene.add.rectangle(-10, -10, gridWidth + 20, gridHeight + 20, 0x000000, 0.5);
        bg.setOrigin(0);
        this.add(bg);

        // Create the grid cells using individual rectangles for better lifecycle stability
        for (let gy = 0; gy < campaign.map_height; gy++) {
            for (let gx = 0; gx < campaign.map_width; gx++) {
                const cx = gx * totalCellSize;
                const cy = gy * totalCellSize;

                const cell = scene.add.rectangle(cx, cy, this.cellSize, this.cellSize, 0x1a1a1a);
                cell.setOrigin(0);
                cell.setStrokeStyle(1, 0x333333);
                
                // Tech border detail
                const inner = scene.add.rectangle(cx + 4, cy + 4, this.cellSize - 8, this.cellSize - 8);
                inner.setOrigin(0);
                inner.setStrokeStyle(1, 0x444444, 0.5);

                this.add([cell, inner]);
            }
        }

        // Optional: Add some "glow" to the edges of the map
        const borderGlow = scene.add.rectangle(-2, -2, gridWidth + 4, gridHeight + 4);
        borderGlow.setOrigin(0);
        borderGlow.setStrokeStyle(2, 0x00ffff, 0.3);
        this.add(borderGlow);

        scene.add.existing(this);
        
        // Make the container size known for potential camera bounds
        this.setSize(gridWidth, gridHeight);
    }
}
