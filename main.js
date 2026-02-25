import { GameGrid } from './src/core/grid.js';
import { DataWheel } from './src/core/dataWheel.js';
import { CyberBeast, CLASS_STATS } from './src/entities/cyberbeast.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('CyberBeasts: Core Conquest - Inicializado');

    // Inicializa o Grid 6x6
    const grid = new GameGrid('game-grid');
    const wheel = new DataWheel();

    // Spawn test units
    const alphaStriker = new CyberBeast('Alpha', 'Striker', CLASS_STATS.Striker);
    const betaTank = new CyberBeast('Beta', 'Tank', CLASS_STATS.Tank);

    grid.placeUnit(alphaStriker, 0, 1);
    grid.placeUnit(betaTank, 5, 4);

    // Botão de Próximo Turno - Agora simula uma resolução de combate
    const nextTurnBtn = document.getElementById('btn-next-turn');
    if (nextTurnBtn) {
        nextTurnBtn.addEventListener('click', async () => {
            const statusPanel = document.getElementById('status-panel');
            statusPanel.innerHTML = '> SIMULANDO CONFLITO DE DADOS...';

            // Simula um combate entre Alpha e Beta
            const result = await wheel.spin(alphaStriker.wheel);
            statusPanel.innerHTML += `<br>> ALPHA Striker resolveu: ${result}`;
        });
    }
});
