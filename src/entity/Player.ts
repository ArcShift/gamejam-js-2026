import { Scene } from 'phaser';
import { Unit, UnitType, Faction } from './Unit';

export class Player extends Unit {
    container: Phaser.GameObjects.Container;
    static readonly MAX_SCRAP: number = 100;
    scrap: number = 0;

    constructor(scene: Scene) {
        super("CORE-01", "Tecnomancer.", 100, 5, 20, UnitType.Machine, [], Faction.Player, [], [0, 0]);
        this.container = scene.add.container(0, 0);
        
        const size = 48; // A bit smaller than the 64px cell
        
        // Deep shadow for depth
        const shadow = scene.add.rectangle(4, 4, size, size, 0x000000, 0.5);
        shadow.setOrigin(0.5);

        // Main body - Neon Cyan square
        const body = scene.add.rectangle(0, 0, size, size, 0x00d2ff);
        body.setOrigin(0.5);
        body.setStrokeStyle(3, 0xffffff, 0.8);

        // Inner detail - techy square
        const inner = scene.add.rectangle(0, 0, size - 16, size - 16, 0x00d2ff);
        inner.setOrigin(0.5);
        inner.setStrokeStyle(1, 0x00f2ff, 1);
        inner.setAlpha(0.6);

        // Core glow point
        const core = scene.add.circle(0, 0, 4, 0xffffff, 1);
        
        // Outer glow using a larger semi-transparent rectangle
        const glow = scene.add.rectangle(0, 0, size + 12, size + 12, 0x00d2ff, 0.2);
        glow.setOrigin(0.5);

        this.container.add([shadow, glow, body, inner, core]);
        
        // Add a subtle idle animation (pulse and slight rotation)
        scene.tweens.add({
            targets: [body, inner, glow],
            scale: { from: 1, to: 1.05 },
            alpha: { from: 0.7, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Slow rotation for the inner square to give it a techy feel
        scene.tweens.add({
            targets: inner,
            angle: 360,
            duration: 10000,
            repeat: -1,
            ease: 'Linear'
        });

        this.container.setDepth(10);
        scene.add.existing(this.container);
    }

    setPosition(x: number, y: number) {
        this.container.setPosition(x, y);
    }
    
    faceTarget(targetGx: number) {
        if (targetGx < this.gx) {
            this.container.setScale(-1, 1);
        } else if (targetGx > this.gx) {
            this.container.setScale(1, 1);
        }
    }

    get x() { return this.container.x; }
    get y() { return this.container.y; }
}
