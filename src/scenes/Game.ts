import { Scene } from 'phaser';
import { Map as GameMap } from '../ui/Map';
import { ICampaign } from '../entity/Campaign';
import { GManager } from '../system/GameManager';
import { Player } from '../entity/Player';
import { Scrap } from '../entity/Scrap';
import { HumanUnit, humans } from '../entity/HumanUnit';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameMap: GameMap;
    mission: ICampaign | null;
    player: Player;
    units: Map<string, any> = new Map();
    scrap: Map<string, any> = new Map();
    selector: Phaser.GameObjects.Graphics;

    constructor ()
    {
        super('Game');
    }

    init (data?: { mission: ICampaign })
    {
        if (data && data.mission) {
            this.mission = data.mission;
        }
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.fadeIn(200);
        this.camera.setBackgroundColor(0x0a0a0a);

        const width = this.scale.width;
        const height = this.scale.height;
        const sidebarWidth = 250;

        // Use GManager if mission data is not in init data (happens on restarts/re-entries)
        const activeMission = this.mission || GManager.currentMission;

        // Clear tracking
        this.units.clear();
        this.scrap.clear();

        // Initialize Map
        if (activeMission) {
            this.gameMap = new GameMap(this, 50, 50, activeMission);
            
            // Basic camera bounds based on map size
            this.camera.setBounds(0, 0, this.gameMap.width + 100 + sidebarWidth, this.gameMap.height + 100);
            
            // Grid constants from Map.ts
            const cellSize = 64;
            const gap = 4;
            const totalCellSize = cellSize + gap;
            const mapOffsetX = 50; // The x pos passed to new Map()
            const mapOffsetY = 50; // The y pos passed to new Map()

            // Initialize Cell Selector
            this.selector = this.add.graphics();
            this.selector.lineStyle(2, 0x00ffff, 1);
            
            // Draw corner brackets for a tech look
            const len = 12;
            // Top Left
            this.selector.moveTo(0, len);
            this.selector.lineTo(0, 0);
            this.selector.lineTo(len, 0);
            // Top Right
            this.selector.moveTo(cellSize - len, 0);
            this.selector.lineTo(cellSize, 0);
            this.selector.lineTo(cellSize, len);
            // Bottom Right
            this.selector.moveTo(cellSize, cellSize - len);
            this.selector.lineTo(cellSize, cellSize);
            this.selector.lineTo(cellSize - len, cellSize);
            // Bottom Left
            this.selector.moveTo(len, cellSize);
            this.selector.lineTo(0, cellSize);
            this.selector.lineTo(0, cellSize - len);
            
            this.selector.strokePath();
            this.selector.setVisible(false);
            this.selector.setDepth(10); // Above map and units

            // Pulse effect for selector
            this.tweens.add({
                targets: this.selector,
                alpha: 0.4,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Handle Map Click
            this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                // If the pointer is over the sidebar area, ignore
                if (pointer.x > width - sidebarWidth) return;

                // Convert world position to grid coordinates
                const worldX = pointer.worldX;
                const worldY = pointer.worldY;

                const gx = Math.floor((worldX - mapOffsetX) / totalCellSize);
                const gy = Math.floor((worldY - mapOffsetY) / totalCellSize);

                // Check bounds
                if (gx >= 0 && gx < activeMission.map_width && gy >= 0 && gy < activeMission.map_height) {
                    const key = `${gx},${gy}`;
                    const unit = this.units.get(key);
                    const scrap = this.scrap.get(key);
                    
                    // Update selector position
                    const sx = mapOffsetX + gx * totalCellSize;
                    const sy = mapOffsetY + gy * totalCellSize;
                    
                    // If moving to a new position, add a little snap effect
                    if (this.selector.x !== sx || this.selector.y !== sy) {
                        this.selector.setPosition(sx, sy);
                        this.selector.setVisible(true);
                        this.selector.setScale(1.2);
                        this.tweens.add({
                            targets: this.selector,
                            scaleX: 1,
                            scaleY: 1,
                            duration: 150,
                            ease: 'Back.easeOut'
                        });
                    }

                    this.events.emit('cell-selected', { unit, scrap });
                } else {
                    this.selector.setVisible(false);
                }
            });
            
            // Make map draggable for large maps (only if right click or shift click?)
            // Actually, let's just make it drag if not clicking a unit/cell?
            // For now keep simple: drag if pointer is down and moving
            this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
                if (!pointer.isDown || pointer.x > width - sidebarWidth) return;
                this.camera.scrollX -= (pointer.x - pointer.prevPosition.x) / this.camera.zoom;
                this.camera.scrollY -= (pointer.y - pointer.prevPosition.y) / this.camera.zoom;
            });
            
            // Create and position Player in a random grid cell
            this.player = new Player(this);
            const pgx = Math.floor(Math.random() * activeMission.map_width);
            const pgy = Math.floor(Math.random() * activeMission.map_height);
            
            const px = mapOffsetX + pgx * totalCellSize + cellSize / 2;
            const py = mapOffsetY + pgy * totalCellSize + cellSize / 2;
            
            this.player.setPosition(px, py);
            this.units.set(`${pgx},${pgy}`, this.player);

            // Create cell pools
            const allCells: {gx: number, gy: number}[] = [];
            const availableUnitCells: {gx: number, gy: number}[] = [];

            for (let y = 0; y < activeMission.map_height; y++) {
                for (let x = 0; x < activeMission.map_width; x++) {
                    const cell = { gx: x, gy: y };
                    allCells.push(cell);
                    // Units (other than player) should not spawn on the player's starting cell
                    if (x !== pgx || y !== pgy) {
                        availableUnitCells.push(cell);
                    }
                }
            }

            // Spawn Scrap Metal (20% of grid cells - can overlap with player and humans)
            const scrapCount = Math.floor(allCells.length * 0.2);
            const availableScrapCells = [...allCells];

            // Spawn the scrap
            for (let i = 0; i < scrapCount && availableScrapCells.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableScrapCells.length);
                const cell = availableScrapCells.splice(randomIndex, 1)[0];
                
                // Random value between 1 and 100
                const scrapValue = Math.floor(Math.random() * 100) + 1;
                const scrapObj = new Scrap(this, scrapValue);
                
                const sx = mapOffsetX + cell.gx * totalCellSize + cellSize / 2;
                const sy = mapOffsetY + cell.gy * totalCellSize + cellSize / 2;
                
                scrapObj.setPosition(sx, sy);
                this.scrap.set(`${cell.gx},${cell.gy}`, scrapObj);
            }

            // Spawn Human Units (5% of grid cells)
            const humanCount = Math.floor(allCells.length * 0.05);
            
            // Calculate distribution [Thug, Merc, Tyrant] based on 9:3:1 ratio
            const weights = [9, 3, 1];
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            
            const distribution = weights.map(w => Math.floor(humanCount * w / totalWeight));
            let currentSum = distribution.reduce((a, b) => a + b, 0);
            
            // Distribute remaining slots to highest weights to match target count
            for (let i = 0; i < weights.length && currentSum < humanCount; i++) {
                distribution[i]++;
                currentSum++;
            }

            // Create a spawn queue based on the calculated distribution
            const spawnQueue: any[] = [];
            distribution.forEach((count, index) => {
                for (let i = 0; i < count; i++) {
                    spawnQueue.push(humans[index]);
                }
            });

            // Place units in random available cells (cannot overlap with player or each other)
            for (const unitData of spawnQueue) {
                if (availableUnitCells.length === 0) break;
                const randomIndex = Math.floor(Math.random() * availableUnitCells.length);
                const cell = availableUnitCells.splice(randomIndex, 1)[0];
                
                const unit = new HumanUnit(this, unitData);
                const hx = mapOffsetX + cell.gx * totalCellSize + cellSize / 2;
                const hy = mapOffsetY + cell.gy * totalCellSize + cellSize / 2;
                unit.setPosition(hx, hy);
                this.units.set(`${cell.gx},${cell.gy}`, unit);
            }
        }
        
        // Launch UI subscene
        this.scene.launch('GameUI');

        this.events.on('shutdown', () => {
            this.scene.stop('GameUI');
        });
    }

    public winMission() {
        const activeMission = this.mission || GManager.currentMission;
        
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (activeMission && activeMission.closing_naration) {
                this.scene.start('Narration', {
                    narrationKey: activeMission.closing_naration,
                    nextScene: 'Campaign'
                });
            } else {
                this.scene.start('Campaign');
            }
        });
    }
}
