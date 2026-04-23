import { Player } from '../entity/Player';
import { Unit } from '../entity/Unit';
import { MoveAction } from '../system/TurnManager';
import { machineUnits } from '../entity/MachineUnit';
import * as EasyStar from 'easystarjs';

const finder = new EasyStar.js();
finder.enableSync();

export interface PlayerAIAction {
    type: 'move' | 'collect' | 'summon' | 'wait';
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

        // Freedom check
        const currentFree = this.getFreeNeighbors(player.gx, player.gy, unitMap, mapWidth, mapHeight);

        // 2. Seek free space first if crowded
        // If we only have 2 or fewer free spots, try to move to a freer area before summoning
        if (currentFree.length <= 2 && player.ap >= 25 && player.scrap >= 20) {
            for (const f of currentFree) {
                const nx = player.gx + f.dx;
                const ny = player.gy + f.dy;
                const nextFree = this.getFreeNeighbors(nx, ny, unitMap, mapWidth, mapHeight);
                if (nextFree.length > currentFree.length) {
                    onAction({ 
                        type: 'move', 
                        move: { unit: player, fromGx: player.gx, fromGy: player.gy, toGx: nx, toGy: ny } 
                    });
                    return;
                }
            }
        }

        // 3. If have enough scrap and AP, try to summon a machine
        // CRITICAL: Only summon if we have at least 2 free neighbors, so summoning one won't trap us.
        if (currentFree.length >= 2) {
            const counts = machineUnits.map(m => ({ 
                template: m, 
                count: 0, 
                index: machineUnits.indexOf(m) 
            }));

            for (const unit of unitMap.values()) {
                if (unit.faction === player.faction && unit !== player) {
                    const machineMatch = counts.find(c => c.template.name === unit.name);
                    if (machineMatch) {
                        machineMatch.count++;
                    }
                }
            }

            // Sort by count (ascending) to find the least constructed
            counts.sort((a, b) => a.count - b.count);

            for (const item of counts) {
                const template = item.template;
                if (player.scrap >= template.cost && player.ap >= template.cost) {
                    // Shuffle neighbors to avoid always picking the same spot
                    const shuffledNeighbors = [...currentFree].sort(() => Math.random() - 0.5);

                    for (const n of shuffledNeighbors) {
                        const nx = n.gx;
                        const ny = n.gy;
                        
                        onAction({ 
                            type: 'summon', 
                            machineIndex: item.index, 
                            summonGx: nx, 
                            summonGy: ny 
                        });
                        return;
                    }
                }
            }
        }

        // 4. Move toward nearest scrap if not full
        if (player.scrap < Player.MAX_SCRAP) {
            const nearestScrap = this.findNearestScrap(player, scrapMap, unitMap);
            if (nearestScrap) {
                const move = this.findPathMove(player, nearestScrap.gx, nearestScrap.gy, unitMap, mapWidth, mapHeight);
                if (move) {
                    onAction({ type: 'move', move });
                    return;
                }
            }
        }

        // 4. If nothing else to do, pass
        onAction({ type: 'wait' });
    }

    private static findNearestScrap(player: Player, scrapMap: Map<string, any>, unitMap: Map<string, any>): { gx: number, gy: number } | null {
        let nearest: { gx: number, gy: number } | null = null;
        let minDist = Infinity;

        for (const [key, scrap] of scrapMap.entries()) {
            const [gx, gy] = key.split(',').map(Number);
            
            // Skip if there's a unit there (unless it's the player themselves)
            const unitAtScrap = unitMap.get(key);
            if (unitAtScrap && unitAtScrap !== player) continue;

            const dist = Math.abs(player.gx - gx) + Math.abs(player.gy - gy);
            
            if (dist < minDist) {
                minDist = dist;
                nearest = { gx, gy };
            }
        }
        return nearest;
    }

    private static getFreeNeighbors(gx: number, gy: number, unitMap: Map<string, any>, mapWidth: number, mapHeight: number): {gx: number, gy: number, dx: number, dy: number}[] {
        const neighbors = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];
        return neighbors
            .map(n => ({ gx: gx + n.dx, gy: gy + n.dy, dx: n.dx, dy: n.dy }))
            .filter(n => {
                if (n.gx < 0 || n.gx >= mapWidth || n.gy < 0 || n.gy >= mapHeight) return false;
                return !unitMap.has(`${n.gx},${n.gy}`);
            });
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
                const unit = unitMap.get(key);
                const isSelf = unit === self;
                
                // Blocked if there's a unit, UNLESS it's ourselves
                // This ensures we can move to a target cell only if it's empty
                grid[y][x] = (unit && !isSelf) ? 1 : 0;
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
