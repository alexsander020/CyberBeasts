export class GameState {
    constructor() {
        this.playerBench = [];
        this.enemyBench = [];
        this.dataCenter = []; // Max 2 slots
        this.currentPlayer = 'player';
        this.turnNumber = 1;
        this.plates = [
            { id: 'p1', name: 'Overclock', desc: '+1 MP temporarily', effect: 'mp_boost' },
            { id: 'p2', name: 'Data Repair', desc: 'Resets a unit to bench', effect: 'recall' },
            { id: 'p3', name: 'Firewall', desc: 'Blocks a node for 1 turn', effect: 'block' }
        ];
    }

    addToBench(unit, team) {
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
        console.log(`REBOOTING: ${unit.name}`);
        this.addToBench(unit, unit.owner);
        this.updateDataCenterUI();
    }

    updateDataCenterUI() {
        for (let i = 0; i < 2; i++) {
            const slot = document.getElementById(`dc-${i}`);
            if (slot) {
                const unit = this.dataCenter[i];
                if (unit) {
                    slot.classList.add('occupied');
                    slot.innerHTML = unit.icon || '👾';
                    slot.title = unit.name;
                    slot.style.borderColor = unit.color || 'var(--cyber-pink)';
                } else {
                    slot.classList.remove('occupied');
                    slot.innerHTML = '';
                    slot.title = '';
                    slot.style.borderColor = '';
                }
            }
        }
    }

    triggerBenchEvent() {
        const event = new CustomEvent('benchUpdated', { detail: { state: this } });
        document.dispatchEvent(event);
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

        text.innerText = this.currentPlayer === 'player' ? 'YOUR TURN' : 'AI TURN';
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
        if (statusEl) statusEl.innerHTML = `> TURNO: ${this.turnNumber}<br>> ARQUITETADOR: ${this.currentPlayer.toUpperCase()}`;
    }
}
