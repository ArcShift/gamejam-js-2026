import { IWeapon, Weapon } from "./Weapon";

export interface IUnit {
    name: string;
    description: string;
    maxHp: number;
    defense: number;
    speed: number;
    weapon: string[];
    faction: Faction;
}

export enum Faction {
    Evil,
    Neutral,
    Good,
    Player
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
    defense: number;
    speed: number;
    type: UnitType;
    weapon: string[];
    faction: Faction;
    equippedWeapons: Weapon[];
    gx: number = 0;
    gy: number = 0;
    
    hp: number;
    ap: number = 0;
    selectedWeaponIndex: number = 0;

    constructor(name: string, description: string, maxHp: number, defense: number, speed: number, type: UnitType, weapon: string[], faction: Faction) {
        this.name = name;
        this.description = description;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.defense = defense;
        this.speed = speed;
        this.type = type;
        this.weapon = weapon;
        this.faction = faction;
        this.equippedWeapons = weapon.map(w => new Weapon(w));
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

    takeDamage(amount: number) {
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;
    }

    isDead(): boolean {
        return this.hp <= 0;
    }

    attack(target: Unit, weaponIndex?: number): boolean {
        const idx = weaponIndex !== undefined ? weaponIndex : this.selectedWeaponIndex;
        if (this.equippedWeapons.length <= idx) return false;
        
        const weapon = this.equippedWeapons[idx];
        
        if (this.ap < weapon.apCost) return false;
        if (weapon.currentAmmo <= 0) return false; // Out of ammo
        
        // Manhattan distance check for range
        const dist = Math.abs(this.gx - target.gx) + Math.abs(this.gy - target.gy);
        if (dist > weapon.range) return false;
        
        this.ap -= weapon.apCost;
        weapon.currentAmmo--;

        // Calculate damage (simple subtraction with min of 1 if hit)
        const damageDealt = Math.max(1, weapon.damage - target.defense);
        target.takeDamage(damageDealt);
        
        return true;
    }
}