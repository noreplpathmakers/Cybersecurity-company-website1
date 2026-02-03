// Live Threat Activity Chart
class ThreatChart {
    constructor(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        this.ctx = canvas.getContext('2d');
        this.data = [];
        this.labels = [];
        this.maxDataPoints = options.points || 30;
        this.chart = null;
        this.isBackground = options.isBackground || false;
        this.tension = options.tension !== undefined ? options.tension : 0.4;

        this.init();

        // Listen for theme changes to update colors
        window.addEventListener('themeChanged', () => this.updateColors());
    }

    init() {
        // Initialize with default data
        for (let i = 0; i < this.maxDataPoints; i++) {
            this.labels.push('');
            this.data.push(Math.floor(Math.random() * 40) + (this.isBackground ? 10 : 20));
        }

        const color = this.getThemeColor();
        const fillOpacity = this.isBackground ? '10' : '15';

        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'Threat Frequency',
                    data: this.data,
                    borderColor: color,
                    backgroundColor: `${color}${fillOpacity}`,
                    fill: true,
                    tension: this.tension,
                    pointRadius: 0,
                    borderWidth: this.isBackground ? 1 : 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: {
                        display: !this.isBackground,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 10 } }
                    },
                    y: {
                        display: !this.isBackground,
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 10 } }
                    }
                },
                animation: { duration: 500 }
            }
        });

        // Update periodically with random fluctuations
        setInterval(() => this.updateChart(), 600);
    }

    getThemeColor() {
        const isDark = document.body.classList.contains('dark-theme');
        // Pink for the new theme
        return isDark ? '#ec4899' : '#e91e63';
    }

    updateColors() {
        if (!this.chart) return;
        const color = this.getThemeColor();
        const isDark = document.body.classList.contains('dark-theme');
        const axisColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        const fillOpacity = this.isBackground ? '10' : '15';

        this.chart.data.datasets[0].borderColor = color;
        this.chart.data.datasets[0].backgroundColor = `${color}${fillOpacity}`;

        if (this.chart.options.scales) {
            if (this.chart.options.scales.x) {
                this.chart.options.scales.x.ticks.color = axisColor;
                this.chart.options.scales.x.grid.color = gridColor;
            }
            if (this.chart.options.scales.y) {
                this.chart.options.scales.y.ticks.color = axisColor;
                this.chart.options.scales.y.grid.color = gridColor;
            }
        }

        this.chart.update('none');
    }

    updateChart() {
        if (!this.chart) return;
        this.data.shift();
        // Generate a value that is somewhat related to the previous one for a smoother look
        const lastVal = this.data[this.data.length - 1];
        const change = Math.floor(Math.random() * 15) - 7;
        let newVal = lastVal + change;

        // Keep within bounds
        if (newVal < 5) newVal = 5 + Math.random() * 10;
        if (newVal > 95) newVal = 95 - Math.random() * 10;

        this.data.push(newVal);
        this.chart.update('none');
    }
}

// Global initialization for known chart IDs
document.addEventListener('DOMContentLoaded', () => {
    // Normal Charts
    [
        'threat-activity-chart-home',
        'threat-activity-chart-user',
        'threat-activity-chart-admin'
    ].forEach(id => {
        if (document.getElementById(id)) {
            new ThreatChart(id);
        }
    });

    // Background Wave Charts
    [
        'threat-activity-bg-home',
        'threat-activity-bg-user',
        'threat-activity-bg-admin',
        'service-wave-detection',
        'service-wave-network',
        'service-wave-incident'
    ].forEach(id => {
        if (document.getElementById(id)) {
            new ThreatChart(id, { isBackground: true, points: 50, tension: 0.6 });
        }
    });
});

