import { GameGrid } from './src/core/grid.js';
import { DataWheel } from './src/core/dataWheel.js';
import { GameState } from './src/core/gameState.js';
import { CyberBeast, INITIAL_BEASTS } from './src/entities/cyberbeast.js';
import { CyberAI } from './src/core/ai.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('CyberBeasts: Kernel v2.3 Initialized');

    const state = new GameState();
    const grid = new GameGrid(state);
    const wheel = new DataWheel();

    // Connect Wheel to Grid for Combat triggers
    grid.setWheel(wheel);

    const ai = new CyberAI(grid, state);

    // Populate Benches
    INITIAL_BEASTS.forEach(data => {
        state.addToBench(CyberBeast.fromJSON(data, 'player'), 'player');
        state.addToBench(CyberBeast.fromJSON(data, 'enemy'), 'enemy');
    });

    renderBench(state);
    state.updateUI();

    // Music Toggle Logic
    const btnMusic = document.getElementById('btn-music');
    const audio = document.getElementById('bg-music');
    if (btnMusic && audio) {
        btnMusic.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                btnMusic.classList.add('playing');
                btnMusic.innerText = '⏸️';
            } else {
                audio.pause();
                btnMusic.classList.remove('playing');
                btnMusic.innerText = '🎵';
            }
        });
    }

    document.addEventListener('benchUpdated', (e) => renderBench(e.detail.state));

    const btnNext = document.getElementById('btn-next-turn');
    if (btnNext) {
        btnNext.addEventListener('click', async () => {
            if (state.currentPlayer !== 'player') return;

            state.nextTurn();

            // AI Turn
            if (state.currentPlayer === 'enemy') {
                const statusPanel = document.getElementById('status-panel');
                statusPanel.innerHTML += "<br>> PENSAMENTO DA IA ATIVO...";

                setTimeout(async () => {
                    await ai.playTurn();
                    state.nextTurn();
                }, 1000);
            }
        });
    }

    // Plates Modal Logic
    const btnPlates = document.getElementById('btn-plates');
    const platesModal = document.getElementById('plates-modal');
    const platesList = document.getElementById('plates-list');

    if (btnPlates) {
        btnPlates.addEventListener('click', () => {
            platesModal.style.display = 'flex';
            renderPlates(state);
        });
    }

    platesModal.addEventListener('click', (e) => {
        if (e.target === platesModal) platesModal.style.display = 'none';
    });

    function renderPlates(state) {
        platesList.innerHTML = '';
        state.plates.forEach(plate => {
            const card = document.createElement('div');
            card.className = 'plate-card';
            card.innerHTML = `
                <div class="plate-name">${plate.name}</div>
                <div class="plate-desc">${plate.desc}</div>
                <div style="font-size: 1.5rem; text-align: center;">⚡</div>
            `;
            card.onclick = () => {
                console.log(`Using Plate: ${plate.name}`);
                platesModal.style.display = 'none';
            };
            platesList.appendChild(card);
        });
    }

    function renderBench(state) {
        const benchContainer = document.getElementById('bench-slots');
        if (!benchContainer) return;
        benchContainer.innerHTML = '';

        state.playerBench.forEach((unit, index) => {
            const slot = document.createElement('div');
            slot.className = 'bench-slot';
            slot.innerHTML = unit.icon;
            slot.style.borderColor = unit.color;
            slot.title = `${unit.name} (${unit.type})`;
            slot.onclick = () => {
                if (state.currentPlayer !== 'player') return;
                // Entry points for player: 0, 1
                const entryId = Math.random() > 0.5 ? 0 : 1;
                if (!grid.units.has(entryId)) {
                    grid.placeUnit(unit, entryId);
                    state.playerBench.splice(index, 1);
                    renderBench(state);
                } else {
                    alert("Portal de Entrada bloqueado!");
                }
            };
            benchContainer.appendChild(slot);
        });
    }
});
