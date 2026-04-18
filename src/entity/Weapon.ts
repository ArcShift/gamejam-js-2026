export interface IWeapon {
    name: string;
    damage: number;
    range: number;
    apCost: number;
    maxAmmo: number;
}

const weapons = [
    {
        key: 'knife',
        name: 'Knife',
        damage: 10,
        range: 1,
        apCost: 50,
        maxAmmo: 99
    },
    {
        key: 'assault_rifle',
        name: 'Assault Rifle',
        damage: 10,
        range: 3,
        apCost: 50,
        maxAmmo: 9
    }
]

export class Weapon implements IWeapon {
    key: string;
    name: string;
    damage: number;
    range: number;
    apCost: number;
    maxAmmo: number;
    currentAmmo: number;

    constructor(key: string) {
        const config = weapons.find(w => w.key === key);
        if (!config) {
            throw new Error(`Weapon config not found for key: ${key}`);
        }
        this.key = config.key;
        this.name = config.name;
        this.damage = config.damage;
        this.range = config.range;
        this.apCost = config.apCost;
        this.maxAmmo = config.maxAmmo;
        this.currentAmmo = config.maxAmmo;
    }
}
