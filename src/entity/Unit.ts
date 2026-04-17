export interface IUnit {
    name: string;
    description: string;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
}

export const AP_MOVE_COST = 25;
export const AP_ACT_THRESHOLD = 100;
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
    gx: number = 0;
    gy: number = 0;
    
    hp: number;
    ap: number = 0;

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

    /** Regen AP by speed stat. */
    regenAp() {
        this.ap += this.speed;
    }

    canMove(): boolean {
        return this.ap >= AP_MOVE_COST;
    }

    consumeMove(): boolean {
        if (!this.canMove()) return false;
        this.ap -= AP_MOVE_COST;
        return true;
    }
}