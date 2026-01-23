/**
 * Main Application JavaScript
 * Chemical Formula Optimizer
 */

// Global Variables
let currentFormData = {};
let optimizationResults = [];

// DOM Elements
const formulaForm = document.getElementById('formulaForm');
const apiContainer = document.getElementById('apiContainer');
const budgetSlider = document.getElementById('budget');
const budgetValue = document.getElementById('budgetValue');
const productOptions = document.querySelectorAll('.product-option');
const productFormInput = document.getElementById('productForm');
const optimizeBtn = document.getElementById('optimizeBtn');
const resultsPlaceholder = document.getElementById('resultsPlaceholder');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsContent = document.getElementById('resultsContent');

// Initialize Application
function initApplication() {
    console.log('Chemical Formula Optimizer initialized');
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Update budget display
    updateBudgetDisplay();
    
    // Load any saved data
    loadSavedData();
}

// Initialize Event Listeners
function initializeEventListeners() {
    // Budget slider
    if (budgetSlider) {
        budgetSlider.addEventListener('input', updateBudgetDisplay);
    }
    
    // Product form selection
    productOptions.forEach(option => {
        option.addEventListener('click', () => selectProductForm(option));
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectProductForm(option);
            }
        });
    });
    
    // Form submission
    if (formulaForm) {
        formulaForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Add API button
    document.querySelector('.btn-secondary')?.addEventListener('click', addAPIRow);
    
    // Initialize tooltips
    initializeTooltips();
}

// Initialize Form Validation
function initializeFormValidation() {
    // Add real-time validation
    const inputs = formulaForm.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Form Validation Functions
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.getAttribute('name') || field.id || field.className;
    
    // Clear any existing error
    clearFieldError(field);
    
    // Check required fields
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, `${getFieldLabel(field)} is required`);
        return false;
    }
    
    // Validate numeric fields
    if (field.type === 'number') {
        const min = parseFloat(field.getAttribute('min')) || 0;
        const max = parseFloat(field.getAttribute('max')) || Infinity;
        const numValue = parseFloat(value);
        
        if (isNaN(numValue)) {
            showFieldError(field, 'Please enter a valid number');
            return false;
        }
        
        if (numValue < min) {
            showFieldError(field, `Value must be at least ${min}`);
            return false;
        }
        
        if (numValue > max) {
            showFieldError(field, `Value must not exceed ${max}`);
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);
    
    // Add error class
    field.classList.add('error');
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--danger-color)';
    errorDiv.style.fontSize = '0.9rem';
    errorDiv.style.marginTop = '5px';
    
    // Insert after field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    
    // Focus on field
    field.focus();
}

