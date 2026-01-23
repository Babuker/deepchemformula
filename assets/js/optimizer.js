/**
 * AI Optimization Engine
 * Chemical Formula Optimizer
 */

// Optimization Configuration
const OPTIMIZATION_CONFIG = {
    algorithms: {
        genetic: {
            populationSize: 100,
            generations: 50,
            mutationRate: 0.1,
            crossoverRate: 0.8
        },
        simulatedAnnealing: {
            initialTemperature: 1000,
            coolingRate: 0.95
        }
    },
    weights: {
        cost: 0.4,
        performance: 0.3,
        stability: 0.2,
        compliance: 0.1
    },
    constraints: {
        minCost: 50,
        maxCost: 500,
        minPerformance: 60,
        minStability: 70,
        minCompliance: 90
    }
};

// API Database (In real app, this would be a server-side database)
const API_DATABASE = {
    paracetamol: {
        name: 'Paracetamol (Acetaminophen)',
        category: 'Analgesic',
        solubility: 'Sparingly soluble in water',
        stability: 'Stable under normal conditions',
        compatibility: ['Starch', 'Povidone', 'Magnesium stearate'],
        excipients: {
            binder: ['Povidone', 'HPMC'],
            disintegrant: ['Sodium starch glycolate', 'Croscarmellose sodium'],
            lubricant: ['Magnesium stearate', 'Stearic acid'],
            filler: ['Microcrystalline cellulose', 'Lactose']
        },
        costPerMg: 0.0012,
        minDose: 250,
        maxDose: 1000
    },
    ibuprofen: {
        name: 'Ibuprofen',
        category: 'NSAID',
        solubility: 'Practically insoluble in water',
        stability: 'Light sensitive',
        compatibility: ['Microcrystalline cellulose', 'Colloidal silicon dioxide'],
        excipients: {
            binder: ['Povidone', 'HPMC'],
            disintegrant: ['Croscarmellose sodium', 'Sodium starch glycolate'],
            lubricant: ['Magnesium stearate', 'Talc'],
            filler: ['Microcrystalline cellulose', 'Dibasic calcium phosphate']
        },
        costPerMg: 0.0015,
        minDose: 200,
        maxDose: 800
    },
    amoxicillin: {
        name: 'Amoxicillin Trihydrate',
        category: 'Antibiotic',
        solubility: 'Slightly soluble in water',
        stability: 'Moisture sensitive',
        compatibility: ['Microcrystalline cellulose', 'Magnesium stearate'],
        excipients: {
            binder: ['Povidone', 'HPMC'],
            disintegrant: ['Sodium starch glycolate', 'Croscarmellose sodium'],
            lubricant: ['Magnesium stearate', 'Stearic acid'],
            filler: ['Microcrystalline cellulose', 'Lactose']
        },
        costPerMg: 0.002,
        minDose: 250,
        maxDose: 1000
    },
    metformin: {
        name: 'Metformin HCl',
        category: 'Antidiabetic',
        solubility: 'Freely soluble in water',
        stability: 'Stable',
        compatibility: ['Povidone', 'Magnesium stearate'],
        excipients: {
            binder: ['Povidone', 'HPMC'],
            disintegrant: ['Croscarmellose sodium'],
            lubricant: ['Magnesium stearate'],
            filler: ['Microcrystalline cellulose']
        },
        costPerMg: 0.0008,
        minDose: 500,
        maxDose: 1000
    },
    omeprazole: {
        name: 'Omeprazole',
        category: 'PPI',
        solubility: 'Very slightly soluble in water',
        stability: 'Acid labile',
        compatibility: ['Mannitol', 'Sodium lauryl sulfate'],
        excipients: {
            binder: ['HPMC', 'Povidone'],
            disintegrant: ['Croscarmellose sodium'],
            lubricant: ['Magnesium stearate', 'Talc'],
            filler: ['Mannitol', 'Microcrystalline cellulose']
        },
        costPerMg: 0.003,
        minDose: 10,
        maxDose: 40
    }
};

