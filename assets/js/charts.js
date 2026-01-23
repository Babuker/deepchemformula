/**
 * Chart Visualization Module
 * Chemical Formula Optimizer
 */

// Chart Configuration
const CHART_CONFIG = {
    colors: {
        primary: '#3498db',
        secondary: '#2ecc71',
        tertiary: '#e74c3c',
        quaternary: '#f39c12',
        background: 'rgba(52, 152, 219, 0.1)',
        grid: 'rgba(0, 0, 0, 0.1)',
        text: '#333'
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    },
                    color: CHART_CONFIG.colors.text
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 13
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 12
                },
                padding: 10,
                cornerRadius: 6
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: CHART_CONFIG.colors.grid
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: CHART_CONFIG.colors.text
                }
            },
            x: {
                grid: {
                    color: CHART_CONFIG.colors.grid
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11
                    },
                    color: CHART_CONFIG.colors.text
                }
            }
        }
    }
};

// Chart Instances Store
const chartInstances = new Map();

// Initialize Charts
function initializeResultsCharts() {
    // Clean up existing charts
    destroyAllCharts();
    
    // Initialize comparison chart if multiple results
    const resultsContent = document.getElementById('resultsContent');
    if (resultsContent && window.optimizationResults && window.optimizationResults.length > 1) {
        initializeComparisonChart();
        initializeRadarChart();
        initializeCostBreakdownChart();
    }
}

