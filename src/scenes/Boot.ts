import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/bg.png');
    }

    create() {
        const isDev = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isDev) {
            let fpsDisplay = document.getElementById('fps-counter');
            if (!fpsDisplay) {
                fpsDisplay = document.createElement('div');
                fpsDisplay.id = 'fps-counter';
                Object.assign(fpsDisplay.style, {
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    padding: '4px 8px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: '#00ff00',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    zIndex: '9999',
                    pointerEvents: 'none',
                    borderRadius: '4px',
                    border: '1px solid #00ff00'
                });
                document.body.appendChild(fpsDisplay);
            }
            
            // Global check on game loop
            this.game.events.on('step', () => {
                if (fpsDisplay) {
                    fpsDisplay.innerText = `FPS: ${Math.round(this.game.loop.actualFps)}`;
                }
            });
        }

        this.scene.start('Preloader');
    }
}
