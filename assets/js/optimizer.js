/**
 * Database and Data Management
 * Chemical Formula Optimizer
 */

// Database Configuration
const DB_CONFIG = {
    name: 'ChemicalFormulaDB',
    version: 1,
    stores: {
        formulations: 'formulations',
        results: 'results',
        settings: 'settings'
    }
};

// Initialize IndexedDB
class FormulaDatabase {
    constructor() {
        this.db = null;
        this.initialized = false;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            if (this.initialized && this.db) {
                resolve(this.db);
                return;
            }
            
            const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
            
            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.initialized = true;
                console.log('Database initialized successfully');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains(DB_CONFIG.stores.formulations)) {
                    const store = db.createObjectStore(DB_CONFIG.stores.formulations, { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('productForm', 'productForm', { unique: false });
                }
                
                if (!db.objectStoreNames.contains(DB_CONFIG.stores.results)) {
                    const store = db.createObjectStore(DB_CONFIG.stores.results, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('formulationId', 'formulationId', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains(DB_CONFIG.stores.settings)) {
                    db.createObjectStore(DB_CONFIG.stores.settings, { keyPath: 'key' });
                }
            };
        });
    }
    
    // Formulation Methods
    async saveFormulation(formulation) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.formulations], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.formulations);
            
            const request = store.add({
                ...formulation,
                timestamp: new Date().toISOString()
            });
            
            request.onsuccess = () => {
                console.log('Formulation saved with ID:', request.result);
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('Error saving formulation:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    async getFormulation(id) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.formulations], 'readonly');
            const store = transaction.objectStore(DB_CONFIG.stores.formulations);
            
            const request = store.get(id);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async getAllFormulations(limit = 50) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.formulations], 'readonly');
            const store = transaction.objectStore(DB_CONFIG.stores.formulations);
            const index = store.index('timestamp');
            
            const request = index.openCursor(null, 'prev');
            const formulations = [];
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && formulations.length < limit) {
                    formulations.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(formulations);
                }
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async deleteFormulation(id) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.formulations], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.formulations);
            
            const request = store.delete(id);
            
            request.onsuccess = () => {
                console.log('Formulation deleted:', id);
                resolve();
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Results Methods
    async saveResults(formulationId, results) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.results], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.results);
            
            const request = store.add({
                formulationId: formulationId,
                results: results,
                timestamp: new Date().toISOString()
            });
            
            request.onsuccess = () => {
                console.log('Results saved with ID:', request.result);
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('Error saving results:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    async getResults(formulationId) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.results], 'readonly');
            const store = transaction.objectStore(DB_CONFIG.stores.results);
            const index = store.index('formulationId');
            
            const request = index.getAll(formulationId);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async getLatestResults() {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.results], 'readonly');
            const store = transaction.objectStore(DB_CONFIG.stores.results);
            const index = store.index('timestamp');
            
            const request = index.openCursor(null, 'prev');
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    resolve(cursor.value);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Settings Methods
    async saveSetting(key, value) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.settings], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.settings);
            
            const request = store.put({ key, value });
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async getSetting(key, defaultValue = null) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.settings], 'readonly');
            const store = transaction.objectStore(DB_CONFIG.stores.settings);
            
            const request = store.get(key);
            
            request.onsuccess = () => {
                resolve(request.result ? request.result.value : defaultValue);
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Statistics
    async getStatistics() {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(
                [DB_CONFIG.stores.formulations, DB_CONFIG.stores.results], 
                'readonly'
            );
            
            const formulationsStore = transaction.objectStore(DB_CONFIG.stores.formulations);
            const resultsStore = transaction.objectStore(DB_CONFIG.stores.results);
            
            const stats = {
                totalFormulations: 0,
                totalOptimizations: 0,
                averageScore: 0,
                mostCommonForm: '',
                recentActivity: []
            };
            
            // Count formulations
            const countRequest = formulationsStore.count();
            countRequest.onsuccess = () => {
                stats.totalFormulations = countRequest.result;
            };
            
            // Count results
            const resultsCountRequest = resultsStore.count();
            resultsCountRequest.onsuccess = () => {
                stats.totalOptimizations = resultsCountRequest.result;
            };
            
            // Get recent activity
            const recentRequest = resultsStore.index('timestamp').openCursor(null, 'prev');
            const recent = [];
            recentRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && recent.length < 5) {
                    recent.push({
                        id: cursor.value.id,
                        timestamp: cursor.value.timestamp,
                        formulationId: cursor.value.formulationId
                    });
                    cursor.continue();
                } else {
                    stats.recentActivity = recent;
                    
                    // Calculate average score
                    if (stats.totalOptimizations > 0) {
                        const scoresRequest = resultsStore.getAll();
                        scoresRequest.onsuccess = () => {
                            const allResults = scoresRequest.result;
                            let totalScore = 0;
                            let count = 0;
                            
                            allResults.forEach(result => {
                                result.results.forEach(r => {
                                    totalScore += r.overallScore;
                                    count++;
                                });
                            });
                            
                            stats.averageScore = count > 0 ? Math.round(totalScore / count) : 0;
                            
                            // Get most common form
                            const formsRequest = formulationsStore.getAll();
                            formsRequest.onsuccess = () => {
                                const forms = formsRequest.result.map(f => f.productForm);
                                const formCounts = {};
                                forms.forEach(form => {
                                    formCounts[form] = (formCounts[form] || 0) + 1;
                                });
                                
                                let maxCount = 0;
                                let mostCommon = '';
                                Object.entries(formCounts).forEach(([form, count]) => {
                                    if (count > maxCount) {
                                        maxCount = count;
                                        mostCommon = form;
                                    }
                                });
                                
                                stats.mostCommonForm = mostCommon;
                                resolve(stats);
                            };
                        };
                    } else {
                        resolve(stats);
                    }
                }
            };
            
            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    // Export/Import
    async exportData() {
        await this.init();
        
        const data = {
            formulations: await this.getAllFormulations(),
            settings: {},
            timestamp: new Date().toISOString(),
            version: DB_CONFIG.version
        };
        
        // Get all settings
        const transaction = this.db.transaction([DB_CONFIG.stores.settings], 'readonly');
        const store = transaction.objectStore(DB_CONFIG.stores.settings);
        const request = store.getAll();
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                request.result.forEach(setting => {
                    data.settings[setting.key] = setting.value;
                });
                
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json'
                });
                
                resolve({
                    data: data,
                    blob: blob,
                    url: URL.createObjectURL(blob)
                });
            };
            
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    async importData(jsonData) {
        await this.init();
        
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // Clear existing data
            await this.clearDatabase();
            
            // Import formulations
            if (data.formulations && Array.isArray(data.formulations)) {
                for (const formulation of data.formulations) {
                    await this.saveFormulation(formulation);
                }
            }
            
            // Import settings
            if (data.settings && typeof data.settings === 'object') {
                for (const [key, value] of Object.entries(data.settings)) {
                    await this.saveSetting(key, value);
                }
            }
            
            console.log('Data imported successfully');
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
    
    async clearDatabase() {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(
                Object.values(DB_CONFIG.stores), 
                'readwrite'
            );
            
            let completed = 0;
            const totalStores = Object.values(DB_CONFIG.stores).length;
            
            Object.values(DB_CONFIG.stores).forEach(storeName => {
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                
                request.onsuccess = () => {
                    completed++;
                    if (completed === totalStores) {
                        resolve();
                    }
                };
                
                request.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        });
    }
    
    // Backup and Restore
    async createBackup() {
        const exportData = await this.exportData();
        return exportData.blob;
    }
    
    async restoreBackup(blob) {
        try {
            const text = await blob.text();
            return await this.importData(text);
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }
}

// Create global database instance
const formulaDB = new FormulaDatabase();

// Export functions for use in other modules
window.formulaDB = formulaDB;

// Initialize database on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await formulaDB.init();
        console.log('Database ready');
        
        // Load and display statistics if on dashboard
        if (window.location.pathname.includes('dashboard')) {
            const stats = await formulaDB.getStatistics();
            updateDashboardStats(stats);
        }
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
});

