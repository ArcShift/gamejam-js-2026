import { Scene } from 'phaser';

export class Pause extends Scene {
    constructor() {
        super('Pause');
    }

    create() {
        const { width, height } = this.scale;

        // Dim background
        const dim = this.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        dim.setOrigin(0);

        // Pause Panel
        const panelWidth = 400;
        const panelHeight = 300;
        const panel = this.add.container(width / 2, height / 2);

        const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x222222);
        bg.setStrokeStyle(4, 0x00ffff);
        
        const title = this.add.text(0, -100, 'GAME PAUSED', {
            fontSize: '32px',
            fontFamily: 'Orbitron, Arial Black',
            color: '#00ffff'
        }).setOrigin(0.5);

        // Resume Button
        const resumeBtn = this.add.container(0, 50);
        const btnBg = this.add.rectangle(0, 0, 200, 50, 0x00ffff, 0.2);
        btnBg.setStrokeStyle(2, 0x00ffff);
        const btnText = this.add.text(0, 0, 'RESUME', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        resumeBtn.add([btnBg, btnText]);
        btnBg.setInteractive({ useHandCursor: true });

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x00ffff, 0.4));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x00ffff, 0.2));
        btnBg.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('Game');
        });

        // Quit Button (Back to Menu)
        const quitBtn = this.add.text(0, 120, 'QUIT TO MENU', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        quitBtn.on('pointerdown', () => {
            this.scene.stop('Game');
            this.scene.start('MainMenu');
        });

        panel.add([bg, title, resumeBtn, quitBtn]);

        // Add intro animation
        panel.setScale(0.8);
        panel.alpha = 0;
        this.tweens.add({
            targets: panel,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
    }
}
