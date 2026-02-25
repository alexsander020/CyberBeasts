export class DataWheel {
    constructor() {
        this.canvas = document.getElementById('wheel-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('wheel-overlay');
        this.container = document.getElementById('wheel-container');
        this.resultText = document.getElementById('wheel-result');
        this.colors = {
            attack: '#00FF41', // Matrix Green
            guard: '#0000FF',  // Blue
            miss: '#666666',   // Grey
            evol: '#FF00FF',   // Magenta
            skill: '#FFFF00',  // Yellow
            heal: '#00FFFF',   // Cyan
            buff: '#FFA500',   // Orange
            debuff: '#FF0000'  // Red
        };

        this.canvas.width = 300;
        this.canvas.height = 300;
    }

    draw(stats) {
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        let startAngle = 0;
        const radius = 150;
        const centerX = 150;
        const centerY = 150;

        this.ctx.clearRect(0, 0, 300, 300);

        for (const [key, value] of Object.entries(stats)) {
            const sliceAngle = (value / total) * 2 * Math.PI;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            this.ctx.closePath();

            this.ctx.fillStyle = this.colors[key] || '#FFFFFF';
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.stroke();

            // Labels
            const middleAngle = startAngle + sliceAngle / 2;
            const labelX = centerX + (radius / 1.5) * Math.cos(middleAngle);
            const labelY = centerY + (radius / 1.5) * Math.sin(middleAngle);

            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 10px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(key.toUpperCase(), labelX, labelY);

            startAngle += sliceAngle;
        }
    }

    spin(stats) {
        return new Promise((resolve) => {
            this.overlay.style.display = 'flex';
            this.draw(stats);
            this.resultText.innerText = 'PROCESSANDO...';

            const randomDegree = Math.floor(Math.random() * 360) + 1440; // 4 full spins min
            this.container.style.transform = `rotate(${randomDegree}deg)`;

            setTimeout(() => {
                const finalDegree = randomDegree % 360;
                // Calculate which segment is at the top (marker)
                // 0 degrees is 3 o'clock in canvas, marker is at 12 o'clock (-90 degrees)
                // Correct for rotation direction
                const normalizedDegree = (360 - (finalDegree - 90)) % 360;
                const finalResult = this.calculateResult(stats, normalizedDegree);

                this.resultText.innerText = `RESULTADO: ${finalResult}`;

                setTimeout(() => {
                    this.overlay.style.display = 'none';
                    this.container.style.transition = 'none';
                    this.container.style.transform = 'rotate(0deg)';
                    // Force reflow
                    this.container.offsetHeight;
                    this.container.style.transition = 'transform 3s cubic-bezier(0.15, 0, 0.15, 1)';
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
