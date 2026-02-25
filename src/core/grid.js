export class GameGrid {
    constructor() {
        this.container = document.getElementById('nodes-layer');
        this.svg = document.getElementById('board-svg');
        this.unitsLayer = document.getElementById('units-layer');
        this.nodes = [];
        this.connections = [];
        this.units = [];
        this.init();
    }

    init() {
        // Define a node map that forms a hexagonal/cyber pattern similar to the image
        this.nodes = [
            { id: 0, x: 50, y: 10 }, { id: 1, x: 20, y: 30 }, { id: 2, x: 80, y: 30 },
            { id: 3, x: 20, y: 70 }, { id: 4, x: 80, y: 70 }, { id: 5, x: 50, y: 90 },
            { id: 6, x: 50, y: 40 }, { id: 7, x: 50, y: 60 }, { id: 8, x: 35, y: 50 },
            { id: 9, x: 65, y: 50 }
        ];

        this.connections = [
            [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5],
            [1, 6], [2, 6], [3, 7], [4, 7], [6, 8], [6, 9],
            [7, 8], [7, 9], [8, 9]
        ];

        this.render();
    }

    render() {
        this.container.innerHTML = '';
        this.svg.innerHTML = '';

        // Draw Connections
        this.connections.forEach(([startId, endId]) => {
            const start = this.nodes.find(n => n.id === startId);
            const end = this.nodes.find(n => n.id === endId);

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", `${start.x}%`);
            line.setAttribute("y1", `${start.y}%`);
            line.setAttribute("x2", `${end.x}%`);
            line.setAttribute("y2", `${end.y}%`);
            line.setAttribute("stroke", "rgba(255,255,255,0.2)");
            line.setAttribute("stroke-width", "2");
            this.svg.appendChild(line);
        });

        // Draw Nodes
        this.nodes.forEach(node => {
            const el = document.createElement('div');
            el.className = 'grid-point';
            el.style.left = `${node.x}%`;
            el.style.top = `${node.y}%`;
            el.dataset.id = node.id;

            el.addEventListener('click', () => this.handleNodeClick(node));
            this.container.appendChild(el);
        });
    }

    handleNodeClick(node) {
        const statusPanel = document.getElementById('status-panel');
        statusPanel.innerHTML = `> NODO ATIVO: ${node.id}<br>> COORDENADAS: [${node.x}, ${node.y}]`;

        // Highlight logic
        const points = document.querySelectorAll('.grid-point');
        points.forEach(p => p.style.background = 'white');
        const active = document.querySelector(`.grid-point[data-id="${node.id}"]`);
        active.style.background = '#00ffcc';
    }

    placeUnit(unit, nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        unit.currentNode = nodeId;

        let unitEl = document.getElementById(`unit-${unit.name}`);
        if (!unitEl) {
            unitEl = document.createElement('div');
            unitEl.id = `unit-${unit.name}`;
            unitEl.className = `unit-disc ${unit.isEnemy ? 'enemy' : ''}`;
            unitEl.innerHTML = `
                <div class="base"></div>
                <div class="visual">👾</div>
                <div class="hp-badge">${unit.hp}</div>
            `;
            this.unitsLayer.appendChild(unitEl);
        }

        unitEl.style.left = `${node.x}%`;
        unitEl.style.top = `${node.y}%`;

        this.units.push(unit);
    }
}
