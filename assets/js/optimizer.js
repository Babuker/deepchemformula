// Optimization Algorithm JavaScript

class FormulaOptimizer {
    constructor() {
        this.optimizationHistory = [];
        this.currentFormulation = null;
    }
    
    async optimize(formData) {
        console.log('Starting optimization with data:', formData);
        
        // Simulate AI optimization process
        const optimizedFormulation = await this.simulateAIOptimization(formData);
        
        // Calculate metrics
        const metrics = this.calculateMetrics(optimizedFormulation);
        
        // Save to history
        this.optimizationHistory.push({
            timestamp: new Date().toISOString(),
            input: formData,
            output: optimizedFormulation,
            metrics: metrics
        });
        
        this.currentFormulation = {
            ...optimizedFormulation,
            metrics: metrics
        };
        
        return this.currentFormulation;
    }
    
    async simulateAIOptimization(formData) {
        // Simulate AI processing time
        await this.delay(1500 + Math.random() * 1000);
        
        // Generate optimized formulation
        const optimized = {
            ...formData,
            excipients: this.selectOptimalExcipients(formData),
            manufacturingProcess: this.determineManufacturingProcess(formData),
            packaging: this.determinePackaging(formData),
            costBreakdown: this.calculateCostBreakdown(formData),
            stabilityAssessment: this.assessStability(formData),
            regulatoryStatus: this.checkRegulatoryCompliance(formData)
        };
        
        return optimized;
    }
    
    selectOptimalExcipients(formData) {
        const baseExcipients = {
            tablet: [
                { name: 'Microcrystalline Cellulose', function: 'Binder', percentage: 20 },
                { name: 'Lactose Monohydrate', function: 'Filler', percentage: 30 },
                { name: 'Croscarmellose Sodium', function: 'Disintegrant', percentage: 5 },
                { name: 'Magnesium Stearate', function: 'Lubricant', percentage: 1 }
            ],
            capsule: [
                { name: 'Gelatin', function: 'Capsule Shell', percentage: 45 },
                { name: 'Titanium Dioxide', function: 'Opacifier', percentage: 1 },
                { name: 'Silica Gel', function: 'Desiccant', percentage: 2 }
            ],
            syrup: [
                { name: 'Purified Water', function: 'Solvent', percentage: 70 },
                { name: 'Sucrose', function: 'Sweetener', percentage: 20 },
                { name: 'Sodium Benzoate', function: 'Preservative', percentage: 0.1 },
                { name: 'Citric Acid', function: 'pH Adjuster', percentage: 0.5 }
            ]
        };
        
        return baseExcipients[formData.productForm] || baseExcipients.tablet;
    }
    
    determineManufacturingProcess(formData) {
        const processes = {
            tablet: {
                method: 'Direct Compression',
                equipment: ['Mixer', 'Compression Machine', 'Coating Pan'],
                steps: ['Mixing', 'Compression', 'Coating', 'Packaging'],
                time: '4-6 hours'
            },
            capsule: {
                method: 'Capsule Filling',
                equipment: ['Capsule Filling Machine', 'Polishing Machine'],
                steps: ['API Preparation', 'Capsule Filling', 'Polishing', 'Packaging'],
                time: '3-5 hours'
            },
            syrup: {
                method: 'Liquid Mixing',
                equipment: ['Mixing Tank', 'Filtration System', 'Filling Machine'],
                steps: ['Dissolution', 'Mixing', 'Filtration', 'Filling', 'Packaging'],
                time: '2-4 hours'
            }
        };
        
        return processes[formData.productForm] || processes.tablet;
    }
    
    determinePackaging(formData) {
        const packaging = {
            tablet: {
                primary: 'Blister Pack',
                secondary: 'Cardboard Carton',
                material: 'PVC/PVDC',
                quantity: '10 tablets per blister'
            },
            capsule: {
                primary: 'Plastic Bottle',
                secondary: 'Cardboard Box',
                material: 'HDPE',
                quantity: '30 capsules per bottle'
            },
            syrup: {
                primary: 'Glass Bottle',
                secondary: 'Cardboard Carton',
                material: 'Amber Glass',
                quantity: '100ml per bottle'
            }
        };
        
        return packaging[formData.productForm] || packaging.tablet;
    }
    
    calculateCostBreakdown(formData) {
        const totalAPICost = formData.apis.reduce((sum, api) => {
            // Simplified cost calculation
            const costPerUnit = this.getAPICost(api.id);
            return sum + (api.quantity * costPerUnit / 1000); // Convert to grams
        }, 0);
        
        return {
            apiCost: totalAPICost * 1000, // Convert back to kg scale
            excipientCost: totalAPICost * 0.3,
            manufacturingCost: totalAPICost * 0.4,
            packagingCost: totalAPICost * 0.2,
            testingCost: totalAPICost * 0.1,
            totalCost: totalAPICost * 2 // Rough estimate
        };
    }
    
    getAPICost(apiId) {
        const costMap = {
            'paracetamol': 45,
            'ibuprofen': 62,
            'amoxicillin': 120,
            'metformin': 28,
            'omeprazole': 85,
            'aspirin': 38,
            'caffeine': 52,
            'vitamin-c': 15
        };
        
        return costMap[apiId] || 50; // Default cost
    }
    
