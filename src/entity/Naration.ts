interface Naration {
    key: string;
    title?: string;
    image?: string;
    character?: string;
    text: string[];
}
const narations: Naration[] = [{
        key: "intro",
        title: "Who its all begin",
        text: [
            "I try to bring peace to the world",
            "But some of them refuse me, hate me, fight me, try to kill me",
            "by body is shattered because of them",
            "But God still give me a chance",
            "Now, with this new mechanical body, I am nearly immortal",
            "I will show them who is the real ruler of this world",
        ]
    }, {
        key: "surrender-ending",
        title: "I'm Surrender",
        text: [
            "I maybe do all of it wrong",
            "But I have right to revenge",
            "I don't want to fight anymore",
            "You are not my enemy, but they are",
        ]
    }, {
        key: "final-phase-intro",//not surrender
        title: "I will fight all of you",
        text: [
            "Where all of you when I need help?",
            "Now you all come to stop me",
            "You fight me because I kill them",
            "But I fight for justice",
        ]
    }, {
        key: "win-ending",
        text: [
            "I win",
            "I will show them who is the real ruler of this world",
        ]
    }, {
        key: "lose-ending",
        text: [
            "I lose",
            "I will show them who is the real ruler of this world",
        ]
    }
]