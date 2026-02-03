// Threat Map Visualization
class ThreatMap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.threats = [];
        this.maxThreats = 20;
        this.init();
    }

    init() {
        // Create initial threats
        for (let i = 0; i < this.maxThreats; i++) {
            this.addThreat();
        }

        // Add new threats periodically
        setInterval(() => {
            this.addThreat();
        }, 800);
    }

    addThreat() {
        const threat = document.createElement('div');
        threat.className = 'threat-point';

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        threat.style.left = x + '%';
        threat.style.top = y + '%';

        // Random color
        const colors = ['#f472b6', '#22d3ee', '#4ade80', '#fbbf24'];
        threat.style.background = colors[Math.floor(Math.random() * colors.length)];

        // Random animation delay
        threat.style.animationDelay = Math.random() * 2 + 's';

        this.container.appendChild(threat);
        this.threats.push(threat);

        // Remove old threats
        if (this.threats.length > this.maxThreats) {
            const oldThreat = this.threats.shift();
            setTimeout(() => {
                if (oldThreat && oldThreat.parentNode) {
                    oldThreat.remove();
                }
            }, 2000);
        }
    }
}

// Initialize threat map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('threat-map')) {
        new ThreatMap('threat-map');
    }
});