// Dashboard Statistics Update
function updateDashboardStats(stats) {
    const statsElement = document.getElementById('dashboardStats');
    if (statsElement) {
        statsElement.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalFormulations}</div>
                    <div class="stat-label">Total Formulations</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.totalOptimizations}</div>
                    <div class="stat-label">Optimizations</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.averageScore}/100</div>
                    <div class="stat-label">Average Score</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.mostCommonForm || 'N/A'}</div>
                    <div class="stat-label">Most Common Form</div>
                </div>
            </div>
            
            ${stats.recentActivity.length > 0 ? `
            <div class="recent-activity">
                <h3>Recent Activity</h3>
                <ul>
                    ${stats.recentActivity.map(activity => `
                        <li>
                            <span class="activity-time">${new Date(activity.timestamp).toLocaleString()}</span>
                            <span class="activity-desc">Optimization #${activity.id}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
        `;
    }
}

// Utility function to save current formulation
window.saveCurrentFormulation = async function(formData) {
    try {
        const id = await formulaDB.saveFormulation(formData);
        showAlert('Formulation saved successfully!', 'success');
        return id;
    } catch (error) {
        console.error('Error saving formulation:', error);
        showAlert('Failed to save formulation', 'error');
        return null;
    }
};

// Utility function to load saved formulation
window.loadSavedFormulation = async function(id) {
    try {
        const formulation = await formulaDB.getFormulation(id);
        
        // Populate form with saved data
        if (formulation && window.populateFormWithData) {
            window.populateFormWithData(formulation);
            showAlert('Formulation loaded successfully!', 'success');
        }
        
        return formulation;
    } catch (error) {
        console.error('Error loading formulation:', error);
        showAlert('Failed to load formulation', 'error');
        return null;
    }
};

// Auto-save functionality
let autoSaveTimer = null;
const AUTO_SAVE_DELAY = 30000; // 30 seconds

window.enableAutoSave = function() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }
    
    autoSaveTimer = setInterval(async () => {
        if (window.currentFormData && Object.keys(window.currentFormData).length > 0) {
            try {
                await formulaDB.saveFormulation({
                    ...window.currentFormData,
                    autoSaved: true,
                    autoSaveTimestamp: new Date().toISOString()
                });
                console.log('Auto-saved formulation');
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    }, AUTO_SAVE_DELAY);
};

window.disableAutoSave = function() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
};

// Initialize auto-save when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.enableAutoSave();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    window.disableAutoSave();
});
