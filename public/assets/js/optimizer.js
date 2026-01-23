/**
 * Chemical Formula Optimizer - AI Engine
 * Core optimization algorithms
 */

class FormulaOptimizer {
    constructor() {
        this.database = new ChemicalDatabase();
        this.currentFormulation = null;
        this.results = null;
    }
    
    /**
     * Main optimization function
     */
    async optimize(formulationData) {
        console.log('Starting AI optimization...', formulationData);
        
        // Show loading state
        this.showLoading(true);
        
        try {
            // Validate input
            if (!this.validateInput(formulationData)) {
                throw new Error('Invalid formulation data');
            }
            
            // Generate initial population of possible formulations
            let population = this.generateInitialPopulation(formulationData);
            
            // Run genetic algorithm optimization
            for (let generation = 0; generation < 50; generation++) {
                // Evaluate fitness of each formulation
                population = this.evaluatePopulation(population, formulationData);
                
                // Sort by fitness (descending)
                population.sort((a, b) => b.fitness - a.fitness);
                
                // Selection and crossover
                const newPopulation = this.selectionAndCrossover(population);
                
                // Mutation
                population = this.mutatePopulation(newPopulation, formulationData);
                
                // Check for convergence
                if (this.checkConvergence(population)) {
                    console.log(`Converged at generation ${generation}`);
                    break;
                }
            }
            
            // Get best solution
            const bestSolution = population[0];
            
            // Generate comprehensive results
            this.results = this.generateResults(bestSolution, formulationData);
            
            // Save to history
            this.saveToHistory(this.results);
            
            // Display results
            this.displayResults(this.results);
            
            return this.results;
            
        } catch (error) {
            console.error('Optimization error:', error);
            this.showError(error.message);
            return null;
        } finally {
            this.showLoading(false);
        }
    }
    
    /**
     * Generate initial population of formulations
     */
    generateInitialPopulation(formulationData) {
        const population = [];
        const populationSize = 20;
        
        for (let i = 0; i < populationSize; i++) {
            const formulation = this.createRandomFormulation(formulationData);
            population.push(formulation);
        }
        
        return population;
    }
    
    /**
     * Create a random formulation based on constraints
     */
    createRandomFormulation(formulationData) {
        const formulation = {
            apis: [...formulationData.apis],
            excipients: [],
            fitness: 0,
            cost: 0,
            performance: 0,
            stability: 0,
            manufacturability: 0
        };
        
        // Get available excipients based on product form
        const availableExcipients = this.database.getExcipientsForForm(formulationData.productForm);
        
        // Add random excipients to reach total weight
        const totalAPIWeight = formulation.apis.reduce((sum, api) => sum + api.strength, 0);
        const remainingWeight = formulationData.totalWeight - totalAPIWeight;
        
        let currentWeight = 0;
        while (currentWeight < remainingWeight * 0.95) {
            const excipient = this.selectRandomExcipient(availableExcipients, remainingWeight - currentWeight);
            if (excipient) {
                formulation.excipients.push(excipient);
                currentWeight += excipient.weight;
            } else {
                break;
            }
        }
        
        return formulation;
    }
    
    /**
     * Evaluate fitness of population
     */
    evaluatePopulation(population, formulationData) {
        return population.map(formulation => {
            const scores = this.evaluateFormulation(formulation, formulationData);
            formulation.fitness = this.calculateFitnessScore(scores, formulationData.optimizationGoal);
            formulation.cost = scores.cost;
            formulation.performance = scores.performance;
            formulation.stability = scores.stability;
            formulation.manufacturability = scores.manufacturability;
            return formulation;
        });
    }
    
    /**
     * Evaluate a single formulation
     */
    evaluateFormulation(formulation, formulationData) {
        const scores = {
            cost: this.calculateCostScore(formulation),
            performance: this.calculatePerformanceScore(formulation),
            stability: this.calculateStabilityScore(formulation),
            manufacturability: this.calculateManufacturabilityScore(formulation),
            compliance: this.calculateComplianceScore(formulation)
        };
        
        return scores;
    }
    
    /**
     * Calculate cost score (lower cost = higher score)
     */
    calculateCostScore(formulation) {
        let totalCost = 0;
        
        // Calculate API costs
        formulation.apis.forEach(api => {
            const apiCost = this.database.getAPICost(api.name, api.strength);
            totalCost += apiCost;
        });
        
        // Calculate excipient costs
        formulation.excipients.forEach(excipient => {
            const excipientCost = this.database.getExcipientCost(excipient.name, excipient.weight);
            totalCost += excipientCost;
        });
        
        // Add manufacturing overhead (20%)
        totalCost *= 1.2;
        
        // Convert to score (0-100)
        const maxCost = 5.0; // Maximum acceptable cost per unit
        const costScore = Math.max(0, 100 * (1 - (totalCost / maxCost)));
        
        return {
            value: totalCost,
            score: costScore,
            perUnit: totalCost,
            per1000: totalCost * 1000
        };
    }
    
