export class DataWheel {
    constructor() {
        this.canvas = document.getElementById('wheel-canvas');
        this.overlay = document.getElementById('wheel-overlay');
        this.container = document.getElementById('wheel-container');
        this.resultText = document.getElementById('wheel-result');
        this.battleLog = document.getElementById('battle-log');

        // Versus Elements
        this.atAvatar = document.getElementById('attacker-avatar');
        this.atName = document.getElementById('attacker-name-label');
        this.dfAvatar = document.getElementById('defender-avatar');
        this.dfName = document.getElementById('defender-name-label');

        this.colors = {
            blue: '#0088ff',   // Encryption
            gold: '#ffcc00',   // Priority
            purple: '#ff00ff', // Glitch
            white: '#ffffff',  // Standard
            red: '#ff3333'     // Miss
        };
    }

    static getPriority(color) {
        const hierarchy = { 'blue': 10, 'gold': 5, 'purple': 3, 'white': 1, 'red': 0 };
        return hierarchy[color] || 0;
    }

    static resolveCombat(attacker, defender, atkRes, defRes) {
        const pA = this.getPriority(atkRes.type);
        const pB = this.getPriority(defRes.type);

        // 🔵 Blue logic
        if (atkRes.type === 'blue' && defRes.type !== 'blue') return 'attacker_defends';
        if (defRes.type === 'blue' && atkRes.type !== 'blue') return 'defender_defends';
        if (atkRes.type === 'blue' && defRes.type === 'blue') return 'draw';

        // Dominance
        if (pA > pB) return 'attacker_wins';
        if (pB > pA) return 'defender_wins';

        // Ties
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
        this.overlay.style.display = 'flex';
        this.resultText.innerText = '';
        this.battleLog.innerText = 'INITIALIZING COMBAT PROTOCOL...';

        // Setup Versus
        this.atAvatar.innerText = attacker.icon;
        this.atName.innerText = attacker.name;
        this.dfAvatar.innerText = defender.icon;
        this.dfName.innerText = defender.name;

        // Step 1: Attacker Spin
        this.battleLog.innerText = `> ATTACKER SPINNING: ${attacker.name}`;
        const atkRes = await this.spinOnce(attacker);
        this.battleLog.innerText = `> ATTACKER RESULT: ${atkRes.label.toUpperCase()}`;
        await new Promise(r => setTimeout(r, 1000));

        // Step 2: Defender Spin
        this.battleLog.innerText = `> DEFENDER SPINNING: ${defender.name}`;
        const defRes = await this.spinOnce(defender);
        this.battleLog.innerText = `> DEFENDER RESULT: ${defRes.label.toUpperCase()}`;
        await new Promise(r => setTimeout(r, 1000));

        // Step 3: Resolve
        const winnerKey = DataWheel.resolveCombat(attacker, defender, atkRes, defRes);
        this.animateResolution(winnerKey);

        await new Promise(r => setTimeout(r, 2000));
        this.overlay.style.display = 'none';

        return winnerKey;
    }

    async spinOnce(unit) {
        return new Promise((resolve) => {
            this.draw(unit.wheel);
            this.container.style.transition = 'transform 3.0s cubic-bezier(0.15, 0, 0.15, 1)';
            const randomDegree = 1440 + Math.floor(Math.random() * 360);
            this.container.style.transform = `rotate(${randomDegree}deg)`;

            setTimeout(() => {
                const finalDegree = randomDegree % 360;
                const normalized = (360 - (finalDegree - 90)) % 360;
                const result = this.calculateResult(unit.wheel, normalized);

                this.resultText.innerText = result.label.toUpperCase();
                this.resultText.style.color = this.colors[result.type];
                this.resultText.classList.add('active');
                this.container.classList.add('combat-impact');

                setTimeout(() => {
                    this.container.style.transition = 'none';
                    this.container.style.transform = 'rotate(0deg)';
                    this.resultText.classList.remove('active');
                    this.container.classList.remove('combat-impact');
                    resolve(result);
                }, 1000);
            }, 3100);
        });
    }

    animateResolution(winnerKey) {
        let msg = "DRAW / PARITY";
        if (winnerKey === 'attacker_wins') msg = "!!!! ATTACKER WIN !!!!";
        if (winnerKey === 'defender_wins') msg = "!!!! DEFENDER WIN !!!!";
        if (winnerKey === 'attacker_defends' || winnerKey === 'defender_defends') msg = "PROTOCOL: DEFENSE";

        this.battleLog.innerText = `[ ${msg} ]`;
        this.resultText.innerText = msg;
        this.resultText.style.color = '#fff';
        this.resultText.classList.add('active');
    }

    draw(wheel) {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, 280, 280);
        let startAngle = 0;
        const totalSize = 96;

        wheel.forEach(segment => {
            const angle = (segment.size / totalSize) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(140, 140);
            ctx.arc(140, 140, 135, startAngle, startAngle + angle);
            ctx.fillStyle = this.colors[segment.type];
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            startAngle += angle;
        });
    }

    calculateResult(wheel, degree) {
        let current = 0;
        const targetSize = (degree / 360) * 96;
        for (const s of wheel) {
            if (targetSize >= current && targetSize < current + s.size) return s;
            current += s.size;
        }
        return wheel[wheel.length - 1];
    }
}