// Excipient Database
const EXCIPIENT_DATABASE = {
    binders: [
        { name: 'Povidone', cost: 0.05, compatibility: ['paracetamol', 'ibuprofen', 'amoxicillin', 'metformin', 'omeprazole'] },
        { name: 'HPMC', cost: 0.08, compatibility: ['paracetamol', 'ibuprofen', 'amoxicillin', 'metformin', 'omeprazole'] },
        { name: 'Gelatin', cost: 0.04, compatibility: ['paracetamol', 'amoxicillin'] }
    ],
    disintegrants: [
        { name: 'Sodium starch glycolate', cost: 0.07, compatibility: ['paracetamol', 'ibuprofen', 'amoxicillin', 'metformin'] },
        { name: 'Croscarmellose sodium', cost: 0.09, compatibility: ['paracetamol', 'ibuprofen', 'amoxicillin', 'metformin', 'omeprazole'] },
        { name: 'Croscarmellose sodium', cost: 0.09, compatibility: ['paracetamol', 'ibuprofen', 'amoxicillin', 'metformin', 'omeprazole'] }
    ],
    lubricants: [
        { name: 'Magnesium stearate', cost: 0.03, compatibility: ['paracetamol', 'ibuprofen', 'amoxicillin', 'metformin', 'omeprazole'] },
        { name: 'Talc', cost: 0.02, compatibility: ['ibuprofen', 'omeprazole'] },
        { name: 'Stearic acid', cost: 0.04, compatibility: ['paracetamol', 'amoxicillin'] }
    ],
    fillers: [
        { name: 'Microcrystalline cellulose', cost: 0.02, compatibility: ['paracetamol', 'ibuprofen', 'amoxicillin', 'metformin', 'omeprazole'] },
        { name: 'Lactose', cost: 0.015, compatibility: ['paracetamol', 'amoxicillin'] },
        { name: 'Dibasic calcium phosphate', cost: 0.025, compatibility: ['ibuprofen'] },
        { name: 'Mannitol', cost: 0.06, compatibility: ['omeprazole'] }
    ]
};

// Generate Mock Results (for demonstration)
function generateMockResults(formData) {
    console.log('Generating mock results for:', formData);
    
    const results = [];
    const numResults = 3; // Generate 3 alternative formulations
    
    for (let i = 0; i < numResults; i++) {
        const formulation = generateFormulation(formData, i);
        const metrics = calculateMetrics(formulation, formData);
        const costAnalysis = calculateCostAnalysis(formulation);
        
        results.push({
            formulationName: `Formulation ${i + 1}: ${getFormulationName(formData, i)}`,
            description: getFormulationDescription(formData, i),
            overallScore: calculateOverallScore(metrics),
            metrics: metrics,
            ingredients: formulation.ingredients,
            costAnalysis: costAnalysis,
            constraints: checkConstraints(formulation, formData),
            recommendations: generateRecommendations(metrics)
        });
    }
    
    // Sort by overall score
    results.sort((a, b) => b.overallScore - a.overallScore);
    
    return results;
}

// Generate a Formulation
function generateFormulation(formData, variant) {
    const formulation = {
        apis: [...formData.apis],
        excipients: [],
        totalWeight: 0,
        manufacturingProcess: getManufacturingProcess(formData.productForm)
    };
    
    // Calculate API weights and costs
    let totalAPICost = 0;
    let totalAPIWeight = 0;
    
    formulation.apis.forEach(api => {
        const apiData = API_DATABASE[api.name];
        if (apiData) {
            api.cost = api.strength * apiData.costPerMg;
            api.weight = api.strength;
            totalAPICost += api.cost;
            totalAPIWeight += api.weight;
        }
    });
    
    // Select excipients based on compatibility and variant
    formulation.excipients = selectExcipients(formData.apis, variant);
    
    // Calculate excipient weights and costs
    let totalExcipientCost = 0;
    let totalExcipientWeight = 0;
    
    formulation.excipients.forEach(excipient => {
        const weight = calculateExcipientWeight(excipient.type, totalAPIWeight, variant);
        excipient.weight = weight;
        excipient.cost = weight * excipient.costPerMg;
        totalExcipientCost += excipient.cost;
        totalExcipientWeight += weight;
    });
    
    formulation.totalWeight = totalAPIWeight + totalExcipientWeight;
    formulation.totalCost = totalAPICost + totalExcipientCost;
    formulation.manufacturingCost = calculateManufacturingCost(formulation, formData.productForm);
    
    // Combine all ingredients
    formulation.ingredients = [
        ...formulation.apis.map(api => ({
            name: api.displayName,
            amount: api.strength,
            unit: 'mg',
            cost: api.cost,
            type: 'api'
        })),
        ...formulation.excipients.map(exc => ({
            name: exc.name,
            amount: exc.weight,
            unit: 'mg',
            cost: exc.cost,
            type: exc.type
        }))
    ];
    
    return formulation;
}

