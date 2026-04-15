import { Progression } from '../entity/Progression';
import { ICampaign } from '../entity/Campaign';

export class GameManager {
    private static instance: GameManager;
    
    public progression: Progression;
    public currentMission: ICampaign | null = null;

    private constructor() {
        this.progression = new Progression();
    }

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    public startMission(mission: ICampaign) {
        this.currentMission = mission;
    }
}

export const GManager = GameManager.getInstance();


