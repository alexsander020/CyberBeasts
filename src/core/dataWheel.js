export class DataWheel {
    constructor() {
        this.canvas = document.getElementById('wheel-canvas');
        this.overlay = document.getElementById('wheel-overlay');
        this.container = document.getElementById('wheel-container');
        this.resultText = document.getElementById('wheel-result');
        this.battleLog = document.getElementById('battle-log');
        this.battleFlash = document.getElementById('battle-flash');
        this.battlePhase = document.getElementById('battle-phase');
        this.spinningLabel = document.getElementById('spinning-label');

        this.atAvatar = document.getElementById('attacker-avatar');
        this.atName = document.getElementById('attacker-name-label');
        this.atMeta = document.getElementById('attacker-meta');
        this.atSpinResult = document.getElementById('attacker-spin-result');
        this.dfAvatar = document.getElementById('defender-avatar');
        this.dfName = document.getElementById('defender-name-label');
        this.dfMeta = document.getElementById('defender-meta');
        this.dfSpinResult = document.getElementById('defender-spin-result');

        this.segmentColors = {
            blue: { fill: '#0066cc', glow: '#0088ff', gradient: ['#0044aa', '#00aaff'], icon: '🛡️', label: 'DEFESA' },
            gold: { fill: '#cc9900', glow: '#ffcc00', gradient: ['#996600', '#ffdd44'], icon: '⚡', label: 'PRIORIDADE' },
            purple: { fill: '#9900cc', glow: '#ff00ff', gradient: ['#660099', '#ff44ff'], icon: '🌀', label: 'GLITCH' },
            white: { fill: '#cccccc', glow: '#ffffff', gradient: ['#999999', '#ffffff'], icon: '⚔️', label: 'ATAQUE' },
            red: { fill: '#cc0000', glow: '#ff3333', gradient: ['#880000', '#ff4444'], icon: '💨', label: 'MISS' }
        };
    }

    static getPriority(color) {
        const hierarchy = { 'blue': 10, 'gold': 5, 'purple': 3, 'white': 1, 'red': 0 };
        return hierarchy[color] || 0;
    }

    static resolveCombat(attacker, defender, atkRes, defRes) {
        const pA = this.getPriority(atkRes.type);
        const pB = this.getPriority(defRes.type);

        if (atkRes.type === 'blue' && defRes.type !== 'blue') return 'attacker_defends';
        if (defRes.type === 'blue' && atkRes.type !== 'blue') return 'defender_defends';
        if (atkRes.type === 'blue' && defRes.type === 'blue') return 'draw';

        if (pA > pB) return 'attacker_wins';
        if (pB > pA) return 'defender_wins';

        if (atkRes.type === 'white') {
            if (atkRes.power > defRes.power) return 'attacker_wins';
            if (defRes.power > atkRes.power) return 'defender_wins';
            return 'draw';
        }

        if (atkRes.type === 'purple') {
            if (atkRes.stars > defRes.stars) return 'attacker_wins';
            if (defRes.stars > atkRes.stars) return 'defender_wins';
            return 'draw';
        }

        return 'draw';
    }

    async fullBattle(attacker, defender) {
        // Reset state
        this.overlay.style.display = 'flex';
        this.resultText.innerText = '';
        this.resultText.className = '';
        this.atSpinResult.innerText = '—';
        this.atSpinResult.className = 'fighter-spin-result';
        this.dfSpinResult.innerText = '—';
        this.dfSpinResult.className = 'fighter-spin-result';

        // Setup fighter cards
        this.atAvatar.innerText = attacker.icon;
        this.atName.innerText = attacker.name.toUpperCase();
        this.atMeta.innerText = `${attacker.type} • ${attacker.rarity}`;
        this.dfAvatar.innerText = defender.icon;
        this.dfName.innerText = defender.name.toUpperCase();
        this.dfMeta.innerText = `${defender.type} • ${defender.rarity}`;

        // Phase 1: Intro
        this.battlePhase.innerText = '⚔️ PROTOCOLO DE COMBATE';
        this.battleLog.innerText = '> INICIALIZANDO DATA WHEEL...';
        await this.delay(800);

        // Phase 2: Attacker spins
        this.battlePhase.innerText = '🔵 TURNO DO ATACANTE';
        this.spinningLabel.innerText = `${attacker.name.toUpperCase()} GIRANDO...`;
        this.spinningLabel.style.color = 'var(--cyan-neon)';
        this.battleLog.innerText = `> ${attacker.icon} ${attacker.name.toUpperCase()} GIRA A ROLETA`;
        document.getElementById('attacker-card').classList.add('fighter-active');

        const atkRes = await this.spinOnce(attacker);

        document.getElementById('attacker-card').classList.remove('fighter-active');
        this.atSpinResult.innerText = `${this.segmentColors[atkRes.type].icon} ${atkRes.label.toUpperCase()}`;
        this.atSpinResult.className = `fighter-spin-result result-${atkRes.type}`;
        this.atSpinResult.style.color = this.segmentColors[atkRes.type].glow;

        if (atkRes.power) this.atSpinResult.innerText += ` [${atkRes.power}]`;
        if (atkRes.stars) this.atSpinResult.innerText += ` ${'⭐'.repeat(atkRes.stars)}`;

        this.battleLog.innerText = `> RESULTADO: ${this.segmentColors[atkRes.type].icon} ${atkRes.label.toUpperCase()}`;
        await this.delay(1200);

        // Phase 3: Defender spins
        this.battlePhase.innerText = '🔴 TURNO DO DEFENSOR';
        this.spinningLabel.innerText = `${defender.name.toUpperCase()} GIRANDO...`;
        this.spinningLabel.style.color = 'var(--cyber-pink)';
        this.battleLog.innerText = `> ${defender.icon} ${defender.name.toUpperCase()} GIRA A ROLETA`;
        document.getElementById('defender-card').classList.add('fighter-active');

        const defRes = await this.spinOnce(defender);

        document.getElementById('defender-card').classList.remove('fighter-active');
        this.dfSpinResult.innerText = `${this.segmentColors[defRes.type].icon} ${defRes.label.toUpperCase()}`;
        this.dfSpinResult.className = `fighter-spin-result result-${defRes.type}`;
        this.dfSpinResult.style.color = this.segmentColors[defRes.type].glow;

        if (defRes.power) this.dfSpinResult.innerText += ` [${defRes.power}]`;
        if (defRes.stars) this.dfSpinResult.innerText += ` ${'⭐'.repeat(defRes.stars)}`;

        this.battleLog.innerText = `> RESULTADO: ${this.segmentColors[defRes.type].icon} ${defRes.label.toUpperCase()}`;
        await this.delay(1200);

        // Phase 4: Resolution
        this.battlePhase.innerText = '💀 RESOLUÇÃO';
        this.spinningLabel.innerText = 'CALCULANDO...';
        this.spinningLabel.style.color = '#ffcc00';
        await this.delay(600);

        const winnerKey = DataWheel.resolveCombat(attacker, defender, atkRes, defRes);
        this.animateResolution(winnerKey, attacker, defender);

        await this.delay(2800);
        this.overlay.style.display = 'none';

        return winnerKey;
    }

    async spinOnce(unit) {
        return new Promise((resolve) => {
            this.draw(unit.wheel);

            // Reset rotation
            this.container.style.transition = 'none';
            this.container.style.transform = 'rotate(0deg)';

            // Force reflow
            void this.container.offsetWidth;

            // Spin with dramatic easing
            this.container.style.transition = 'transform 3.5s cubic-bezier(0.2, 0, 0.05, 1)';
            const randomDegree = 1800 + Math.floor(Math.random() * 720);
            this.container.style.transform = `rotate(${randomDegree}deg)`;

            // Add spinning class for glow
            this.container.classList.add('wheel-spinning');

            setTimeout(() => {
                this.container.classList.remove('wheel-spinning');

                const finalDegree = randomDegree % 360;
                const normalized = (360 - (finalDegree - 90)) % 360;
                const result = this.calculateResult(unit.wheel, normalized);

                // Flash effect on result
                this.triggerFlash(this.segmentColors[result.type].glow);

                this.resultText.innerText = `${this.segmentColors[result.type].icon} ${result.label.toUpperCase()}`;
                this.resultText.style.color = this.segmentColors[result.type].glow;
                this.resultText.className = 'wheel-result-show';
                this.container.classList.add('combat-impact');

                setTimeout(() => {
                    this.container.style.transition = 'none';
                    this.container.style.transform = 'rotate(0deg)';
                    this.resultText.className = '';
                    this.container.classList.remove('combat-impact');
                    resolve(result);
                }, 1200);
            }, 3600);
        });
    }

    triggerFlash(color) {
        if (!this.battleFlash) return;
        this.battleFlash.style.background = color;
        this.battleFlash.style.opacity = '0.3';
        this.battleFlash.style.display = 'block';
        setTimeout(() => {
            this.battleFlash.style.opacity = '0';
            setTimeout(() => this.battleFlash.style.display = 'none', 300);
        }, 150);
    }

    animateResolution(winnerKey, attacker, defender) {
        const results = {
            'attacker_wins': { msg: `💥 ${attacker.name.toUpperCase()} VENCEU!`, color: 'var(--cyan-neon)', sub: 'RESIDÊNCIA ELIMINADA', flash: '#00F2FF' },
            'defender_wins': { msg: `💥 ${defender.name.toUpperCase()} VENCEU!`, color: 'var(--cyber-pink)', sub: 'INTRUSO ELIMINADO', flash: '#FF0055' },
            'draw': { msg: '🤝 EMPATE', color: '#ffcc00', sub: 'ESTABILIDADE MANTIDA — AMBOS SOBREVIVEM', flash: '#ffcc00' },
            'attacker_defends': { msg: '🛡️ DEFESA DO ATACANTE', color: '#0088ff', sub: 'CONTRA-MEDIDA ATIVADA — ATACANTE RECUOU', flash: '#0088ff' },
            'defender_defends': { msg: '🛡️ DEFESA DO DEFENSOR', color: '#0088ff', sub: 'CONTRA-MEDIDA ATIVADA — ATACANTE RECUOU', flash: '#0088ff' }
        };

        const r = results[winnerKey] || results.draw;

        // Big flash
        this.triggerFlash(r.flash);
        setTimeout(() => this.triggerFlash(r.flash), 300);

        // Show result
        this.battlePhase.innerText = r.sub;
        this.battlePhase.style.color = r.color;

        // Detailed log explanation
        this.battleLog.innerHTML = `
            <div style="width: 100%;">
                <div style="color: ${r.color}; font-weight: bold; font-size: 0.85rem;">[ ${r.msg} ]</div>
                <div style="font-size: 0.65rem; opacity: 0.8; letter-spacing: 1px;">SISTEMA: ${r.sub}</div>
            </div>
        `;

        this.resultText.innerText = r.msg;
        this.resultText.style.color = r.color;
        this.resultText.className = 'wheel-result-final';

        // Highlight winner card
        if (winnerKey === 'attacker_wins') {
            document.getElementById('attacker-card').classList.add('fighter-winner');
            document.getElementById('defender-card').classList.add('fighter-loser');
        } else if (winnerKey === 'defender_wins') {
            document.getElementById('defender-card').classList.add('fighter-winner');
            document.getElementById('attacker-card').classList.add('fighter-loser');
        }

        // Clean up classes
        setTimeout(() => {
            const atCard = document.getElementById('attacker-card');
            const dfCard = document.getElementById('defender-card');
            if (atCard) atCard.classList.remove('fighter-winner', 'fighter-loser');
            if (dfCard) dfCard.classList.remove('fighter-winner', 'fighter-loser');
            this.battlePhase.style.color = '';
        }, 2500);

        this.spinningLabel.innerText = '';
    }

    draw(wheel) {
        const ctx = this.canvas.getContext('2d');
        const size = 320;
        ctx.clearRect(0, 0, size, size);

        let startAngle = 0;
        const totalSize = wheel.reduce((sum, s) => sum + s.size, 0);
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = (size / 2) - 8;

        wheel.forEach((segment, i) => {
            const angle = (segment.size / totalSize) * 2 * Math.PI;
            const colors = this.segmentColors[segment.type];

            // Draw segment with gradient
            const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            grad.addColorStop(0, colors.gradient[0]);
            grad.addColorStop(0.4, colors.fill);
            grad.addColorStop(1, colors.gradient[1]);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
            ctx.fillStyle = grad;
            ctx.fill();

            // Segment border
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
            ctx.closePath();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Glow outer edge
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 1, startAngle + 0.02, startAngle + angle - 0.02);
            ctx.strokeStyle = colors.glow;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Draw segment text — always right-side-up
            ctx.save();
            ctx.translate(centerX, centerY);
            const midAngle = startAngle + angle / 2;
            ctx.rotate(midAngle);

            // Determine text color based on segment type
            const textColor = (segment.type === 'white' || segment.type === 'gold') ? '#111' : '#fff';
            const textDist = radius * 0.6;

            // Label icon
            ctx.font = "14px sans-serif";
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Only draw text if segment is big enough
            if (angle > 0.4) {
                ctx.font = "bold 11px 'JetBrains Mono', monospace";
                ctx.fillStyle = textColor;
                ctx.fillText(segment.label.toUpperCase(), textDist, -6);

                // Sub-info 
                const subText = segment.power ? `[${segment.power}]` : (segment.stars ? '⭐'.repeat(segment.stars) : '');
                if (subText) {
                    ctx.font = "9px 'JetBrains Mono', monospace";
                    ctx.globalAlpha = 0.8;
                    ctx.fillText(subText, textDist, 9);
                    ctx.globalAlpha = 1;
                }
            } else {
                // Small segments — just icon
                ctx.font = "16px sans-serif";
                ctx.fillText(colors.icon, textDist, 0);
            }

            ctx.restore();
            startAngle += angle;
        });

        // Center circle decoration
        ctx.beginPath();
        ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a1a';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'var(--cyan-neon)';
        ctx.fill();

        // Outer ring glow
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    calculateResult(wheel, degree) {
        let current = 0;
        const totalSize = wheel.reduce((sum, s) => sum + s.size, 0);
        const targetSize = (degree / 360) * totalSize;
        for (const s of wheel) {
            if (targetSize >= current && targetSize < current + s.size) return s;
            current += s.size;
        }
        return wheel[wheel.length - 1];
    }

    delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}