function clearFieldError(e) {
    const field = e.target || e;
    field.classList.remove('error');
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function getFieldLabel(field) {
    const label = field.parentNode.querySelector('label') || 
                  document.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace(':', '') : 'This field';
}

// API Row Management
function addAPIRow() {
    const newRow = document.createElement('div');
    newRow.className = 'api-row';
    newRow.innerHTML = `
        <select class="api-select" required>
            <option value="">Select API...</option>
            <option value="paracetamol">Paracetamol (Acetaminophen)</option>
            <option value="ibuprofen">Ibuprofen</option>
            <option value="amoxicillin">Amoxicillin Trihydrate</option>
            <option value="metformin">Metformin HCl</option>
            <option value="omeprazole">Omeprazole</option>
        </select>
        <div class="input-with-unit">
            <input type="number" class="api-strength" min="1" max="2000" value="500" required>
            <span class="unit">mg</span>
        </div>
        <button type="button" class="btn-icon btn-danger" onclick="removeAPIRow(this)" aria-label="Remove ingredient">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    apiContainer.appendChild(newRow);
    
    // Add event listeners to new inputs
    const inputs = newRow.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Animate addition
    newRow.style.opacity = '0';
    newRow.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        newRow.style.transition = 'all 0.3s ease';
        newRow.style.opacity = '1';
        newRow.style.transform = 'translateY(0)';
    }, 10);
}

function removeAPIRow(button) {
    const row = button.closest('.api-row');
    if (row) {
        // Animate removal
        row.style.opacity = '0';
        row.style.transform = 'translateY(-10px)';
        row.style.height = row.offsetHeight + 'px';
        
        setTimeout(() => {
            row.remove();
            // Check if this is the last row
            if (apiContainer.children.length === 0) {
                addAPIRow(); // Always keep at least one row
            }
        }, 300);
    }
}

// Product Form Selection
function selectProductForm(option) {
    const form = option.getAttribute('data-form');
    
    // Update active state
    productOptions.forEach(opt => {
        opt.classList.remove('active');
        opt.setAttribute('aria-checked', 'false');
    });
    
    option.classList.add('active');
    option.setAttribute('aria-checked', 'true');
    productFormInput.value = form;
    
    // Update form visualization
    updateFormVisualization(form);
}

function updateFormVisualization(form) {
    // Add visual feedback for form selection
    const icons = document.querySelectorAll('.product-option i');
    icons.forEach(icon => {
        icon.style.transform = 'scale(1)';
        icon.style.transition = 'transform 0.3s ease';
    });
    
    const activeIcon = document.querySelector(`.product-option[data-form="${form}"] i`);
    if (activeIcon) {
        activeIcon.style.transform = 'scale(1.2)';
    }
}

// Budget Display
function updateBudgetDisplay() {
    if (budgetSlider && budgetValue) {
        const value = budgetSlider.value;
        budgetValue.textContent = `$${value}`;
        
        // Visual feedback
        const percent = ((value - 50) / (500 - 50)) * 100;
        budgetSlider.style.background = `linear-gradient(to right, var(--secondary-color) ${percent}%, #e9ecef ${percent}%)`;
    }
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        showAlert('Please fix the errors in the form before submitting.', 'error');
        return;
    }
    
    // Collect form data
    const formData = collectFormData();
    
    // Show loading state
    showLoading(true);
    
    try {
        // Save form data
        saveFormData(formData);
        
        // Perform optimization
        const results = await performOptimization(formData);
        
        // Display results
        displayResults(results);
        
        // Save results
        saveResults(results);
        
        // Show success message
        showAlert('Formula optimized successfully!', 'success');
        
    } catch (error) {
        console.error('Optimization error:', error);
        showAlert('An error occurred during optimization. Please try again.', 'error');
        
        // Fallback to mock data
        const mockResults = generateMockResults(formData);
        displayResults(mockResults);
    } finally {
        showLoading(false);
    }
}

