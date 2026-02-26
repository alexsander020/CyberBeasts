export class GameGrid {
    constructor(gameState) {
        this.gameState = gameState;
        this.container = document.getElementById('nodes-layer');
        this.svg = document.getElementById('board-svg');
        this.unitsLayer = document.getElementById('units-layer');
        this.nodes = [];
        this.connections = []; // Edges
        this.units = new Map(); // nodeId -> CyberBeast
        this.init();
    }

    init() {
        // Define a symmetric board based on the GDD (Entry points at corners, Core at center end)
        // 0-4 Player Side, 5-9 Enemy Side
        this.nodes = [
            { id: 0, x: 30, y: 90, type: 'entry', team: 'player' },
            { id: 1, x: 70, y: 90, type: 'entry', team: 'player' },
            { id: 2, x: 50, y: 95, type: 'core', team: 'player' }, // Player's own core

            { id: 3, x: 10, y: 50, type: 'node' },
            { id: 4, x: 30, y: 50, type: 'node' },
            { id: 5, x: 50, y: 50, type: 'node' },
            { id: 6, x: 70, y: 50, type: 'node' },
            { id: 7, x: 90, y: 50, type: 'node' },

            { id: 8, x: 30, y: 10, type: 'entry', team: 'enemy' },
            { id: 9, x: 70, y: 10, type: 'entry', team: 'enemy' },
            { id: 10, x: 50, y: 5, type: 'core', team: 'enemy' } // Enemy core (Goal)
        ];

        this.connections = [
            [0, 3], [0, 4], [1, 6], [1, 7], // Entry connections
            [3, 4], [4, 5], [5, 6], [6, 7], // Middle line
            [8, 3], [8, 4], [9, 6], [9, 7], // Enemy Entry connections
            [4, 10], [5, 10], [6, 10], [2, 4], [2, 5], [2, 6] // Core goal connections
        ];

        this.render();
    }

    render() {
        if (!this.container || !this.svg) return;
        this.container.innerHTML = '';
        this.svg.innerHTML = '';

        this.connections.forEach(([sId, eId]) => {
            const s = this.nodes[sId];
            const e = this.nodes[eId];
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", `${s.x}%`); line.setAttribute("y1", `${s.y}%`);
            line.setAttribute("x2", `${e.x}%`); line.setAttribute("y2", `${e.y}%`);
            line.setAttribute("stroke", "rgba(0, 242, 255, 0.3)");
            line.setAttribute("stroke-width", "2");
            this.svg.appendChild(line);
        });

        this.nodes.forEach(node => {
            const el = document.createElement('div');
            el.className = `grid-point ${node.type}`;
            el.style.left = `${node.x}%`; el.style.top = `${node.y}%`;
            el.dataset.id = node.id;

            if (node.type === 'core') el.style.boxShadow = '0 0 15px #FF0055';

            el.addEventListener('click', () => this.onNodeClick(node));
            this.container.appendChild(el);
        });
    }

    onNodeClick(node) {
        const unitAtNode = this.units.get(node.id);
        const statusPanel = document.getElementById('status-panel');

        // Selection Logic
        if (unitAtNode && unitAtNode.owner === this.gameState.currentPlayer) {
            this.selectedUnit = unitAtNode;
            this.showValidMoves(node.id, unitAtNode.mp);
            statusPanel.innerHTML = `> UNIDADE SELECIONADA: ${unitAtNode.name}<br>> MP DISPONÍVEL: ${unitAtNode.mp}`;
            return;
        }

        // Movement Logic
        if (this.selectedUnit && this.isValidMove(node.id)) {
            this.executeMove(this.selectedUnit, node.id);
            this.selectedUnit = null;
            this.clearHighlights();
            return;
        }

        this.selectedUnit = null;
        this.clearHighlights();
        statusPanel.innerHTML = `> NODO ADJACENTE: ${node.id}`;
    }

    showValidMoves(startNodeId, mp) {
        this.clearHighlights();
        this.validMoveNodes = this.getReachableNodes(startNodeId, mp);

        this.validMoveNodes.forEach(nId => {
            const el = document.querySelector(`.grid-point[data-id="${nId}"]`);
            if (el) el.style.boxShadow = '0 0 15px #00ffcc';
        });
    }

    getReachableNodes(startId, mp) {
        const reachable = new Set();
        const queue = [{ id: startId, dist: 0 }];
        const visited = new Set([startId]);

        while (queue.length > 0) {
            const { id, dist } = queue.shift();
            if (dist > 0) reachable.add(id);
            if (dist < mp) {
                const neighbors = this.getNeighbors(id);
                neighbors.forEach(nId => {
                    if (!visited.has(nId)) {
                        const unitThere = this.units.get(nId);
                        // Can pass through own units? GDD doesn't specify, assuming block for now
                        if (!unitThere) {
                            visited.add(nId);
                            queue.push({ id: nId, dist: dist + 1 });
                        }
                    }
                });
            }
        }
        return Array.from(reachable);
    }

    getNeighbors(nodeId) {
        return this.connections
            .filter(c => c.includes(nodeId))
            .map(c => c[0] === nodeId ? c[1] : c[0]);
    }

    isValidMove(nodeId) {
        return this.validMoveNodes && this.validMoveNodes.includes(nodeId);
    }

    executeMove(unit, targetNodeId) {
        const oldNodeId = unit.currentNode;
        this.units.delete(oldNodeId);

        // Check for Goal (Core Conquest)
        const targetNode = this.nodes[targetNodeId];
        if (targetNode.type === 'core' && targetNode.team !== unit.owner) {
            alert(`SISTEMA INVADIDO! ${unit.owner.toUpperCase()} VENCEU!`);
            location.reload();
            return;
        }

        this.placeUnit(unit, targetNodeId);
        console.log(`${unit.name} moved to ${targetNodeId}`);
        this.checkSurround(targetNodeId);
    }

    clearHighlights() {
        this.nodes.forEach(n => {
            const el = document.querySelector(`.grid-point[data-id="${n.id}"]`);
            if (el) el.style.boxShadow = n.type === 'core' ? '0 0 15px #FF0055' : '0 0 8px var(--cyan-neon)';
        });
    }

    placeUnit(unit, nodeId) {
        const node = this.nodes[nodeId];
        unit.currentNode = nodeId;
        this.units.set(nodeId, unit);

        let unitEl = document.getElementById(`unit-${unit.uuid}`);
        if (!unitEl) {
            unitEl = document.createElement('div');
            unitEl.id = `unit-${unit.uuid}`;
            unitEl.className = `unit-disc ${unit.owner}`;
            unitEl.innerHTML = `<div class="base"></div><div class="visual">👾</div>`;
            this.unitsLayer.appendChild(unitEl);
        }

        unitEl.style.left = `${node.x}%`;
        unitEl.style.top = `${node.y}%`;
    }

    // 2.2 SYSTEMA DE CERCO (SURROUND)
    checkSurround(nodeId) {
        const unit = this.units.get(nodeId);
        if (!unit) return;

        const neighbors = this.connections
            .filter(c => c.includes(nodeId))
            .map(c => c[0] === nodeId ? c[1] : c[0]);

        const allBlocked = neighbors.every(nId => {
            const neighborUnit = this.units.get(nId);
            return neighborUnit && neighborUnit.owner !== unit.owner;
        });

        if (allBlocked && neighbors.length > 0) {
            console.log(`SURROUND TRIGGERED! ${unit.name} is deleted.`);
            this.deleteUnit(nodeId);
        }
    }

    deleteUnit(nodeId) {
        const unit = this.units.get(nodeId);
        if (unit) {
            const el = document.getElementById(`unit-${unit.uuid}`);
            if (el) {
                el.classList.add('deleting');
                setTimeout(() => {
                    el.remove();
                    this.units.delete(nodeId);
                    this.gameState.moveToDataCenter(unit);
                }, 600);
            } else {
                this.units.delete(nodeId);
                this.gameState.moveToDataCenter(unit);
            }
        }
    }
}
