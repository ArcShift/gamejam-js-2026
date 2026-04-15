import { Scene, GameObjects } from 'phaser';

export class Sidebar extends GameObjects.Container {
    private bg: GameObjects.Rectangle;
    private fpsText: GameObjects.Text;

    constructor(scene: Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        
        // Background for the sidebar
        this.bg = scene.add.rectangle(0, 0, width, height, 0x111111, 0.95);
        this.bg.setOrigin(0, 0);
        this.bg.setStrokeStyle(1, 0x333333);
        
        this.add(this.bg);

        // Header Title
        const title = scene.add.text(width / 2, 25, 'COMMAND', {
            fontSize: '20px',
            fontFamily: 'Orbitron, Arial Black',
            color: '#00ffff'
        }).setOrigin(0.5);
        this.add(title);

        // Pause Button
        const pauseBtn = this.createPauseButton(scene, width / 2, 80);
        this.add(pauseBtn);
        
        // Dev FPS counter
        const isDev = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isDev) {
            this.fpsText = scene.add.text(10, height - 25, 'FPS: 00', {
                fontSize: '14px',
                color: '#00ff00',
                fontFamily: 'monospace'
            });
            this.add(this.fpsText);
            
            scene.events.on('update', () => {
                this.fpsText.setText(`FPS: ${Math.round(scene.game.loop.actualFps)}`);
            });
        }

        // Add the container to the scene
        scene.add.existing(this);
    }

    private createPauseButton(scene: Scene, x: number, y: number): GameObjects.Container {
        const container = scene.add.container(x, y);
        const bg = scene.add.rectangle(0, 0, 200, 45, 0x333333);
        bg.setStrokeStyle(2, 0x555555);
        
        const text = scene.add.text(0, 0, 'PAUSE SYSTEM', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        container.add([bg, text]);
        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => {
            bg.setFillStyle(0x444444);
            bg.setStrokeStyle(2, 0x00ffff);
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(0x333333);
            bg.setStrokeStyle(2, 0x555555);
        });

        bg.on('pointerdown', () => {
            // Note: Use scene.scene to access the SceneManager
            scene.scene.pause('Game');
            scene.scene.launch('Pause');
        });

        return container;
    }
}
