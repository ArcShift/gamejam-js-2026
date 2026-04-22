interface ISevenSinEnhancement {
    key: string;
    name: string;
    description: string;
    buff: number;
    quote: string;
    debuff: number;
}

export const sevenSinEnhancements: ISevenSinEnhancement[] = [{
    key: 'lust',
    name: 'Lust',
    quote: 'Your heart is mine',
    description: 'Increase max HP significantly but reduce speed',
    buff: 6,
    debuff: 3
}, {
    key: 'gluttony',
    name: 'Gluttony',
    quote: 'Yummy yummy in my tummy',
    description: 'Consume scrap meat to self repair',
    buff: 2,
    debuff: 0

}, {
    key: 'greed',
    name: 'Greed',
    quote: 'I want more and more and more',
    description: 'Increase rifle ammo but reduce health each turn. Only works if it has rifle and ammo not at max and health level does not cause death when reduced',
    buff: 1,
    debuff: 2
}, {
    key: 'sloth',
    name: 'Sloth',
    quote: 'Why move so fast? you will die anyway',
    description: 'Enhance attack but reduce speed',
    buff: 10,
    debuff: 5
}, {
    key: 'wrath',
    name: 'Wrath',
    quote: 'All of you are useless, I will kill you all',
    description: 'Enhance attack but reduce defense',
    buff: 10,
    debuff: 5
}, {
    key: 'envy',
    name: 'Envy',
    quote: 'I want what you have',
    description: 'Increase speed but reduce defense',
    buff: 8,
    debuff: 4
}, {
    key: 'pride',
    name: 'Pride',
    quote: 'I am above all of you',
    description: 'Enhance attack if no ally nearby (8 direction)',
    buff: 10,
    debuff: 0,
}]