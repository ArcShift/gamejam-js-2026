import { Scene } from 'phaser';
import { Map as GameMap } from '../ui/Map';
import { ICampaign } from '../entity/Campaign';
import { GManager } from '../system/GameManager';
import { Player } from '../entity/Player';
import { Scrap } from '../entity/Scrap';
import { HumanUnit, humans } from '../entity/HumanUnit';
import { TurnManager, SystemState } from '../system/TurnManager';
import { Unit } from '../entity/Unit';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameMap: GameMap;
    mission: ICampaign | null;
    player: Player;
    units: Map<string, any> = new Map();
    scrap: Map<string, any> = new Map();
    selector: Phaser.GameObjects.Graphics;
    arrow: Phaser.GameObjects.Graphics;
    selectedGx: number = -1;
    selectedGy: number = -1;

    // Turn system
    turnManager: TurnManager;

    // Grid constants
    private cellSize = 64;
    private totalCellSize = 68; // cellSize + gap
    private mapOffsetX = 50;
    private mapOffsetY = 50;

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
            this.selector.moveTo(this.cellSize - len, 0);
            this.selector.lineTo(this.cellSize, 0);
            this.selector.lineTo(this.cellSize, len);
            // Bottom Right
            this.selector.moveTo(this.cellSize, this.cellSize - len);
            this.selector.lineTo(this.cellSize, this.cellSize);
            this.selector.lineTo(this.cellSize - len, this.cellSize);
            // Bottom Left
            this.selector.moveTo(len, this.cellSize);
            this.selector.lineTo(0, this.cellSize);
            this.selector.lineTo(0, this.cellSize - len);
            
            this.selector.strokePath();
            this.selector.setVisible(false);
            this.selector.setDepth(10); // Above map and units

            // Initialize Arrow Graphic
            this.arrow = this.add.graphics();
            this.arrow.setDepth(11);
            this.arrow.setVisible(false);

            // Pulse effect for selector
            this.tweens.add({
                targets: [this.selector, this.arrow],
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

                // Block input if not player's turn or system is busy
                if (this.turnManager && this.turnManager.state !== SystemState.IDLE) return;

                // Convert world position to grid coordinates
                const worldX = pointer.worldX;
                const worldY = pointer.worldY;

                const gx = Math.floor((worldX - this.mapOffsetX) / this.totalCellSize);
                const gy = Math.floor((worldY - this.mapOffsetY) / this.totalCellSize);

                // Check bounds
                if (gx >= 0 && gx < activeMission.map_width && gy >= 0 && gy < activeMission.map_height) {
                    const isSameCell = this.selectedGx === gx && this.selectedGy === gy;
                    const isAdjacent = Math.abs(gx - this.player.gx) + Math.abs(gy - this.player.gy) === 1;

                    if (isSameCell && isAdjacent) {
                        // MOVE PLAYER
                        const targetKey = `${gx},${gy}`;
                        if (!this.units.has(targetKey)) {
                            // Check if player has enough AP
                            if (!this.player.canMove()) {
                                this.showNotEnoughAP();
                                return;
                            }

                            // Consume AP via turn manager
                            const moved = this.turnManager.playerMove();
                            if (!moved) return;

                            // Update map tracking
                            this.units.delete(`${this.player.gx},${this.player.gy}`);
                            this.player.gx = gx;
                            this.player.gy = gy;
                            this.units.set(targetKey, this.player);

                            // Animate movement
                            const tx = this.mapOffsetX + gx * this.totalCellSize + this.cellSize / 2;
                            const ty = this.mapOffsetY + gy * this.totalCellSize + this.cellSize / 2;

                            // Resume camera follow on player move
                            this.camera.startFollow(this.player.container, true, 0.1, 0.1);
                            this.camera.setFollowOffset(0, 0);

                            this.tweens.add({
                                targets: this.player.container,
                                x: tx,
                                y: ty,
                                duration: 200,
                                ease: 'Power2',
                                onComplete: () => {
                                    // Reset selection after move
                                    this.selectedGx = -1;
                                    this.selectedGy = -1;
                                    this.selector.setVisible(false);
                                    this.arrow.setVisible(false);

                                    // Emit AP update for sidebar
                                    this.events.emit('ap-updated', {
                                        ap: this.player.ap,
                                        turn: this.turnManager.turnCount,
                                        activeUnitName: this.turnManager.currentUnit?.name || 'UNKNOWN'
                                    });

                                    // Tell turn manager the action is finished
                                    this.turnManager.endPlayerAction();
                                }
                            });
                            return;
                        }
                    }

                    // UPDATE SELECTION
                    this.selectedGx = gx;
                    this.selectedGy = gy;

                    const key = `${gx},${gy}`;
                    const unit = this.units.get(key);
                    const scrap = this.scrap.get(key);
                    
                    // Update selector position
                    const sx = this.mapOffsetX + gx * this.totalCellSize;
                    const sy = this.mapOffsetY + gy * this.totalCellSize;
                    
                    // If moving to a new position, add a little snap effect
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

                    // Update Arrow — only show if player can afford to move
                    this.arrow.clear();
                    if (isAdjacent && !unit && this.player.canMove()) {
                        this.arrow.setVisible(true);
                        this.arrow.lineStyle(3, 0xffff00, 1);
                        this.arrow.fillStyle(0xffff00, 1);
                        
                        const centerX = sx + this.cellSize / 2;
                        const centerY = sy + this.cellSize / 2;
                        
                        // Direction from player to cell
                        const dx = gx - this.player.gx;
                        const dy = gy - this.player.gy;
                        
                        // Draw arrow pointing to center of cell
                        if (dx > 0) { // Right
                            this.drawArrow(centerX - 15, centerY, centerX + 5, centerY);
                        } else if (dx < 0) { // Left
                            this.drawArrow(centerX + 15, centerY, centerX - 5, centerY);
                        } else if (dy > 0) { // Down
                            this.drawArrow(centerX, centerY - 15, centerX, centerY + 5);
                        } else if (dy < 0) { // Up
                            this.drawArrow(centerX, centerY + 15, centerX, centerY - 5);
                        }
                    } else {
                        this.arrow.setVisible(false);
                    }

                    this.events.emit('cell-selected', { unit, scrap });
                } else {
                    this.selector.setVisible(false);
                    this.arrow.setVisible(false);
                    this.selectedGx = -1;
                    this.selectedGy = -1;
                }
            });
            
            // Make map draggable for large maps
            this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
                if (!pointer.isDown || pointer.x > width - sidebarWidth) return;
                
                // Stop following if manually dragging
                if (Math.abs(pointer.x - pointer.prevPosition.x) > 1 || Math.abs(pointer.y - pointer.prevPosition.y) > 1) {
                    this.camera.stopFollow();
                }

                this.camera.scrollX -= (pointer.x - pointer.prevPosition.x) / this.camera.zoom;
                this.camera.scrollY -= (pointer.y - pointer.prevPosition.y) / this.camera.zoom;
            });
            
            // Create and position Player in a random grid cell
            this.player = new Player(this);
            const pgx = Math.floor(Math.random() * activeMission.map_width);
            const pgy = Math.floor(Math.random() * activeMission.map_height);
            
            const px = this.mapOffsetX + pgx * this.totalCellSize + this.cellSize / 2;
            const py = this.mapOffsetY + pgy * this.totalCellSize + this.cellSize / 2;
            
            this.player.setPosition(px, py);
            this.player.gx = pgx;
            this.player.gy = pgy;
            this.units.set(`${pgx},${pgy}`, this.player);

            // Camera follow player
            this.camera.startFollow(this.player.container, true, 0.1, 0.1);
            this.camera.setFollowOffset(0, 0);
            
            // Snap to player immediately at start
            this.camera.centerOn(px, py);
            this.camera.scrollX += sidebarWidth / 2;

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
                
                const sx = this.mapOffsetX + cell.gx * this.totalCellSize + this.cellSize / 2;
                const sy = this.mapOffsetY + cell.gy * this.totalCellSize + this.cellSize / 2;
                
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

            // Collect all units for the turn manager
            const allGameUnits: Unit[] = [this.player];

            // Place units in random available cells (cannot overlap with player or each other)
            for (const unitData of spawnQueue) {
                if (availableUnitCells.length === 0) break;
                const randomIndex = Math.floor(Math.random() * availableUnitCells.length);
                const cell = availableUnitCells.splice(randomIndex, 1)[0];
                
                const unit = new HumanUnit(this, unitData);
                const hx = this.mapOffsetX + cell.gx * this.totalCellSize + this.cellSize / 2;
                const hy = this.mapOffsetY + cell.gy * this.totalCellSize + this.cellSize / 2;
                unit.setPosition(hx, hy);
                unit.setGridPosition(cell.gx, cell.gy);
                this.units.set(`${cell.gx},${cell.gy}`, unit);

                allGameUnits.push(unit);
            }

            // Initialize Turn Manager
            this.turnManager = new TurnManager(this.player, this.units);
            this.turnManager.registerUnits(allGameUnits);
            this.turnManager.setMapSize(activeMission.map_width, activeMission.map_height);

            // Handle enemy movement animation
            this.turnManager.onEnemyMove = (action, onComplete) => {
                const targetX = this.mapOffsetX + action.toGx * this.totalCellSize + this.cellSize / 2;
                const targetY = this.mapOffsetY + action.toGy * this.totalCellSize + this.cellSize / 2;
                const humanUnit = action.unit as HumanUnit;

                // Flash the enemy red briefly to indicate it's acting
                const flashGraphic = this.add.circle(
                    this.mapOffsetX + action.fromGx * this.totalCellSize + this.cellSize / 2,
                    this.mapOffsetY + action.fromGy * this.totalCellSize + this.cellSize / 2,
                    20, 0xff0000, 0.3
                );
                flashGraphic.setDepth(9);

                this.tweens.add({
                    targets: flashGraphic,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => flashGraphic.destroy()
                });

                this.tweens.add({
                    targets: humanUnit.container,
                    x: targetX,
                    y: targetY,
                    duration: 250,
                    ease: 'Power2',
                    onComplete: () => {
                        onComplete();
                    }
                });
            };

            this.turnManager.onPlayerTurnStart = () => {
                // Focus on player at start of turn
                this.camera.startFollow(this.player.container, true, 0.1, 0.1);
                this.camera.setFollowOffset(0, 0);

                this.events.emit('ap-updated', {
                    ap: this.player.ap,
                    turn: this.turnManager.turnCount,
                    activeUnitName: this.player.name
                });
            };

            this.turnManager.onLose = () => {
                this.scene.start('GameOver', { message: 'YOU ARE SURROUNDED' });
            };

            this.turnManager.onTurnTick = () => {
                this.events.emit('ap-updated', {
                    ap: this.player.ap,
                    turn: this.turnManager.turnCount,
                    activeUnitName: this.turnManager.currentUnit?.name || 'TICKING...'
                });
            };

            // Emit initial AP state
            this.events.emit('ap-updated', {
                ap: this.player.ap,
                turn: 0,
                activeUnitName: 'INITIALIZING'
            });

            // START THE LOOP
            this.turnManager.start();
        }
        
        // Launch UI subscene
        this.scene.launch('GameUI');

        this.events.on('shutdown', () => {
            this.scene.stop('GameUI');
        });
    }

    /** Show a brief "NOT ENOUGH AP" flash near the player */
    private showNotEnoughAP() {
        const tx = this.player.container.x;
        const ty = this.player.container.y - 40;

        const text = this.add.text(tx, ty, 'NOT ENOUGH AP!', {
            fontSize: '14px',
            fontFamily: 'Orbitron, Arial',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: text,
            y: ty - 30,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }

    private drawArrow(fromX: number, fromY: number, toX: number, toY: number) {
        this.arrow.lineBetween(fromX, fromY, toX, toY);
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const headSize = 10;
        
        this.arrow.lineBetween(toX, toY, toX - headSize * Math.cos(angle - Math.PI / 6), toY - headSize * Math.sin(angle - Math.PI / 6));
        this.arrow.lineBetween(toX, toY, toX - headSize * Math.cos(angle + Math.PI / 6), toY - headSize * Math.sin(angle + Math.PI / 6));
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
