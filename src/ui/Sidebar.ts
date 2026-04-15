import { Scene, GameObjects } from 'phaser';

export class Sidebar extends GameObjects.Container {
    private bg: GameObjects.Rectangle;

    constructor(scene: Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        
        // Background for the sidebar
        this.bg = scene.add.rectangle(0, 0, width, height, 0x222222, 0.9);
        this.bg.setOrigin(0, 0);
        
        this.add(this.bg);
        
        // Add the container to the scene
        scene.add.existing(this);
    }
}
