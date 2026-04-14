export interface IUnit {
    name: string;
    description: string;
    hp: number;
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
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    type: UnitType;

    constructor(name: string, description: string, hp: number, maxHp: number, attack: number, defense: number, speed: number, type: UnitType) {
        this.name = name;
        this.description = description;
        this.hp = hp;
        this.maxHp = maxHp;
        this.attack = attack;
        this.defense = defense;
        this.speed = speed;
        this.type = type;
    }
}