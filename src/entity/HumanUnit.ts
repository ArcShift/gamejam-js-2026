import { Scene } from 'phaser';
import { IUnit, Unit, UnitType, Faction } from "./Unit";

export interface IHumanUnit extends IUnit {
    faction: Faction;
}

export class HumanUnit extends Unit implements IHumanUnit {
    faction: Faction;
    container: Phaser.GameObjects.Container;
    sprite: Phaser.GameObjects.Sprite;

    constructor(scene: Scene, config: IHumanUnit) {
        super(config.name, config.description, config.maxHp, config.defense, config.speed, UnitType.Human, config.weapon, config.faction, config.skills, config.spriteIndex);
        this.faction = config.faction;
        
        this.container = scene.add.container(0, 0);
        
        const visualContainer = scene.add.container(0, 0);

        // Shadow for depth
        const shadow = scene.add.ellipse(0, 15, 24, 12, 0x000000, 0.3);
        
        // Sprite
        this.sprite = scene.add.sprite(0, 0, 'human', config.spriteIndex[1]);
        this.sprite.setScale(0.5); // Scale to fit cell

        visualContainer.add([shadow, this.sprite]);

        this.container.add(visualContainer);

        // Pulse animation on the visual container, NOT the main container
        scene.tweens.add({
            targets: visualContainer,
            y: "-=2",
            duration: 1500 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.container.setDepth(10);
        scene.add.existing(this.container);
    }
    
    faceTarget(targetGx: number) {
        if (targetGx < this.gx) {
            this.sprite.setFlipX(true);
        } else if (targetGx > this.gx) {
            this.sprite.setFlipX(false);
        }
    }
    
    setPosition(x: number, y: number) {
        this.container.setPosition(x, y);
    }

    setGridPosition(gx: number, gy: number) {
        this.gx = gx;
        this.gy = gy;
    }
}

export const humans: IHumanUnit[] = [{
        name: "Thug",
        description: "Street thug. use melee attack",
        maxHp: 100,
        defense: 3,
        speed: 10,
        faction: Faction.Evil,
        weapon: ['knife'],
        skills: [],
        spriteIndex: [0, 1],
    }, {
        name: "Mercenary",
        description: "Mercenary. has assault rifle",
        maxHp: 100,
        defense: 3,
        speed: 10,
        faction: Faction.Evil,
        weapon: ['assault_rifle', 'knife'],
        skills: [],
        spriteIndex: [2, 3],
    }, {
        name: "Tyrant",
        description: "Tyrant. Spawn other unit",
        maxHp: 100,
        defense: 3,
        speed: 5,
        faction: Faction.Evil,
        weapon: [],
        skills: ['spawn-thug'],
        spriteIndex: [4, 5],
    }
    // good human implement later
];

