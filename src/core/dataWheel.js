export class DataWheel {
    constructor() {
        this.canvas = document.getElementById('wheel-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('wheel-overlay');
        this.container = document.getElementById('wheel-container');
        this.resultText = document.getElementById('wheel-result');
        this.colors = {
            attack: '#ffcc00',
            guard: '#0088ff',
            miss: '#666666',
            evol: '#ff3333',
            skill: '#ff00ff',
            heal: '#00ffcc',
            buff: '#ffffff',
            debuff: '#aa0000'
        };

        this.canvas.width = 250;
        this.canvas.height = 250;
    }

    draw(stats) {
        if (!this.ctx) return;
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        let startAngle = 0;
        const radius = 125;
        const centerX = 125;
        const centerY = 125;

        this.ctx.clearRect(0, 0, 250, 250);

        for (const [key, value] of Object.entries(stats)) {
            const sliceAngle = (value / total) * 2 * Math.PI;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            this.ctx.closePath();

            this.ctx.fillStyle = this.colors[key] || '#FFFFFF';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            this.ctx.stroke();

            // Labels
            const middleAngle = startAngle + sliceAngle / 2;
            const labelX = centerX + (radius / 1.5) * Math.cos(middleAngle);
            const labelY = centerY + (radius / 1.5) * Math.sin(middleAngle);

            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 8px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(key.toUpperCase(), labelX, labelY);

            startAngle += sliceAngle;
        }
    }

    spin(stats) {
        return new Promise((resolve) => {
            if (!this.overlay || !this.container) return resolve('MISS');
            this.overlay.style.display = 'flex';
            this.draw(stats);
            this.resultText.innerText = 'PROCESSANDO...';

            const randomDegree = Math.floor(Math.random() * 360) + 1440;
            this.container.style.transition = 'transform 3s cubic-bezier(0.15, 0, 0.15, 1)';
            this.container.style.transform = `rotate(${randomDegree}deg)`;

            setTimeout(() => {
                const finalDegree = randomDegree % 360;
                const normalizedDegree = (360 - (finalDegree - 90)) % 360;
                const finalResult = this.calculateResult(stats, normalizedDegree);

                this.resultText.innerText = `RESULTADO: ${finalResult}`;

                setTimeout(() => {
                    this.overlay.style.display = 'none';
                    this.container.style.transition = 'none';
                    this.container.style.transform = 'rotate(0deg)';
                    this.container.offsetHeight;
                    resolve(finalResult);
                }, 2000);
            }, 3500);
        });
    }

    calculateResult(stats, degree) {
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        let currentDegree = 0;
        const targetDegree = degree;

        for (const [key, value] of Object.entries(stats)) {
            const sliceDegree = (value / total) * 360;
            if (targetDegree >= currentDegree && targetDegree < currentDegree + sliceDegree) {
                return key.toUpperCase();
            }
            currentDegree += sliceDegree;
        }
        return 'MISS';
    }
}
