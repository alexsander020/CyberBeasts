export class GameState {
    constructor() {
        this.playerBench = [];
        this.enemyBench = [];
        this.dataCenter = [];
        this.currentPlayer = 'player';
        this.turnNumber = 1;
        this.gameOver = false;
        this.plates = [
            { id: 'p1', name: 'Overclock', desc: '+1 MP temporariamente', effect: 'mp_boost', icon: '⚡', used: false },
            { id: 'p2', name: 'Data Repair', desc: 'Retorna unidade ao banco', effect: 'recall', icon: '🔄', used: false },
            { id: 'p3', name: 'Firewall', desc: 'Bloqueia um nodo por 1 turno', effect: 'block', icon: '🔥', used: false }
        ];
        this.blockedNodes = new Set();
    }

    addToBench(unit, team) {
        unit.status = 'bench';
        unit.hasActed = false;
        if (team === 'player') this.playerBench.push(unit);
        else this.enemyBench.push(unit);
        this.triggerBenchEvent();
    }

    moveToDataCenter(unit) {
        unit.status = 'deleted';
        this.dataCenter.push(unit);
        this.updateDataCenterUI();

        if (this.dataCenter.length > 2) {
            const rebooted = this.dataCenter.shift();
            this.rebootUnit(rebooted);
        }
    }

    rebootUnit(unit) {
        console.log(`REBOOT: ${unit.name}`);
        unit.status = 'bench';
        this.addToBench(unit, unit.owner);
        this.updateDataCenterUI();
    }

    updateDataCenterUI() {
        const isFull = this.dataCenter.length >= 2;
        for (let i = 0; i < 2; i++) {
            const slot = document.getElementById(`dc-${i}`);
            if (slot) {
                const unit = this.dataCenter[i];
                if (unit) {
                    slot.classList.add('occupied');
                    if (isFull) slot.classList.add('dc-alert');
                    else slot.classList.remove('dc-alert');

                    slot.innerHTML = unit.icon || '👾';
                    slot.title = `${unit.name} — Aguardando reboot`;
                    slot.style.borderColor = unit.color || 'var(--cyber-pink)';
                } else {
                    slot.classList.remove('occupied', 'dc-alert');
                    slot.innerHTML = '';
                    slot.title = 'Slot vazio — unidades deletadas vão para cá';
                    slot.style.borderColor = '';
                }
            }
        }
    }

    triggerBenchEvent() {
        const event = new CustomEvent('benchUpdated', { detail: { state: this } });
        document.dispatchEvent(event);
    }

    resetActions(grid) {
        for (const unit of grid.units.values()) {
            unit.hasActed = false;
        }
        // Clear expired blocked nodes
        this.blockedNodes.clear();
    }

    nextTurn() {
        this.currentPlayer = this.currentPlayer === 'player' ? 'enemy' : 'player';
        this.turnNumber++;
        this.showTurnSplash();
        this.updateUI();
    }

    showTurnSplash() {
        const splash = document.getElementById('turn-splash');
        const text = document.getElementById('splash-text');
        if (!splash || !text) return;

        text.innerText = this.currentPlayer === 'player' ? 'SEU TURNO' : 'TURNO DA IA';
        text.style.color = this.currentPlayer === 'player' ? 'var(--cyan-neon)' : 'var(--cyber-pink)';
        text.style.textShadow = `0 0 20px ${text.style.color}`;

        splash.style.display = 'flex';
        setTimeout(() => {
            splash.style.display = 'none';
        }, 1200);
    }

    updateUI() {
        const turnEl = document.getElementById('turn-val');
        if (turnEl) turnEl.innerText = this.turnNumber;

        const statusEl = document.getElementById('status-panel');
        if (statusEl) statusEl.innerHTML = `> TURNO: ${this.turnNumber}<br>> JOGADOR: ${this.currentPlayer === 'player' ? 'VOCÊ' : 'IA'}`;
    }

    showVictory(winner) {
        if (this.gameOver) return;
        this.gameOver = true;

        const overlay = document.getElementById('victory-overlay');
        const title = document.getElementById('victory-title');
        const subtitle = document.getElementById('victory-subtitle');

        if (!overlay || !title || !subtitle) return;

        if (winner === 'player') {
            title.innerText = 'VITÓRIA!';
            title.style.color = 'var(--cyan-neon)';
            title.style.textShadow = '0 0 30px var(--cyan-neon)';
            subtitle.innerText = 'Sistema inimigo invadido com sucesso.';
        } else {
            title.innerText = 'DERROTA';
            title.style.color = 'var(--cyber-pink)';
            title.style.textShadow = '0 0 30px var(--cyber-pink)';
            subtitle.innerText = 'Seu core foi comprometido.';
        }

        overlay.style.display = 'flex';
    }
}
