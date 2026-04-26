import { Scene } from 'phaser';

export class Pause extends Scene {
    constructor() {
        super('Pause');
    }

    create() {
        this.cameras.main.setScroll(0, 0);
        const { width, height } = this.scale;

        // Dim background
        const dim = this.add.rectangle(0, 0, width, height, 0x000000, 0.6);
        dim.setOrigin(0);
        dim.setScrollFactor(0);

        // Pause Panel
        const panelWidth = 400;
        const panelHeight = 420;
        const panel = this.add.container(width / 2, height / 2);
        panel.setScrollFactor(0);

        const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111, 0.9);
        bg.setStrokeStyle(4, 0x00ffff);
        
        const title = this.add.text(0, -160, 'SYSTEM PAUSED', {
            fontSize: '32px',
            fontFamily: 'Orbitron',
            color: '#00ffff'
        }).setOrigin(0.5);

        const gameScene = this.scene.get('Game') as any;

        // Resume Button
        const resumeBtn = this.add.container(0, -80);
        const btnBg = this.add.rectangle(0, 0, 250, 50, 0x00ffff, 0.1);
        btnBg.setStrokeStyle(2, 0x00ffff);
        const btnText = this.add.text(0, 0, 'RESUME', {
            fontSize: '20px',
            fontFamily: 'Orbitron',
            color: '#ffffff'
        }).setOrigin(0.5);

        resumeBtn.add([btnBg, btnText]);
        btnBg.setInteractive({ useHandCursor: true });

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x00ffff, 0.3));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x00ffff, 0.1));
        btnBg.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('Game');
            this.scene.resume('GameUI');
        });

        // Auto Mode Toggle
        const autoBtn = this.add.container(0, -10);
        const isAIEnabled = gameScene.turnManager.isAIEnabled;
        const autoBg = this.add.rectangle(0, 0, 250, 50, isAIEnabled ? 0x00ff88 : 0x333333, 0.2);
        autoBg.setStrokeStyle(2, isAIEnabled ? 0x00ff88 : 0x666666);
        const autoText = this.add.text(0, 0, isAIEnabled ? 'AUTO MODE: ON' : 'AUTO MODE: OFF', {
            fontSize: '18px',
            fontFamily: 'Orbitron',
            color: isAIEnabled ? '#00ff88' : '#aaaaaa'
        }).setOrigin(0.5);

        autoBtn.add([autoBg, autoText]);
        autoBg.setInteractive({ useHandCursor: true });

        autoBg.on('pointerover', () => {
            const currentEnabled = gameScene.turnManager.isAIEnabled;
            autoBg.setFillStyle(currentEnabled ? 0x00ff88 : 0xffffff, 0.3);
        });
        autoBg.on('pointerout', () => {
            const currentEnabled = gameScene.turnManager.isAIEnabled;
            autoBg.setFillStyle(currentEnabled ? 0x00ff88 : 0x333333, 0.2);
        });

        autoBg.on('pointerdown', () => {
            gameScene.events.emit('toggle-auto-action');
            // Small delay to ensure Game scene has processed the event if it's async for some reason
            this.time.delayedCall(10, () => {
                const nowEnabled = gameScene.turnManager.isAIEnabled;
                autoText.setText(nowEnabled ? 'AUTO MODE: ON' : 'AUTO MODE: OFF');
                autoText.setColor(nowEnabled ? '#00ff88' : '#aaaaaa');
                autoBg.setFillStyle(nowEnabled ? 0x00ff88 : 0x333333, 0.2);
                autoBg.setStrokeStyle(2, nowEnabled ? 0x00ff88 : 0x666666);
            });
        });

        // Finish Mission (Dev Only)
        let devButtons: any[] = [];
        if ("dev" === import.meta.env.VITE_ENV) {
            const finishBtn = this.add.container(0, 140);
            const finishBg = this.add.rectangle(0, 0, 250, 50, 0x004400, 0.5);
            finishBg.setStrokeStyle(2, 0x00aa00);
            const finishText = this.add.text(0, 0, 'FINISH MISSION', {
                fontSize: '18px',
                fontFamily: 'Orbitron',
                color: '#ffffff'
            }).setOrigin(0.5);
            finishBtn.add([finishBg, finishText]);
            finishBg.setInteractive({ useHandCursor: true });
            finishBg.on('pointerdown', () => {
                this.scene.stop();
                this.scene.stop('GameUI');
                gameScene.winMission();
            });
            devButtons.push(finishBtn);
        }

        // Quit Button (Back to Menu)
        const quitBtn = this.add.container(0, 60);
        const quitBg = this.add.rectangle(0, 0, 250, 50, 0xff4444, 0.1);
        quitBg.setStrokeStyle(2, 0xff4444);
        const quitText = this.add.text(0, 0, 'QUIT TO MAIN MENU', {
            fontSize: '18px',
            fontFamily: 'Orbitron',
            color: '#ffffff'
        }).setOrigin(0.5);

        quitBtn.add([quitBg, quitText]);
        quitBg.setInteractive({ useHandCursor: true });

        quitBg.on('pointerover', () => quitBg.setFillStyle(0xff4444, 0.3));
        quitBg.on('pointerout', () => quitBg.setFillStyle(0xff4444, 0.1));
        quitBg.on('pointerdown', () => {
            this.scene.stop('Game');
            this.scene.stop('GameUI');
            this.scene.stop();
            this.scene.start('MainMenu');
        });

        panel.add([bg, title, resumeBtn, autoBtn, ...devButtons, quitBtn]);

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
