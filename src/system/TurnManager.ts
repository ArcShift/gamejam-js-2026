import { Unit, AP_ACT_THRESHOLD } from '../entity/Unit';
import { Player } from '../entity/Player';
import { EnemyAI } from '../ai/Enemy';

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
    state: SystemState = SystemState.PROCESSING;
    turnCount: number = 0;
    currentUnit: Unit | null = null;

    // Map bounds for stuck check
    private mapWidth: number = 20;
    private mapHeight: number = 20;

    // Callbacks
    onEnemyMove: ((action: MoveAction, onComplete: () => void) => void) | null = null;
    onUnitAttack: ((attacker: Unit, target: Unit, onComplete: () => void) => void) | null = null;
    onTurnTick: (() => void) | null = null;
    onPlayerTurnStart: (() => void) | null = null;
    onLose: (() => void) | null = null;

    onSkill: ((unit: Unit, skillKey: string, targetGx: number, targetGy: number, onComplete: () => void) => void) | null = null;

    constructor(player: Player, unitMap: Map<string, any>, deadBodies: Map<string, any>) {
        this.player = player;
        this.unitMap = unitMap;
        this.deadBodies = deadBodies;
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
            // Check if player is surrounded before starting their turn
            if (this.checkPlayerStuck()) {
                this.state = SystemState.ANIMATING;
                if (this.onLose) this.onLose();
                return;
            }
            this.state = SystemState.IDLE;
            if (this.onPlayerTurnStart) this.onPlayerTurnStart();
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
        }
        if (this.onTurnTick) this.onTurnTick();
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

    private runUnitAI(unit: Unit) {
        EnemyAI.run(
            unit,
            this.unitMap,
            this.deadBodies,
            this.mapWidth,
            this.mapHeight,
            // onAttack
            (target) => {
                if (this.onUnitAttack) {
                    this.onUnitAttack(unit, target, () => {
                        this.nextTurn();
                    });
                } else {
                    this.nextTurn();
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
                        this.nextTurn();
                    });
                } else {
                    this.nextTurn();
                }
            },
            // onSkill
            (skillKey, targetGx, targetGy) => {
                if (this.onSkill) {
                    this.onSkill(unit, skillKey, targetGx, targetGy, () => {
                        this.nextTurn();
                    });
                } else {
                    this.nextTurn();
                }
            },
            // onPass
            () => {
                this.nextTurn();
            }
        );
    }

    private checkPlayerStuck(): boolean {
        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        ];

        for (const dir of directions) {
            const nx = this.player.gx + dir.dx;
            const ny = this.player.gy + dir.dy;
            const key = `${nx},${ny}`;

            if (nx >= 0 && nx < this.mapWidth && ny >= 0 && ny < this.mapHeight) {
                if (!this.unitMap.has(key)) {
                    return false; // Found an empty adjacent cell!
                }
            }
        }

        return true; // No empty adjacent cells found
    }
}
