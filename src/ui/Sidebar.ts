import { Scene, GameObjects } from 'phaser';

export class Sidebar extends GameObjects.Container {
    private detailsContainer: GameObjects.Container;
    private unitInfo: { name: GameObjects.Text, hp: GameObjects.Text, stats: GameObjects.Text, desc: GameObjects.Text };
    private scrapInfo: { title: GameObjects.Text, value: GameObjects.Text };
    private bg: GameObjects.Rectangle;

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

        // Details Panel
        this.createDetailsPanel(scene, width, height);

        // Pause Button (moved to bottom)
        const pauseBtn = this.createPauseButton(scene, width / 2, height - 90);
        this.add(pauseBtn);

        // Win Button (temp for testing narration)
        const winBtn = this.createWinButton(scene, width / 2, height - 40);
        this.add(winBtn);

        // Add the container to the scene
        scene.add.existing(this);
    }

    private createDetailsPanel(scene: Scene, width: number, height: number) {
        this.detailsContainer = scene.add.container(20, 80);
        this.add(this.detailsContainer);

        // Unit Section
        const unitTitle = scene.add.text(0, 0, 'UNIT DATA', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#00ffff'
        });
        
        this.unitInfo = {
            name: scene.add.text(0, 25, 'No Unit Selected', { fontSize: '18px', color: '#ffffff' }),
            hp: scene.add.text(0, 50, '', { fontSize: '14px', color: '#ff5555' }),
            stats: scene.add.text(0, 70, '', { fontSize: '13px', color: '#aaaaaa' }),
            desc: scene.add.text(0, 95, '', { fontSize: '12px', color: '#888888', wordWrap: { width: width - 40 } })
        };

        // Scrap Section
        const scrapY = 220;
        const scrapTitle = scene.add.text(0, scrapY, 'RESOURCES', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#ffaa00'
        });

        this.scrapInfo = {
            title: scene.add.text(0, scrapY + 25, '', { fontSize: '16px', color: '#ffffff' }),
            value: scene.add.text(0, scrapY + 50, '', { fontSize: '14px', color: '#ffaa00' })
        };

        this.detailsContainer.add([
            unitTitle, this.unitInfo.name, this.unitInfo.hp, this.unitInfo.stats, this.unitInfo.desc,
            scrapTitle, this.scrapInfo.title, this.scrapInfo.value
        ]);
    }

    public updateDetails(unit: any | null, scrap: any | null) {
        if (unit) {
            this.unitInfo.name.setText(unit.name.toUpperCase());
            this.unitInfo.hp.setText(`HP: ${unit.hp} / ${unit.maxHp}`);
            this.unitInfo.stats.setText(`ATK: ${unit.attack}  DEF: ${unit.defense}  SPD: ${unit.speed}`);
            this.unitInfo.desc.setText(unit.description);
        } else {
            this.unitInfo.name.setText('NONE');
            this.unitInfo.hp.setText('');
            this.unitInfo.stats.setText('');
            this.unitInfo.desc.setText('Select a grid to scan for units.');
        }

        if (scrap) {
            this.scrapInfo.title.setText('SCRAP METAL');
            this.scrapInfo.value.setText(`VALUE: ${scrap.value} units`);
        } else {
            this.scrapInfo.title.setText('NONE');
            this.scrapInfo.value.setText('');
        }
    }

    private createPauseButton(scene: Scene, x: number, y: number): GameObjects.Container {
        const container = scene.add.container(x, y);
        const bg = scene.add.rectangle(0, 0, 200, 45, 0x333333);
        bg.setStrokeStyle(2, 0x555555);
        
        const text = scene.add.text(0, 0, 'PAUSE SYSTEM', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
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
            scene.scene.pause('Game');
            scene.scene.pause('GameUI');
            scene.scene.launch('Pause');
        });

        return container;
    }

    private createWinButton(scene: Scene, x: number, y: number): GameObjects.Container {
        const container = scene.add.container(x, y);
        const bg = scene.add.rectangle(0, 0, 200, 45, 0x004400);
        bg.setStrokeStyle(2, 0x00aa00);
        
        const text = scene.add.text(0, 0, 'FINISH MISSION', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
        }).setOrigin(0.5);

        container.add([bg, text]);
        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => {
            bg.setFillStyle(0x006600);
            bg.setStrokeStyle(2, 0x00ff00);
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(0x004400);
            bg.setStrokeStyle(2, 0x00aa00);
        });

        bg.on('pointerdown', () => {
            const gameScene = scene.scene.get('Game') as any;
            if (gameScene && gameScene.winMission) {
                gameScene.winMission();
            }
        });

        return container;
    }
}
