import { GameGrid } from './src/core/grid.js';
import { DataWheel } from './src/core/dataWheel.js';
import { CyberBeast, CLASS_STATS } from './src/entities/cyberbeast.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('CyberBeasts: Core Conquest - Inicializado na Floresta Cyber');

    // Inicializa o Grid de Nodos
    const grid = new GameGrid();
    const wheel = new DataWheel();

    // Spawn test units on nodes
    const alphaStriker = new CyberBeast('Alpha', 'Striker', CLASS_STATS.Striker);
    const betaTank = new CyberBeast('Beta', 'Tank', CLASS_STATS.Tank);
    betaTank.isEnemy = true;

    // Place units on specific nodes (0-9 defined in grid.js)
    grid.placeUnit(alphaStriker, 5); // Nodo de base (inferior)
    grid.placeUnit(betaTank, 0);    // Nodo de base (superior)

    // Botão de Compilar Dados (Next Turn)
    const nextTurnBtn = document.getElementById('btn-next-turn');
    if (nextTurnBtn) {
        nextTurnBtn.addEventListener('click', async () => {
            const statusPanel = document.getElementById('status-panel');
            statusPanel.innerHTML = '> SIMULANDO CONFLITO DE DADOS...';

            // Simula um combate
            const result = await wheel.spin(alphaStriker.wheel);
            statusPanel.innerHTML = `> ALPHA Striker: ${result}`;
        });
    }
});
