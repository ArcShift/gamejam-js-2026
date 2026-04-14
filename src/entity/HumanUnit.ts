import { IUnit, Unit, UnitType } from "./Unit";

export enum HumanFaction {
    Evil,
    Neutral,
    Good
}

interface IHumanUnit extends IUnit {
    faction: HumanFaction;
}

class HumanUnit extends Unit implements IHumanUnit {
    faction: HumanFaction;
    constructor(name: string, description: string, hp: number, maxHp: number, attack: number, defense: number, speed: number, faction: HumanFaction) {
        super(name, description, hp, maxHp, attack, defense, speed, UnitType.Human);
        this.faction = faction;
    }
}

const humans: IHumanUnit[] = [{
        name: "Thug",
        description: "Street thug. usually use melee attack",
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
        faction: HumanFaction.Evil
    }, {
        name: "Mercenary",
        description: "Mercenary. usually use range attack",
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
        faction: HumanFaction.Evil
    }, {
        name: "Tyrant",
        description: "Tyrant. Spawn other unit",
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
        faction: HumanFaction.Evil
    }
    //neutral & good implement later
];

