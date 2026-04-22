export interface ICampaign {
    title: string;
    opening_naration?: string;
    closing_naration?: string;
    map_width: number;
    map_height: number;
}

export const campaigns: ICampaign[] = [{
    title: "Begining",
    opening_naration: "intro",
    closing_naration: "win-ending",
    map_width: 10,
    map_height: 10
}, {
    title: "Justice Must be serve",
    opening_naration: "intro-mission-2",
    map_width: 15,
    map_height: 10
}, {
    title: "Mission 3",
    map_width: 15,
    map_height: 15
}, {
    title: "Mission 4",
    map_width: 20,
    map_height: 15
}, {
    title: "Mission 5",
    map_width: 20,
    map_height: 20
}, {
    title: "Mission 6",
    map_width: 25,
    map_height: 20
}, {
    title: "Is this the end?",
    closing_naration: "surrender-ending",
    map_width: 25,
    map_height: 25
}];