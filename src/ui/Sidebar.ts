import { Scene, GameObjects } from 'phaser';

export class Sidebar extends GameObjects.Container {
    private detailsContainer: GameObjects.Container;
    private unitInfo: { name: GameObjects.Text, hp: GameObjects.Text, stats: GameObjects.Text, enhancement: GameObjects.Text, desc: GameObjects.Text };
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

    private summonBtn: GameObjects.Container;
    private summonBtnText: GameObjects.Text;
    private summonBtnBg: GameObjects.Rectangle;

    private autoBtn: GameObjects.Container;
    private autoBtnText: GameObjects.Text;
    private autoBtnBg: GameObjects.Rectangle;
    private waitBtn: GameObjects.Container;

    private summonPanel: GameObjects.Container;
    private machineButtons: GameObjects.Container[] = [];

    // Layout members
    private unitTitle: GameObjects.Text;
    private weaponTitle: GameObjects.Text;
    private scrapTitle: GameObjects.Text;
    private detailsMargin: number = 20;

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
        if ("dev" === import.meta.env.VITE_ENV) {
            const winBtn = this.createWinButton(scene, width / 2, height - 40);
            this.add(winBtn);
        }

        // Collect Scrap Button (hidden by default)
        this.createCollectButton(scene, width / 2, 420);

        // Attack Button (hidden by default)
        this.createAttackButton(scene, width / 2, 420); // They will likely not overlap because player can't collect scrap from an enemy cell

        // Switch Weapon Button (hidden by default)
        this.createSwitchWeaponButton(scene, width / 2, 470);

        // Summon Button (hidden by default)
        this.createSummonButton(scene, width / 2, 520);

        // Summon Panel (hidden by default)
        this.createSummonPanel(scene, width, height);

        // Auto Button
        this.createAutoButton(scene, width - 60, 25);

        // Wait Button
        this.createWaitButton(scene, width / 2, 570);

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
        this.turnText.setText(`TICK: ${turn}`);
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
        let y = 0;
        this.detailsContainer = scene.add.container(20, 140);
        this.add(this.detailsContainer);

