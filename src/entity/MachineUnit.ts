import { Scene } from "phaser";
import { IUnit, Unit, UnitType, Faction } from "./Unit";

export interface IMachine extends IUnit {
    cost: number;//scrap metal cost to build
    activeSkill?: string;
}

export class MachineUnit extends Unit {
    container: Phaser.GameObjects.Container;

    constructor(scene: Scene, template: IMachine, faction: Faction) {
        super(template.name, template.description, template.maxHp, template.defense, template.speed, UnitType.Machine, template.weapon, faction);
        
        this.ap = 90; // Start with 90 AP as requested
        
        this.container = scene.add.container(0, 0);
        
        const baseColor = faction === Faction.Player ? 0x00ff88 : 0xff4444;
        
        this.createGeometry(scene, template.name, baseColor);
        
        // Subtle hover animation
        scene.tweens.add({
            targets: this.container,
            y: "-=3",
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.container.setDepth(9);
        scene.add.existing(this.container);
    }

    private createGeometry(scene: Scene, name: string, color: number) {
        const visual = scene.add.container(0, 0);
        
        if (name === "Heavy") {
            // Bulkier, armored look
            const body = scene.add.rectangle(0, 0, 44, 44, color);
            body.setStrokeStyle(3, 0x000000, 0.5);
            
            const shield = scene.add.triangle(0, 0, -22, 22, 22, 22, 0, -22, 0x000000, 0.3);
            const core = scene.add.rectangle(0, 0, 16, 16, 0xffffff, 0.8);
            
            visual.add([body, shield, core]);
        } else if (name === "Drone") {
            // Sleek, diamond-shaped flyer
            const body = scene.add.polygon(0, 0, [0, -22, 18, 0, 0, 22, -18, 0], color);
            body.setStrokeStyle(2, 0xffffff, 0.8);
            
            const wingL = scene.add.rectangle(-20, 0, 8, 4, color);
            const wingR = scene.add.rectangle(20, 0, 8, 4, color);
            
            const eye = scene.add.circle(0, 0, 4, 0xffffff);
            
            visual.add([body, wingL, wingR, eye]);
        } else {
            // Standard Sentinel - Boxy turret
            const body = scene.add.rectangle(0, 0, 36, 36, color);
            body.setStrokeStyle(2, 0xffffff, 0.8);
            
            const turret = scene.add.rectangle(0, 0, 20, 20, 0x000000, 0.5);
            turret.setRotation(Math.PI / 4);
            
            const lens = scene.add.circle(0, 0, 6, 0xffffff, 1);
            
            visual.add([body, turret, lens]);
        }
        
        this.container.add(visual);
    }

    setPosition(x: number, y: number) {
        this.container.setPosition(x, y);
    }
}

export const machineUnits: IMachine[] = [
    {
        name: "Sentinel",
        description: "Standard tactical turret. Balanced range and speed.",
        maxHp: 100,
        defense: 5,
        speed: 5,
        cost: 30,
        weapon: ['assault_rifle', 'knife'],
        faction: Faction.Player
    },
    {
        name: "Heavy",
        description: "Slow, armored construction. Melee focus.",
        maxHp: 200,
        defense: 12,
        speed: 3,
        cost: 50,
        weapon: ['knife'],
        faction: Faction.Player
    },
    {
        name: "Drone",  
        description: "Extremely fast scout. Low health but acts frequently.", 
        maxHp: 60,
        defense: 2,
        speed: 15,
        cost: 20,
        weapon: ['knife'],
        faction: Faction.Player
    }
];