import { IUnit } from "./Unit";

interface IMachine extends IUnit {

}

const machineUnits: IMachine[] = [
    {
        name: "Sentinel",
        description: "Sentinel. range attack",
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
    },
    {
        name: "Heavy",
        description: "Heavy. melee attack",
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
    },
    {
        name: "Drone",  
        description: "Drone. unaffect by terrain", 
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
    },
    {
        name: "Bombard",
        description: "Bombard. long range attack",
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
    },
    {
        name: "Fixer",
        description: "Have fixing skill",
        maxHp: 100,
        attack: 10,
        defense: 10,
        speed: 10,
    },
]
export interface SinBuff {
    key: string;
    name?: string;
    quote?: string;
    buff_desc: string;
    debuff_desc?: string;
}

const sinBuffs: SinBuff[] = [
    {
        key: "lust",
        name: "Lust",
        quote: "I want you to be mine",
        buff_desc: "Increase attack if ally is around",
    },
    {
        key: "gluttony",
        name: "Gluttony",
        buff_desc: "Active Skill. Consume scrap metal to gain HP",
    },
    {
        key: "greed",
        name: "Greed",
        buff_desc: "Collect more resource",
    },
    {
        key: "wrath",
        name: "Wrath",

        buff_desc: "Increase attack",
        debuff_desc: "Decrease defense",
    },
    {
        key: "sloth",
        name: "Sloth",
        buff_desc: "Increase defense",
        debuff_desc: "Decrease speed",
    },
    {
        key: "envy",
        name: "Envy",
        quote: "I want what you have",
        buff_desc: "Active Skill. Copy stat of enemy in front you",
    },
    {
        key: "pride",
        name: "Pride",
        quote: "I stand above all",
        buff_desc: "Increase attack if no ally is around",
    }
];