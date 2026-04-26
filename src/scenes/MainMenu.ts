import { Scene, GameObjects } from 'phaser';
import { GH, GW } from '../main';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    create() {
        const menu = [
            { title: 'Play', scene: 'Campaign', },
            { title: 'How to Play', scene: 'Tutorial' }
        ]
         const bg = this.add.graphics();
        bg.fillGradientStyle(0x000005, 0x000005, 0x000511, 0x000511, 1);
        bg.fillRect(0, 0, GW, GH);
        this.background = this.add.image(512, 384, 'background').setAlpha(0.5);

        this.title = this.add.text(GW / 2, 200, 'Technomancer', {
            fontFamily: 'Orbitron',
            fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        this.add.text(GW / 2, 250, '7 Deadly Mech Sins',
            {
                fontFamily: 'Orbitron',
                fontSize: 24, color: '#ffffff',
                stroke: '#000000', strokeThickness: 8,
                align: 'center'
            }).setOrigin(0.5);


        let startY = 400;

        menu.forEach((item, index) => {
            const btn = this.add.text(GW / 2, startY + index * 60, item.title, {
                fontFamily: 'Orbitron',
                fontSize: 28,
                color: '#ffffff',
                stroke: '#007a7aff', strokeThickness: 6,
                align: 'center'
            }).setOrigin(0.5);

            btn.setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => {
                btn.setScale(1.1);
                btn.setColor('#00ffff');
            });

            btn.on('pointerout', () => {
                btn.setScale(1);
                btn.setColor('#ffffff');
            });

            btn.on('pointerdown', () => {
                if (item.scene) {
                    this.scene.start(item.scene);
                }
            });
        });

        // this.input.once('pointerdown', () => {

        //     this.scene.start('Campaign');

        // });
    }
}
