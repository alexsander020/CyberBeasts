export class CyberAI {
    constructor(grid, gameState) {
        this.grid = grid;
        this.gameState = gameState;
    }

    async playTurn() {
        console.log("AI starts processing data...");
        const enemyUnits = Array.from(this.grid.units.values()).filter(u => u.owner === 'enemy');

        // 1. Try to spawn if units are available in bench
        await this.trySpawn();

        // 2. Move each unit on board
        for (const unit of enemyUnits) {
            await this.calculateAggressiveMove(unit);
            await new Promise(r => setTimeout(r, 500)); // Delay between unit moves for visual feedback
        }
    }

    async trySpawn() {
        if (this.gameState.enemyBench.length > 0) {
            // Entry points for enemy: 8, 9
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
        const reachable = this.grid.getReachableNodes(unit.currentNode, unit.mp);
        if (reachable.length === 0) return;

        // TARGET PRIORITIES:
        // 1. Player Core (Node 2) - Immediate Win
        // 2. Attack Player Units - Strategic Thinning
        // 3. Move closer to Player Core - Advancement

        const playerCoreId = 2;
        if (reachable.includes(playerCoreId)) {
            await this.grid.executeMove(unit, playerCoreId);
            return;
        }

        // Check for player units to attack
        const attackTargets = reachable.filter(nId => {
            const u = this.grid.units.get(nId);
            return u && u.owner === 'player';
        });

        if (attackTargets.length > 0) {
            // Pick a random target to attack
            const target = attackTargets[Math.floor(Math.random() * attackTargets.length)];
            await this.grid.executeMove(unit, target);
            return;
        }

        // Advance towards the Player Core
        let bestNode = reachable[0];
        let minDist = Infinity;
        const coreNode = this.grid.nodes[playerCoreId];

        reachable.forEach(nId => {
            const node = this.grid.nodes[nId];
            const dist = Math.sqrt(Math.pow(node.x - coreNode.x, 2) + Math.pow(node.y - coreNode.y, 2));
            if (dist < minDist) {
                minDist = dist;
                bestNode = nId;
            }
        });

        await this.grid.executeMove(unit, bestNode);
    }
}
