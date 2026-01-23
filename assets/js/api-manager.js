// API Manager JavaScript

class APIManager {
    constructor() {
        this.apis = [];
        this.loadAPIs();
    }
    
    async loadAPIs() {
        try {
            // In a real application, this would be an API call
            this.apis = await this.fetchAPIs();
            this.renderAPITable();
        } catch (error) {
            console.error('Failed to load APIs:', error);
        }
    }
    
    async fetchAPIs() {
        // Simulated API data - in real app, fetch from server
        return [
            {
                id: 1,
                name: 'Paracetamol',
                chemicalName: 'Acetaminophen',
                formula: 'C₈H₉NO₂',
                molecularWeight: '151.16',
                solubility: '14 mg/mL (25°C)',
                pricePerKg: 45.00,
                manufacturer: 'Various',
                stability: 'Stable',
                compatibility: ['Ibuprofen', 'Caffeine'],
                storage: 'Room temperature'
            },
            {
                id: 2,
                name: 'Ibuprofen',
                chemicalName: '2-(4-isobutylphenyl)propanoic acid',
                formula: 'C₁₃H₁₈O₂',
                molecularWeight: '206.28',
                solubility: '0.021 mg/mL (25°C)',
                pricePerKg: 62.00,
                manufacturer: 'Various',
                stability: 'Stable',
                compatibility: ['Paracetamol'],
                storage: 'Room temperature'
            },
            {
                id: 3,
                name: 'Amoxicillin',
                chemicalName: 'Amoxicillin Trihydrate',
                formula: 'C₁₆H₁₉N₃O₅S·3H₂O',
                molecularWeight: '419.45',
                solubility: '3.4 mg/mL (25°C)',
                pricePerKg: 120.00,
                manufacturer: 'Various',
                stability: 'Refrigerate',
                compatibility: ['Clavulanic Acid'],
                storage: '2-8°C'
            },
            {
                id: 4,
                name: 'Metformin HCl',
                chemicalName: 'Metformin Hydrochloride',
                formula: 'C₄H₁₁N₅·HCl',
                molecularWeight: '165.62',
                solubility: '300 mg/mL (25°C)',
                pricePerKg: 28.00,
                manufacturer: 'Various',
                stability: 'Stable',
                compatibility: ['Most APIs'],
                storage: 'Room temperature'
            },
            {
                id: 5,
                name: 'Omeprazole',
                chemicalName: '5-methoxy-2-[(4-methoxy-3,5-dimethylpyridin-2-yl)methylsulfinyl]-1H-benzimidazole',
                formula: 'C₁₇H₁₉N₃O₃S',
                molecularWeight: '345.42',
                solubility: '0.5 mg/mL (25°C)',
                pricePerKg: 85.00,
                manufacturer: 'Various',
                stability: 'Protect from light',
                compatibility: [],
                storage: 'Room temperature'
            }
        ];
    }
    
    renderAPITable() {
        const tableBody = document.querySelector('#apiDatabaseTable tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        this.apis.forEach(api => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${api.name}</strong><br>
                    <small class="text-muted">${api.chemicalName}</small>
                </td>
                <td>${api.formula}</td>
                <td>${api.molecularWeight} g/mol</td>
                <td>${api.solubility}</td>
                <td>$${api.pricePerKg.toFixed(2)}/kg</td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="window.APIManager.addToFormulation(${api.id})">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    addToFormulation(apiId) {
        const api = this.apis.find(a => a.id === apiId);
        if (!api) return;
        
        // Find or create API row in the main form
        this.addAPIToForm(api);
        
        // Show notification
        this.showNotification(`${api.name} added to formulation`, 'success');
    }
    
    addAPIToForm(api) {
        // Implementation similar to addAPIToForm in app.js
        let emptyRow = null;
        const apiSelects = document.querySelectorAll('.api-select');
        
        for (let i = 0; i < apiSelects.length; i++) {
            if (!apiSelects[i].value) {
                emptyRow = apiSelects[i].closest('tr');
                break;
            }
        }
        
        if (!emptyRow) {
            addAPIRow();
            const rows = document.querySelectorAll('#apiTableBody tr');
            emptyRow = rows[rows.length - 1];
        }
        
        // Set the API
        const select = emptyRow.querySelector('.api-select');
        for (let option of select.options) {
            if (option.text.includes(api.name)) {
                option.selected = true;
                break;
            }
        }
        
        // Auto-fill quantity based on typical dosage
        const quantityInput = emptyRow.querySelector('.api-quantity-input');
        switch(api.name.toLowerCase()) {
            case 'paracetamol':
                quantityInput.value = 500;
                break;
            case 'ibuprofen':
                quantityInput.value = 400;
                break;
            case 'amoxicillin':
                quantityInput.value = 500;
                break;
            case 'metformin':
                quantityInput.value = 850;
                break;
            case 'omeprazole':
                quantityInput.value = 20;
                break;
            default:
                quantityInput.value = 100;
        }
        
        // Highlight
        emptyRow.style.backgroundColor = '#e8f5e8';
        setTimeout(() => {
            emptyRow.style.transition = 'background-color 0.5s ease';
            emptyRow.style.backgroundColor = '';
        }, 1000);
        
        // Update summary
        if (typeof updateAPISummary === 'function') {
            updateAPISummary();
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize API Manager
let APIManagerInstance = null;

function initAPIManager() {
    APIManagerInstance = new APIManager();
    window.APIManager = APIManagerInstance;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAPIManager);
