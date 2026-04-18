interface ISkill {
    key: string;
    name: string;
    description: string;
    cost: number;
}

export class Skill implements ISkill {
    key: string;
    name: string;
    description: string;
    cost: number;
    
    constructor(key: string, name: string, description: string, cost: number) {
        this.name = name;
        this.description = description;
        this.cost = cost;
    }
}

export const skills: ISkill[] = [{ 
        key: 'spawn-thug',
        name: "Spawn Thug",
        description: "Can spawn thug",
        cost: 100
    }, {
        key: 'consume-brain',
        name: "Consume Brain",
        description: "Consumes brain to from dead body to enter enhance mode",
        cost: 80
    }
];