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
    constructor(name: string, description: string, maxHp: number, attack: number, defense: number, speed: number, faction: HumanFaction) {
        super(name, description, maxHp, attack, defense, speed, UnitType.Human);
        this.faction = faction;
    }
}

const humans: IHumanUnit[] = [{
        name: "Thug",
        description: "Street thug. usually use melee attack",
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
        faction: HumanFaction.Evil
    }, {
        name: "Mercenary",
        description: "Mercenary. usually use range attack",
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
        faction: HumanFaction.Evil
    }, {
        name: "Tyrant",
        description: "Tyrant. Spawn other unit",
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
        faction: HumanFaction.Evil
    }
    //neutral & good implement later
];

