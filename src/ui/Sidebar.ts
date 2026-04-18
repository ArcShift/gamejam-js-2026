import { Scene, GameObjects } from 'phaser';

export class Sidebar extends GameObjects.Container {
    private detailsContainer: GameObjects.Container;
    private unitInfo: { name: GameObjects.Text, hp: GameObjects.Text, stats: GameObjects.Text, desc: GameObjects.Text };
    private weaponContainer: GameObjects.Container;
    private scrapInfo: { title: GameObjects.Text, value: GameObjects.Text };
    private bg: GameObjects.Rectangle;

    // Turn system UI
    private turnText: GameObjects.Text;
    private phaseText: GameObjects.Text;
    private apLabelText: GameObjects.Text;
    private apValueText: GameObjects.Text;
    private apBarBg: GameObjects.Rectangle;
    private apBarFill: GameObjects.Rectangle;
    private apBarWidth: number;
    private collectBtn: GameObjects.Container;
    private collectBtnText: GameObjects.Text;
    private collectBtnBg: GameObjects.Rectangle;
    private carriedScrapText: GameObjects.Text;

    private attackBtn: GameObjects.Container;
    private attackBtnText: GameObjects.Text;
    private attackBtnBg: GameObjects.Rectangle;

    private switchWeaponBtn: GameObjects.Container;
    private switchWeaponBtnText: GameObjects.Text;
    private switchWeaponBtnBg: GameObjects.Rectangle;

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

        // Turn & AP Panel (below header, above details)
        this.createTurnPanel(scene, width);

        // Details Panel
        this.createDetailsPanel(scene, width, height);

        // Pause Button (moved to bottom)
        const pauseBtn = this.createPauseButton(scene, width / 2, height - 90);
        this.add(pauseBtn);

        // Win Button (temp for testing narration)
        const winBtn = this.createWinButton(scene, width / 2, height - 40);
        this.add(winBtn);

        // Collect Scrap Button (hidden by default)
        this.createCollectButton(scene, width / 2, 420);

        // Attack Button (hidden by default)
        this.createAttackButton(scene, width / 2, 420); // They will likely not overlap because player can't collect scrap from an enemy cell

        // Switch Weapon Button (hidden by default)
        this.createSwitchWeaponButton(scene, width / 2, 470);

