export class GameGrid {
    constructor(containerId, rows = 6, cols = 6) {
        this.container = document.getElementById(containerId);
        this.rows = rows;
        this.cols = cols;
        this.cells = [];
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.createCell(r, c);
                this.container.appendChild(cell);
                this.cells.push({ r, c, element: cell });
            }
        }
    }

    createCell(r, c) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.id = `cell-${r}-${c}`;

        // Spawn Zones
        if (r === 0) cell.classList.add('spawn-blue');
        if (r === 5) cell.classList.add('spawn-red');

        // Core Nexus (Objective)
        if ((r === 0 && (c === 2 || c === 3)) || (r === 5 && (c === 2 || c === 3))) {
            cell.classList.add('core-nexus');
            cell.innerHTML = '<span style="font-size: 0.5rem">CORE</span>';
        }

        cell.addEventListener('click', () => this.handleCellClick(r, c));

        return cell;
    }

    handleCellClick(r, c) {
        console.log(`Cell clicked: [${r}, ${c}]`);
        const statusPanel = document.getElementById('status-panel');
        statusPanel.innerHTML = `> CELULA SELECIONADA: [${r}, ${c}]<br>> ANALISANDO DADOS...`;

        // Highlight selection
        this.cells.forEach(cell => cell.element.style.borderColor = '');
        const target = this.cells.find(cell => cell.r === r && cell.c === c);
        if (target) {
            target.element.style.borderColor = 'var(--cyber-magenta)';
        }
    }
}
