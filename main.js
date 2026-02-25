import { GameGrid } from './src/core/grid.js';
import { DataWheel } from './src/core/dataWheel.js';
import { GameState } from './src/core/gameState.js';
import { CyberBeast, INITIAL_BEASTS } from './src/entities/cyberbeast.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('CyberBeasts: Kernel v2.1 Initialized');

    const state = new GameState();
    const grid = new GameGrid(state);
    const wheel = new DataWheel();

    // Populate Bench
    INITIAL_BEASTS.forEach(data => {
        state.addToBench(CyberBeast.fromJSON(data, 'player'), 'player');
    });

    renderBench(state);

    // Initial Status Update
    state.updateUI();

    // Listen for bench updates (reboots)
    document.addEventListener('benchUpdated', (e) => {
        renderBench(e.detail.state);
    });

    // Spawn Trigger Simulation
    const btnNext = document.getElementById('btn-next-turn');
    if (btnNext) btnNext.addEventListener('click', () => state.nextTurn());

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
                // Effect implementation would go here
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
            slot.innerHTML = '👾';
            slot.title = unit.name;
            slot.onclick = () => {
                // Try to spawn at Entry Point 0 or 1
                const entryId = Math.random() > 0.5 ? 0 : 1;
                grid.placeUnit(unit, entryId);
                state.playerBench.splice(index, 1);
                renderBench(state);
            };
            benchContainer.appendChild(slot);
        });
    }
});
