export class GameGrid {
    constructor(containerId, rows = 6, cols = 6) {
        this.container = document.getElementById(containerId);
        this.rows = rows;
        this.cols = cols;
        this.cells = [];
        this.units = []; // Tracking units on the grid
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.createCell(r, c);
                this.container.appendChild(cell);
                this.cells.push({
                    r, c,
                    element: cell,
                    type: this.getNodeType(r, c)
                });
            }
        }
    }

    getNodeType(r, c) {
        // Core Nexus
        if ((r === 0 && (c === 2 || c === 3)) || (r === 5 && (c === 2 || c === 3))) return 'core-nexus';

        // Random obstacles and nodes for demonstration
        const seed = (r * 10 + c);
        if (seed % 13 === 0 && r > 0 && r < 5) return 'firewall';
        if (seed % 11 === 0 && r > 0 && r < 5) return 'boost-node';
        if (seed % 17 === 0 && r > 0 && r < 5) return 'repair-node';

        return 'normal';
    }

    createCell(r, c) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        const type = this.getNodeType(r, c);
        if (type !== 'normal') cell.classList.add(type);

        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.id = `cell-${r}-${c}`;

        // Spawn Zones
        if (r === 0) cell.classList.add('spawn-blue');
        if (r === 5) cell.classList.add('spawn-red');

        cell.addEventListener('click', () => this.handleCellClick(r, c));

        return cell;
    }

    handleCellClick(r, c) {
        const statusPanel = document.getElementById('status-panel');
        const cellInfo = this.cells.find(cell => cell.r === r && cell.c === c);

        statusPanel.innerHTML = `> CELULA: [${r}, ${c}] | TIPO: ${cellInfo.type.toUpperCase()}<br>> ANALISANDO DADOS...`;

        // Handle basic unit interaction / collision trigger
        this.checkCollision(r, c);

        // Highlight selection
        this.cells.forEach(cell => cell.element.style.boxShadow = '');
        cellInfo.element.style.boxShadow = 'inset 0 0 15px var(--cyber-magenta)';
    }

    checkCollision(r, c) {
        // Placeholder for collision logic: If unit A moves to unit B
        // In this sprint, we just log the trigger
        console.log(`Collision check at [${r}, ${c}]`);
    }

    placeUnit(unit, r, c) {
        unit.position = { r, c };
        const cell = document.getElementById(`cell-${r}-${c}`);
        const unitEl = document.createElement('div');
        unitEl.className = 'cyberbeast-sprite';
        unitEl.style.width = '40px';
        unitEl.style.height = '40px';
        unitEl.style.background = unit.type === 'Striker' ? 'var(--matrix-green)' : 'var(--cyber-magenta)';
        unitEl.style.borderRadius = '50%';
        unitEl.style.boxShadow = '0 0 10px currentColor';
        cell.appendChild(unitEl);
        this.units.push(unit);
    }
}
