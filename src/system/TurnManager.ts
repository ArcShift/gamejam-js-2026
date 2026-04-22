import { Unit, AP_ACT_THRESHOLD } from '../entity/Unit';
import { Player } from '../entity/Player';
import { EnemyAI } from '../ai/Enemy';
import { PlayerAI, PlayerAIAction } from '../ai/Player';

export enum SystemState {
    IDLE,        // Waiting for player input
    PROCESSING,  // Calculating/AI
    ANIMATING,   // Animation in progress
}

export interface MoveAction {
    unit: Unit;
    fromGx: number;
    fromGy: number;
    toGx: number;
    toGy: number;
}



export class TurnManager {
    private allUnits: Unit[] = [];
    private player: Player;
    private unitMap: Map<string, any>;
    private deadBodies: Map<string, any>;
    private scrapMap: Map<string, any>;
    state: SystemState = SystemState.PROCESSING;
    turnCount: number = 0;
    currentUnit: Unit | null = null;
    isAIEnabled: boolean = false;

    // Map bounds for stuck check
    private mapWidth: number = 20;
    private mapHeight: number = 20;

    // Callbacks
    onEnemyMove: ((action: MoveAction, onComplete: () => void) => void) | null = null;
    onUnitAttack: ((attacker: Unit, target: Unit, onComplete: () => void) => void) | null = null;
    onTurnTick: (() => void) | null = null;
    onSkill: ((unit: Unit, skillKey: string, targetGx: number, targetGy: number, onComplete: () => void) => void) | null = null;
    onPlayerAIAction: ((action: PlayerAIAction, onComplete: () => void) => void) | null = null;

    constructor(player: Player, unitMap: Map<string, any>, deadBodies: Map<string, any>, scrapMap: Map<string, any>) {
        this.player = player;
        this.unitMap = unitMap;
        this.deadBodies = deadBodies;
        this.scrapMap = scrapMap;
    }

    registerUnits(units: Unit[]) {
        this.allUnits = units;
    }

    removeUnit(unit: Unit) {
        this.allUnits = this.allUnits.filter(u => u !== unit);
    }

    setMapSize(width: number, height: number) {
        this.mapWidth = width;
        this.mapHeight = height;
    }

    /** Start the turn system loop */
    start() {
        this.nextTurn();
    }

    /** Determine who acts next */
    nextTurn() {
        let highestAPUnit = this.getHighestAPUnit();

        // If no one is at the threshold, tick until someone is
        while (highestAPUnit.ap < AP_ACT_THRESHOLD) {
            this.tick();
            highestAPUnit = this.getHighestAPUnit();
        }

        this.currentUnit = highestAPUnit;

        if (this.currentUnit instanceof Player) {
            // AUTOMATIC PLAYER AI OR MANUAL
            if (this.isAIEnabled) {
                this.state = SystemState.PROCESSING;
                this.runPlayerAI();
            } else {
                this.state = SystemState.IDLE;
            }
        } else {
            // All other units use AI
            this.state = SystemState.PROCESSING;
            this.runUnitAI(this.currentUnit);
        }
    }

    private getHighestAPUnit(): Unit {
        return this.allUnits.reduce((prev, current) => (prev.ap > current.ap) ? prev : current);
    }

    private tick() {
        this.turnCount++;
        for (const unit of this.allUnits) {
            unit.regenAp();
            this.applyTurnEffects(unit);
        }
        if (this.onTurnTick) this.onTurnTick();
    }

    private applyTurnEffects(unit: Unit) {
        if (!unit.enhancement) return;

        if (unit.enhancement === 'Greed') {
            // Increase rifle ammo but reduce health each turn.
            // Only works if it has rifle and ammo not at max and health level does not cause death when reduced
            const rifle = unit.equippedWeapons.find(w => w.key.includes('rifle'));
            if (rifle && rifle.currentAmmo < rifle.maxAmmo && unit.hp > 1) {
                rifle.currentAmmo++;
                unit.hp--;
            }
        }
    }

    /** Called after player action is complete */
    endPlayerAction() {
        this.nextTurn();
    }

    /** Player movement action */
    playerMove(): boolean {
        if (this.state !== SystemState.IDLE || !this.currentUnit || !(this.currentUnit instanceof Player)) {
            return false;
        }

        this.state = SystemState.ANIMATING;
        if (!this.player.consumeMove()) {
            this.state = SystemState.IDLE;
            return false;
        }

        return true;
    }

    public runPlayerAI() {
        PlayerAI.run(
            this.player,
            this.unitMap,
            this.scrapMap,
            this.mapWidth,
            this.mapHeight,
            (action) => {
                if (this.onPlayerAIAction) {
                    this.onPlayerAIAction(action, () => {
                        setTimeout(() => this.nextTurn(), 10);
                    });
                } else {
                    setTimeout(() => this.nextTurn(), 10);
                }
            }
        );
    }

    private runUnitAI(unit: Unit) {
        EnemyAI.run(
            unit,
            this.unitMap,
            this.deadBodies,
            this.mapWidth,
            this.mapHeight,
            (target) => {
                if (this.onUnitAttack) {
                    this.onUnitAttack(unit, target, () => {
                        setTimeout(() => this.nextTurn(), 10);
                    });
                } else {
                    setTimeout(() => this.nextTurn(), 10);
                }
            },
            // onMove
            (move) => {
                // Update map tracking
                const oldKey = `${unit.gx},${unit.gy}`;
                const newKey = `${move.toGx},${move.toGy}`;

                this.unitMap.delete(oldKey);
                unit.gx = move.toGx;
                unit.gy = move.toGy;
                this.unitMap.set(newKey, unit);

                if (this.onEnemyMove) {
                    this.onEnemyMove(move, () => {
                        setTimeout(() => this.nextTurn(), 10);
                    });
                } else {
                    setTimeout(() => this.nextTurn(), 10);
                }
            },
            // onSkill
            (skillKey, targetGx, targetGy) => {
                if (this.onSkill) {
                    this.onSkill(unit, skillKey, targetGx, targetGy, () => {
                        setTimeout(() => this.nextTurn(), 10);
                    });
                } else {
                    setTimeout(() => this.nextTurn(), 10);
                }
            },
            // onPass
            () => {
                setTimeout(() => this.nextTurn(), 10);
            }
        );
    }

}
