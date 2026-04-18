import { Scene } from 'phaser';

export class Scrap {
    container: Phaser.GameObjects.Container;
    value: number;

    constructor(scene: Scene, value: number) {
        this.value = value;
        this.container = scene.add.container(0, 0);
        
        // Use a random frame from the 6x3 scrap-metal spritesheet (18 frames total)
        const frameIndex = Math.floor(Math.random() * 18);
        const sprite = scene.add.sprite(0, 0, 'scrap-metal', frameIndex);
        
        // The frame is 100x100, so scale it to fit nicely within the cell
        sprite.setScale(0.5);
        this.container.add(sprite);

        // Add a small GLINT effect
        const glint = scene.add.rectangle(0, 0, 4, 15, 0xffffff, 0.6);
        glint.setAngle(45);
        this.container.add(glint);

        scene.tweens.add({
            targets: glint,
            x: { from: -15, to: 15 },
            y: { from: -15, to: 15 },
            alpha: { from: 0, to: 1, yoyo: true },
            duration: 1500,
            repeat: -1,
            repeatDelay: Math.random() * 3000 + 2000,
            ease: 'Power2'
        });

        // Subtle float animation
        scene.tweens.add({
            targets: this.container,
            y: '+=3',
            duration: 2000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.container.setDepth(1);
        scene.add.existing(this.container);
    }

    setPosition(x: number, y: number) {
        this.container.setPosition(x, y);
    }

    destroy() {
        this.container.destroy();
    }
}
