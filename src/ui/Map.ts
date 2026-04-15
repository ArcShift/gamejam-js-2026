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

        // We use a Graphics object for the grid to keep it performance-friendly
        const graphics = scene.add.graphics();
        this.add(graphics);

        // Draw the grid cells
        graphics.fillStyle(0x1a1a1a, 1);
        graphics.lineStyle(2, 0x333333, 1);

        for (let gy = 0; gy < campaign.map_height; gy++) {
            for (let gx = 0; gx < campaign.map_width; gx++) {
                const cx = gx * totalCellSize;
                const cy = gy * totalCellSize;

                // Draw cell background
                graphics.fillRect(cx, cy, this.cellSize, this.cellSize);
                
                // Draw cell border
                graphics.strokeRect(cx, cy, this.cellSize, this.cellSize);

                // Add a subtle tech-style inner detail
                graphics.lineStyle(1, 0x444444, 0.5);
                graphics.strokeRect(cx + 4, cy + 4, this.cellSize - 8, this.cellSize - 8);
            }
        }

        // Optional: Add some "glow" to the edges of the map
        const glow = scene.add.graphics();
        glow.lineStyle(4, 0x00ffff, 0.1);
        glow.strokeRect(-2, -2, gridWidth + 4, gridHeight + 4);
        this.add(glow);

        scene.add.existing(this);
        
        // Make the container size known for potential camera bounds
        this.setSize(gridWidth, gridHeight);
    }
}
