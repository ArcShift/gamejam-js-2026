import { Scene } from 'phaser';
import { IUnit, Unit, UnitType, Faction } from "./Unit";

export interface IHumanUnit extends IUnit {
    faction: Faction;
}

export class HumanUnit extends Unit implements IHumanUnit {
    faction: Faction;
    container: Phaser.GameObjects.Container;

    constructor(scene: Scene, config: IHumanUnit) {
        super(config.name, config.description, config.maxHp, config.defense, config.speed, UnitType.Human, config.weapon, config.faction, config.skills);
        this.faction = config.faction;
        
        this.container = scene.add.container(0, 0);
        
        const baseColor = this.getColorFor(config.name);
        
        // Simple human geometry
        // Shadow for depth
        const shadow = scene.add.ellipse(0, 15, 24, 12, 0x000000, 0.3);
        
        // Head
        const head = scene.add.circle(0, -10, 8, 0xffdbac);
        head.setStrokeStyle(1, 0x000000, 0.5);
        
        // Body (tactical vest look)
        const body = scene.add.rectangle(0, 5, 20, 22, baseColor);
        body.setStrokeStyle(1, 0x000000);

        // Arms
        const lArm = scene.add.rectangle(-12, 2, 6, 16, baseColor);
        const rArm = scene.add.rectangle(12, 2, 6, 16, baseColor);

        //legs
        const lLeg = scene.add.rectangle(-7, 25, 6, 15, baseColor);
        const rLeg = scene.add.rectangle(7, 25, 6, 15, baseColor);
        
        const visualContainer = scene.add.container(0, 0);
        visualContainer.add([shadow, lArm, rArm, body, head, lLeg, rLeg]);

        // Detail based on type
        if (config.name === "Tyrant") {
            const crown = scene.add.triangle(0, -22, -7, 0, 7, 0, 0, -10, 0xffd700);
            crown.setStrokeStyle(1, 0x000000);
            crown.setPosition(7,-12);
            visualContainer.add(crown);
            
            const aura = scene.add.circle(0, 0, 25, 0x9c27b0, 0.1);
            visualContainer.addAt(aura, 0);
        } else if (config.name === "Mercenary") {
            const bandana = scene.add.rectangle(0, -12, 18, 4, 0x3f51b5);
            visualContainer.add(bandana);
        }

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
    
    private getColorFor(name: string): number {
        switch(name) {
            case "Thug": return 0x795548; // Brown
            case "Mercenary": return 0x455a64; // Steel Blue/Grey
            case "Tyrant": return 0x212121; // Dark/Black
            default: return 0x607d8b;
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
        description: "Street thug. usually use melee attack",
        maxHp: 100,
        defense: 3,
        speed: 10,
        faction: Faction.Evil,
        weapon: ['knife'],
        skills: [],
    }, {
        name: "Mercenary",
        description: "Mercenary. usually use range attack",
        maxHp: 100,
        defense: 3,
        speed: 10,
        faction: Faction.Evil,
        weapon: ['assault_rifle', 'knife'],
        skills: [],
    }, {
        name: "Tyrant",
        description: "Tyrant. Spawn other unit",
        maxHp: 100,
        defense: 3,
        speed: 5,
        faction: Faction.Evil,
        weapon: [],
        skills: ['spawn-thug'],
    }
    // good human implement later
];

