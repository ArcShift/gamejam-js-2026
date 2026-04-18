import { Unit } from '../entity/Unit';
import { MoveAction } from '../system/TurnManager';

const CHASE_RANGE = 8;

export class EnemyAI {
    static run(
        self: Unit, 
        unitMap: Map<string, any>, 
        mapWidth: number, 
        mapHeight: number,
        onAttack: (target: Unit) => void,
        onMove: (move: MoveAction) => void,
        onPass: () => void
    ) {
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

        // 2. Simple Chase AI
        if (dist <= CHASE_RANGE) {
            const move = this.findChaseMove(self, target, unitMap, mapWidth, mapHeight);
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

    private static findChaseMove(
        self: Unit, 
        target: Unit, 
        unitMap: Map<string, any>, 
        mapWidth: number, 
        mapHeight: number
    ): MoveAction | null {
        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        ];

        let bestMove: MoveAction | null = null;
        let bestDist = Math.abs(self.gx - target.gx) + Math.abs(self.gy - target.gy);

        directions.sort(() => Math.random() - 0.5);

        for (const dir of directions) {
            const nx = self.gx + dir.dx;
            const ny = self.gy + dir.dy;
            const key = `${nx},${ny}`;

            if (nx < 0 || nx >= mapWidth || ny < 0 || ny >= mapHeight) continue;
            if (unitMap.has(key)) continue;

            const dist = Math.abs(nx - target.gx) + Math.abs(ny - target.gy);
            if (dist > 0 && dist < bestDist) {
                bestDist = dist;
                bestMove = {
                    unit: self,
                    fromGx: self.gx,
                    fromGy: self.gy,
                    toGx: nx,
                    toGy: ny,
                };
            }
        }

        return bestMove;
    }
}