    assessStability(formData) {
        const stabilityFactors = {
            temperature: this.checkTemperatureStability(formData),
            humidity: this.checkHumidityStability(formData),
            light: this.checkLightStability(formData),
            shelfLife: this.estimateShelfLife(formData)
        };
        
        return stabilityFactors;
    }
    
    checkTemperatureStability(formData) {
        if (formData.storageConditions === 'refrigerated') {
            return { stable: true, range: '2-8°C', note: 'Requires refrigeration' };
        } else if (formData.storageConditions === 'frozen') {
            return { stable: true, range: '≤ -20°C', note: 'Requires freezing' };
        } else {
            return { stable: true, range: '15-30°C', note: 'Room temperature stable' };
        }
    }
    
    checkHumidityStability(formData) {
        return { stable: true, maxHumidity: '75% RH', note: 'Keep in dry conditions' };
    }
    
    checkLightStability(formData) {
        const lightSensitiveAPIs = ['omeprazole', 'vitamin-c'];
        const hasLightSensitive = formData.apis.some(api => 
            lightSensitiveAPIs.includes(api.id)
        );
        
        return {
            stable: true,
            protection: hasLightSensitive ? 'Amber container required' : 'Standard protection',
            note: hasLightSensitive ? 'Light sensitive formulation' : 'Light stable'
        };
    }
    
    estimateShelfLife(formData) {
        const baseShelfLife = 24; // months
        
        // Adjust based on storage conditions
        let adjustment = 0;
        if (formData.storageConditions === 'refrigerated') adjustment = 12;
        if (formData.storageConditions === 'frozen') adjustment = 24;
        
        // Adjust based on APIs
        const stableAPIs = ['paracetamol', 'ibuprofen', 'metformin'];
        const unstableAPIs = ['amoxicillin', 'omeprazole'];
        
        formData.apis.forEach(api => {
            if (unstableAPIs.includes(api.id)) adjustment -= 6;
            if (stableAPIs.includes(api.id)) adjustment += 3;
        });
        
        return Math.max(12, baseShelfLife + adjustment); // Minimum 12 months
    }
    
    checkRegulatoryCompliance(formData) {
        const pharmacopeias = ['USP', 'BP', 'EP'];
        const compliant = pharmacopeias.map(pharma => ({
            standard: pharma,
            compliant: true,
            tests: ['Identification', 'Assay', 'Impurities', 'Dissolution'],
            passing: Math.random() > 0.1 // 90% chance of passing
        }));
        
        return {
            overall: compliant.every(c => c.passing),
            details: compliant,
            note: compliant.every(c => c.passing) 
                ? 'Meets all pharmacopeia standards' 
                : 'Some standards may require additional testing'
        };
    }
    
    calculateMetrics(formulation) {
        const metrics = {
            costScore: this.calculateCostScore(formulation),
            performanceScore: this.calculatePerformanceScore(formulation),
            stabilityScore: this.calculateStabilityScore(formulation),
            manufacturabilityScore: this.calculateManufacturabilityScore(formulation),
            regulatoryScore: this.calculateRegulatoryScore(formulation)
        };
        
        // Overall score (weighted average)
        metrics.overallScore = (
            metrics.costScore * 0.25 +
            metrics.performanceScore * 0.30 +
            metrics.stabilityScore * 0.20 +
            metrics.manufacturabilityScore * 0.15 +
            metrics.regulatoryScore * 0.10
        );
        
        return metrics;
    }
    
    calculateCostScore(formulation) {
        const targetBudget = parseFloat(formulation.budget);
        const actualCost = formulation.costBreakdown.totalCost;
        
        // Score based on how close to budget (lower is better)
        const deviation = Math.abs(actualCost - targetBudget) / targetBudget;
        return Math.max(0, 100 - (deviation * 100));
    }
    
    calculatePerformanceScore(formulation) {
        // Score based on formulation complexity and API properties
        let score = 80; // Base score
        
        // Bonus for multiple APIs (synergy)
        if (formulation.apis.length > 1) score += 10;
        
        // Penalty for incompatible APIs
        const incompatiblePairs = [['omeprazole', 'aspirin']];
        incompatiblePairs.forEach(pair => {
            if (formulation.apis.some(a => a.id === pair[0]) && 
                formulation.apis.some(a => a.id === pair[1])) {
                score -= 20;
            }
        });
        
        return Math.min(100, Math.max(0, score));
    }
    
    calculateStabilityScore(formulation) {
        const shelfLife = formulation.stabilityAssessment.shelfLife;
        const maxShelfLife = 36; // Maximum expected shelf life
        
        return (shelfLife / maxShelfLife) * 100;
    }
    
    calculateManufacturabilityScore(formulation) {
        // Score based on manufacturing complexity
        const complexity = {
            'tablet': 90,
            'capsule': 85,
            'syrup': 80,
            'ointment': 75,
            'injection': 70
        };
        
        return complexity[formulation.productForm] || 80;
    }
    
    calculateRegulatoryScore(formulation) {
        const compliant = formulation.regulatoryStatus.overall;
        return compliant ? 95 : 60;
    }
    
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getOptimizationHistory() {
        return this.optimizationHistory;
    }
    
    getCurrentFormulation() {
        return this.currentFormulation;
    }
}

// Export for use in other modules
window.FormulaOptimizer = FormulaOptimizer;