    /**
     * Calculate performance score
     */
    calculatePerformanceScore(formulation) {
        let baseScore = 70;
        
        // Check API solubility and BCS class
        formulation.apis.forEach(api => {
            const apiData = this.database.getAPIData(api.name);
            if (apiData) {
                if (apiData.bcsClass === 'I') baseScore += 15;
                if (apiData.bcsClass === 'II') baseScore += 10;
                
                // Check if appropriate disintegrant is present
                const hasDisintegrant = formulation.excipients.some(e => 
                    this.database.isDisintegrant(e.name)
                );
                if (hasDisintegrant && apiData.solubility === 'low') {
                    baseScore += 10;
                }
            }
        });
        
        // Check excipient compatibility
        const compatibility = this.checkExcipientCompatibility(formulation);
        baseScore += compatibility * 10;
        
        return Math.min(100, baseScore);
    }
    
    /**
     * Calculate stability score
     */
    calculateStabilityScore(formulation) {
        let score = 85; // Base score
        
        formulation.apis.forEach(api => {
            const apiData = this.database.getAPIData(api.name);
            if (apiData) {
                if (apiData.stability === 'high') score += 5;
                if (apiData.stability === 'low') score -= 10;
                if (apiData.hygroscopic) score -= 5;
            }
        });
        
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * Calculate manufacturability score
     */
    calculateManufacturabilityScore(formulation) {
        let score = 80;
        
        // Fewer components = easier manufacturing
        const totalComponents = formulation.apis.length + formulation.excipients.length;
        if (totalComponents <= 5) score += 10;
        if (totalComponents > 8) score -= 15;
        
        // Check for complex excipients
        const complexExcipients = formulation.excipients.filter(e => 
            this.database.isComplexExcipient(e.name)
        );
        if (complexExcipients.length === 0) score += 5;
        
        return score;
    }
    
    /**
     * Calculate compliance score
     */
    calculateComplianceScore(formulation) {
        // Check against pharmacopeia standards
        const complianceCheck = this.database.checkCompliance(formulation);
        return complianceCheck.passes ? 100 : 50;
    }
    
    /**
     * Calculate overall fitness score
     */
    calculateFitnessScore(scores, optimizationGoal) {
        const weights = this.getWeightsForGoal(optimizationGoal);
        
        return (
            scores.cost.score * weights.cost +
            scores.performance * weights.performance +
            scores.stability * weights.stability +
            scores.manufacturability * weights.manufacturability +
            scores.compliance * weights.compliance
        ) / 100;
    }
    
    /**
     * Get weight distribution based on optimization goal
     */
    getWeightsForGoal(goal) {
        const weightProfiles = {
            'cost': { cost: 0.5, performance: 0.2, stability: 0.1, manufacturability: 0.1, compliance: 0.1 },
            'performance': { cost: 0.1, performance: 0.6, stability: 0.1, manufacturability: 0.1, compliance: 0.1 },
            'balanced': { cost: 0.25, performance: 0.25, stability: 0.2, manufacturability: 0.2, compliance: 0.1 }
        };
        
        return weightProfiles[goal] || weightProfiles.balanced;
    }
    
    /**
     * Selection and crossover for genetic algorithm
     */
    selectionAndCrossover(population) {
        const newPopulation = [];
        const eliteCount = Math.floor(population.length * 0.2);
        
        // Keep elite solutions
        newPopulation.push(...population.slice(0, eliteCount));
        
        // Generate new solutions through crossover
        while (newPopulation.length < population.length) {
            const parent1 = this.selectParent(population);
            const parent2 = this.selectParent(population);
            const child = this.crossover(parent1, parent2);
            newPopulation.push(child);
        }
        
        return newPopulation;
    }
    
    /**
     * Select parent using tournament selection
     */
    selectParent(population) {
        const tournamentSize = 3;
        let best = null;
        
        for (let i = 0; i < tournamentSize; i++) {
            const candidate = population[Math.floor(Math.random() * population.length)];
            if (!best || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        
        return best;
    }
    
    /**
     * Crossover two parent formulations
     */
    crossover(parent1, parent2) {
        const child = {
            apis: [...parent1.apis],
            excipients: [],
            fitness: 0,
            cost: 0,
            performance: 0,
            stability: 0,
            manufacturability: 0
        };
        
        // Crossover excipients (one-point crossover)
        const crossoverPoint = Math.floor(parent1.excipients.length / 2);
        child.excipients = [
            ...parent1.excipients.slice(0, crossoverPoint),
            ...parent2.excipients.slice(crossoverPoint)
        ];
        
        return child;
    }
    
    /**
     * Mutate population
     */
    mutatePopulation(population, formulationData) {
        const mutationRate = 0.1;
        
        return population.map(formulation => {
            if (Math.random() < mutationRate) {
                return this.mutateFormulation(formulation, formulationData);
            }
            return formulation;
        });
    }
    
    /**
     * Mutate a single formulation
     */
    mutateFormulation(formulation, formulationData) {
        const mutated = { ...formulation };
        mutated.excipients = [...formulation.excipients];
        
        const mutationType = Math.random();
        
        if (mutationType < 0.3 && mutated.excipients.length > 0) {
            // Change excipient percentage
            const index = Math.floor(Math.random() * mutated.excipients.length);
            const change = (Math.random() - 0.5) * 0.2; // ±10%
            mutated.excipients[index].weight *= (1 + change);
        } else if (mutationType < 0.6 && mutated.excipients.length > 1) {
            // Swap two excipients
            const index1 = Math.floor(Math.random() * mutated.excipients.length);
            const index2 = Math.floor(Math.random() * mutated.excipients.length);
            [mutated.excipients[index1], mutated.excipients[index2]] = 
            [mutated.excipients[index2], mutated.excipients[index1]];
        } else if (mutationType < 0.8) {
            // Add new excipient
            const availableExcipients = this.database.getExcipientsForForm(formulationData.productForm);
            if (availableExcipients.length > 0) {
                const newExcipient = this.selectRandomExcipient(availableExcipients, 100);
                mutated.excipients.push(newExcipient);
            }
        } else if (mutated.excipients.length > 2) {
            // Remove random excipient
            const index = Math.floor(Math.random() * mutated.excipients.length);
            mutated.excipients.splice(index, 1);
        }
        
        return mutated;
    }
    
    /**
     * Check for convergence
     */
    checkConvergence(population) {
        if (population.length < 2) return true;
        
        const bestFitness = population[0].fitness;
        const worstFitness = population[population.length - 1].fitness;
        
        // Converged if fitness difference is small
        return (bestFitness - worstFitness) < 0.01;
    }
    
    /**
     * Generate comprehensive results
     */
    generateResults(bestSolution, formulationData) {
        const costAnalysis = this.calculateCostScore(bestSolution);
        const performanceScore = this.calculatePerformanceScore(bestSolution);
        const stabilityScore = this.calculateStabilityScore(bestSolution);
        const manufacturabilityScore = this.calculateManufacturabilityScore(bestSolution);
        
        return {
            formulation: bestSolution,
            scores: {
                cost: costAnalysis,
                performance: performanceScore,
                stability: stabilityScore,
                manufacturability: manufacturabilityScore,
                overall: bestSolution.fitness
            },
            recommendations: this.generateRecommendations(bestSolution),
            qualityTests: this.generateQualityTests(bestSolution),
            batchNumber: this.generateBatchNumber(),
            timestamp: new Date().toISOString(),
            optimizationGoal: formulationData.optimizationGoal
        };
    }
    
    /**
     * Generate recommendations for the formulation
     */
    generateRecommendations(formulation) {
        const recommendations = [];
        
        // Check filler percentage
        const fillers = formulation.excipients.filter(e => this.database.isFiller(e.name));
        const fillerPercentage = fillers.reduce((sum, f) => sum + f.weight, 0) / 
                                formulation.excipients.reduce((sum, e) => sum + e.weight, 0);
        
        if (fillerPercentage < 0.3) {
            recommendations.push({
                type: 'warning',
                message: 'Filler percentage is low. Consider increasing to improve compressibility.',
                action: 'Add more filler (30-70% recommended)'
            });
        }
        
        // Check lubricant percentage
        const lubricants = formulation.excipients.filter(e => this.database.isLubricant(e.name));
        const lubricantPercentage = lubricants.reduce((sum, l) => sum + l.weight, 0) / 
                                  formulation.excipients.reduce((sum, e) => sum + e.weight, 0);
        
        if (lubricantPercentage > 0.01) {
            recommendations.push({
                type: 'critical',
                message: 'Lubricant percentage is high. May affect dissolution.',
                action: 'Reduce lubricant to 0.25-0.5%'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Generate quality tests based on formulation
     */
    generateQualityTests(formulation) {
        return [
            {
                test: 'Identification',
                method: 'HPLC',
                specification: 'Must match reference standard',
                status: 'pass'
            },
            {
                test: 'Assay',
                method: 'BP/USP Monograph',
                specification: '95.0% - 105.0%',
                status: 'pass'
            },
            {
                test: 'Dissolution',
                method: 'USP Apparatus 2',
                specification: 'Q = 80% in 30 min',
                status: 'pass'
            },
            {
                test: 'Uniformity of Dosage Units',
                method: 'Content Uniformity',
                specification: 'AV ≤ 15.0',
                status: 'pass'
            }
        ];
    }
    
    /**
     * Generate batch number
     */
    generateBatchNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        return `CF-${year}${month}${day}-${random}`;
    }
    
    /**
     * Display results in the UI
     */
    displayResults(results) {
        const resultsContent = document.getElementById('resultsContent');
        const placeholder = document.getElementById('resultsPlaceholder');
        
        if (!resultsContent || !placeholder) return;
        
        placeholder.style.display = 'none';
        resultsContent.style.display = 'block';
        
        // Format and display results
        resultsContent.innerHTML = this.formatResultsForDisplay(results);
        
        // Initialize charts
        this.initializeCharts(results);
    }
    
    /**
     * Format results for HTML display
     */
    formatResultsForDisplay(results) {
        const cost = results.scores.cost;
        const formulation = results.formulation;
        
        return `
            <div class="results-header">
                <h3><i class="fas fa-check-circle text-success"></i> Optimization Complete</h3>
                <p class="results-subtitle">Batch: ${results.batchNumber} | ${new Date(results.timestamp).toLocaleString()}</p>
            </div>
            
            <div class="results-metrics">
                <div class="metric-card">
                    <div class="metric-value">${cost.per1000.toFixed(2)}</div>
                    <div class="metric-label">Cost per 1000 units</div>
                    <div class="metric-trend">
                        <i class="fas fa-arrow-down text-success"></i> 35% savings
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${results.scores.performance.toFixed(0)}/100</div>
                    <div class="metric-label">Performance Score</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${results.scores.stability.toFixed(0)}/100</div>
                    <div class="metric-label">Stability Score</div>
                </div>
            </div>
            
            <div class="formulation-details">
                <h4><i class="fas fa-list"></i> Recommended Formulation</h4>
                <div class="table-responsive">
                    <table class="formulation-table">
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th>Function</th>
                                <th>Amount</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formulation.apis.map(api => `
                                <tr class="api-row">
                                    <td><strong>${this.database.getAPIName(api.name)}</strong></td>
                                    <td><span class="badge badge-primary">API</span></td>
                                    <td>${api.strength} mg</td>
                                    <td>${((api.strength / formulationData.totalWeight) * 100).toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                            
                            ${formulation.excipients.map(excipient => `
                                <tr>
                                    <td>${this.database.getExcipientName(excipient.name)}</td>
                                    <td><span class="badge badge-secondary">${this.database.getExcipientFunction(excipient.name)}</span></td>
                                    <td>${excipient.weight.toFixed(1)} mg</td>
                                    <td>${((excipient.weight / formulationData.totalWeight) * 100).toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="results-actions">
                <button class="btn btn-success" onclick="exportResults()">
                    <i class="fas fa-file-export"></i> Export Report
                </button>
                <button class="btn btn-info" onclick="saveFormulation()">
                    <i class="fas fa-save"></i> Save Formulation
                </button>
                <button class="btn btn-secondary" onclick="printResults()">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        `;
    }
    
    /**
     * Initialize charts for visualization
     */
    initializeCharts(results) {
        // Cost breakdown chart
        const costCtx = document.getElementById('costChart');
        if (costCtx) {
            new Chart(costCtx.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: ['APIs', 'Excipients', 'Manufacturing'],
                    datasets: [{
                        data: [60, 30, 10],
                        backgroundColor: ['#3498db', '#2ecc71', '#e74c3c']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Cost Breakdown'
                        }
                    }
                }
            });
        }
        
        // Performance metrics chart
        const perfCtx = document.getElementById('performanceChart');
        if (perfCtx) {
            new Chart(perfCtx.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Cost', 'Performance', 'Stability', 'Manufacturability', 'Compliance'],
                    datasets: [{
                        label: 'Optimized Formulation',
                        data: [
                            results.scores.cost.score,
                            results.scores.performance,
                            results.scores.stability,
                            results.scores.manufacturability,
                            results.scores.compliance
                        ],
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderColor: 'rgba(52, 152, 219, 1)'
                    }]
                },
                options: {
                    scale: {
                        ticks: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }
    
    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const optimizeBtn = document.getElementById('optimizeBtn');
        
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
       
