// Main Application JavaScript

let apiRowCounter = 1;
let selectedProductForm = 'tablet';

function initApplication() {
    console.log('Chemical Formula Optimizer initialized');
    
    // Initialize event listeners
    initEventListeners();
    
    // Load API database
    loadAPIDatabase();
    
    // Initialize product form selection
    initProductFormSelection();
    
    // Initialize budget slider
    initBudgetSlider();
    
    // Update API summary
    updateAPISummary();
}

function initEventListeners() {
    // Form submission
    const formulaForm = document.getElementById('formulaForm');
    if (formulaForm) {
        formulaForm.addEventListener('submit', handleFormSubmission);
    }
    
    // API search
    const apiSearch = document.getElementById('apiSearch');
    if (apiSearch) {
        apiSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchAPIs();
            }
        });
    }
    
    // API quantity changes
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('api-quantity-input') || 
            e.target.classList.contains('api-select') ||
            e.target.classList.contains('api-unit-select')) {
            updateAPISummary();
        }
    });
    
    // Help button
    const helpBtn = document.querySelector('[onclick="showHelp()"]');
    if (helpBtn) {
        helpBtn.onclick = showHelp;
    }
}

function initProductFormSelection() {
    const productOptions = document.querySelectorAll('.product-option');
    productOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            productOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Update hidden input
            selectedProductForm = this.dataset.form;
            document.getElementById('productForm').value = selectedProductForm;
            
            console.log('Selected product form:', selectedProductForm);
        });
    });
}

function initBudgetSlider() {
    const budgetSlider = document.getElementById('budget');
    const budgetValue = document.getElementById('budgetValue');
    
    if (budgetSlider && budgetValue) {
        budgetSlider.addEventListener('input', function() {
            budgetValue.textContent = '$' + this.value;
        });
    }
}

