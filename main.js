import { GameGrid } from './src/core/grid.js';
import { DataWheel } from './src/core/dataWheel.js';
import { GameState } from './src/core/gameState.js';
import { CyberBeast, INITIAL_BEASTS } from './src/entities/cyberbeast.js';
import { CyberAI } from './src/core/ai.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('CyberBeasts: Kernel v3.0 Initialized');

    const state = new GameState();
    const grid = new GameGrid(state);
    const wheel = new DataWheel();

    grid.setWheel(wheel);
    const ai = new CyberAI(grid, state);

    INITIAL_BEASTS.forEach(data => {
        state.addToBench(CyberBeast.fromJSON(data, 'player'), 'player');
        state.addToBench(CyberBeast.fromJSON(data, 'enemy'), 'enemy');
    });

    renderBench(state);
    state.updateUI();

    // ── Music Toggle ──
    const btnMusic = document.getElementById('btn-music');
    const audio = document.getElementById('bg-music');
    if (btnMusic && audio) {
        btnMusic.onclick = () => {
            if (audio.paused) {
                audio.play();
                btnMusic.innerText = '⏸️';
            } else {
                audio.pause();
                btnMusic.innerText = '🎵';
            }
        };
    }

    // ── Bench Update ──
    document.addEventListener('benchUpdated', (e) => renderBench(e.detail.state));

    // ── Next Turn ──
    const btnNext = document.getElementById('btn-next-turn');
    if (btnNext) {
        btnNext.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (state.currentPlayer !== 'player') return;
            if (state.gameOver) return;

            // Reset all unit actions for next turn
            state.resetActions(grid);
            state.nextTurn();

            if (state.currentPlayer === 'enemy') {
                btnNext.disabled = true;
                btnNext.innerText = 'IA PENSANDO...';
                setTimeout(async () => {
                    await ai.playTurn();
                    state.resetActions(grid);
                    state.nextTurn();
                    btnNext.disabled = false;
                    btnNext.innerText = 'PRÓXIMO TURNO';
                    grid.refreshAllUnitVisuals();
                    renderBench(state);
                }, 1000);
            }
        });
    }

    // ── Plates ──
    const btnPlates = document.getElementById('btn-plates');
    const platesModal = document.getElementById('plates-modal');
    const platesList = document.getElementById('plates-list');
    const btnClosePlates = document.getElementById('btn-close-plates');

    if (btnPlates) {
        btnPlates.onclick = (e) => {
            e.stopPropagation();
            if (state.currentPlayer !== 'player' || state.gameOver) return;
            platesModal.style.display = 'flex';
            renderPlates(state);
        };
    }

    if (btnClosePlates) {
        btnClosePlates.onclick = () => {
            platesModal.style.display = 'none';
        };
    }

    if (platesModal) {
        platesModal.onclick = (e) => {
            if (e.target === platesModal) platesModal.style.display = 'none';
        };
    }

    // ── Surrender ──
    const btnSurrender = document.getElementById('btn-surrender');
    const surrenderModal = document.getElementById('surrender-modal');
    const btnConfirmSurrender = document.getElementById('btn-confirm-surrender');
    const btnCancelSurrender = document.getElementById('btn-cancel-surrender');

    if (btnSurrender) {
        btnSurrender.onclick = (e) => {
            e.stopPropagation();
            if (state.gameOver) return;
            surrenderModal.style.display = 'flex';
        };
    }

    if (btnConfirmSurrender) {
        btnConfirmSurrender.onclick = () => {
            surrenderModal.style.display = 'none';
            state.showVictory('enemy');
        };
    }

    if (btnCancelSurrender) {
        btnCancelSurrender.onclick = () => {
            surrenderModal.style.display = 'none';
        };
    }

    // ── Victory Restart ──
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
        btnRestart.onclick = () => location.reload();
    }

    // ── Tutorial ──
    const btnHelp = document.getElementById('btn-help');
    const tutorialModal = document.getElementById('tutorial-modal');
    const btnCloseTutorial = document.getElementById('btn-close-tutorial');

    if (btnHelp) {
        btnHelp.onclick = (e) => {
            e.stopPropagation();
            tutorialModal.style.display = 'flex';
        };
    }

    if (btnCloseTutorial) {
        btnCloseTutorial.onclick = () => {
            tutorialModal.style.display = 'none';
        };
    }

    if (tutorialModal) {
        tutorialModal.onclick = (e) => {
            if (e.target === tutorialModal) tutorialModal.style.display = 'none';
        };
    }

    // ── Show tutorial on first visit ──
    if (!localStorage.getItem('cyberbeasts-tutorial-seen')) {
        tutorialModal.style.display = 'flex';
        localStorage.setItem('cyberbeasts-tutorial-seen', 'true');
    }

    // ── Plates Rendering & Effects ──
    function renderPlates(state) {
        platesList.innerHTML = '';
        state.plates.forEach(plate => {
            const card = document.createElement('div');
            card.className = `plate-card ${plate.used ? 'used' : ''}`;
            card.innerHTML = `
                <div class="plate-icon">${plate.icon}</div>
                <div class="plate-name">${plate.name.toUpperCase()}</div>
                <div class="plate-desc">${plate.desc}</div>
                ${plate.used ? '<div class="plate-used-tag">USADO</div>' : ''}
            `;
            if (!plate.used) {
                card.onclick = () => {
                    usePlate(plate);
                    platesModal.style.display = 'none';
                };
            }
            platesList.appendChild(card);
        });
    }

    function usePlate(plate) {
        const statusPanel = document.getElementById('status-panel');

        switch (plate.effect) {
            case 'mp_boost': {
                // Give +1 MP to all player units on the field this turn
                let boosted = 0;
                for (const unit of grid.units.values()) {
                    if (unit.owner === 'player') {
                        unit.mp += 1;
                        boosted++;
                    }
                }
                plate.used = true;
                statusPanel.innerHTML = `> ⚡ OVERCLOCK: +1 MP para ${boosted} unidade(s)!`;
                // Revert after turn ends (on next turn)
                const originalMPs = new Map();
                for (const unit of grid.units.values()) {
                    if (unit.owner === 'player') {
                        originalMPs.set(unit.uuid, unit.mp - 1);
                    }
                }
                document.addEventListener('benchUpdated', function revert() {
                    for (const unit of grid.units.values()) {
                        const orig = originalMPs.get(unit.uuid);
                        if (orig !== undefined) unit.mp = orig;
                    }
                    document.removeEventListener('benchUpdated', revert);
                }, { once: true });
                break;
            }
            case 'recall': {
                // Return a random player unit from the field to the bench
                const playerUnits = Array.from(grid.units.entries())
                    .filter(([_, u]) => u.owner === 'player');
                if (playerUnits.length > 0) {
                    const [nodeId, unit] = playerUnits[0];
                    grid.deleteUnit(nodeId);
                    plate.used = true;
                    statusPanel.innerHTML = `> 🔄 DATA REPAIR: ${unit.name} retornando ao banco`;
                } else {
                    statusPanel.innerHTML = `> ⚠️ Nenhuma unidade em campo para retornar`;
                }
                break;
            }
            case 'block': {
                // Block central nodes for 1 turn
                const centralNodes = [3, 4, 5, 6, 7];
                const emptyNodes = centralNodes.filter(id => !grid.units.has(id));
                if (emptyNodes.length > 0) {
                    const target = emptyNodes[Math.floor(Math.random() * emptyNodes.length)];
                    state.blockedNodes.add(target);
                    plate.used = true;

                    // Visual feedback
                    const el = document.querySelector(`.grid-point[data-id="${target}"]`);
                    if (el) {
                        el.classList.add('blocked-node');
                    }
                    statusPanel.innerHTML = `> 🔥 FIREWALL: Nodo ${target} bloqueado!`;
                } else {
                    statusPanel.innerHTML = `> ⚠️ Nenhum nodo disponível para bloqueio`;
                }
                break;
            }
        }
    }

    // ── Bench Rendering ──
    function renderBench(state) {
        const benchContainer = document.getElementById('bench-slots');
        if (!benchContainer) return;
        benchContainer.innerHTML = '';

        state.playerBench.forEach((unit, index) => {
            const slot = document.createElement('div');
            slot.className = 'bench-slot';
            slot.innerHTML = `
                <span class="bench-icon">${unit.icon}</span>
                <span class="bench-name">${unit.name.split(' ')[0]}</span>
            `;
            slot.style.borderColor = unit.color;
            slot.title = `${unit.name} (${unit.type}) — MP: ${unit.mp} | ${unit.rarity}`;
            slot.onclick = (e) => {
                e.stopPropagation();
                if (state.currentPlayer !== 'player') return;
                if (state.gameOver) return;
                const entryPoints = [0, 1].filter(id => !grid.units.has(id));
                if (entryPoints.length > 0) {
                    grid.placeUnit(unit, entryPoints[0]);
                    state.playerBench.splice(index, 1);
                    renderBench(state);
                    const statusPanel = document.getElementById('status-panel');
                    statusPanel.innerHTML = `> ${unit.name.toUpperCase()} compilado no nodo ${entryPoints[0]}`;
                } else {
                    const statusPanel = document.getElementById('status-panel');
                    statusPanel.innerHTML = `> ⛔ ERRO: Portais de entrada bloqueados!`;
                }
            };
            benchContainer.appendChild(slot);
        });

        // Show count
        const countEl = document.getElementById('bench-count');
        if (countEl) countEl.innerText = `${state.playerBench.length} unidade(s) no banco`;
    }
});
