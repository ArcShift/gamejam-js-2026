export interface ICampaign {
    title: string;
    opening_naration?: string;
    closing_naration?: string;
    grid_x: number;
    grid_y: number;
}

export const campaigns: ICampaign[] = [{
    title: "Begining",
    opening_naration: "intro",
    grid_x: 10,
    grid_y: 10
}, {
    title: "Justice Must be serve",
    grid_x: 15,
    grid_y: 10
}, {
    title: "Mission 3",
    grid_x: 15,
    grid_y: 15
}, {
    title: "Mission 4",
    grid_x: 20,
    grid_y: 15
}, {
    title: "Mission 5",
    grid_x: 20,
    grid_y: 20
}, {
    title: "Mission 6",
    grid_x: 25,
    grid_y: 20
}, {
    title: "Is this the end?",
    grid_x: 25,
    grid_y: 25
}];