function addAPIRow() {
    apiRowCounter++;
    
    const tableBody = document.getElementById('apiTableBody');
    const newRow = document.createElement('tr');
    newRow.id = `apiRow-${apiRowCounter}`;
    
    newRow.innerHTML = `
        <td>
            <select class="api-select" name="api[]" required>
                <option value="">Select API...</option>
                <option value="paracetamol">Paracetamol (Acetaminophen)</option>
                <option value="ibuprofen">Ibuprofen</option>
                <option value="amoxicillin">Amoxicillin Trihydrate</option>
                <option value="metformin">Metformin HCl</option>
                <option value="omeprazole">Omeprazole</option>
                <option value="aspirin">Aspirin</option>
                <option value="caffeine">Caffeine</option>
                <option value="vitamin-c">Vitamin C (Ascorbic Acid)</option>
            </select>
        </td>
        <td>
            <input type="number" 
                   class="api-quantity-input" 
                   name="quantity[]" 
                   min="1" 
                   max="5000" 
                   value="500" 
                   step="1" 
                   required>
        </td>
        <td>
            <select class="api-unit-select" name="unit[]" required>
                <option value="mg" selected>mg</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="µg">µg</option>
                <option value="IU">IU</option>
            </select>
        </td>
        <td class="api-actions">
            <button type="button" 
                    class="btn-icon btn-danger btn-sm" 
                    onclick="removeAPIRow(${apiRowCounter})" 
                    title="Remove API">
                <i class="fas fa-times"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(newRow);
    updateAPISummary();
    
    // Add animation
    newRow.style.opacity = '0';
    newRow.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        newRow.style.transition = 'all 0.3s ease';
        newRow.style.opacity = '1';
        newRow.style.transform = 'translateY(0)';
    }, 10);
}

function removeAPIRow(rowId) {
    const row = document.getElementById(`apiRow-${rowId}`);
    if (row) {
        // Add removal animation
        row.style.transition = 'all 0.3s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            row.remove();
            updateAPISummary();
            
            // If no rows left, add a default row
            const remainingRows = document.querySelectorAll('#apiTableBody tr');
            if (remainingRows.length === 0) {
                addAPIRow();
            }
        }, 300);
    }
}

function updateAPISummary() {
    const apiSelects = document.querySelectorAll('.api-select');
    const apiQuantities = document.querySelectorAll('.api-quantity-input');
    const apiUnits = document.querySelectorAll('.api-unit-select');
    
    let summaryHTML = '<div class="api-list">';
    let totalAPIs = 0;
    
    for (let i = 0; i < apiSelects.length; i++) {
        const apiName = apiSelects[i].options[apiSelects[i].selectedIndex].text;
        const quantity = apiQuantities[i].value;
        const unit = apiUnits[i].value;
        
        if (apiSelects[i].value) {
            summaryHTML += `
                <div class="api-summary-item">
                    <span class="api-name">${apiName}</span>
                    <span class="api-quantity">${quantity} ${unit}</span>
                </div>
            `;
            totalAPIs++;
        }
    }
    
    summaryHTML += '</div>';
    
    const summaryElement = document.getElementById('apiSummary');
    const summaryContent = document.getElementById('summaryContent');
    
    if (totalAPIs > 0) {
        summaryElement.style.display = 'block';
        summaryContent.innerHTML = summaryHTML;
    } else {
        summaryElement.style.display = 'none';
    }
}

function searchAPIs() {
    const searchTerm = document.getElementById('apiSearch').value.toLowerCase();
    const apiTable = document.getElementById('apiDatabaseTable');
    
    if (!apiTable) return;
    
    const rows = apiTable.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < cells.length - 1; j++) { // Exclude last cell (actions)
            if (cells[j].textContent.toLowerCase().includes(searchTerm)) {
                found = true;
                break;
            }
        }
        
        rows[i].style.display = found ? '' : 'none';
    }
}

function loadAPIDatabase() {
    const apiDatabase = [
        {
            name: "Paracetamol",
            formula: "C₈H₉NO₂",
            weight: "151.16 g/mol",
            solubility: "14 mg/mL",
            price: "$45/kg"
        },
        {
            name: "Ibuprofen",
            formula: "C₁₃H₁₈O₂",
            weight: "206.28 g/mol",
            solubility: "0.021 mg/mL",
            price: "$62/kg"
        },
        {
            name: "Amoxicillin",
            formula: "C₁₆H₁₉N₃O₅S",
            weight: "365.40 g/mol",
            solubility: "3.4 mg/mL",
            price: "$120/kg"
        },
        {
            name: "Metformin HCl",
            formula: "C₄H₁₁N₅·HCl",
            weight: "165.62 g/mol",
            solubility: "300 mg/mL",
            price: "$28/kg"
        },
        {
            name: "Omeprazole",
            formula: "C₁₇H₁₉N₃O₃S",
            weight: "345.42 g/mol",
            solubility: "0.5 mg/mL",
            price: "$85/kg"
        },
        {
            name: "Aspirin",
            formula: "C₉H₈O₄",
            weight: "180.16 g/mol",
            solubility: "3 mg/mL",
            price: "$38/kg"
        },
        {
            name: "Caffeine",
            formula: "C₈H₁₀N₄O₂",
            weight: "194.19 g/mol",
            solubility: "21.7 mg/mL",
            price: "$52/kg"
        },
        {
            name: "Vitamin C",
            formula: "C₆H₈O₆",
            weight: "176.12 g/mol",
            solubility: "330 mg/mL",
            price: "$15/kg"
        }
    ];
    
    const tableBody = document.getElementById('apiDatabaseTable')?.querySelector('tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    apiDatabase.forEach(api => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${api.name}</td>
            <td>${api.formula}</td>
            <td>${api.weight}</td>
            <td>${api.solubility}</td>
            <td>${api.price}</td>
            <td>
                <button class="btn btn-success btn-sm add-btn" onclick="addAPIToForm('${api.name}')">
                    <i class="fas fa-plus"></i> Add
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addAPIToForm(apiName) {
    // Find the first empty API row or add a new one
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
    
    // Set the API name
    const select = emptyRow.querySelector('.api-select');
    for (let option of select.options) {
        if (option.text.includes(apiName)) {
            option.selected = true;
            break;
        }
    }
    
    // Highlight the row briefly
    emptyRow.style.backgroundColor = '#e8f5e8';
    setTimeout(() => {
        emptyRow.style.transition = 'background-color 0.5s ease';
        emptyRow.style.backgroundColor = '';
    }, 1000);
    
    updateAPISummary();
}

async function handleFormSubmission(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showAlert('Please fill in all required fields correctly.', 'danger');
        return;
    }
    
    // Show loading indicator
    showLoadingIndicator();
    
    // Collect form data
    const formData = collectFormData();
    
    try {
        // Simulate API call with timeout
        await simulateOptimization(formData);
        
        // Show results
        showResults(formData);
        
    } catch (error) {
        console.error('Optimization error:', error);
        showAlert('An error occurred during optimization. Please try again.', 'danger');
        hideLoadingIndicator();
    }
}

function collectFormData() {
    const apiRows = document.querySelectorAll('#apiTableBody tr');
    const apis = [];
    
    apiRows.forEach(row => {
        const select = row.querySelector('.api-select');
        const quantity = row.querySelector('.api-quantity-input');
        const unit = row.querySelector('.api-unit-select');
        
        if (select.value) {
            apis.push({
                name: select.options[select.selectedIndex].text,
                id: select.value,
                quantity: quantity.value,
                unit: unit.value
            });
        }
    });
    
    return {
        apis: apis,
        primaryGoal: document.getElementById('primaryGoal').value,
        budget: document.getElementById('budget').value,
        productForm: document.getElementById('productForm').value,
        productionScale: document.getElementById('productionScale').value,
        releaseProfile: document.getElementById('releaseProfile').value,
        storageConditions: document.getElementById('storageConditions').value,
        timestamp: new Date().toISOString()
    };
}

function validateForm() {
    // Check if at least one API is selected
    const apiSelects = document.querySelectorAll('.api-select');
    let hasSelectedAPI = false;
    
    for (let select of apiSelects) {
        if (select.value) {
            hasSelectedAPI = true;
            break;
        }
    }
    
    if (!hasSelectedAPI) {
        showAlert('Please select at least one Active Pharmaceutical Ingredient.', 'warning');
        return false;
    }
    
    // Validate quantities
    const quantityInputs = document.querySelectorAll('.api-quantity-input');
    for (let input of quantityInputs) {
        if (input.value <= 0) {
            showAlert('API quantities must be greater than 0.', 'warning');
            input.focus();
            return false;
        }
    }
    
    return true;
}

function showLoadingIndicator() {
    document.getElementById('resultsPlaceholder').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'none';
    document.getElementById('loadingIndicator').style.display = 'block';
    
    // Simulate progress
    const progressBar = document.getElementById('progressBar');
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 95) {
            progress = 95;
            clearInterval(interval);
        }
        progressBar.style.width = progress + '%';
    }, 300);
}

function hideLoadingIndicator() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

async function simulateOptimization(formData) {
    // Simulate AI processing time
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 2000 + Math.random() * 2000);
    });
}

function showResults(formData) {
    hideLoadingIndicator();
    
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.innerHTML = generateResultsHTML(formData);
    resultsContent.style.display = 'block';
    
    // Initialize charts if Chart.js is loaded
    if (typeof Chart !== 'undefined') {
        setTimeout(initializeCharts, 100);
    }
}

function generateResultsHTML(formData) {
    // Calculate totals
    const totalQuantity = formData.apis.reduce((sum, api) => sum + parseFloat(api.quantity), 0);
    
    return `
        <div class="results-header">
            <h3><i class="fas fa-check-circle text-success"></i> Optimization Complete</h3>
            <p class="text-muted">AI has analyzed ${formData.apis.length} APIs and found the optimal formulation</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${formData.apis.length}</div>
                <div class="stat-label">Active APIs</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalQuantity}</div>
                <div class="stat-label">Total Quantity</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$${formData.budget}</div>
                <div class="stat-label">Target Budget</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">94%</div>
                <div class="stat-label">Optimization Score</div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h4><i class="fas fa-table"></i> Optimized Formula Composition</h4>
                <button class="btn btn-secondary btn-sm" onclick="exportToPDF()">
                    <i class="fas fa-download"></i> Export PDF
                </button>
            </div>
            <div class="card-body">
                <table class="api-table">
                    <thead>
                        <tr>
                            <th>API Name</th>
                            <th>Quantity</th>
                            <th>Percentage</th>
                            <th>Estimated Cost</th>
                            <th>Compatibility</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${formData.apis.map((api, index) => `
                            <tr>
                                <td>${api.name}</td>
                                <td>${api.quantity} ${api.unit}</td>
                                <td>${((api.quantity / totalQuantity) * 100).toFixed(1)}%</td>
                                <td>$${(api.quantity * 0.05).toFixed(2)}</td>
                                <td><span class="badge badge-success">Good</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="charts-container">
            <div class="chart-card">
                <div class="chart-title">Cost Distribution</div>
                <canvas id="costChart"></canvas>
            </div>
            <div class="chart-card">
                <div class="chart-title">Performance Metrics</div>
                <canvas id="performanceChart"></canvas>
            </div>
        </div>
        
        <div class="alert alert-success">
            <h4><i class="fas fa-lightbulb"></i> AI Recommendations</h4>
            <ul>
                <li>Consider using sustained release formulation for better patient compliance</li>
                <li>Recommended storage: ${formData.storageConditions}</li>
                <li>Estimated shelf life: 24 months under recommended conditions</li>
                <li>Cost savings: 15% compared to standard formulation</li>
            </ul>
        </div>
        
        <div class="form-actions">
            <button class="btn btn-success" onclick="saveFormulation()">
                <i class="fas fa-save"></i> Save Formulation
            </button>
            <button class="btn btn-info" onclick="runNewOptimization()">
                <i class="fas fa-redo"></i> Run New Optimization
            </button>
        </div>
    `;
}

function showHelp() {
    alert('Chemical Formula Optimizer Help:\n\n1. Add APIs using the table interface\n2. Set your optimization goals\n3. Select product form\n4. Click "Optimize Formula with AI" to get results\n\nFor more detailed help, please refer to the documentation.');
}

function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert alert-${type}`;
    alertDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles for custom alert
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1000';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.maxWidth = '400px';
    alertDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

function resetForm() {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
        const form = document.getElementById('formulaForm');
        form.reset();
        
        // Reset API table to single row
        const tableBody = document.getElementById('apiTableBody');
        tableBody.innerHTML = `
            <tr id="apiRow-1">
                <td>
                    <select class="api-select" name="api[]" required>
                        <option value="">Select API...</option>
                        <option value="paracetamol">Paracetamol (Acetaminophen)</option>
                        <option value="ibuprofen">Ibuprofen</option>
                        <option value="amoxicillin">Amoxicillin Trihydrate</option>
                        <option value="metformin">Metformin HCl</option>
                        <option value="omeprazole">Omeprazole</option>
                        <option value="aspirin">Aspirin</option>
                        <option value="caffeine">Caffeine</option>
                        <option value="vitamin-c">Vitamin C (Ascorbic Acid)</option>
                    </select>
                </td>
                <td>
                    <input type="number" 
                           class="api-quantity-input" 
                           name="quantity[]" 
                           min="1" 
                           max="5000" 
                           value="500" 
                           step="1" 
                           required>
                </td>
                <td>
                    <select class="api-unit-select" name="unit[]" required>
                        <option value="mg" selected>mg</option>
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="µg">µg</option>
                        <option value="IU">IU</option>
                    </select>
                </td>
                <td class="api-actions">
                    <button type="button" 
                            class="btn-icon btn-danger btn-sm" 
                            onclick="removeAPIRow(1)" 
                            title="Remove API">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
        
        // Reset product form selection
        document.querySelectorAll('.product-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector('.product-option[data-form="tablet"]').classList.add('active');
        document.getElementById('productForm').value = 'tablet';
        
        // Reset budget slider
        document.getElementById('budget').value = 200;
        document.getElementById('budgetValue').textContent = '$200';
        
        // Hide results
        document.getElementById('resultsContent').style.display = 'none';
        document.getElementById('resultsPlaceholder').style.display = 'block';
        document.getElementById('loadingIndicator').style.display = 'none';
        
        // Hide API summary
        document.getElementById('apiSummary').style.display = 'none';
        
        apiRowCounter = 1;
        
        showAlert('Form has been reset successfully.', 'success');
    }
}

function exportToPDF() {
    const element = document.getElementById('resultsContent');
    const opt = {
        margin:       1,
        filename:     `formulation-${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}

function saveFormulation() {
    const formData = collectFormData();
    const formulations = JSON.parse(localStorage.getItem('savedFormulations') || '[]');
    
    // Add current formulation
    formulations.push({
        ...formData,
        savedAt: new Date().toISOString(),
        id: Date.now()
    });
    
    // Save to localStorage
    localStorage.setItem('savedFormulations', JSON.stringify(formulations));
    
    showAlert('Formulation saved successfully!', 'success');
}

function runNewOptimization() {
    // Scroll to form
    document.querySelector('.formula-section').scrollIntoView({ behavior: 'smooth' });
    
    // Show placeholder
    document.getElementById('resultsContent').style.display = 'none';
    document.getElementById('resultsPlaceholder').style.display = 'block';
    
    showAlert('Ready for new optimization. Adjust your parameters and click "Optimize".', 'info');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initApplication);
