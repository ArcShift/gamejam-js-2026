import { HumanUnit } from '../entity/HumanUnit';
import { Player } from '../entity/Player';
import { MoveAction } from '../system/TurnManager';

const CHASE_RANGE = 5;

export class EnemyAI {
    static run(
        enemy: HumanUnit, 
        player: Player, 
        unitMap: Map<string, any>, 
        mapWidth: number, 
        mapHeight: number,
        onAttack: () => void,
        onMove: (move: MoveAction) => void,
        onPass: () => void
    ) {
        const dist = Math.abs(enemy.gx - player.gx) + Math.abs(enemy.gy - player.gy);
        
        // 1. Try to attack if in range
        if (enemy.equippedWeapons && enemy.equippedWeapons.length > 0) {
            // Sort weapons by range descending to prefer ranged over melee
            // Keep track of original indices for the attack method
            const weaponsByRange = enemy.equippedWeapons
                .map((w, index) => ({ weapon: w, index }))
                .sort((a, b) => b.weapon.range - a.weapon.range);

            for (const item of weaponsByRange) {
                const weapon = item.weapon;
                if (dist <= weapon.range && enemy.ap >= weapon.apCost && weapon.currentAmmo > 0) {
                    enemy.attack(player, item.index);
                    onAttack();
                    return;
                }
            }
        }

        // 2. Simple Chase AI
        if (dist <= CHASE_RANGE) {
            const move = this.findChaseMove(enemy, player, unitMap, mapWidth, mapHeight);
            if (move && enemy.consumeMove()) {
                onMove(move);
                return;
            }
        }
        
        enemy.ap -= 10; // Penalty for passing/idle
        onPass();
    }

    private static findChaseMove(
        enemy: HumanUnit, 
        player: Player, 
        unitMap: Map<string, any>, 
        mapWidth: number, 
        mapHeight: number
    ): MoveAction | null {
        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        ];

        let bestMove: MoveAction | null = null;
        let bestDist = Math.abs(enemy.gx - player.gx) + Math.abs(enemy.gy - player.gy);

        // Randomize directions for variety
        directions.sort(() => Math.random() - 0.5);

        for (const dir of directions) {
            const nx = enemy.gx + dir.dx;
            const ny = enemy.gy + dir.dy;
            const key = `${nx},${ny}`;

            // Check map bounds
            if (nx < 0 || nx >= mapWidth || ny < 0 || ny >= mapHeight) continue;

            if (unitMap.has(key)) continue;

            const dist = Math.abs(nx - player.gx) + Math.abs(ny - player.gy);
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
