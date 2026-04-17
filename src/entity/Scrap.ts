import { Scene } from 'phaser';

export class Scrap {
    container: Phaser.GameObjects.Container;
    value: number;

    constructor(scene: Scene, value: number) {
        this.value = value;
        this.container = scene.add.container(0, 0);
        
        const baseSize = 32;
        
        // Random metallic colors
        const colors = [0x7f8c8d, 0x95a5a6, 0xbdc3c7, 0x34495e];
        const rustColor = 0xa0522d;
        
        // Create a cluster of jagged shapes for a "scrap" look
        for (let i = 0; i < 4; i++) {
            const w = Math.random() * 20 + 10;
            const h = Math.random() * 20 + 10;
            const x = Math.random() * 16 - 8;
            const y = Math.random() * 16 - 8;
            const angle = Math.random() * 360;
            const color = Math.random() > 0.3 ? colors[Math.floor(Math.random() * colors.length)] : rustColor;
            
            const part = scene.add.rectangle(x, y, w, h, color);
            part.setAngle(angle);
            part.setStrokeStyle(1, 0x2c3e50, 0.5);
            this.container.add(part);
        }

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
