export class CyberAI {
    constructor(grid, gameState) {
        this.grid = grid;
        this.gameState = gameState;
    }

    async playTurn() {
        console.log("AI starts processing data...");

        // 1. Reactive Spawning: If player is near core, spawn immediately
        const playerUnits = Array.from(this.grid.units.values()).filter(u => u.owner === 'player');
        const enemyCoreId = 10;
        const playerNearCore = playerUnits.some(pu => {
            const neighbors = this.grid.getNeighbors(enemyCoreId);
            return neighbors.includes(pu.currentNode);
        });

        if (playerNearCore && this.gameState.enemyBench.length > 0) {
            await this.trySpawn();
        }

        const enemyUnits = Array.from(this.grid.units.values()).filter(u => u.owner === 'enemy');

        // 2. Move each unit on board
        for (const unit of enemyUnits) {
            await this.calculateAggressiveMove(unit);
            await new Promise(r => setTimeout(r, 600));
        }

        // 3. Normal spawning at end of turn
        await this.trySpawn();
    }

    async trySpawn() {
        if (this.gameState.enemyBench.length > 0) {
            const entryPoints = [8, 9].filter(id => !this.grid.units.has(id));
            if (entryPoints.length > 0) {
                const unit = this.gameState.enemyBench.shift();
                this.grid.placeUnit(unit, entryPoints[0]);
                console.log(`AI compiled ${unit.name} at node ${entryPoints[0]}`);
                await new Promise(r => setTimeout(r, 800));
            }
        }
    }

    async calculateAggressiveMove(unit) {
        // Use the new Map-based API from Kernel v2.5+
        const reachableMap = this.grid.getReachableNodesMap(unit.currentNode, unit.mp);
        const reachableNodes = Array.from(reachableMap.keys());
        if (reachableNodes.length === 0) return;

        // TARGET PRIORITIES:
        // 1. Defend Core (Node 10) if player is near
        const enemyCoreId = 10;
        if (reachableNodes.includes(enemyCoreId)) {
            await this.grid.animateMove(unit, reachableMap.get(enemyCoreId));
            return;
        }

        // 2. Attack Player Units
        const attackTargets = reachableNodes.filter(nId => {
            const u = this.grid.units.get(nId);
            return u && u.owner === 'player';
        });

        if (attackTargets.length > 0) {
            const target = attackTargets[Math.floor(Math.random() * attackTargets.length)];
            await this.grid.animateMove(unit, reachableMap.get(target));
            return;
        }

        // 3. Advance towards Player Core (Node 2)
        const playerCoreId = 2;
        let bestNode = reachableNodes[0];
        let minDist = Infinity;
        const targetNode = this.grid.nodes[playerCoreId];

        reachableNodes.forEach(nId => {
            const node = this.grid.nodes[nId];
            const dist = Math.sqrt(Math.pow(node.x - targetNode.x, 2) + Math.pow(node.y - targetNode.y, 2));
            if (dist < minDist) {
                minDist = dist;
                bestNode = nId;
            }
        });

        await this.grid.animateMove(unit, reachableMap.get(bestNode));
    }
}
