import { Scene } from 'phaser';
import { campaigns } from '../entity/Campaign';
import { GManager } from '../system/GameManager';

export class Campaign extends Scene {
    private isTransitioning: boolean = false;

    constructor() {
        super('Campaign');
    }

    create() {
        this.isTransitioning = false;
        const { width, height } = this.scale;
        
        // Reset camera in case it was faded out from previous session
        this.cameras.main.fadeIn(200);

        // Dark sci-fi background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000011, 0x000011, 0x000522, 0x000522, 1);
        bg.fillRect(0, 0, width, height);

        // Add some grid lines for aesthetic
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x00ffff, 0.05);
        for (let x = 0; x < width; x += 40) {
            grid.lineBetween(x, 0, x, height);
        }
        for (let y = 0; y < height; y += 40) {
            grid.lineBetween(0, y, width, y);
        }

        // Header
        const headerContainer = this.add.container(width / 2, 60);
        const titleText = this.add.text(0, 0, 'MISSION SELECTION', {
            fontSize: '42px',
            fontFamily: 'Orbitron',
            color: '#00ffff',
            stroke: '#004444',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Underline effect
        const underline = this.add.rectangle(0, 30, 400, 2, 0x00ffff);
        headerContainer.add([titleText, underline]);

        const gridCols = 4;
        const spacingX = 220;
        const spacingY = 160;
        const startX = (width - (gridCols - 1) * spacingX) / 2;
        const startY = 200;

        const nodePositions: { x: number, y: number }[] = [];

        // Pre-calculate positions for nodes and connections
        campaigns.forEach((mission, index) => {
            const row = Math.floor(index / gridCols);
            let col = index % gridCols;

            // Zig-zag pattern: Row 0 left-to-right, Row 1 right-to-left, etc.
            if (row % 2 === 1) {
                col = (gridCols - 1) - col;
            }

            const x = startX + col * spacingX;
            const y = startY + row * spacingY;
            nodePositions.push({ x, y });
        });

        // Draw connections
        const connections = this.add.graphics();
        connections.lineStyle(3, 0x00ffff, 0.2);

        for (let i = 0; i < nodePositions.length - 1; i++) {
            const start = nodePositions[i];
            const end = nodePositions[i + 1];
            connections.lineBetween(start.x, start.y, end.x, end.y);
        }

        // Add nodes
        campaigns.forEach((mission, index) => {
            const { x, y } = nodePositions[index];

            // Mock unlocked logic: assume first 2 are unlocked
            const isUnlocked = index < 7; 

            // Node container
            const nodeContainer = this.add.container(x, y);

            // Outer ring
            const ring = this.add.circle(0, 0, 18, isUnlocked ? 0x00ffff : 0x333333, 0.2);
            ring.setStrokeStyle(2, isUnlocked ? 0x00ffff : 0x555555);
            
            // Core
            const core = this.add.circle(0, 0, 10, isUnlocked ? 0x00ffff : 0x444444);
            
            // Label
            const label = this.add.text(0, 35, mission.title, {
                fontSize: '14px',
                fontFamily: 'Orbitron',
                color: isUnlocked ? '#ffffff' : '#666666',
                align: 'center'
            }).setOrigin(0.5);

            nodeContainer.add([ring, core, label]);

            if (isUnlocked) {
                ring.setInteractive({ useHandCursor: true });
                
                ring.on('pointerover', () => {
                    this.tweens.add({
                        targets: [ring, core],
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 200,
                        ease: 'Power2'
                    });
                    label.setColor('#00ffff');
                });

                ring.on('pointerout', () => {
                    this.tweens.add({
                        targets: [ring, core],
                        scaleX: 1,
                        scaleY: 1,
                        duration: 200,
                        ease: 'Power2'
                    });
                    label.setColor('#ffffff');
                });

                ring.on('pointerdown', () => {
                    if (this.isTransitioning) return;
                    this.isTransitioning = true;
                    
                    GManager.startMission(mission);
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        if (mission.opening_naration && import.meta.env.VITE_ENV !== 'dev') {
                            this.scene.start('Narration', {
                                narrationKey: mission.opening_naration,
                                nextScene: 'Game'
                            });
                        } else {
                            this.scene.start('Game');
                        }
                    });
                });

                // Idle glow animation
                this.tweens.add({
                    targets: ring,
                    alpha: 0.6,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // Add back button
        const backBtn = this.add.text(width - 50, height - 30, 'BACK TO MENU', {
            fontSize: '18px',
            fontFamily: 'Orbitron',
            color: '#aaaaaa'
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
