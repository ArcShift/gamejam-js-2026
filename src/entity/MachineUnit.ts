import { Scene } from "phaser";
import { IUnit, Unit, UnitType, Faction } from "./Unit";

export interface IMachine extends IUnit {
    cost: number;//scrap metal cost to build
    activeSkill?: string;
}

export class MachineUnit extends Unit {
    container: Phaser.GameObjects.Container;
    sprite: Phaser.GameObjects.Sprite;

    constructor(scene: Scene, template: IMachine, faction: Faction) {
        super(template.name, template.description, template.maxHp, template.defense, template.speed, UnitType.Machine, template.weapon, faction, template.skills, template.spriteIndex);
        
        this.ap = 90; // Start with 90 AP as requested
        
        this.container = scene.add.container(0, 0);
        
        const visualContainer = scene.add.container(0, 0);
        
        // Add a shadow for depth
        const shadow = scene.add.ellipse(0, 15, 24, 12, 0x000000, 0.3);
        
        this.sprite = scene.add.sprite(0, 0, 'machine', template.spriteIndex[1]);
        this.sprite.setScale(0.15); // Scale to fit 64x64 cell

        visualContainer.add([shadow, this.sprite]);
        this.container.add(visualContainer);
        
        // Subtle hover animation on the visual container, NOT the main container
        scene.tweens.add({
            targets: visualContainer,
            y: "-=3",
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.container.setDepth(9);
        scene.add.existing(this.container);
    }

    setPosition(x: number, y: number) {
        this.container.setPosition(x, y);
    }
    
    faceTarget(targetGx: number) {
        if (targetGx < this.gx) {
            this.sprite.setFlipX(true);
        } else if (targetGx > this.gx) {
            this.sprite.setFlipX(false);
        }
    }
}

export const machineUnits: IMachine[] = [
    {
        name: "Sentinel",
        description: "Standard tactical turret. Balanced range and speed.",
        maxHp: 100,
        defense: 5,
        speed: 10,
        cost: 30,
        weapon: ['assault_rifle', 'knife'],
        faction: Faction.Player,
        spriteIndex: [0, 3],
        skills: ['consume-brain'],
    },  
    {
        name: "Heavy",
        description: "Slow, armored construction. Melee focus.",
        maxHp: 200,
        defense: 5,
        speed: 10,
        cost: 50,
        weapon: ['knife'],
        faction: Faction.Player,
        spriteIndex: [1, 4],
        skills: ['consume-brain'],
    },
    {
        name: "Drone",  
        description: "Extremely fast scout. Low health but acts frequently.", 
        maxHp: 60,
        defense: 2,
        speed: 15,
        cost: 20,
        weapon: ['knife'],
        faction: Faction.Player,
        spriteIndex: [2, 5],
        skills: ['consume-brain'],
    }
];