// Select Excipients
function selectExcipients(apis, variant) {
    const excipients = [];
    const compatibilitySet = new Set();
    
    // Get compatible excipients for all APIs
    apis.forEach(api => {
        const apiData = API_DATABASE[api.name];
        if (apiData && apiData.compatibility) {
            apiData.compatibility.forEach(exc => compatibilitySet.add(exc));
        }
    });
    
    // Select one from each category with variant-based selection
    const categories = ['binders', 'disintegrants', 'lubricants', 'fillers'];
    
    categories.forEach(category => {
        const available = EXCIPIENT_DATABASE[category].filter(exc => 
            exc.compatibility.some(apiName => 
                apis.some(api => api.name === apiName)
            )
        );
        
        if (available.length > 0) {
            // Use variant to select different options
            const index = variant % available.length;
            const selected = available[index];
            
            excipients.push({
                ...selected,
                type: category.slice(0, -1), // Remove 's' from plural
                costPerMg: selected.cost / 1000 // Convert to per mg
            });
        }
    });
    
    return excipients;
}

// Calculate Excipient Weight
function calculateExcipientWeight(type, apiWeight, variant) {
    const ratios = {
        binder: 0.02, // 2% of API weight
        disintegrant: 0.05, // 5%
        lubricant: 0.01, // 1%
        filler: 0.10 // 10%
    };
    
    const baseWeight = apiWeight * (ratios[type] || 0.05);
    // Add some variation
    const variation = 0.8 + (variant * 0.1);
    return Math.round(baseWeight * variation);
}

// Get Manufacturing Process
function getManufacturingProcess(productForm) {
    const processes = {
        tablet: 'Direct Compression',
        capsule: 'Encapsulation',
        syrup: 'Liquid Mixing'
    };
    return processes[productForm] || 'Direct Compression';
}

// Calculate Manufacturing Cost
function calculateManufacturingCost(formulation, productForm) {
    const baseCosts = {
        tablet: 0.50,
        capsule: 0.75,
        syrup: 1.00
    };
    
    const scaleFactor = formulation.totalWeight / 1000; // Per gram
    return baseCosts[productForm] * scaleFactor * 1000; // For batch
}

// Calculate Metrics
function calculateMetrics(formulation, formData) {
    // Cost Efficiency (lower cost is better, but must meet budget)
    const targetBudget = formData.optimization.budget;
    const costRatio = Math.min(formulation.totalCost / targetBudget, 1);
    const costEfficiency = Math.round((1 - costRatio) * 100);
    
    // Performance (based on API characteristics and formulation)
    const performance = calculatePerformanceScore(formulation);
    
    // Stability (based on API stability and excipient compatibility)
    const stability = calculateStabilityScore(formulation);
    
    // Compliance (regulatory adherence)
    const compliance = calculateComplianceScore(formulation);
    
    return {
        cost: Math.max(0, costEfficiency),
        performance: performance,
        stability: stability,
        compliance: compliance
    };
}

// Calculate Performance Score
function calculatePerformanceScore(formulation) {
    let score = 80; // Base score
    
    // Check if APIs are within therapeutic range
    formulation.apis.forEach(api => {
        const apiData = API_DATABASE[api.name];
        if (apiData) {
            if (api.strength >= apiData.minDose && api.strength <= apiData.maxDose) {
                score += 10;
            } else {
                score -= 20;
            }
        }
    });
    
    // Check excipient selection
    const hasBinder = formulation.excipients.some(e => e.type === 'binder');
    const hasDisintegrant = formulation.excipients.some(e => e.type === 'disintegrant');
    
    if (hasBinder && hasDisintegrant) score += 10;
    
    return Math.min(100, Math.max(0, score));
}

// Calculate Stability Score
function calculateStabilityScore(formulation) {
    let score = 85; // Base score
    
    // Check API stability
    formulation.apis.forEach(api => {
        const apiData = API_DATABASE[api.name];
        if (apiData) {
            if (apiData.stability.includes('Stable')) score += 5;
            if (apiData.stability.includes('sensitive')) score -= 10;
        }
    });
    
    // Check excipient compatibility
    const incompatibleCount = formulation.excipients.filter(exc => {
        return !exc.compatibility.some(apiName => 
            formulation.apis.some(api => api.name === apiName)
        );
    }).length;
    
    score -= incompatibleCount * 15;
    
    return Math.min(100, Math.max(0, score));
}

