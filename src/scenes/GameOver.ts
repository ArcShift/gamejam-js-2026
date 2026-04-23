import { Scene } from 'phaser';

export class GameOver extends Scene
{
    private message: string = 'GAME OVER';

    constructor ()
    {
        super('GameOver');
    }

    init (data: { message?: string })
    {
        if (data.message) {
            this.message = data.message;
        }
    }

    create ()
    {
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor(0x0a0a0a);
        this.cameras.main.fadeIn(500);

        // Techy background effect (scanlines/grid)
        const grid = this.add.grid(width/2, height/2, width, height, 64, 64, 0x000000, 0, 0x333333, 0.1);
        
        // Title
        const title = this.add.text(width / 2, height / 2 - 50, 'CONNECTION TERMINATED', {
            fontFamily: 'Orbitron',
            fontSize: '48px',
            color: '#ff4444',
            stroke: '#000000',
            strokeThickness: 8,
        }).setOrigin(0.5);

        // Custom Message
        const subtext = this.add.text(width / 2, height / 2 + 30, this.message.toUpperCase(), {
            fontFamily: 'Orbitron',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Pulse effect on title
        this.tweens.add({
            targets: title,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Prompt to restart
        const prompt = this.add.text(width / 2, height - 100, 'CLICK TO RETURN TO MISSION HUB', {
            fontFamily: 'Orbitron',
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        this.input.once('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Campaign');
            });
        });
    }
}
