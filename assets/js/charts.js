// Charts JavaScript for visualization

function initializeCharts() {
    initializeCostChart();
    initializePerformanceChart();
}

function initializeCostChart() {
    const ctx = document.getElementById('costChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['API Cost', 'Excipients', 'Manufacturing', 'Packaging', 'QC Testing'],
            datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#9b59b6',
                    '#e74c3c',
                    '#f39c12'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

function initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Bioavailability', 'Stability', 'Solubility', 'Compatibility', 'Cost Efficiency', 'Regulatory Score'],
            datasets: [{
                label: 'Current Formulation',
                data: [85, 90, 75, 88, 82, 95],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: '#3498db',
                borderWidth: 2,
                pointBackgroundColor: '#3498db'
            }, {
                label: 'Industry Average',
                data: [70, 75, 65, 72, 68, 80],
                backgroundColor: 'rgba(149, 165, 166, 0.2)',
                borderColor: '#95a5a6',
                borderWidth: 2,
                borderDash: [5, 5],
                pointBackgroundColor: '#95a5a6'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}