        // Unit Section
        this.unitTitle = scene.add.text(0, y, 'UNIT DATA', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#00ffff'
        });

        this.unitInfo = {
            name: scene.add.text(0, y+=25, 'No Unit Selected', { fontSize: '18px', color: '#ffffff' }),
            hp: scene.add.text(0, y, '', { fontSize: '13px', color: '#ff5555' }), // Smaller font for row
            stats: scene.add.text(0, y+=25, '', { fontSize: '13px', color: '#aaaaaa' }),
            enhancement: scene.add.text(0, y+=25, 'No Enhancements', { fontSize: '12px', fontFamily: 'Orbitron', color: '#ff00ff' }),
            desc: scene.add.text(0, y+=50, '', { fontSize: '12px', color: '#888888', wordWrap: { width: width - 40 } }),
        };

        this.weaponTitle = scene.add.text(0, 105, 'WEAPONS', {
            fontSize: '11px',
            fontFamily: 'Arial Black',
            color: '#00ccff',
        });
        this.weaponTitle.setAlpha(0.7);

        this.weaponContainer = scene.add.container(0, 125);

        // Scrap Section
        this.scrapTitle = scene.add.text(0, 250, 'RESOURCES', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#ffaa00'
        });

        this.scrapInfo = {
            title: scene.add.text(0, 275, '', { fontSize: '16px', color: '#ffffff' }),
            value: scene.add.text(0, 300, '', { fontSize: '14px', color: '#ffaa00' })
        };

        this.carriedScrapText = scene.add.text(0, 325, '', {
            fontSize: '12px',
            fontFamily: 'Orbitron',
            color: '#00ffff'
        });

        this.detailsContainer.add([
            this.unitTitle, this.unitInfo.name, this.unitInfo.hp, this.unitInfo.stats, this.unitInfo.enhancement, this.weaponTitle, this.weaponContainer, this.unitInfo.desc,
            this.scrapTitle, this.scrapInfo.title, this.scrapInfo.value, this.carriedScrapText
        ]);
    }

    private layoutDetails() {
        let currentY = 0;

        // Unit Section
        this.unitTitle.y = currentY;
        currentY += 22;

        this.unitInfo.name.y = currentY;
        currentY += 24;

        // Stats Row 1: HP & AP
        this.unitInfo.hp.y = currentY;
        currentY += 20;

        // Stats Row 2: DEF & SPD
        this.unitInfo.stats.y = currentY;
        currentY += 20;

        // Enhancement Row
        if (this.unitInfo.enhancement.text.length > 0) {
            this.unitInfo.enhancement.y = currentY;
            currentY += 22;
        }

        // Weapons Section
        if (this.weaponContainer.length > 0) {
            this.weaponTitle.setVisible(true);
            this.weaponTitle.y = currentY;
            currentY += 18;
            this.weaponContainer.y = currentY;

            // Calculate height of weapons
            const weaponCount = this.weaponContainer.length;
            currentY += (weaponCount * 18) + 10;
        } else {
            this.weaponTitle.setVisible(false);
        }

        // Description
        if (this.unitInfo.desc.text.length > 0 && this.unitInfo.desc.text !== 'Select a grid to scan for units.') {
            this.unitInfo.desc.y = currentY;
            currentY += this.unitInfo.desc.height + 15;
        } else if (this.unitInfo.desc.text === 'Select a grid to scan for units.') {
            this.unitInfo.desc.y = currentY;
            currentY += 30;
        }

        // Scrap Section
        if (this.scrapInfo.title.text !== 'NONE' || this.carriedScrapText.visible) {
            this.scrapTitle.setVisible(true);
            this.scrapTitle.y = currentY;
            currentY += 22;

            this.scrapInfo.title.y = currentY;
            currentY += 22;

            this.scrapInfo.value.y = currentY;
            currentY += 20;

            if (this.carriedScrapText.visible) {
                this.carriedScrapText.y = currentY;
                currentY += 20;
            }
        } else {
            this.scrapTitle.setVisible(false);
        }

        // Final layout of buttons
        this.repositionActionButtons(currentY + 140);
    }

    private repositionActionButtons(startY: number = 420) {
        let currentY = Math.max(startY, 400);
        const sidebarWidth = 250;
        const centerX = sidebarWidth / 2;

        // Collect and Attack buttons can be side-by-side
        if (this.collectBtn.visible && this.attackBtn.visible) {
            // Resize them
            const smallWidth = 100;
            this.collectBtnBg.setSize(smallWidth, 45);
            this.attackBtnBg.setSize(smallWidth, 45);

            this.collectBtn.x = centerX - 55;
            this.attackBtn.x = centerX + 55;

            this.collectBtn.y = currentY + 22;
            this.attackBtn.y = currentY + 22;

            currentY += 60;
        } else {
            // Restore size and stack
            const normalWidth = 200;
            this.collectBtnBg.setSize(normalWidth, 45);
            this.attackBtnBg.setSize(normalWidth, 45);

            this.collectBtn.x = centerX;
            this.attackBtn.x = centerX;

            if (this.collectBtn.visible) {
                this.collectBtn.y = currentY + 22;
                currentY += 50;
            }
            if (this.attackBtn.visible) {
                this.attackBtn.y = currentY + 22;
                currentY += 50;
            }
        }

        // Switch and Summon buttons always full width
        if (this.switchWeaponBtn.visible) {
            this.switchWeaponBtn.y = currentY + 22;
            currentY += 50;
        }
        if (this.summonBtn.visible) {
            this.summonBtn.y = currentY + 22;
            currentY += 50;
        }
    }

    public updateDetails(unit: any | null, scrap: any | null) {
        if (unit) {
            this.unitInfo.name.setText(unit.name.toUpperCase());
            this.unitInfo.hp.setText(`HP: ${unit.hp}/${unit.maxHp}  |  AP: ${Math.floor(unit.ap)}`);
            this.unitInfo.stats.setText(`DEF: ${unit.defense}  |  SPD: ${unit.speed}`);

            if (unit.enhancement) {
                this.unitInfo.enhancement.setText(`ENHANCED: ${unit.enhancement.toUpperCase()}`);
                this.unitInfo.enhancement.setVisible(true);
            } else {
                this.unitInfo.enhancement.setText('');
                this.unitInfo.enhancement.setVisible(false);
            }

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

            // Show summon button if player
            if (unit.name === 'CORE-01') {
                this.showSummonButton(true, 30); // Hardcoded cost for Sentinel for now
            } else {
                this.showSummonButton(false);
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
        if (!unit || unit.name !== 'CORE-01' || (unit.equippedWeapons && unit.equippedWeapons.length <= 1)) {
            this.showSwitchWeaponButton(false);
        }

        if (!unit || unit.name !== 'CORE-01') {
            this.showSummonButton(false);
            this.summonPanel.setVisible(false);
            this.detailsContainer.setVisible(true);
        }

        // Refresh dynamic layout
        this.layoutDetails();
    }

    public showCollectButton(visible: boolean, cost: number = 0) {
        this.collectBtn.setVisible(visible);
        if (visible) {
            this.collectBtnText.setText(`COLLECT (${cost} AP)`);
        }
        this.layoutDetails();
    }

    public showAttackButton(visible: boolean, cost: number = 0) {
        this.attackBtn.setVisible(visible);
        if (visible) {
            this.attackBtnText.setText(`ATTACK (${cost} AP)`);
        }
        this.layoutDetails();
    }

    public showSwitchWeaponButton(visible: boolean) {
        this.switchWeaponBtn.setVisible(visible);
        this.layoutDetails();
    }

    public showSummonButton(visible: boolean, cost: number = 0) {
        this.summonBtn.setVisible(visible);
        this.layoutDetails();
    }

    public openSummonPanel(machines: any[], currentScrap: number) {
        this.detailsContainer.setVisible(false);
        this.summonPanel.setVisible(true);
        this.showSummonButton(false);
        this.showAttackButton(false);
        this.showCollectButton(false);
        this.showSwitchWeaponButton(false);

        // Update buttons state
        this.machineButtons.forEach((btn: any, index) => {
            const machine = machines[index];
            const canAfford = currentScrap >= machine.cost;
            const bg = btn.getAt(0) as GameObjects.Rectangle;
            const txt = btn.getAt(1) as GameObjects.Text;
            const costTxt = btn.getAt(2) as GameObjects.Text;

            if (canAfford) {
                bg.setAlpha(0.2);
                bg.setStrokeStyle(2, 0x00ff88);
                txt.setColor('#ffffff');
                costTxt.setColor('#00ff88');
                bg.setInteractive();
            } else {
                bg.setAlpha(0.05);
                bg.setStrokeStyle(1, 0x444444);
                txt.setColor('#444444');
                costTxt.setColor('#444444');
                bg.disableInteractive();
            }
        });
    }

    public closeSummonPanel() {
        this.summonPanel.setVisible(false);
        this.detailsContainer.setVisible(true);
        this.showSummonButton(true);
    }

    private createCollectButton(scene: Scene, x: number, y: number) {
        this.collectBtn = scene.add.container(x, y);
        this.collectBtnBg = scene.add.rectangle(0, 0, 200, 45, 0xffaa00, 0.2);
        this.collectBtnBg.setStrokeStyle(2, 0xffaa00);

        this.collectBtnText = scene.add.text(0, 0, 'COLLECT', {
            fontSize: '11px', // Smaller font for potential side-by-side
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
            fontSize: '11px', // Smaller font for potential side-by-side
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

    private createSummonButton(scene: Scene, x: number, y: number) {
        this.summonBtn = scene.add.container(x, y);
        this.summonBtnBg = scene.add.rectangle(0, 0, 200, 45, 0x00ff88, 0.2);
        this.summonBtnBg.setStrokeStyle(2, 0x00ff88);

        this.summonBtnText = scene.add.text(0, 0, 'CONSTRUCT MACHINE', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.summonBtn.add([this.summonBtnBg, this.summonBtnText]);
        this.add(this.summonBtn);

        this.summonBtnBg.setInteractive({ useHandCursor: true });
        this.summonBtn.setVisible(false);

        this.summonBtnBg.on('pointerover', () => {
            this.summonBtnBg.setFillStyle(0x00ff88, 0.4);
        });

        this.summonBtnBg.on('pointerout', () => {
            this.summonBtnBg.setFillStyle(0x00ff88, 0.2);
        });

        this.summonBtnBg.on('pointerdown', () => {
            this.scene.events.emit('open-summon-panel-request');
        });
    }

    private createSummonPanel(scene: Scene, width: number, height: number) {
        this.summonPanel = scene.add.container(0, 140);
        this.add(this.summonPanel);
        this.summonPanel.setVisible(false);

        const title = scene.add.text(20, 0, 'SELECT MACHINE', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#00ff88'
        });
        this.summonPanel.add(title);

        // Load machine data (will be passed from Game.ts but we need to create placeholders)
        // We will create 3 buttons for now
        const machineNames = ["SENTINEL", "HEAVY", "DRONE"];
        const machineCosts = [30, 50, 20];

        machineNames.forEach((name, i) => {
            const btn = scene.add.container(width / 2, 40 + i * 55);
            const bg = scene.add.rectangle(0, 0, 200, 45, 0x00ff88, 0.2);
            bg.setStrokeStyle(2, 0x00ff88);

            const txt = scene.add.text(-90, 0, name, {
                fontSize: '14px',
                fontFamily: 'Orbitron',
                color: '#ffffff'
            }).setOrigin(0, 0.5);

            const costTxt = scene.add.text(90, 0, `${machineCosts[i]} S`, {
                fontSize: '13px',
                fontFamily: 'monospace',
                color: '#00ff88'
            }).setOrigin(1, 0.5);

            btn.add([bg, txt, costTxt]);
            this.summonPanel.add(btn);
            this.machineButtons.push(btn);

            bg.on('pointerover', () => bg.setFillStyle(0x00ff88, 0.4));
            bg.on('pointerout', () => bg.setFillStyle(0x00ff88, 0.2));
            bg.on('pointerdown', () => {
                this.scene.events.emit('select-machine-to-summon', i);
            });
        });

        // Cancel Button
        const cancelBtn = scene.add.container(width / 2, 230);
        const cancelBg = scene.add.rectangle(0, 0, 200, 45, 0xff4444, 0.1);
        cancelBg.setStrokeStyle(1, 0xff4444);
        const cancelTxt = scene.add.text(0, 0, 'CANCEL', { fontSize: '14px', color: '#ff4444' }).setOrigin(0.5);
        cancelBtn.add([cancelBg, cancelTxt]);
        this.summonPanel.add(cancelBtn);

        cancelBg.setInteractive({ useHandCursor: true });
        cancelBg.on('pointerdown', () => {
            this.scene.events.emit('cancel-summon-request');
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

    private createAutoButton(scene: Scene, x: number, y: number) {
        this.autoBtn = scene.add.container(x, y);
        this.autoBtnBg = scene.add.rectangle(0, 0, 90, 24, 0x333333);
        this.autoBtnBg.setStrokeStyle(1, 0x666666);

        this.autoBtnText = scene.add.text(0, 0, 'AUTO: OFF', {
            fontSize: '10px',
            fontFamily: 'Orbitron',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        this.autoBtn.add([this.autoBtnBg, this.autoBtnText]);
        this.autoBtnBg.setInteractive({ useHandCursor: true });

        this.autoBtnBg.on('pointerover', () => this.autoBtnBg.setStrokeStyle(1, 0x00ccff));
        this.autoBtnBg.on('pointerout', () => {
            const isEnabled = this.autoBtnText.text.includes('ON');
            this.autoBtnBg.setStrokeStyle(1, isEnabled ? 0x00ff88 : 0x666666);
        });

        this.autoBtnBg.on('pointerdown', () => {
            this.scene.events.emit('toggle-auto-request');
        });

        this.add(this.autoBtn);
    }

    public updateAutoButton(isEnabled: boolean) {
        if (isEnabled) {
            this.autoBtnText.setText('AUTO: ON');
            this.autoBtnText.setColor('#00ff88');
            this.autoBtnBg.setStrokeStyle(2, 0x00ff88);
            this.autoBtnBg.setFillStyle(0x004422);
        } else {
            this.autoBtnText.setText('AUTO: OFF');
            this.autoBtnText.setColor('#aaaaaa');
            this.autoBtnBg.setStrokeStyle(1, 0x666666);
            this.autoBtnBg.setFillStyle(0x333333);
        }
    }

    private createWaitButton(scene: Scene, x: number, y: number) {
        this.waitBtn = scene.add.container(x, y);
        const bg = scene.add.rectangle(0, 0, 180, 35, 0x444444);
        bg.setStrokeStyle(2, 0x888888);

        const text = scene.add.text(0, 0, 'WAIT (20 AP)', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.waitBtn.add([bg, text]);
        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => bg.setStrokeStyle(2, 0xffffff));
        bg.on('pointerout', () => bg.setStrokeStyle(2, 0x888888));

        bg.on('pointerdown', () => {
            this.scene.events.emit('wait-request');
        });

        this.add(this.waitBtn);
    }
}
