import { Player } from '../entity/Player';
import { Unit } from '../entity/Unit';
import { MoveAction } from '../system/TurnManager';
import { machineUnits } from '../entity/MachineUnit';
import * as EasyStar from 'easystarjs';

const finder = new EasyStar.js();
finder.enableSync();

export interface PlayerAIAction {
    type: 'move' | 'collect' | 'summon' | 'pass';
    move?: MoveAction;
    machineIndex?: number;
    summonGx?: number;
    summonGy?: number;
}

export class PlayerAI {
    static run(
        player: Player,
        unitMap: Map<string, any>,
        scrapMap: Map<string, any>,
        mapWidth: number,
        mapHeight: number,
        onAction: (action: PlayerAIAction) => void
    ) {
        // 1. If standing on scrap and have space, collect it
        const currentKey = `${player.gx},${player.gy}`;
        const currentScrap = scrapMap.get(currentKey);
        
        // We only collect if we have at least 1 AP and some storage space
        if (currentScrap && player.scrap < Player.MAX_SCRAP && player.ap >= 1) {
            onAction({ type: 'collect' });
            return;
        }

        // 2. If have enough scrap and AP, try to summon a Sentinel (index 0)
        // Check if there's an empty cell adjacent to the player
        const template = machineUnits[0]; // sentinel
        if (player.scrap >= template.cost && player.ap >= template.cost) {
            const neighbors = [
                { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
                { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
            ];
            // Shuffle neighbors to avoid always picking the same spot
            neighbors.sort(() => Math.random() - 0.5);

            for (const n of neighbors) {
                const nx = player.gx + n.dx;
                const ny = player.gy + n.dy;
                const key = `${nx},${ny}`;
                
                if (nx >= 0 && nx < mapWidth && ny >= 0 && ny < mapHeight && !unitMap.has(key)) {
                    onAction({ 
                        type: 'summon', 
                        machineIndex: 0, 
                        summonGx: nx, 
                        summonGy: ny 
                    });
                    return;
                }
            }
        }

        // 3. Move toward nearest scrap if not full
        if (player.scrap < Player.MAX_SCRAP) {
            const nearestScrap = this.findNearestScrap(player, scrapMap);
            if (nearestScrap) {
                const move = this.findPathMove(player, nearestScrap.gx, nearestScrap.gy, unitMap, mapWidth, mapHeight);
                if (move) {
                    onAction({ type: 'move', move });
                    return;
                }
            }
        }

        // 4. If nothing else to do, pass
        onAction({ type: 'pass' });
    }

    private static findNearestScrap(player: Player, scrapMap: Map<string, any>): { gx: number, gy: number } | null {
        let nearest: { gx: number, gy: number } | null = null;
        let minDist = Infinity;

        for (const [key, scrap] of scrapMap.entries()) {
            const [gx, gy] = key.split(',').map(Number);
            const dist = Math.abs(player.gx - gx) + Math.abs(player.gy - gy);
            
            if (dist < minDist) {
                minDist = dist;
                nearest = { gx, gy };
            }
        }
        return nearest;
    }

    private static findPathMove(
        self: Unit, 
        targetGx: number,
        targetGy: number,
        unitMap: Map<string, any>, 
        mapWidth: number, 
        mapHeight: number
    ): MoveAction | null {
        const grid: number[][] = [];
        for (let y = 0; y < mapHeight; y++) {
            grid[y] = [];
            for (let x = 0; x < mapWidth; x++) {
                const key = `${x},${y}`;
                const isOccupied = unitMap.has(key);
                const isTarget = x === targetGx && y === targetGy;
                const isSelf = x === self.gx && y === self.gy;
                
                // Blocked if there's a unit, UNLESS it's the target or ourselves
                grid[y][x] = (isOccupied && !isTarget && !isSelf) ? 1 : 0;
            }
        }

        finder.setGrid(grid);
        finder.setAcceptableTiles([0]);

        let nextMove: MoveAction | null = null;

        finder.findPath(self.gx, self.gy, targetGx, targetGy, (path) => {
            if (path && path.length > 1) {
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
