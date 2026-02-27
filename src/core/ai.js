export class CyberAI {
    constructor(grid, gameState) {
        this.grid = grid;
        this.gameState = gameState;
    }

    async playTurn() {
        console.log("IA processando dados...");
        const statusPanel = document.getElementById('status-panel');

        // 1. Reactive Spawning: If player is near core, spawn immediately
        const playerUnits = Array.from(this.grid.units.values()).filter(u => u.owner === 'player');
        const enemyCoreId = 10;
        const playerNearCore = playerUnits.some(pu => {
            const neighbors = this.grid.getNeighbors(enemyCoreId);
            return neighbors.includes(pu.currentNode);
        });

        if (playerNearCore && this.gameState.enemyBench.length > 0) {
            statusPanel.innerHTML = `> 🤖 IA: Ameaça detectada! Reforços chegando...`;
            await this.trySpawn();
        }

        const enemyUnits = Array.from(this.grid.units.values()).filter(u => u.owner === 'enemy');

        // 2. Move each unit on board
        for (const unit of enemyUnits) {
            if (!this.grid.units.has(unit.currentNode)) continue; // Unit was deleted during combat
            statusPanel.innerHTML = `> 🤖 IA movendo: ${unit.name}`;
            await this.calculateAggressiveMove(unit);
            await new Promise(r => setTimeout(r, 800));
        }

        // 3. Normal spawning at end of turn
        if (this.gameState.enemyBench.length > 0) {
            statusPanel.innerHTML = `> 🤖 IA: Compilando nova unidade...`;
            await this.trySpawn();
        }

        statusPanel.innerHTML = `> 🤖 IA finalizou seu turno`;
    }

    async trySpawn() {
        if (this.gameState.enemyBench.length > 0) {
            const entryPoints = [8, 9].filter(id => !this.grid.units.has(id));
            if (entryPoints.length > 0) {
                const unit = this.gameState.enemyBench.shift();
                this.grid.placeUnit(unit, entryPoints[0]);
                console.log(`IA compilou ${unit.name} no nodo ${entryPoints[0]}`);
                await new Promise(r => setTimeout(r, 800));
            }
        }
    }

    async calculateAggressiveMove(unit) {
        const reachableMap = this.grid.getReachableNodesMap(unit.currentNode, unit.mp);
        const reachableNodes = Array.from(reachableMap.keys());
        if (reachableNodes.length === 0) return;

        // TARGET PRIORITIES:
        // 1. Rush to Player Core if reachable (win condition!)
        const playerCoreId = 2;
        if (reachableNodes.includes(playerCoreId)) {
            await this.grid.animateMove(unit, reachableMap.get(playerCoreId));
            return;
        }

        // 2. Defend Core (Node 10) if player is near
        const enemyCoreId = 10;
        const coreNeighbors = this.grid.getNeighbors(enemyCoreId);
        const playerNearCore = coreNeighbors.some(nId => {
            const u = this.grid.units.get(nId);
            return u && u.owner === 'player';
        });

        if (playerNearCore) {
            // Try to attack the threatening player unit
            const threats = reachableNodes.filter(nId => {
                const u = this.grid.units.get(nId);
                return u && u.owner === 'player' && coreNeighbors.includes(nId);
            });
            if (threats.length > 0) {
                await this.grid.animateMove(unit, reachableMap.get(threats[0]));
                return;
            }
        }

        // 3. Attack Player Units
        const attackTargets = reachableNodes.filter(nId => {
            const u = this.grid.units.get(nId);
            return u && u.owner === 'player';
        });

        if (attackTargets.length > 0) {
            const target = attackTargets[Math.floor(Math.random() * attackTargets.length)];
            await this.grid.animateMove(unit, reachableMap.get(target));
            return;
        }

        // 4. Advance towards Player Core (Node 2)
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
