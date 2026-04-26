import { Scene } from 'phaser';
import { narations } from '../entity/Naration';

export interface NarrationSceneData {
    narrationKey: string;
    nextScene: string;
    nextSceneData?: any;
}

export class Narration extends Scene {
    private sceneData: NarrationSceneData;
    private currentNarration?: any;
    private textIndex: number = 0;
    private isTyping: boolean = false;
    private textGameObject: Phaser.GameObjects.Text;
    private titleGameObject: Phaser.GameObjects.Text;
    private fullText: string = "";
    private currentIndex: number = 0;
    private typingTimer?: Phaser.Time.TimerEvent;

    constructor() {
        super('Narration');
    }

    init(data: NarrationSceneData) {
        this.sceneData = data;
        this.currentNarration = narations.find(n => n.key === data.narrationKey);
        this.textIndex = 0;
    }

    create() {
        const { width, height } = this.scale;
        
        // Reset camera
        this.cameras.main.fadeIn(500);

        // Dark sci-fi background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x000005, 0x000005, 0x000511, 0x000511, 1);
        bg.fillRect(0, 0, width, height);

        // Decorative elements
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x00ffff, 0.03);
        for (let x = 0; x < width; x += 50) grid.lineBetween(x, 0, x, height);
        for (let y = 0; y < height; y += 50) grid.lineBetween(0, y, width, y);

        // Scanline effect
        const scanlines = this.add.graphics();
        scanlines.lineStyle(2, 0x000000, 0.1);
        for (let y = 0; y < height; y += 4) {
            scanlines.lineBetween(0, y, width, y);
        }

        // Header
        this.titleGameObject = this.add.text(width / 2, 100, '', {
            fontSize: '32px',
            fontFamily: 'Orbitron',
            color: '#00ffff',
            stroke: '#004444',
            strokeThickness: 2
        }).setOrigin(0.5);

        if (this.currentNarration?.title) {
            this.titleGameObject.setText(this.currentNarration.title.toUpperCase());
        }

        // Narration text
        this.textGameObject = this.add.text(width / 2, height / 2, '', {
            fontSize: '28px',
            fontFamily: 'Orbitron',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.7 },
            lineSpacing: 12
        }).setOrigin(0.5);

        // Continue prompt (blinking)
        const prompt = this.add.text(width / 2, height - 80, '>>> CLICK TO CONTINUE <<<', {
            fontSize: '16px',
            fontFamily: 'Orbitron',
            color: '#00ffff',
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Typing effect
        this.displayNextPage();

        // Skip Button (Top Right)
        const skipBtn = this.add.container(width - 80, 50);
        const skipBg = this.add.rectangle(0, 0, 100, 35, 0x00ffff, 0.1);
        skipBg.setStrokeStyle(1, 0x00ffff);
        const skipText = this.add.text(0, 0, 'SKIP', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#00ffff'
        }).setOrigin(0.5);
        skipBtn.add([skipBg, skipText]);

        skipBg.setInteractive({ useHandCursor: true });
        skipBg.on('pointerover', () => skipBg.setFillStyle(0x00ffff, 0.3));
        skipBg.on('pointerout', () => skipBg.setFillStyle(0x00ffff, 0.1));
        skipBg.on('pointerdown', (pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation();
            this.transitionToNext();
        });

        this.input.on('pointerdown', () => {
            if (this.isTyping) {
                this.completeTyping();
            } else {
                this.displayNextPage();
            }
        });
    }

    private displayNextPage() {
        if (!this.currentNarration || this.textIndex >= this.currentNarration.text.length) {
            this.transitionToNext();
            return;
        }

        this.fullText = this.currentNarration.text[this.textIndex];
        this.textIndex++;
        this.startTyping();
    }

    private startTyping() {
        this.isTyping = true;
        this.currentIndex = 0;
        this.textGameObject.text = "";
        
        if (this.typingTimer) this.typingTimer.remove();
        
        this.typingTimer = this.time.addEvent({
            delay: 40,
            callback: () => {
                this.textGameObject.text += this.fullText[this.currentIndex];
                this.currentIndex++;
                if (this.currentIndex >= this.fullText.length) {
                    this.isTyping = false;
                }
            },
            repeat: this.fullText.length - 1
        });
    }

    private completeTyping() {
        this.isTyping = false;
        if (this.typingTimer) this.typingTimer.remove();
        this.textGameObject.text = this.fullText;
    }

    private transitionToNext() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(this.sceneData.nextScene, this.sceneData.nextSceneData);
        });
    }
}
