import { DataWheel } from './dataWheel.js';

export class GameGrid {
    constructor(gameState) {
        this.gameState = gameState;
        this.container = document.getElementById('nodes-layer');
        this.svg = document.getElementById('board-svg');
        this.unitsLayer = document.getElementById('units-layer');
        this.nodes = [];
        this.connections = [];
        this.units = new Map();
        this.wheel = null;
        this.selectedUnit = null;
        this.validMoveMap = null;
        this.init();
    }

    setWheel(wheel) {
        this.wheel = wheel;
    }

    init() {
        this.nodes = [
            { id: 0, x: 30, y: 90, type: 'entry', team: 'player' },
            { id: 1, x: 70, y: 90, type: 'entry', team: 'player' },
            { id: 2, x: 50, y: 95, type: 'core', team: 'player' },

            { id: 3, x: 10, y: 50, type: 'node' },
            { id: 4, x: 30, y: 50, type: 'node' },
            { id: 5, x: 50, y: 50, type: 'node' },
            { id: 6, x: 70, y: 50, type: 'node' },
            { id: 7, x: 90, y: 50, type: 'node' },

            { id: 8, x: 30, y: 10, type: 'entry', team: 'enemy' },
            { id: 9, x: 70, y: 10, type: 'entry', team: 'enemy' },
            { id: 10, x: 50, y: 5, type: 'core', team: 'enemy' }
        ];

        this.connections = [
            [0, 3], [0, 4], [1, 6], [1, 7],
            [3, 4], [4, 5], [5, 6], [6, 7],
            [8, 3], [8, 4], [9, 6], [9, 7],
            [4, 10], [5, 10], [6, 10], [2, 4], [2, 5], [2, 6]
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
            line.setAttribute("stroke", "rgba(0, 242, 255, 0.4)");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("stroke-dasharray", "6,4");
            line.classList.add('grid-line');
            this.svg.appendChild(line);
        });

