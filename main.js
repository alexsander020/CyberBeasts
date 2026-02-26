import { GameGrid } from './src/core/grid.js';
import { DataWheel } from './src/core/dataWheel.js';
import { GameState } from './src/core/gameState.js';
import { CyberBeast, INITIAL_BEASTS } from './src/entities/cyberbeast.js';
import { CyberAI } from './src/core/ai.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('CyberBeasts: Kernel v2.8 Initialized');

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

    document.addEventListener('benchUpdated', (e) => renderBench(e.detail.state));

    const btnNext = document.getElementById('btn-next-turn');
    if (btnNext) {
        btnNext.addEventListener('click', async (e) => {
            e.stopPropagation(); // Shield the grid from this click
            if (state.currentPlayer !== 'player') return;

            state.nextTurn();

            if (state.currentPlayer === 'enemy') {
                setTimeout(async () => {
                    await ai.playTurn();
                    state.nextTurn();
                }, 1000);
            }
        });
    }

    const btnPlates = document.getElementById('btn-plates');
    const platesModal = document.getElementById('plates-modal');
    const platesList = document.getElementById('plates-list');
    const btnClosePlates = document.getElementById('btn-close-plates');

    if (btnPlates) {
        btnPlates.onclick = () => {
            platesModal.style.display = 'flex';
            renderPlates(state);
        };
    }

    if (btnClosePlates) {
        btnClosePlates.onclick = () => {
            platesModal.style.display = 'none';
        };
    }

    platesModal.onclick = (e) => {
        if (e.target === platesModal) platesModal.style.display = 'none';
    };

    function renderPlates(state) {
        platesList.innerHTML = '';
        state.plates.forEach(plate => {
            const card = document.createElement('div');
            card.className = 'plate-card';
            card.innerHTML = `
                <div class="plate-name">${plate.name.toUpperCase()}</div>
                <div class="plate-desc">${plate.desc}</div>
            `;
            card.onclick = () => {
                console.log(`Using Plate: ${plate.name}`);
                platesModal.style.display = 'none';
                // Future: Implement plate effects
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
            slot.onclick = (e) => {
                e.stopPropagation();
                if (state.currentPlayer !== 'player') return;
                const entryPoints = [0, 1].filter(id => !grid.units.has(id));
                if (entryPoints.length > 0) {
                    grid.placeUnit(unit, entryPoints[0]);
                    state.playerBench.splice(index, 1);
                    renderBench(state);
                } else {
                    alert("PROTOCOL ERROR: Portal de Entrada bloqueado!");
                }
            };
            benchContainer.appendChild(slot);
        });
    }
});