// Initialize Comparison Chart
function initializeComparisonChart() {
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const results = window.optimizationResults;
    
    const data = {
        labels: results.map(r => r.formulationName.split(':')[1].trim()),
        datasets: [
            {
                label: 'Cost Efficiency',
                data: results.map(r => r.metrics.cost),
                backgroundColor: CHART_CONFIG.colors.primary,
                borderColor: CHART_CONFIG.colors.primary,
                borderWidth: 2
            },
            {
                label: 'Performance',
                data: results.map(r => r.metrics.performance),
                backgroundColor: CHART_CONFIG.colors.secondary,
                borderColor: CHART_CONFIG.colors.secondary,
                borderWidth: 2
            },
            {
                label: 'Stability',
                data: results.map(r => r.metrics.stability),
                backgroundColor: CHART_CONFIG.colors.tertiary,
                borderColor: CHART_CONFIG.colors.tertiary,
                borderWidth: 2
            },
            {
                label: 'Compliance',
                data: results.map(r => r.metrics.compliance),
                backgroundColor: CHART_CONFIG.colors.quaternary,
                borderColor: CHART_CONFIG.colors.quaternary,
                borderWidth: 2
            }
        ]
    };
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            ...CHART_CONFIG.options,
            plugins: {
                ...CHART_CONFIG.options.plugins,
                title: {
                    display: true,
                    text: 'Formulation Comparison',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
    
    chartInstances.set('comparison', chart);
}

// Initialize Radar Chart
function initializeRadarChart() {
    // Create canvas if it doesn't exist
    let canvas = document.getElementById('radarChart');
    if (!canvas) {
        const container = document.querySelector('.results-content');
        if (!container) return;
        
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `
            <h4 class="chart-title">Performance Radar Chart</h4>
            <canvas id="radarChart"></canvas>
        `;
        container.appendChild(chartContainer);
        canvas = document.getElementById('radarChart');
    }
    
    const ctx = canvas.getContext('2d');
    const results = window.optimizationResults;
    
    const data = {
        labels: ['Cost Efficiency', 'Performance', 'Stability', 'Compliance', 'Overall Score'],
        datasets: results.map((result, index) => ({
            label: `Formulation ${index + 1}`,
            data: [
                result.metrics.cost,
                result.metrics.performance,
                result.metrics.stability,
                result.metrics.compliance,
                result.overallScore
            ],
            backgroundColor: getColorWithOpacity(index, 0.2),
            borderColor: getColorWithOpacity(index, 1),
            borderWidth: 2,
            pointBackgroundColor: getColorWithOpacity(index, 1),
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }))
    };
    
    const chart = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
            ...CHART_CONFIG.options,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    },
                    grid: {
                        color: CHART_CONFIG.colors.grid
                    },
                    pointLabels: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                ...CHART_CONFIG.options.plugins,
                title: {
                    display: true,
                    text: 'Performance Comparison',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
    
    chartInstances.set('radar', chart);
}

// Initialize Cost Breakdown Chart
function initializeCostBreakdownChart() {
    // Create canvas if it doesn't exist
    let canvas = document.getElementById('costChart');
    if (!canvas && window.optimizationResults.length > 0) {
        const container = document.querySelector('.results-content');
        if (!container) return;
        
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `
            <h4 class="chart-title">Cost Breakdown Analysis</h4>
            <canvas id="costChart"></canvas>
        `;
        container.appendChild(chartContainer);
        canvas = document.getElementById('costChart');
    }
    
    const ctx = canvas.getContext('2d');
    const results = window.optimizationResults;
    
    // Use the best result (first in sorted array)
    const bestResult = results[0];
    const costData = bestResult.costAnalysis;
    
    const data = {
        labels: ['Material Cost', 'Manufacturing Cost', 'Savings'],
        datasets: [{
            data: [
                costData.material,
                costData.manufacturing,
                costData.savings
            ],
            backgroundColor: [
                CHART_CONFIG.colors.primary,
                CHART_CONFIG.colors.secondary,
                CHART_CONFIG.colors.tertiary
            ],
            borderColor: [
                CHART_CONFIG.colors.primary,
                CHART_CONFIG.colors.secondary,
                CHART_CONFIG.colors.tertiary
            ],
            borderWidth: 1
        }]
    };
    
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            ...CHART_CONFIG.options,
            plugins: {
                ...CHART_CONFIG.options.plugins,
                title: {
                    display: true,
                    text: 'Cost Distribution',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    chartInstances.set('cost', chart);
}

// Initialize Time Series Chart (for historical data)
function initializeTimeSeriesChart(data) {
    const canvas = document.getElementById('timeSeriesChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Optimization Score',
                data: data.scores,
                backgroundColor: CHART_CONFIG.colors.background,
                borderColor: CHART_CONFIG.colors.primary,
                borderWidth: 3,
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            ...CHART_CONFIG.options,
            plugins: {
                ...CHART_CONFIG.options.plugins,
                title: {
                    display: true,
                    text: 'Historical Performance Trend',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    ...CHART_CONFIG.options.scales.y,
                    title: {
                        display: true,
                        text: 'Score',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    ...CHART_CONFIG.options.scales.x,
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
    
    chartInstances.set('timeSeries', chart);
}

// Initialize Ingredient Distribution Chart
function initializeIngredientChart(ingredients) {
    const canvas = document.getElementById('ingredientChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Separate APIs and excipients
    const apis = ingredients.filter(i => i.type === 'api');
    const excipients = ingredients.filter(i => i.type !== 'api');
    
    const data = {
        labels: [...apis.map(a => a.name), ...excipients.map(e => e.name)],
        datasets: [{
            data: [...apis.map(a => a.amount), ...excipients.map(e => e.amount)],
            backgroundColor: [
                ...apis.map((_, i) => getColorWithOpacity(i, 0.8)),
                ...excipients.map((_, i) => getColorWithOpacity(i + apis.length, 0.6))
            ],
            borderColor: [
                ...apis.map((_, i) => getColorWithOpacity(i, 1)),
                ...excipients.map((_, i) => getColorWithOpacity(i + apis.length, 1))
            ],
            borderWidth: 1
        }]
    };
    
    const chart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            ...CHART_CONFIG.options,
            plugins: {
                ...CHART_CONFIG.options.plugins,
                title: {
                    display: true,
                    text: 'Ingredient Distribution',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value}mg (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    chartInstances.set('ingredient', chart);
}

// Export Chart as Image
function exportChart(chartId, filename = 'chart') {
    const chart = chartInstances.get(chartId);
    if (!chart) {
        console.error('Chart not found:', chartId);
        return;
    }
    
    const link = document.createElement('a');
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = chart.toBase64Image();
    link.click();
}

// Export All Charts
function exportAllCharts() {
    chartInstances.forEach((chart, id) => {
        exportChart(id, `formulation-${id}`);
    });
}

// Update Chart Data
function updateChart(chartId, newData) {
    const chart = chartInstances.get(chartId);
    if (!chart) return;
    
    chart.data = newData;
    chart.update();
}

// Destroy Chart
function destroyChart(chartId) {
    const chart = chartInstances.get(chartId);
    if (chart) {
        chart.destroy();
        chartInstances.delete(chartId);
    }
}

// Destroy All Charts
function destroyAllCharts() {
    chartInstances.forEach((chart, id) => {
        chart.destroy();
    });
    chartInstances.clear();
}

// Helper Functions
function getColorWithOpacity(index, opacity = 1) {
    const colors = [
        `rgba(52, 152, 219, ${opacity})`,    // Blue
        `rgba(46, 204, 113, ${opacity})`,    // Green
        `rgba(231, 76, 60, ${opacity})`,     // Red
        `rgba(243, 156, 18, ${opacity})`,    // Orange
        `rgba(155, 89, 182, ${opacity})`,    // Purple
        `rgba(26, 188, 156, ${opacity})`,    // Teal
        `rgba(52, 73, 94, ${opacity})`,      // Dark Blue
        `rgba(241, 196, 15, ${opacity})`     // Yellow
    ];
    
    return colors[index % colors.length];
}

// Initialize Chart.js global defaults
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = CHART_CONFIG.colors.text;

// Make functions available globally
window.initializeResultsCharts = initializeResultsCharts;
window.exportChart = exportChart;
window.exportAllCharts = exportAllCharts;
window.destroyAllCharts = destroyAllCharts;

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a page that needs charts
    if (document.querySelector('.results-content')) {
        // Charts will be initialized when results are displayed
        console.log('Charts module loaded');
    }
});
