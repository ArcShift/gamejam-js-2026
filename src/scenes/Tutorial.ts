import { Scene } from 'phaser';

export class Tutorial extends Scene {
    constructor() {
        super('Tutorial');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000005, 0x000005, 0x000511, 0x000511, 1);
        bg.fillRect(0, 0, width, height);

        // Grid overlay
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x00ffff, 0.05);
        for (let x = 0; x < width; x += 50) grid.lineBetween(x, 0, x, height);
        for (let y = 0; y < height; y += 50) grid.lineBetween(0, y, width, y);

        // Title
        this.add.text(width / 2, 60, 'COMMANDER PROTOCOL', {
            fontSize: '42px',
            fontFamily: 'Orbitron',
            color: '#00ffff',
            stroke: '#004444',
            strokeThickness: 4
        }).setOrigin(0.5);

        const content = [
            {
                title: 'BASIC MOVEMENT',
                text: 'Click adjacent tiles to move. Movement consumes Action Points (AP). Your AP regenerates per tick times speed.'
            },
            {
                title: 'RESOURCES & CONSTRUCTION',
                text: 'Collect Scrap Metal from the grid. Use scrap to construct specialized Machines to fight for you.'
            },
            {
                title: 'COMBAT',
                text: 'Your Core is tecnomancer. so it does not attack, deploy machines and the machines will fight for you.'
            },
            {
                title: 'THE SEVEN DEADLY SINS',
                text: 'Consuming human dead bodies allows your machine to integrate a "Sin" enhancement, granting permanent stat boosts and unique abilities.'
            },
            {
                title: 'AUTO MODE',
                text: 'Toggle AUTO MODE in the Pause menu to let the system AI handle tactical decisions while you observe.'
            }
        ];

        let startY = 120;
        content.forEach((item, index) => {
            const sectionY = startY + index * 105;
            
            // Section header
            this.add.text(80, sectionY, item.title, {
                fontSize: '22px',
                fontFamily: 'Orbitron',
                color: '#00ffff',
                stroke: '#000000',
                strokeThickness: 2
            });

            // Section body
            this.add.text(80, sectionY + 30, item.text, {
                fontSize: '16px',
                fontFamily: 'Orbitron',
                color: '#ffffff',
                wordWrap: { width: width - 160 },
                lineSpacing: 8
            });

            // Decorator line
            const line = this.add.graphics();
            line.lineStyle(1, 0x00ffff, 0.3);
            line.lineBetween(80, sectionY + 25, 300, sectionY + 25);
        });

        // Back Button
        const backBtn = this.add.container(width / 2, height - 60);
        const btnBg = this.add.rectangle(0, 0, 250, 50, 0x00ffff, 0.1);
        btnBg.setStrokeStyle(2, 0x00ffff);
        const btnText = this.add.text(0, 0, 'BACK TO MENU', {
            fontSize: '20px',
            fontFamily: 'Orbitron',
            color: '#ffffff'
        }).setOrigin(0.5);

        backBtn.add([btnBg, btnText]);
        btnBg.setInteractive({ useHandCursor: true });

        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0x00ffff, 0.3);
            btnText.setColor('#00ffff');
        });

        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0x00ffff, 0.1);
            btnText.setColor('#ffffff');
        });

        btnBg.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        // Scanline effect (reused from Narration)
        const scanlines = this.add.graphics();
        scanlines.lineStyle(2, 0x000000, 0.1);
        for (let y = 0; y < height; y += 4) {
            scanlines.lineBetween(0, y, width, y);
        }
    }
}