        this.nodes.forEach(node => {
            const el = document.createElement('div');
            el.className = `grid-point ${node.type}`;
            if (node.type === 'core' && node.team === 'player') el.classList.add('core-player');
            if (node.type === 'core' && node.team === 'enemy') el.classList.add('core-enemy');
            el.style.left = `${node.x}%`; el.style.top = `${node.y}%`;
            el.dataset.id = node.id;

            // Add label
            const label = document.createElement('span');
            label.className = 'node-label';
            if (node.type === 'core') label.innerText = node.team === 'player' ? '🔵 SEU CORE' : '🔴 CORE INIMIGO';
            else if (node.type === 'entry') label.innerText = node.team === 'player' ? 'ENTRADA' : 'SAÍDA';
            el.appendChild(label);

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onNodeClick(node);
            });
            this.container.appendChild(el);
        });
    }

    async onNodeClick(node) {
        if (this.gameState.gameOver) return;

        console.log(`Nodo ${node.id} clicado. Unidade:`, this.units.get(node.id));
        const unitAtNode = this.units.get(node.id);
        const statusPanel = document.getElementById('status-panel');

        // Check if node is blocked
        if (this.gameState.blockedNodes.has(node.id) && !unitAtNode) {
            statusPanel.innerHTML = `> ⛔ NODO ${node.id} BLOQUEADO POR FIREWALL`;
            const blockedEl = document.querySelector(`.grid-point[data-id="${node.id}"]`);
            if (blockedEl) blockedEl.classList.add('shake-feedback');
            setTimeout(() => blockedEl?.classList.remove('shake-feedback'), 400);
            return;
        }

        // Selection Logic
        if (unitAtNode && unitAtNode.owner === this.gameState.currentPlayer) {
            if (unitAtNode.hasActed) {
                statusPanel.innerHTML = `> ⚠️ ${unitAtNode.name.toUpperCase()} JÁ AGIU NESTE TURNO`;
                // Shake feedback on the unit
                const unitEl = document.getElementById(`unit-${unitAtNode.uuid}`);
                if (unitEl) {
                    unitEl.classList.add('shake-feedback');
                    setTimeout(() => unitEl.classList.remove('shake-feedback'), 400);
                }
                return;
            }
            this.selectedUnit = unitAtNode;
            this.showValidMoves(node.id, unitAtNode.mp);
            statusPanel.innerHTML = `> SELECIONADO: ${unitAtNode.name}<br>> MP: ${unitAtNode.mp} | TIPO: ${unitAtNode.type}<br>> RARIDADE: ${unitAtNode.rarity}`;
            return;
        }

        // Movement / Combat Logic
        if (this.selectedUnit) {
            const path = this.getPath(this.selectedUnit.currentNode, node.id);
            if (path) {
                const unit = this.selectedUnit;
                this.selectedUnit = null;
                this.clearHighlights();
                await this.animateMove(unit, path);
                unit.hasActed = true;
                this.updateUnitVisual(unit);
                statusPanel.innerHTML = `> ${unit.name.toUpperCase()} moveu para nodo ${node.id}`;
                return;
            }
        }

        this.selectedUnit = null;
        this.clearHighlights();
        if (node.type === 'core') {
            statusPanel.innerHTML = `> CORE: ${node.team === 'player' ? 'Seu núcleo — proteja!' : 'Alvo inimigo — invada!'}`;
        } else if (node.type === 'entry') {
            statusPanel.innerHTML = `> PORTAL: ${node.team === 'player' ? 'Entrada para suas unidades' : 'Portal inimigo'}`;
        } else {
            statusPanel.innerHTML = `> NODO ${node.id}: ${unitAtNode ? `Ocupado por ${unitAtNode.name}` : 'Vazio'}`;
        }
    }

    updateUnitVisual(unit) {
        const el = document.getElementById(`unit-${unit.uuid}`);
        if (el) {
            if (unit.hasActed) {
                el.classList.add('has-acted');
            } else {
                el.classList.remove('has-acted');
            }
        }
    }

    refreshAllUnitVisuals() {
        for (const unit of this.units.values()) {
            this.updateUnitVisual(unit);
        }
    }

    showValidMoves(startNodeId, mp) {
        this.clearHighlights();
        this.validMoveMap = this.getReachableNodesMap(startNodeId, mp);

        for (const [nId, path] of this.validMoveMap.entries()) {
            // Skip blocked nodes (unless enemy is there)
            if (this.gameState.blockedNodes.has(nId) && !this.units.has(nId)) continue;

            const el = document.querySelector(`.grid-point[data-id="${nId}"]`);
            if (el) {
                const enemyThere = this.units.has(nId) && this.units.get(nId).owner !== this.gameState.currentPlayer;
                el.style.boxShadow = enemyThere ? '0 0 15px #ff3333' : '0 0 20px #00ffcc';
                el.classList.add('valid-move');
            }
        }
    }

    getReachableNodesMap(startId, mp) {
        const reachableMap = new Map();
        const queue = [{ id: startId, dist: 0, path: [] }];
        const visited = new Set([startId]);

        while (queue.length > 0) {
            const { id, dist, path } = queue.shift();
            if (dist > 0) reachableMap.set(id, path);
            if (dist < mp) {
                const neighbors = this.getNeighbors(id);
                neighbors.forEach(nId => {
                    const unitThere = this.units.get(nId);
                    const isEnemy = unitThere && unitThere.owner !== this.gameState.currentPlayer;

                    if (!visited.has(nId)) {
                        if (isEnemy) {
                            reachableMap.set(nId, [...path, nId]);
                            visited.add(nId);
                        } else if (!unitThere) {
                            visited.add(nId);
                            queue.push({ id: nId, dist: dist + 1, path: [...path, nId] });
                        }
                    }
                });
            }
        }
        return reachableMap;
    }

    getPath(startId, endId) {
        if (!this.validMoveMap) return null;
        return this.validMoveMap.get(endId);
    }

    async animateMove(unit, path) {
        const oldId = unit.currentNode;
        this.units.delete(oldId);

        for (let i = 0; i < path.length; i++) {
            const nodeId = path[i];
            const isLast = i === path.length - 1;
            const enemyUnit = this.units.get(nodeId);

            if (enemyUnit && enemyUnit.owner !== unit.owner && isLast) {
                const result = await this.startCombat(unit, enemyUnit);

                if (result === 'attacker_wins') {
                    this.deleteUnit(nodeId);
                    this.placeUnit(unit, nodeId);
                } else if (result === 'defender_wins') {
                    // Attacker is destroyed, place back doesn't happen
                    const lastSafe = i > 0 ? path[i - 1] : oldId;
                    // Unit is destroyed
                    const el = document.getElementById(`unit-${unit.uuid}`);
                    if (el) {
                        el.classList.add('deleting');
                        setTimeout(() => el.remove(), 600);
                    }
                    this.gameState.moveToDataCenter(unit);
                    return;
                } else if (result === 'attacker_defends' || result === 'defender_defends') {
                    // Both survive — attacker goes back to previous safe position
                    const lastSafe = i > 0 ? path[i - 1] : oldId;
                    this.placeUnit(unit, lastSafe);
                    return;
                } else {
                    // Draw — both survive, attacker stays in last safe position
                    const lastSafe = i > 0 ? path[i - 1] : oldId;
                    this.placeUnit(unit, lastSafe);
                    return;
                }
                break;
            } else {
                this.placeUnit(unit, nodeId);
                await new Promise(r => setTimeout(r, 200));
            }
        }

        const finalNode = this.nodes[unit.currentNode];
        if (finalNode.type === 'core' && finalNode.team !== unit.owner) {
            this.gameState.showVictory(unit.owner);
        }

        this.checkSurround(unit.currentNode);
    }

    async startCombat(attacker, defender) {
        const winner = await this.wheel.fullBattle(attacker, defender);
        console.log(`Resultado do combate: ${winner}`);
        return winner;
    }

    getNeighbors(nodeId) {
        return this.connections
            .filter(c => c.includes(nodeId))
            .map(c => c[0] === nodeId ? c[1] : c[0]);
    }

    clearHighlights() {
        this.nodes.forEach(n => {
            const el = document.querySelector(`.grid-point[data-id="${n.id}"]`);
            if (el && !el.classList.contains('blocked-node')) {
                const coreColor = n.team === 'player' ? 'var(--cyan-neon)' : '#FF0055';
                el.style.boxShadow = n.type === 'core' ? `0 0 15px ${coreColor}` : '0 0 8px var(--cyan-neon)';
                el.classList.remove('valid-move');
            }
        });
    }

    placeUnit(unit, nodeId) {
        const node = this.nodes[nodeId];
        unit.currentNode = nodeId;
        unit.status = 'field';
        this.units.set(nodeId, unit);

        let unitEl = document.getElementById(`unit-${unit.uuid}`);
        const isNew = !unitEl;
        if (!unitEl) {
            unitEl = document.createElement('div');
            unitEl.id = `unit-${unit.uuid}`;
            unitEl.className = `unit-disc ${unit.owner}`;
            unitEl.innerHTML = `<div class="base" style="border-color: ${unit.color}"></div><div class="visual">${unit.icon}</div><div class="unit-name-tag">${unit.name.split(' ')[0]}</div>`;
            this.unitsLayer.appendChild(unitEl);
        }

        unitEl.style.left = `${node.x}%`;
        unitEl.style.top = `${node.y}%`;

        if (isNew) {
            unitEl.classList.add('spawning');
            setTimeout(() => unitEl.classList.remove('spawning'), 600);
        }

        this.updateUnitVisual(unit);
    }

    checkSurround(nodeId) {
        const unit = this.units.get(nodeId);
        if (!unit) return;

        const neighbors = this.getNeighbors(nodeId);
        const allBlocked = neighbors.every(nId => {
            const neighborUnit = this.units.get(nId);
            return neighborUnit && neighborUnit.owner !== unit.owner;
        });

        if (allBlocked && neighbors.length > 0) {
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
