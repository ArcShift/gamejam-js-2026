export interface IUnit {
    name: string;
    description: string;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
}
export enum UnitType {
    Human,
    Machine,
}

export class Unit implements IUnit {
    name: string;
    description: string;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    type: UnitType;
    
    hp: number;
    ap: number;

    constructor(name: string, description: string, maxHp: number, attack: number, defense: number, speed: number, type: UnitType) {
        this.name = name;
        this.description = description;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.attack = attack;
        this.defense = defense;
        this.speed = speed;
        this.type = type;
    }
}