        // Add the container to the scene
        scene.add.existing(this);
    }

    private createTurnPanel(scene: Scene, width: number) {
        const panelY = 55;
        const padX = 15;

        // Separator line
        const sep = scene.add.rectangle(padX, panelY, width - padX * 2, 1, 0x333333);
        sep.setOrigin(0, 0);
        this.add(sep);

        // Turn counter
        this.turnText = scene.add.text(padX, panelY + 8, 'TURN: 0', {
            fontSize: '13px',
            fontFamily: 'Orbitron, monospace',
            color: '#888888'
        });
        this.add(this.turnText);

        // Phase indicator
        this.phaseText = scene.add.text(width - padX, panelY + 8, 'YOUR TURN', {
            fontSize: '13px',
            fontFamily: 'Orbitron, monospace',
            color: '#00ff88'
        }).setOrigin(1, 0);
        this.add(this.phaseText);

        // AP Label
        this.apLabelText = scene.add.text(padX, panelY + 30, 'ACTION POINTS', {
            fontSize: '11px',
            fontFamily: 'Orbitron, monospace',
            color: '#00ccff'
        });
        this.add(this.apLabelText);

        // AP Value text
        this.apValueText = scene.add.text(width - padX, panelY + 30, '0 / 100', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(1, 0);
        this.add(this.apValueText);

        // AP Bar background
        this.apBarWidth = width - padX * 2;
        this.apBarBg = scene.add.rectangle(padX, panelY + 48, this.apBarWidth, 12, 0x222222);
        this.apBarBg.setOrigin(0, 0);
        this.apBarBg.setStrokeStyle(1, 0x444444);
        this.add(this.apBarBg);

        // AP Bar fill
        this.apBarFill = scene.add.rectangle(padX + 1, panelY + 49, 0, 10, 0x00ccff);
        this.apBarFill.setOrigin(0, 0);
        this.add(this.apBarFill);

        // Bottom separator
        const sep2 = scene.add.rectangle(padX, panelY + 68, width - padX * 2, 1, 0x333333);
        sep2.setOrigin(0, 0);
        this.add(sep2);
    }

    public updateAP(ap: number, turn: number, activeUnitName: string) {
        this.turnText.setText(`TURN: ${turn}`);
        this.apValueText.setText(`${ap} / 100`);

        // Update active unit text
        this.phaseText.setText(activeUnitName.toUpperCase());
        if (activeUnitName === 'CORE-01') {
            this.phaseText.setColor('#00ff88'); // Player color
        } else {
            this.phaseText.setColor('#ff4444'); // Enemy color
        }

        // Animate AP bar fill (cap visually at 100% but keep data)
        const progress = Math.min(1, ap / 100);
        const fillWidth = Math.max(0, progress * (this.apBarWidth - 2));
        this.scene.tweens.add({
            targets: this.apBarFill,
            displayWidth: fillWidth,
            duration: 200,
            ease: 'Power2'
        });

        // Color the bar based on AP level
        if (ap >= 50) {
            this.apBarFill.setFillStyle(0x00ccff); // Cyan - plenty of AP
        } else if (ap >= 25) {
            this.apBarFill.setFillStyle(0xffaa00); // Orange - one move left
        } else {
            this.apBarFill.setFillStyle(0xff4444); // Red - not enough to move
        }
    }

    private createDetailsPanel(scene: Scene, width: number, _height?: number) {
        this.detailsContainer = scene.add.container(20, 140);
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
            stats: scene.add.text(0, 75, '', { fontSize: '13px', color: '#aaaaaa' }),
            desc: scene.add.text(0, 200, '', { fontSize: '12px', color: '#888888', wordWrap: { width: width - 40 } })
        };

        const weaponTitle = scene.add.text(0, 105, 'WEAPONS', {
            fontSize: '11px',
            fontFamily: 'Orbitron',
            color: '#00ccff',
            alpha: 0.7
        });

        this.weaponContainer = scene.add.container(0, 125);

        // Scrap Section
        const scrapY = 280;
        const scrapTitle = scene.add.text(0, scrapY, 'RESOURCES', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#ffaa00'
        });

        this.scrapInfo = {
            title: scene.add.text(0, scrapY + 25, '', { fontSize: '16px', color: '#ffffff' }),
            value: scene.add.text(0, scrapY + 50, '', { fontSize: '14px', color: '#ffaa00' })
        };

        this.carriedScrapText = scene.add.text(0, scrapY + 75, '', {
            fontSize: '12px',
            fontFamily: 'Orbitron',
            color: '#00ffff'
        });

        this.detailsContainer.add([
            unitTitle, this.unitInfo.name, this.unitInfo.hp, this.unitInfo.stats, weaponTitle, this.weaponContainer, this.unitInfo.desc,
            scrapTitle, this.scrapInfo.title, this.scrapInfo.value, this.carriedScrapText
        ]);
    }

    public updateDetails(unit: any | null, scrap: any | null) {
        if (unit) {
            this.unitInfo.name.setText(unit.name.toUpperCase());
            this.unitInfo.hp.setText(`HP: ${unit.hp} / ${unit.maxHp}`);
            this.unitInfo.stats.setText(`DEF: ${unit.defense} SPD: ${unit.speed}\nAP: ${Math.floor(unit.ap)}`);
            
            this.weaponContainer.removeAll(true);
            if (unit.equippedWeapons && unit.equippedWeapons.length > 0) {
                unit.equippedWeapons.forEach((w: any, index: number) => {
                    const isActive = index === unit.selectedWeaponIndex;
                    const color = isActive ? '#00ffff' : '#666666';
                    const prefix = isActive ? '> ' : '  ';
                    
                    const weaponTxt = this.scene.add.text(0, index * 18, `${prefix}${w.name.toUpperCase()} [${w.currentAmmo}/${w.maxAmmo}]`, {
                        fontSize: '11px',
                        fontFamily: 'Orbitron',
                        color: color
                    });
                    
                    if (isActive) {
                        weaponTxt.setStroke('#00ffff', 1);
                    }
                    
                    this.weaponContainer.add(weaponTxt);
                });
            } else {
                this.weaponContainer.add(this.scene.add.text(0, 0, 'NONE', { fontSize: '11px', color: '#666666' }));
            }
            
            // Show switch weapon button if player has more than 1 weapon
            if (unit.name === 'CORE-01' && unit.equippedWeapons.length > 1) {
                this.showSwitchWeaponButton(true);
            } else {
                this.showSwitchWeaponButton(false);
            }
            
            this.unitInfo.desc.setText(unit.description);
        } else {
            this.unitInfo.name.setText('NONE');
            this.unitInfo.hp.setText('');
            this.unitInfo.stats.setText('');
            this.weaponContainer.removeAll(true);
            this.unitInfo.desc.setText('Select a grid to scan for units.');
        }

        if (scrap) {
            this.scrapInfo.title.setText('SCRAP METAL');
            this.scrapInfo.value.setText(`VALUE: ${scrap.value} units`);
        } else {
            this.scrapInfo.title.setText('NONE');
            this.scrapInfo.value.setText('');
        }

        // Show carried scrap if selecting player
        if (unit && unit.name === 'CORE-01') {
            this.carriedScrapText.setText(`CARRIED: ${unit.scrap} / 100`);
            this.carriedScrapText.setVisible(true);
        } else {
            this.carriedScrapText.setVisible(false);
        }

        // Auto-hide collect button if no scrap or not player
        if (!scrap || !unit || unit.name !== 'CORE-01') {
            this.showCollectButton(false);
        }

        // We will manage attack button visibility from GameUI since it needs weapon data,
        // or just expose showAttackButton.
        if (!unit || unit.name !== 'CORE-01' || unit.equippedWeapons.length <= 1) {
            this.showSwitchWeaponButton(false);
        }
    }

    public showCollectButton(visible: boolean, cost: number = 0) {
        this.collectBtn.setVisible(visible);
        if (visible) {
            this.collectBtnText.setText(`COLLECT (${cost} AP)`);
        }
    }

    public showAttackButton(visible: boolean, cost: number = 0) {
        this.attackBtn.setVisible(visible);
        if (visible) {
            this.attackBtnText.setText(`ATTACK (${cost} AP)`);
        }
    }

    public showSwitchWeaponButton(visible: boolean) {
        this.switchWeaponBtn.setVisible(visible);
    }

    private createCollectButton(scene: Scene, x: number, y: number) {
        this.collectBtn = scene.add.container(x, y);
        this.collectBtnBg = scene.add.rectangle(0, 0, 200, 45, 0xffaa00, 0.2);
        this.collectBtnBg.setStrokeStyle(2, 0xffaa00);
        
        this.collectBtnText = scene.add.text(0, 0, 'COLLECT SCRAP', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.collectBtn.add([this.collectBtnBg, this.collectBtnText]);
        this.add(this.collectBtn);

        this.collectBtnBg.setInteractive({ useHandCursor: true });
        this.collectBtn.setVisible(false);

        this.collectBtnBg.on('pointerover', () => {
            this.collectBtnBg.setFillStyle(0xffaa00, 0.4);
        });

        this.collectBtnBg.on('pointerout', () => {
            this.collectBtnBg.setFillStyle(0xffaa00, 0.2);
        });

        this.collectBtnBg.on('pointerdown', () => {
            this.scene.events.emit('collect-scrap-request');
        });
    }

    private createAttackButton(scene: Scene, x: number, y: number) {
        this.attackBtn = scene.add.container(x, y);
        this.attackBtnBg = scene.add.rectangle(0, 0, 200, 45, 0xff0000, 0.2);
        this.attackBtnBg.setStrokeStyle(2, 0xff0000);
        
        this.attackBtnText = scene.add.text(0, 0, 'ATTACK', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.attackBtn.add([this.attackBtnBg, this.attackBtnText]);
        this.add(this.attackBtn);

        this.attackBtnBg.setInteractive({ useHandCursor: true });
        this.attackBtn.setVisible(false);

        this.attackBtnBg.on('pointerover', () => {
            this.attackBtnBg.setFillStyle(0xff0000, 0.4);
        });

        this.attackBtnBg.on('pointerout', () => {
            this.attackBtnBg.setFillStyle(0xff0000, 0.2);
        });

        this.attackBtnBg.on('pointerdown', () => {
            this.scene.events.emit('attack-request');
        });
    }

    private createSwitchWeaponButton(scene: Scene, x: number, y: number) {
        this.switchWeaponBtn = scene.add.container(x, y);
        this.switchWeaponBtnBg = scene.add.rectangle(0, 0, 200, 45, 0x00ccff, 0.2);
        this.switchWeaponBtnBg.setStrokeStyle(2, 0x00ccff);
        
        this.switchWeaponBtnText = scene.add.text(0, 0, 'SWITCH WEAPON', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.switchWeaponBtn.add([this.switchWeaponBtnBg, this.switchWeaponBtnText]);
        this.add(this.switchWeaponBtn);

        this.switchWeaponBtnBg.setInteractive({ useHandCursor: true });
        this.switchWeaponBtn.setVisible(false);

        this.switchWeaponBtnBg.on('pointerover', () => {
            this.switchWeaponBtnBg.setFillStyle(0x00ccff, 0.4);
        });

        this.switchWeaponBtnBg.on('pointerout', () => {
            this.switchWeaponBtnBg.setFillStyle(0x00ccff, 0.2);
        });

        this.switchWeaponBtnBg.on('pointerdown', () => {
            this.scene.events.emit('switch-weapon-request');
        });
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
