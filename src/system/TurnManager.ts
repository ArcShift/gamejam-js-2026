import { Unit, AP_ACT_THRESHOLD } from '../entity/Unit';
import { HumanUnit } from '../entity/HumanUnit';
import { Player } from '../entity/Player';

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

const CHASE_RANGE = 4; // Manhattan distance to detect player

export class TurnManager {
    private allUnits: Unit[] = [];
    private player: Player;
    private unitMap: Map<string, any>;
    state: SystemState = SystemState.PROCESSING;
    turnCount: number = 0;
    currentUnit: Unit | null = null;

    // Callbacks
    onEnemyMove: ((action: MoveAction, onComplete: () => void) => void) | null = null;
    onTurnTick: (() => void) | null = null;
    onPlayerTurnStart: (() => void) | null = null;

    constructor(player: Player, unitMap: Map<string, any>) {
        this.player = player;
        this.unitMap = unitMap;
    }

    registerUnits(units: Unit[]) {
        this.allUnits = units;
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
            this.state = SystemState.IDLE;
            if (this.onPlayerTurnStart) this.onPlayerTurnStart();
        } else if (this.currentUnit instanceof HumanUnit) {
            this.state = SystemState.PROCESSING;
            this.runEnemyAI(this.currentUnit);
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
        // Player action is finished. We don't necessarily give them another turn immediately.
        // We re-evaluate who has the highest AP.
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

    private runEnemyAI(enemy: HumanUnit) {
        // Simple Chase AI
        const dist = Math.abs(enemy.gx - this.player.gx) + Math.abs(enemy.gy - this.player.gy);
        
        if (dist <= CHASE_RANGE) {
            const move = this.findChaseMove(enemy);
            if (move && enemy.consumeMove()) {
                // Update map tracking
                const oldKey = `${enemy.gx},${enemy.gy}`;
                const newKey = `${move.toGx},${move.toGy}`;

                this.unitMap.delete(oldKey);
                enemy.gx = move.toGx;
                enemy.gy = move.toGy;
                this.unitMap.set(newKey, enemy);

                if (this.onEnemyMove) {
                    this.onEnemyMove(move, () => {
                        this.nextTurn();
                    });
                } else {
                    this.nextTurn();
                }
                return;
            }
        }
        
        // If couldn't move or out of range, just end turn (consume minimal AP or just pass?)
        // Usually if a unit "waits", they still consume some AP or we just tick.
        // Let's say if they can't act, they just lose a bit of AP or we skip them.
        // To prevent infinite loops of same unit "highest AP" but can't act:
        enemy.ap -= 10; // Penalty for passing/idle
        this.nextTurn();
    }

    private findChaseMove(enemy: HumanUnit): MoveAction | null {
        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        ];

        let bestMove: MoveAction | null = null;
        let bestDist = Math.abs(enemy.gx - this.player.gx) + Math.abs(enemy.gy - this.player.gy);

        // Randomize directions for variety
        directions.sort(() => Math.random() - 0.5);

        for (const dir of directions) {
            const nx = enemy.gx + dir.dx;
            const ny = enemy.gy + dir.dy;
            const key = `${nx},${ny}`;

            if (this.unitMap.has(key)) continue;

            const dist = Math.abs(nx - this.player.gx) + Math.abs(ny - this.player.gy);
            if (dist > 0 && dist < bestDist) {
                bestDist = dist;
                bestMove = {
                    unit: enemy,
                    fromGx: enemy.gx,
                    fromGy: enemy.gy,
                    toGx: nx,
                    toGy: ny,
                };
            }
        }

        return bestMove;
    }
}