// Calculate Compliance Score
function calculateComplianceScore(formulation) {
    let score = 95; // Base score (most formulations are compliant)
    
    // Check for prohibited combinations
    const hasMultipleAPIs = formulation.apis.length > 1;
    if (hasMultipleAPIs) {
        // Some API combinations might need special consideration
        score -= 5;
    }
    
    // Check excipient regulatory status (simplified)
    const allExcipientsApproved = formulation.excipients.every(exc => 
        exc.name !== 'Prohibited Substance'
    );
    
    if (!allExcipientsApproved) score = 0;
    
    return Math.min(100, Math.max(0, score));
}

// Calculate Cost Analysis
function calculateCostAnalysis(formulation) {
    const materialCost = formulation.totalCost;
    const manufacturingCost = formulation.manufacturingCost || materialCost * 0.3;
    const totalCost = materialCost + manufacturingCost;
    
    // Calculate savings compared to typical formulation
    const typicalCost = totalCost * 1.3; // Assume 30% higher
    const savings = typicalCost - totalCost;
    const efficiency = Math.min(100, (savings / typicalCost) * 100);
    
    return {
        material: materialCost,
        manufacturing: manufacturingCost,
        total: totalCost,
        typical: typicalCost,
        savings: savings,
        efficiency: Math.round(efficiency)
    };
}

// Calculate Overall Score
function calculateOverallScore(metrics) {
    const weights = OPTIMIZATION_CONFIG.weights;
    
    const weightedScore = 
        (metrics.cost * weights.cost) +
        (metrics.performance * weights.performance) +
        (metrics.stability * weights.stability) +
        (metrics.compliance * weights.compliance);
    
    return Math.round(weightedScore);
}

// Check Constraints
function checkConstraints(formulation, formData) {
    const constraints = OPTIMIZATION_CONFIG.constraints;
    const violations = [];
    
    if (formulation.totalCost < constraints.minCost) {
        violations.push('Cost too low for viable production');
    }
    
    if (formulation.totalCost > constraints.maxCost) {
        violations.push(`Exceeds maximum cost of $${constraints.maxCost}`);
    }
    
    const metrics = calculateMetrics(formulation, formData);
    
    if (metrics.performance < constraints.minPerformance) {
        violations.push(`Performance below minimum threshold (${constraints.minPerformance}%)`);
    }
    
    if (metrics.stability < constraints.minStability) {
        violations.push(`Stability below minimum threshold (${constraints.minStability}%)`);
    }
    
    if (metrics.compliance < constraints.minCompliance) {
        violations.push(`Compliance below minimum threshold (${constraints.minCompliance}%)`);
    }
    
    return {
        passed: violations.length === 0,
        violations: violations
    };
}

// Generate Recommendations
function generateRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.cost < 70) {
        recommendations.push('Consider alternative excipients to reduce costs');
    }
    
    if (metrics.performance < 75) {
        recommendations.push('Review API ratios for optimal therapeutic effect');
    }
    
    if (metrics.stability < 80) {
        recommendations.push('Add stabilizers or consider different packaging');
    }
    
    if (metrics.compliance < 95) {
        recommendations.push('Verify excipient regulatory status for target markets');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Formulation meets all optimization criteria');
    }
    
    return recommendations;
}

// Helper Functions
function getFormulationName(formData, variant) {
    const apiNames = formData.apis.map(api => api.displayName.split(' ')[0]).join(' + ');
    const forms = ['Standard', 'Enhanced', 'Economy'];
    return `${forms[variant]} ${apiNames} ${formData.productForm.charAt(0).toUpperCase() + formData.productForm.slice(1)}`;
}

function getFormulationDescription(formData, variant) {
    const descriptions = [
        `Balanced formulation optimized for ${formData.optimization.primaryGoal}`,
        `High-performance formulation with enhanced stability`,
        `Cost-effective formulation maintaining compliance standards`
    ];
    return descriptions[variant] || descriptions[0];
}

// Genetic Algorithm Implementation (simplified)
class GeneticOptimizer {
    constructor(formData) {
        this.formData = formData;
        this.population = [];
        this.generation = 0;
    }
    
    initializePopulation() {
        for (let i = 0; i < OPTIMIZATION_CONFIG.algorithms.genetic.populationSize; i++) {
            this.population.push(this.createIndividual());
        }
    }
    
