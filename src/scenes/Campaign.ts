import { Naration } from "../subscene/Naration";

interface ICampaign {
    title: string;
    opening_naration?: string;
    closing_naration?: string;
}

const campaigns: ICampaign[] = [
    {
        title: "Campaign 1",
        opening_naration: "intro"
    }
];
