import { GameGrid } from './src/core/grid.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('CyberBeasts: Core Conquest - Inicializado');

    // Inicializa o Grid 6x6
    const grid = new GameGrid('game-grid');

    // Botão de Próximo Turno
    const nextTurnBtn = document.getElementById('btn-next-turn');
    if (nextTurnBtn) {
        nextTurnBtn.addEventListener('click', () => {
            const statusPanel = document.getElementById('status-panel');
            statusPanel.innerHTML += '<br>> TURNO FINALIZADO. PROCESSANDO NEXT FRAME...';
            console.log('Turn processed.');
        });
    }
});
