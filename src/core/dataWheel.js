export class DataWheel {
    constructor() {
        this.canvas = document.getElementById('wheel-canvas');
        this.overlay = document.getElementById('wheel-overlay');
        this.container = document.getElementById('wheel-container');
        this.resultText = document.getElementById('wheel-result');
        this.colors = {
            blue: '#0088ff',   // Encryption
            gold: '#ffcc00',   // Priority
            purple: '#ff00ff', // Glitch
            white: '#ffffff',  // Standard
            red: '#ff3333'     // Miss
        };
    }

    // Solve combat logic based on Priority Hierarchy (GDD 3.1)
    static resolveCombat(attacker, defender, attackResult, defendResult) {
        const pA = this.getPriority(attackResult.type);
        const pB = this.getPriority(defendResult.type);

        // 🔵 Blue wins all
        if (attackResult.type === 'blue' && defendResult.type !== 'blue') return 'attacker_defends';
        if (defendResult.type === 'blue' && attackResult.type !== 'blue') return 'defender_defends';
        if (attackResult.type === 'blue' && defendResult.type === 'blue') return 'draw';

        // Dominance logic
        if (pA > pB) return 'attacker_wins';
        if (pB > pA) return 'defender_wins';

        // Same color logic
        if (attackResult.type === 'white') {
            return attackResult.power > defendResult.power ? 'attacker_wins' : 'defender_wins';
        }

        if (attackResult.type === 'purple') {
            return attackResult.stars > defendResult.stars ? 'attacker_wins' : 'defender_wins';
        }

        return 'draw';
    }

    static getPriority(color) {
        const hierarchy = { 'blue': 10, 'gold': 5, 'purple': 3, 'white': 1, 'red': 0 };
        return hierarchy[color] || 0;
    }

    async spin(unit) {
        return new Promise((resolve) => {
            this.overlay.style.display = 'flex';
            this.draw(unit.wheel);

            const randomDegree = 1440 + Math.floor(Math.random() * 360);
            this.container.style.transform = `rotate(${randomDegree}deg)`;

            setTimeout(() => {
                const finalDegree = randomDegree % 360;
                // Marker is at top (270deg in canvas logic relative to 0 at 3oclock)
                const normalized = (360 - (finalDegree - 90)) % 360;
                const result = this.calculateResult(unit.wheel, normalized);

                this.resultText.innerText = `${result.label.toUpperCase()} (${result.type.toUpperCase()})`;

                setTimeout(() => {
                    this.overlay.style.display = 'none';
                    this.container.style.transform = 'rotate(0deg)';
                    resolve(result);
                }, 1500);
            }, 3200);
        });
    }

    draw(wheel) {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, 250, 250);
        let startAngle = 0;
        const totalSize = 96;

        wheel.forEach(segment => {
            const angle = (segment.size / totalSize) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(125, 125);
            ctx.arc(125, 125, 120, startAngle, startAngle + angle);
            ctx.fillStyle = this.colors[segment.type];
            ctx.fill();
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