    createIndividual() {
        return generateFormulation(this.formData, Math.floor(Math.random() * 3));
    }
    
    calculateFitness(individual) {
        const metrics = calculateMetrics(individual, this.formData);
        return calculateOverallScore(metrics);
    }
    
    selection() {
        // Tournament selection
        const tournamentSize = 5;
        const selected = [];
        
        for (let i = 0; i < this.population.length; i++) {
            const tournament = [];
            for (let j = 0; j < tournamentSize; j++) {
                tournament.push(this.population[Math.floor(Math.random() * this.population.length)]);
            }
            tournament.sort((a, b) => this.calculateFitness(b) - this.calculateFitness(a));
            selected.push(tournament[0]);
        }
        
        return selected;
    }
    
    crossover(parent1, parent2) {
        // Simple crossover - mix excipients
        const child = { ...parent1 };
        if (Math.random() < OPTIMIZATION_CONFIG.algorithms.genetic.crossoverRate) {
            const excipientIndex = Math.floor(Math.random() * parent1.excipients.length);
            child.excipients[excipientIndex] = { ...parent2.excipients[excipientIndex] };
        }
        return child;
    }
    
    mutate(individual) {
        if (Math.random() < OPTIMIZATION_CONFIG.algorithms.genetic.mutationRate) {
            const excipientIndex = Math.floor(Math.random() * individual.excipients.length);
            const newExcipient = selectExcipients(this.formData.apis, Math.floor(Math.random() * 3))[0];
            if (newExcipient) {
                individual.excipients[excipientIndex] = newExcipient;
            }
        }
        return individual;
    }
    
    evolve() {
        const selected = this.selection();
        const newPopulation = [];
        
        for (let i = 0; i < selected.length; i += 2) {
            if (i + 1 < selected.length) {
                const child1 = this.crossover(selected[i], selected[i + 1]);
                const child2 = this.crossover(selected[i + 1], selected[i]);
                newPopulation.push(this.mutate(child1));
                newPopulation.push(this.mutate(child2));
            }
        }
        
        this.population = newPopulation;
        this.generation++;
    }
    
    getBestSolution() {
        return this.population.reduce((best, current) => {
            return this.calculateFitness(current) > this.calculateFitness(best) ? current : best;
        }, this.population[0]);
    }
}

// Export optimization functions
window.performAdvancedOptimization = async function(formData) {
    console.log('Starting advanced optimization...');
    
    const optimizer = new GeneticOptimizer(formData);
    optimizer.initializePopulation();
    
    // Run evolution
    for (let i = 0; i < OPTIMIZATION_CONFIG.algorithms.genetic.generations; i++) {
        optimizer.evolve();
        
        // Log progress
        if (i % 10 === 0) {
            const best = optimizer.getBestSolution();
            console.log(`Generation ${i}: Best fitness = ${optimizer.calculateFitness(best)}`);
        }
    }
    
    const bestSolution = optimizer.getBestSolution();
    return [bestSolution]; // Return as array for compatibility
};

// Simulated Annealing (alternative algorithm)
window.performSimulatedAnnealing = async function(formData) {
    console.log('Starting simulated annealing optimization...');
    
    let currentSolution = generateFormulation(formData, 0);
    let currentEnergy = -calculateOverallScore(calculateMetrics(currentSolution, formData));
    let temperature = OPTIMIZATION_CONFIG.algorithms.simulatedAnnealing.initialTemperature;
    
    let bestSolution = currentSolution;
    let bestEnergy = currentEnergy;
    
    for (let i = 0; i < 1000; i++) {
        // Generate neighbor
        const neighbor = generateFormulation(formData, (i % 3));
        const neighborEnergy = -calculateOverallScore(calculateMetrics(neighbor, formData));
        
        // Calculate energy difference
        const energyDiff = neighborEnergy - currentEnergy;
        
        // Acceptance probability
        const acceptanceProbability = Math.exp(-energyDiff / temperature);
        
        if (energyDiff < 0 || Math.random() < acceptanceProbability) {
            currentSolution = neighbor;
            currentEnergy = neighborEnergy;
        }
        
        // Update best solution
        if (currentEnergy < bestEnergy) {
            bestSolution = currentSolution;
            bestEnergy = currentEnergy;
        }
        
        // Cool down
        temperature *= OPTIMIZATION_CONFIG.algorithms.simulatedAnnealing.coolingRate;
    }
    
    return [bestSolution];
};
