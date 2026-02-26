export class CyberAI {
    constructor(grid, gameState) {
        this.grid = grid;
        this.gameState = gameState;
    }

    playTurn() {
        console.log("AI starting turn...");
        const enemyUnits = Array.from(this.grid.units.values()).filter(u => u.owner === 'enemy');

        if (enemyUnits.length === 0) {
            this.trySpawn();
            return;
        }

        // For each unit, try to move towards the player core (Node 2)
        enemyUnits.forEach(unit => {
            this.moveTowardsTarget(unit, 2);
        });

        // After moving, if we have units left in bench, try to spawn
        this.trySpawn();
    }

    trySpawn() {
        if (this.gameState.enemyBench.length > 0) {
            // Entry points for enemy: 8, 9
            const entryPoints = [8, 9].filter(id => !this.grid.units.has(id));
            if (entryPoints.length > 0) {
                const unit = this.gameState.enemyBench.shift();
                this.grid.placeUnit(unit, entryPoints[0]);
                console.log(`AI spawned ${unit.name} at node ${entryPoints[0]}`);
            }
        }
    }

    moveTowardsTarget(unit, targetNodeId) {
        const reachable = this.grid.getReachableNodes(unit.currentNode, unit.mp);
        if (reachable.length === 0) return;

        // Simple distance check (Euclidean as fallback, but should ideally use BFS for true path)
        let bestNode = reachable[0];
        let minDist = Infinity;

        reachable.forEach(nId => {
            const node = this.grid.nodes[nId];
            const target = this.grid.nodes[targetNodeId];
            const dist = Math.sqrt(Math.pow(node.x - target.x, 2) + Math.pow(node.y - target.y, 2));

            if (dist < minDist) {
                minDist = dist;
                bestNode = nId;
            }
        });

        this.grid.executeMove(unit, bestNode);
    }
}
