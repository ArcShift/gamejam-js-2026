import { Unit } from '../entity/Unit';
import { MoveAction } from '../system/TurnManager';
import * as EasyStar from 'easystarjs';

const finder = new EasyStar.js();
finder.enableSync();

const CHASE_RANGE = 8;

export class EnemyAI {
    static run(
        self: Unit, 
        unitMap: Map<string, any>, 
        deadBodies: Map<string, any>,
        mapWidth: number, 
        mapHeight: number,
        onAttack: (target: Unit) => void,
        onMove: (move: MoveAction) => void,
        onSkill: (skillKey: string, targetGx: number, targetGy: number) => void,
        onPass: () => void
    ) {
        // 0. Try to use skills
        if (self.skills.includes('consume-brain') && self.ap >= 80) {
            for (const body of deadBodies.values()) {
                const dist = Math.abs(self.gx - body.gx) + Math.abs(self.gy - body.gy);
                if (dist <= 1) {
                    onSkill('consume-brain', body.gx, body.gy);
                    return;
                }
            }
        }

        // Find nearest enemy (different faction)
        const target = this.findNearestEnemy(self, unitMap);
        
        if (!target) {
            self.ap -= 10;
            onPass();
            return;
        }

        const dist = Math.abs(self.gx - target.gx) + Math.abs(self.gy - target.gy);
        
        // 1. Try to attack if in range
        if (self.equippedWeapons && self.equippedWeapons.length > 0) {
            // Sort weapons to prefer those that "fit" the distance best.
            // For a target in close range, we prefer shorter range (melee) weapons.
            // If ranges are equal, we prefer the one with higher damage.
            const sortedWeapons = self.equippedWeapons
                .map((w, index) => ({ weapon: w, index }))
                .sort((a, b) => {
                    // Primary: Shortest range first (prefer melee if possible)
                    if (a.weapon.range !== b.weapon.range) {
                        return a.weapon.range - b.weapon.range;
                    }
                    // Secondary: Higher damage
                    return b.weapon.damage - a.weapon.damage;
                });

            for (const item of sortedWeapons) {
                const weapon = item.weapon;
                if (dist <= weapon.range && self.ap >= weapon.apCost && weapon.currentAmmo > 0) {
                    self.attack(target, item.index);
                    onAttack(target);
                    return;
                }
            }
        }

        // 2. Pathfinding with EasyStar
        if (dist <= CHASE_RANGE) {
            const move = this.findPathMove(self, target, unitMap, mapWidth, mapHeight);
            if (move && self.consumeMove()) {
                onMove(move);
                return;
            }
        }
        
        self.ap -= 10; // Penalty for passing/idle
        onPass();
    }

    private static findNearestEnemy(self: Unit, unitMap: Map<string, any>): Unit | null {
        let nearest: Unit | null = null;
        let minDist = Infinity;

        for (const unit of unitMap.values()) {
            if (unit.faction !== self.faction && !unit.isDead()) {
                const dist = Math.abs(self.gx - unit.gx) + Math.abs(self.gy - unit.gy);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = unit;
                }
            }
        }
        return nearest;
    }

    private static findPathMove(
        self: Unit, 
        target: Unit, 
        unitMap: Map<string, any>, 
        mapWidth: number, 
        mapHeight: number
    ): MoveAction | null {
        // Create grid (0 = walkable, 1 = blocked)
        const grid: number[][] = [];
        for (let y = 0; y < mapHeight; y++) {
            grid[y] = [];
            for (let x = 0; x < mapWidth; x++) {
                const key = `${x},${y}`;
                // Blocked if there's a unit, UNLESS it's the target or ourselves
                const isOccupied = unitMap.has(key);
                const isTarget = x === target.gx && y === target.gy;
                const isSelf = x === self.gx && y === self.gy;
                
                grid[y][x] = (isOccupied && !isTarget && !isSelf) ? 1 : 0;
            }
        }

        finder.setGrid(grid);
        finder.setAcceptableTiles([0]);

        let nextMove: MoveAction | null = null;

        finder.findPath(self.gx, self.gy, target.gx, target.gy, (path) => {
            if (path && path.length > 1) {
                // The first point in path is the current position, the second is the next step
                const nextStep = path[1];
                nextMove = {
                    unit: self,
                    fromGx: self.gx,
                    fromGy: self.gy,
                    toGx: nextStep.x,
                    toGy: nextStep.y
                };
            }
        });

        finder.calculate();

        return nextMove;
    }
}