// Form Validation
function validateForm() {
    let isValid = true;
    
    // Validate all required fields
    const requiredFields = formulaForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    // Validate at least one API
    const apiRows = apiContainer.querySelectorAll('.api-row');
    if (apiRows.length === 0) {
        showAlert('Please add at least one active ingredient.', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Collect Form Data
function collectFormData() {
    const formData = {
        apis: [],
        optimization: {
            primaryGoal: document.getElementById('primaryGoal').value,
            budget: parseInt(budgetSlider.value)
        },
        productForm: productFormInput.value,
        timestamp: new Date().toISOString()
    };
    
    // Collect API data
    const apiRows = apiContainer.querySelectorAll('.api-row');
    apiRows.forEach(row => {
        const apiSelect = row.querySelector('.api-select');
        const apiStrength = row.querySelector('.api-strength');
        
        formData.apis.push({
            name: apiSelect.value,
            displayName: apiSelect.options[apiSelect.selectedIndex].text,
            strength: parseInt(apiStrength.value),
            unit: 'mg'
        });
    });
    
    currentFormData = formData;
    return formData;
}

// Perform Optimization
async function performOptimization(formData) {
    console.log('Performing optimization for:', formData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real application, this would call an actual API
    // For now, generate realistic mock results
    return generateMockResults(formData);
}

// Display Results
function displayResults(results) {
    optimizationResults = results;
    
    // Hide placeholder, show results
    resultsPlaceholder.style.display = 'none';
    resultsContent.style.display = 'block';
    resultsContent.innerHTML = '';
    
    // Generate results HTML
    const resultsHTML = generateResultsHTML(results);
    resultsContent.innerHTML = resultsHTML;
    
    // Scroll to results
    resultsContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Initialize chart if present
    initializeResultsCharts();
    
    // Initialize result actions
    initializeResultActions();
}

// Generate Results HTML
function generateResultsHTML(results) {
    let html = '';
    
    results.forEach((result, index) => {
        html += `
            <div class="result-card" data-result-index="${index}">
                <div class="result-header">
                    <div>
                        <h3 class="result-title">${result.formulationName}</h3>
                        <p class="result-description">${result.description}</p>
                    </div>
                    <div class="result-score">
                        Score: ${result.overallScore}/100
                    </div>
                </div>
                
                <div class="result-metrics">
                    <div class="metric">
                        <span class="metric-label">Cost Efficiency</span>
                        <span class="metric-value ${getMetricClass(result.metrics.cost)}">${result.metrics.cost}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Performance</span>
                        <span class="metric-value ${getMetricClass(result.metrics.performance)}">${result.metrics.performance}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Stability</span>
                        <span class="metric-value ${getMetricClass(result.metrics.stability)}">${result.metrics.stability}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Compliance</span>
                        <span class="metric-value ${getMetricClass(result.metrics.compliance)}">${result.metrics.compliance}%</span>
                    </div>
                </div>
                
                <div class="formulation-details">
                    <h4>Recommended Formulation</h4>
                    <ul class="ingredient-list">
                        ${result.ingredients.map(ing => `
                            <li>
                                <strong>${ing.name}:</strong> ${ing.amount} ${ing.unit}
                                ${ing.cost ? `<span class="ingredient-cost">($${ing.cost})</span>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="cost-analysis">
                    <h4>Cost Analysis</h4>
                    <p>Total Cost: <strong>$${result.costAnalysis.total.toFixed(2)}</strong></p>
                    <p>Estimated Savings: <strong class="savings">$${result.costAnalysis.savings.toFixed(2)}</strong></p>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${result.costAnalysis.efficiency}%"></div>
                    </div>
                </div>
                
                <div class="result-actions">
                    <button class="btn btn-info" onclick="viewDetailedAnalysis(${index})">
                        <i class="fas fa-chart-bar"></i> Detailed Analysis
                    </button>
                    <button class="btn btn-success" onclick="exportResults(${index})">
                        <i class="fas fa-download"></i> Export Formula
                    </button>
                    <button class="btn btn-light" onclick="compareResult(${index})">
                        <i class="fas fa-balance-scale"></i> Compare
                    </button>
                </div>
            </div>
        `;
    });
    
    // Add comparison section if multiple results
    if (results.length > 1) {
        html += `
            <div class="comparison-section">
                <h3><i class="fas fa-balance-scale"></i> Comparison</h3>
                <div class="chart-container">
                    <canvas id="comparisonChart"></canvas>
                </div>
            </div>
        `;
    }
    
    return html;
}

// Helper Functions
function getMetricClass(value) {
    if (value >= 80) return 'high';
    if (value >= 60) return 'medium';
    return 'low';
}

// Show/Hide Loading
function showLoading(show) {
    if (show) {
        resultsPlaceholder.style.display = 'none';
        loadingIndicator.style.display = 'block';
        resultsContent.style.display = 'none';
        optimizeBtn.disabled = true;
        optimizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
    } else {
        loadingIndicator.style.display = 'none';
        optimizeBtn.disabled = false;
        optimizeBtn.innerHTML = '<i class="fas fa-cogs"></i> Optimize Formula with AI';
    }
}

// Show Alert
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) existingAlert.remove();
    
    // Create alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i>
        <span>${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles for close button
    const style = document.createElement('style');
    style.textContent = `
        .alert-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: auto;
            padding: 0 5px;
        }
        .alert-close:hover {
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
    
    // Insert alert
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(alertDiv, mainContent.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function getAlertIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Initialize Tooltips
function initializeTooltips() {
    // Add tooltips to elements with data-tooltip attribute
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('focus', showTooltip);
        element.addEventListener('blur', hideTooltip);
    });
}

function showTooltip(e) {
    const element = e.target;
    const tooltipText = element.getAttribute('data-tooltip');
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-text';
    tooltip.textContent = tooltipText;
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'var(--dark-color)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = 'var(--border-radius)';
    tooltip.style.fontSize = '0.9rem';
    tooltip.style.zIndex = '1000';
    tooltip.style.maxWidth = '200px';
    tooltip.style.wordWrap = 'break-word';
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) + 'px';
    tooltip.style.top = rect.top - 10 + 'px';
    tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
    
    // Add arrow
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.bottom = '-5px';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '5px solid transparent';
    arrow.style.borderRight = '5px solid transparent';
    arrow.style.borderTop = '5px solid var(--dark-color)';
    tooltip.appendChild(arrow);
    
    // Add to DOM
    tooltip.id = 'active-tooltip';
    document.body.appendChild(tooltip);
    
    // Store reference
    element.tooltip = tooltip;
}

function hideTooltip(e) {
    const element = e.target;
    if (element.tooltip) {
        element.tooltip.remove();
        element.tooltip = null;
    }
}

// Data Persistence
function saveFormData(formData) {
    try {
        localStorage.setItem('lastFormulation', JSON.stringify(formData));
    } catch (error) {
        console.error('Failed to save form data:', error);
    }
}

function loadSavedData() {
    try {
        const savedData = localStorage.getItem('lastFormulation');
        if (savedData) {
            const formData = JSON.parse(savedData);
            // Could implement form restoration here
            console.log('Loaded saved form data:', formData);
        }
    } catch (error) {
        console.error('Failed to load saved data:', error);
    }
}

function saveResults(results) {
    try {
        localStorage.setItem('lastResults', JSON.stringify(results));
        localStorage.setItem('resultsTimestamp', new Date().toISOString());
    } catch (error) {
        console.error('Failed to save results:', error);
    }
}

// Help Function
function showHelp() {
    const helpContent = `
        <h2>How to Use Chemical Formula Optimizer</h2>
        
        <h3>1. Configure Active Ingredients</h3>
        <p>Add one or more Active Pharmaceutical Ingredients (APIs) with their strengths.</p>
        
        <h3>2. Set Optimization Goals</h3>
        <p>Choose your primary objective and set a target budget.</p>
        
        <h3>3. Select Product Form</h3>
        <p>Choose between tablet, capsule, or syrup formulation.</p>
        
        <h3>4. Optimize</h3>
        <p>Click "Optimize Formula with AI" to generate optimal formulations.</p>
        
        <h3>Understanding Results</h3>
        <ul>
            <li><strong>Cost Efficiency:</strong> How cost-effective the formulation is</li>
            <li><strong>Performance:</strong> Expected therapeutic effectiveness</li>
            <li><strong>Stability:</strong> Shelf-life and storage stability</li>
            <li><strong>Compliance:</strong> Adherence to regulatory standards</li>
        </ul>
    `;
    
    showModal('Help Guide', helpContent);
}

// Modal Functions
function showModal(title, content) {
    // Remove existing modal
    const existingModal = document.querySelector('.modal');
    if (existingModal) existingModal.remove();
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Add ESC key to close
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
    
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApplication);
} else {
    initApplication();
}

// Make functions globally available
window.addAPIRow = addAPIRow;
window.removeAPIRow = removeAPIRow;
window.showHelp = showHelp;
window.viewDetailedAnalysis = (index) => {
    console.log('View detailed analysis for result:', index);
    // Implement detailed analysis view
};
window.exportResults = (index) => {
    console.log('Export results for result:', index);
    // Implement export functionality
};
window.compareResult = (index) => {
    console.log('Compare result:', index);
    // Implement comparison functionality
};
window.closeModal = closeModal;
