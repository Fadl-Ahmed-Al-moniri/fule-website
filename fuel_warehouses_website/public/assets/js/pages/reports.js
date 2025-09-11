import { getRequest, postRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { API_ENDPOINTS } from '../endpoint.js';
import { getUserToken } from '../utils/user-token.js';

let currentReportType = null;
let currentReportData = null;
const token = getUserToken();

const filtersPanel = document.getElementById('filtersPanel');
const reportResults = document.getElementById('reportResults');
const warehouseSelect = document.getElementById('warehouseSelect');
const itemSelect = document.getElementById('itemSelect');
const beneficiarySelect = document.getElementById('beneficiarySelect');
const supplierSelect = document.getElementById('supplierSelect');
const stationsSelect = document.getElementById('stationsSelect');
const startDateInput = document.getElementById('startDateInput');
const endDateInput = document.getElementById('endDateInput');
const generateReportBtn = document.getElementById('generateReportBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');

const warehouseReportTemplate = document.getElementById('warehouseReportTemplate');
const itemReportTemplate = document.getElementById('itemReportTemplate');
const statusReportTemplate = document.getElementById('statusReportTemplate');

const reportData = document.getElementById('reportData');
const reportLoading = document.getElementById('reportLoading');
const reportEmpty = document.getElementById('reportEmpty');
const reportTitle = document.getElementById('reportTitle');
const reportSubtitle = document.getElementById('reportSubtitle');
const reportDate = document.getElementById('reportDate');
const reportCount = document.getElementById('reportCount');


async function initializeReports() {
    try {
        showLoader();
        await loadWarehouses();
        await loadItems();
        await loadSuppliers();
        await loadBeneficiaries();
        await loadStations();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize reports:', error);
        alert('Failed to load initial data. Please refresh the page.');
    } finally {
        hideLoader();
    }
}


async function loadWarehouses() {
    try {
        const response = await getRequest(API_ENDPOINTS.Inventory.warehouses, token);
        
        if (response.status === 200) {
            warehouseSelect.innerHTML = '<option value="">Select Warehouse</option>';
            response.data.forEach(warehouse => {
                const option = document.createElement('option');
                option.value = warehouse.id;
                option.textContent = warehouse.name;
                warehouseSelect.appendChild(option);
            });
        } else {
            throw new Error('Failed to load warehouses');
        }
    } catch (error) {
        console.error('Error loading warehouses:', error);
        warehouseSelect.innerHTML = '<option value="">Error loading warehouses</option>';
    }
}
async function loadItems() {
    try {
        const response = await getRequest(API_ENDPOINTS.Inventory.items, token);
        
        if (response.status === 200) {
            itemSelect.innerHTML = '<option value="">Select Item</option>';
            response.data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name;
                itemSelect.appendChild(option);
            });
        } else {
            throw new Error('Failed to load items');
        }
    } catch (error) {
        console.error('Error loading items:', error);
        itemSelect.innerHTML = '<option value="">Error loading items</option>';
    }
}

async function loadSuppliers() {
    try {
        const response = await getRequest(API_ENDPOINTS.Accounts.suppliers, token);
        
        if (response.status === 200) {
            supplierSelect.innerHTML = '<option value="">Select Supply</option>';
            response.data.forEach(supplier => {
                const option = document.createElement('option');
                option.value = supplier.id;
                option.textContent = supplier.name;
                supplierSelect.appendChild(option);
            });
        } else {
            throw new Error('Failed to load supplieres');
        }
    } catch (error) {
        console.error('Error loading supplieres:', error);
        supplierSelect.innerHTML = '<option value="">Error loading supplieres</option>';
    }
}
async function loadBeneficiaries() {
    try {
        const response = await getRequest(API_ENDPOINTS.Accounts.beneficiaries, token);
        
        if (response.status === 200) {
            beneficiarySelect.innerHTML = '<option value="">Select Beneficiary</option>';
            response.data.forEach(beneficiary => {
                const option = document.createElement('option');
                option.value = beneficiary.id;
                option.textContent = beneficiary.name;
                beneficiarySelect.appendChild(option);
            });
        } else {
            throw new Error('Failed to load beneficiaries');
        }
    } catch (error) {
        console.error('Error loading beneficiaries:', error);
        beneficiarySelect.innerHTML = '<option value="">Error loading Beneficiary</option>';
    }
}
async function loadStations() {
    try {
        const response = await getRequest(API_ENDPOINTS.Inventory.stations, token);
        
        if (response.status === 200) {
            stationsSelect.innerHTML = '<option value="">Select Station</option>';
            response.data.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = station.name;
                stationsSelect.appendChild(option);
            });
        } else {
            throw new Error('Failed to load stations');
        }
    } catch (error) {
        console.error('Error loading beneficiaries:', error);
        stationsSelect.innerHTML = '<option value="">Error loading stations</option>';
    }
}



function setupEventListeners() {
    generateReportBtn.addEventListener('click', handleGenerateReport);
    exportExcelBtn.addEventListener('click', () => handleExport('xlsx'));
    exportPdfBtn.addEventListener('click', () => handleExport('pdf'));
}

/**
 * Select report type and show appropriate filters
 * @param {string} reportType - Type of report (warehouse, item, status)
 */
window.selectReportType = function(reportType) {
    currentReportType = reportType;
    
    // Show filters panel
    filtersPanel.style.display = 'block';
    
    // Hide report results if visible
    reportResults.style.display = 'none';
    
    // Configure filters based on report type
    const warehouseFilter = document.getElementById('warehouseFilter');
    const itemFilter = document.getElementById('itemFilter');
    const beneficiaryFilter = document.getElementById('beneficiaryFilter');
    const supplierFilter = document.getElementById('supplierFilter');
    const stationsFilter = document.getElementById('stationsFilter');
    
    switch (reportType) {
        case 'warehouse':
            warehouseFilter.style.display = 'block';
            itemFilter.style.display = 'none';
            supplierFilter.style.display = 'none';
            stationsFilter.style.display = 'none';
            beneficiaryFilter.style.display = 'none';
            reportTitle.textContent = 'General Warehouse Report';
            break;
        case 'item':
            warehouseFilter.style.display = 'none';
            itemFilter.style.display = 'block';
            supplierFilter.style.display = 'none';
            stationsFilter.style.display = 'none';
            beneficiaryFilter.style.display = 'none';
            reportTitle.textContent = 'Item Movement Report';
            break;
        case 'status':
            warehouseFilter.style.display = 'block';
            itemFilter.style.display = 'none';
            supplierFilter.style.display = 'none';
            stationsFilter.style.display = 'none';
            beneficiaryFilter.style.display = 'none';
            reportTitle.textContent = 'Warehouse Status Report';
            break;
        case 'item_status':
            warehouseFilter.style.display = 'none';
            supplierFilter.style.display = 'none';
            stationsFilter.style.display = 'none';
            beneficiaryFilter.style.display = 'none';            
            itemFilter.style.display = 'block';
            reportTitle.textContent = 'Item Status Report';
            break;
        case 'beneficiary_outgoing':
            warehouseFilter.style.display = 'none';
            itemFilter.style.display = 'none';
            supplierFilter.style.display = 'none';
            stationsFilter.style.display = 'none';
            beneficiaryFilter.style.display = 'block';
            break;
        case 'supply_by_supplier':
            warehouseFilter.style.display = 'none';
            itemFilter.style.display = 'none';
            supplierFilter.style.display = 'block';
            stationsFilter.style.display = 'none';
            beneficiaryFilter.style.display = 'none';
            break;
        case 'supply_by_station':
            warehouseFilter.style.display = 'none';
            itemFilter.style.display = 'none';
            supplierFilter.style.display = 'none';
            stationsFilter.style.display = 'block';
            beneficiaryFilter.style.display = 'none';
            break;
    }
    
    // Scroll to filters panel
    filtersPanel.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Clear all filters
 */
window.clearFilters = function() {
    warehouseSelect.value = '';
    itemSelect.value = '';
    beneficiarySelect.value = '';
    stationsSelect.value = '';
    supplierSelect.value = '';
    startDateInput.value = '';
    endDateInput.value = '';
    
    // Hide results
    reportResults.style.display = 'none';
    currentReportData = null;
    
    // Disable export buttons
    exportExcelBtn.disabled = true;
    exportPdfBtn.disabled = true;
}

/**
 * Handle report generation
 */
async function handleGenerateReport() {
    if (!currentReportType) {
        alert('Please select a report type first.');
        return;
    }
    
    // Validate required filters
    if (!validateFilters()) {
        return;
    }
    
    try {
        showLoader();
        
        // Show report results section
        reportResults.style.display = 'block';
        reportData.style.display = 'none';
        reportLoading.style.display = 'block';
        reportEmpty.style.display = 'none';
        
        // Scroll to results
        reportResults.scrollIntoView({ behavior: 'smooth' });
        
        // Generate report based on type
        let reportResponse;
        switch (currentReportType) {
            case 'warehouse':
                reportResponse = await generateWarehouseReport();
                break;
            case 'item':
                reportResponse = await generateItemReport();
                break;
            case 'status':
                reportResponse = await generateStatusReport();
                break;
            case 'item_status':
                reportResponse = await generateItemStatusReport();
                break;
            case 'beneficiary_outgoing':
                reportResponse = await generateBeneficiaryReport();
            
                break;
            case 'supply_by_supplier':
                reportResponse = await generateSupplierReport();
                break;
            case 'supply_by_station':
                reportResponse =await generatestationsReport();
                break;
    }
        
        if (reportResponse && reportResponse.status === 200) {
            currentReportData = reportResponse.data;
            displayReportData();
            
            // Enable export buttons
            exportExcelBtn.disabled = false;
            exportPdfBtn.disabled = false;
        } else {
            showEmptyState();
        }
        
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report. Please try again.');
        showEmptyState();
    } finally {
        hideLoader();
        reportLoading.style.display = 'none';
    }
}

/**
 * Validate filters based on report type
 */
function validateFilters() {
    switch (currentReportType) {
        case 'warehouse':
            if (!warehouseSelect.value) {
                alert('Please select a warehouse.');
                return false;
            }
            break;
        case 'item':
            if (!itemSelect.value) {
                alert('Please select an item.');
                return false;
            }
            break;
        case 'status':
            // Status report can work without specific filters
            break;
    }
    return true;
}

/**
 * Generate warehouse report
 */
async function generateWarehouseReport() {
    const params = {
        warehouse_id: warehouseSelect.value
    };
    
    if (startDateInput.value) {
        params.start_date = startDateInput.value;
    }
    if (endDateInput.value) {
        params.end_date = endDateInput.value;
    }
    
    return await getRequest(API_ENDPOINTS.Reports.warehouseReport, token, params);
}

/**
 * Generate item report
 */
async function generateItemReport() {
    const params = {
        item_id: itemSelect.value
    };
    
    if (startDateInput.value) {
        params.start_date = startDateInput.value;
    }
    if (endDateInput.value) {
        params.end_date = endDateInput.value;
    }
    
    return await getRequest(API_ENDPOINTS.Reports.itemReport, token, params);
}



async function generateBeneficiaryReport() {
    const params = {
        beneficiary_id: beneficiarySelect.value
    };
    
    if (startDateInput.value) {
        params.start_date = startDateInput.value;
    }
    if (endDateInput.value) {
        params.end_date = endDateInput.value;
    }
    
    return await getRequest(API_ENDPOINTS.Reports.beneficiaryReport, token, params);
}
async function generateSupplierReport() {
    const params = {
        supplier_id: supplierSelect.value
    };
    
    if (startDateInput.value) {
        params.start_date = startDateInput.value;
    }
    if (endDateInput.value) {
        params.end_date = endDateInput.value;
    }
    
    return await getRequest(API_ENDPOINTS.Reports.supplierReport, token, params);
}
async function generatestationsReport() {
    const params = {
        stations_id: stationsSelect.value
    };
    
    if (startDateInput.value) {
        params.start_date = startDateInput.value;
    }
    if (endDateInput.value) {
        params.end_date = endDateInput.value;
    }
    
    return await getRequest(API_ENDPOINTS.Reports.stationsReport, token, params);
}

async function generateItemStatusReport() {
    const params = {
        item_id: itemSelect.value
    };
    
    if (startDateInput.value) {
        params.start_date = startDateInput.value;
    }
    if (endDateInput.value) {
        params.end_date = endDateInput.value;
    }
    
    return await getRequest(API_ENDPOINTS.Reports.itemStatus, token, params);
}

/**
 * Generate status report
 */
async function generateStatusReport() {
    const params = {};
    
    if (warehouseSelect.value) {
        params.warehouse_id = warehouseSelect.value;
    }
    
    return await getRequest(API_ENDPOINTS.Reports.statusReport, token, params);
}

/**
 * Display report data in the appropriate template
 */
function displayReportData() {
    // Hide all templates first
    document.querySelectorAll('.report-template').forEach(template => {
        template.style.display = 'none';
    });
    
    // Show report data container
    reportData.style.display = 'block';
    
    // Update report metadata
    reportDate.textContent = new Date().toLocaleDateString();
    
    // Display data based on report type
    switch (currentReportType) {
        case 'warehouse':
            displayWarehouseReport();
            break;
        case 'item':
            displayItemReport();
            break;
        case 'status':
            displayStatusReport();
            break;
        case 'item_status':
            displayStatusReport();
            break;
        case 'beneficiary_outgoing':
            displayBeneficiaryReport();
            break;
        case 'supply_by_supplier':
            displaySupplierReport();
            break;
        case 'supply_by_station':
            displayStationsReport();
            break;  
    }
}


/**
 * Display warehouse report data
 */
function displayWarehouseReport() {
    warehouseReportTemplate.style.display = 'block';
    
    const data = currentReportData;
    let totalRecords = 0;
    
    // Display supplies
    if (data.supplies && data.supplies.length > 0) {
        displaySupplies(data.supplies);
        totalRecords += data.supplies.length;
        document.getElementById('suppliesCount').textContent = `(${data.supplies.length})`;
    } else {
        document.getElementById('suppliesSection').style.display = 'none';
    }
    
    // Display dispatches
    if (data.dispatches && data.dispatches.length > 0) {
        displayDispatches(data.dispatches);
        totalRecords += data.dispatches.length;
        document.getElementById('dispatchesCount').textContent = `(${data.dispatches.length})`;
    } else {
        document.getElementById('dispatchesSection').style.display = 'none';
    }
    
    // Display returns
    if (data.returns) {
        const returnsTotal = displayReturns(data.returns);
        totalRecords += returnsTotal;
        document.getElementById('returnsCount').textContent = `(${returnsTotal})`;
        
        if (returnsTotal === 0) {
            document.getElementById('returnsSection').style.display = 'none';
        }
    } else {
        document.getElementById('returnsSection').style.display = 'none';
    }
    
    // Display damages
    if (data.damages && data.damages.length > 0) {
        displayDamages(data.damages);
        totalRecords += data.damages.length;
        document.getElementById('damagesCount').textContent = `(${data.damages.length})`;
    } else {
        document.getElementById('damagesSection').style.display = 'none';
    }
    
    reportCount.textContent = `${totalRecords} records found`;
}

/**
 * Display supplies data
 */
function displaySupplies(supplies) {
    const tbody = document.getElementById('suppliesTableBody');
    tbody.innerHTML = '';
    
    supplies.forEach(supply => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        
        const itemsHtml = supply.items.map(item => 
            `<div class="text-sm">${item.item_name}: <span class="font-medium">${parseFloat(item.quantity).toLocaleString()}</span></div>`
        ).join('');
        
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">#${supply.id}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${formatDate(supply.operation_date)}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${supply.supplier_name}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${itemsHtml}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Display dispatches data
 */
function displayDispatches(dispatches) {
    const tbody = document.getElementById('dispatchesTableBody');
    tbody.innerHTML = '';
    
    dispatches.forEach(dispatch => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        
        const itemsHtml = dispatch.items.map(item => 
            `<div class="text-sm">${item.item_name}: <span class="font-medium">${parseFloat(item.quantity).toLocaleString()}</span></div>`
        ).join('');
        
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">#${dispatch.id}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${formatDate(dispatch.operation_date)}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${dispatch.beneficiary_name}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${itemsHtml}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Display returns data
 */
function displayReturns(returns) {
    let totalReturns = 0;
    
    // Supply returns
    const supplyReturnsBody = document.getElementById('supplyReturnsTableBody');
    supplyReturnsBody.innerHTML = '';
    
    if (returns.supply_returns && returns.supply_returns.length > 0) {
        returns.supply_returns.forEach(returnOp => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
            
            const itemsHtml = returnOp.returned_items.map(item => 
                `<div class="text-sm">${item.item_name}: <span class="font-medium">${parseFloat(item.returned_quantity).toLocaleString()}</span></div>`
            ).join('');
            
            row.innerHTML = `
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">#${returnOp.id}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${formatDate(returnOp.operation_date)}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">#${returnOp.original_operation_id}</td>
                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${returnOp.reason || 'N/A'}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${itemsHtml}</td>
            `;
            
            supplyReturnsBody.appendChild(row);
        });
        totalReturns += returns.supply_returns.length;
    } else {
        document.getElementById('supplyReturnsSubsection').style.display = 'none';
    }
    
    // Dispatch returns
    const dispatchReturnsBody = document.getElementById('dispatchReturnsTableBody');
    dispatchReturnsBody.innerHTML = '';
    
    if (returns.dispatch_returns && returns.dispatch_returns.length > 0) {
        returns.dispatch_returns.forEach(returnOp => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
            
            const itemsHtml = returnOp.returned_items.map(item => 
                `<div class="text-sm">${item.item_name}: <span class="font-medium">${parseFloat(item.returned_quantity).toLocaleString()}</span></div>`
            ).join('');
            
            row.innerHTML = `
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">#${returnOp.id}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${formatDate(returnOp.operation_date)}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">#${returnOp.original_operation_id}</td>
                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${returnOp.reason || 'N/A'}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${itemsHtml}</td>
            `;
            
            dispatchReturnsBody.appendChild(row);
        });
        totalReturns += returns.dispatch_returns.length;
    } else {
        document.getElementById('dispatchReturnsSubsection').style.display = 'none';
    }
    
    return totalReturns;
}

/**
 * Display damages data
 */
function displayDamages(damages) {
    const tbody = document.getElementById('damagesTableBody');
    tbody.innerHTML = '';
    
    damages.forEach(damage => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        
        const itemsHtml = damage.items.map(item => 
            `<div class="text-sm">${item.item_name}: <span class="font-medium">${parseFloat(item.damaged_quantity).toLocaleString()}</span></div>`
        ).join('');
        
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">#${damage.id}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${formatDate(damage.operation_date)}</td>
            <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${damage.reason || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${itemsHtml}</td>
        `;
        
        tbody.appendChild(row);
    });
}


function displayItemReport() {
    itemReportTemplate.style.display = 'block';
    
    const data = currentReportData;
    const tbody = document.getElementById('itemMovementsTableBody');
    tbody.innerHTML = '';
    
    let totalRecords = 0;
    const allMovements = [];
    
    // Collect all movements from different operation types
    if (data.supplies) {
        data.supplies.forEach(supply => {
            supply.items.forEach(item => {
                allMovements.push({
                    date: supply.operation_date,
                    type: 'Supply',
                    warehouse: supply.warehouse_name,
                    quantity: `+${parseFloat(item.quantity).toLocaleString()}`,
                    details: `From: ${supply.supplier_name}`,
                    sortDate: new Date(supply.operation_date)
                });
            });
        });
    }
    
    if (data.dispatches) {
        data.dispatches.forEach(dispatch => {
            dispatch.items.forEach(item => {
                allMovements.push({
                    date: dispatch.operation_date,
                    type: 'Dispatch',
                    warehouse: dispatch.warehouse_name,
                    quantity: `-${parseFloat(item.quantity).toLocaleString()}`,
                    details: `To: ${dispatch.beneficiary_name}`,
                    sortDate: new Date(dispatch.operation_date)
                });
            });
        });
    }
    if (data.returns) {
      if (data.returns.supply_returns && data.returns.supply_returns.length > 0) {
        data.returns.supply_returns.forEach(supply => {
        supply.returned_items.forEach(item => {
                allMovements.push({
                    date: supply.operation_date,
                    type: 'Supply Returns',
                    warehouse: supply.warehouse_name,
                    quantity: `+${parseFloat(item.returned_quantity).toLocaleString()}`,
                    sortDate: new Date(supply.operation_date)
                });
            });
        }); 
      
      }
    if (data.returns.dispatch_returns && data.returns.dispatch_returns.length > 0) {
        data.returns.dispatch_returns.forEach(dispatch => {
            dispatch.returned_items.forEach(item => {
                allMovements.push({
                    date: dispatch.operation_date,
                    type: 'Dispatch Returns',
                    warehouse: dispatch.warehouse_name,
                    quantity: `-${parseFloat(item.returned_quantity).toLocaleString()}`,
                    sortDate: new Date(dispatch.operation_date)
                });
            });
        });
      }
      }

    // Add other operation types...
    
    // Sort by date (newest first)
    allMovements.sort((a, b) => b.sortDate - a.sortDate);
    
    // Display movements
    allMovements.forEach(movement => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        
        const quantityClass = movement.quantity.startsWith('+') ? 'text-green-600' : 'text-red-600';
        
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${formatDate(movement.date)}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${getOperationTypeClass(movement.type)}">
                    ${movement.type}
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${movement.warehouse}</td>
            <td class="px-4 py-3 text-sm font-medium ${quantityClass}">${movement.quantity}</td>
            <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${movement.details}</td>
        `;
        
        tbody.appendChild(row);
        totalRecords++;
    });
    
    reportCount.textContent = `${totalRecords} movements found`;
}

/**
 * Display status report data
 */
function displayStatusReport() {
    statusReportTemplate.style.display = 'block';
    
    const data = currentReportData;
    const tbody = document.getElementById('warehouseStatusTableBody');
    tbody.innerHTML = '';
    
    if (data && data.length > 0) {
        data.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
            
            // Color code based on stock level
            const stockLevel = parseFloat(item.current_quantity);
            const openingBalance = parseFloat(item.opening_balance);
            const stockClass = stockLevel < (openingBalance * 0.2) ? 'text-red-600' : 
                              stockLevel < (openingBalance * 0.5) ? 'text-yellow-600' : 'text-green-600';
            
            row.innerHTML = `
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${item.warehouse_name}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${item.item_name}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${parseFloat(item.opening_balance).toLocaleString()}</td>
                <td class="px-4 py-3 text-sm font-medium ${stockClass}">${parseFloat(item.current_quantity).toLocaleString()}</td>
                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${item.unit_of_measure}</td>
                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${formatDate(item.last_updated)}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        reportCount.textContent = `${data.length} items found`;
    } else {
        showEmptyState();
    }
}


function displayBeneficiaryReport() {
    itemReportTemplate.style.display = 'block';
    
    const data = currentReportData;
    const tbody = document.getElementById('itemMovementsTableBody');
    tbody.innerHTML = '';
    
    let totalRecords = 0;
    const allMovements = [];
    
    // Collect all movements from different operation types
    if (data && data != null) {
        data.forEach(expor => {
            expor.items.forEach(item => {
                allMovements.push({
                    date: expor.operation_date,
                    type: 'Beneficiary',
                    warehouse: expor.warehouse_name,
                    quantity: `+${parseFloat(item.quantity).toLocaleString()}`,
                    details: `From: ${expor.beneficiary_name}`,
                    sortDate: new Date(expor.operation_date)
                });
            });
        });
    }
    
    allMovements.sort((a, b) => b.sortDate - a.sortDate);
    
    // Display movements
    allMovements.forEach(movement => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        
        const quantityClass = movement.quantity.startsWith('+') ? 'text-green-600' : 'text-red-600';
        
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${formatDate(movement.date)}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${getOperationTypeClass(movement.type)}">
                    ${movement.type}
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${movement.warehouse}</td>
            <td class="px-4 py-3 text-sm font-medium ${quantityClass}">${movement.quantity}</td>
            <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${movement.details}</td>
        `;
        
        tbody.appendChild(row);
        totalRecords++;
    });
    
    reportCount.textContent = `${totalRecords} movements found`;
}


function displaySupplierReport() {
    itemReportTemplate.style.display = 'block';
    
    const data = currentReportData;
    const tbody = document.getElementById('itemMovementsTableBody');
    tbody.innerHTML = '';
    
    let totalRecords = 0;
    const allMovements = [];
    
    // Collect all movements from different operation types
    if (data && data != null) {
        data.forEach(supplier => {
            supplier.items.forEach(item => {
                allMovements.push({
                    date: supplier.operation_date,
                    type: 'Supplier',
                    warehouse: supplier.warehouse_name,
                    quantity: `+${parseFloat(item.quantity).toLocaleString()}`,
                    details: `From: ${supplier.supplier_name}`,
                    sortDate: new Date(supplier.operation_date)
                });
            });
        });
    }
    
    allMovements.sort((a, b) => b.sortDate - a.sortDate);
    
    // Display movements
    allMovements.forEach(movement => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        
        const quantityClass = movement.quantity.startsWith('+') ? 'text-green-600' : 'text-red-600';
        
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${formatDate(movement.date)}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${getOperationTypeClass(movement.type)}">
                    ${movement.type}
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${movement.warehouse}</td>
            <td class="px-4 py-3 text-sm font-medium ${quantityClass}">${movement.quantity}</td>
            <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${movement.details}</td>
        `;
        
        tbody.appendChild(row);
        totalRecords++;
    });
    
    reportCount.textContent = `${totalRecords} movements found`;
}
function displayStationsReport() {
    itemReportTemplate.style.display = 'block';
    
    const data = currentReportData;
    const tbody = document.getElementById('itemMovementsTableBody');
    tbody.innerHTML = '';
    
    let totalRecords = 0;
    const allMovements = [];
    
    // Collect all movements from different operation types
    if (data && data != null) {
        data.forEach(stations => {
            stations.items.forEach(item => {
                allMovements.push({
                    date: stations.operation_date,
                    type: 'Stations',
                    warehouse: stations.warehouse_name,
                    quantity: `+${parseFloat(item.quantity).toLocaleString()}`,
                    details: `From: ${stations.supplier_name}`,
                    sortDate: new Date(stations.operation_date)
                });
            });
        });
    }
    
    allMovements.sort((a, b) => b.sortDate - a.sortDate);
    
    // Display movements
    allMovements.forEach(movement => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
        
        const quantityClass = movement.quantity.startsWith('+') ? 'text-green-600' : 'text-red-600';
        
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${formatDate(movement.date)}</td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${getOperationTypeClass(movement.type)}">
                    ${movement.type}
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${movement.warehouse}</td>
            <td class="px-4 py-3 text-sm font-medium ${quantityClass}">${movement.quantity}</td>
            <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${movement.details}</td>
        `;
        
        tbody.appendChild(row);
        totalRecords++;
    });
    
    reportCount.textContent = `${totalRecords} movements found`;
}


/**
 * Show empty state
 */
function showEmptyState() {
    reportData.style.display = 'none';
    reportEmpty.style.display = 'block';
    reportCount.textContent = '0 records found';
    
    // Disable export buttons
    exportExcelBtn.disabled = true;
    exportPdfBtn.disabled = true;
}

/**
 * Handle export functionality
 */
async function handleExport(format) {
    if (!currentReportData || !currentReportType) {
        alert('No report data to export.');
        return;
    }
    
    try {
        showLoader();
        
        // Build export parameters
        const params = { format };
        
        switch (currentReportType) {
            case 'warehouse':
                params.warehouse_id = warehouseSelect.value;
                break;
            case 'item':
                params.item_id = itemSelect.value;
                break;
            case 'status':
                if (warehouseSelect.value) {
                    params.warehouse_id = warehouseSelect.value;
                }
                break;
            case 'item_status':
                params.item_id = itemSelect.value;
                break;
            case 'beneficiary_outgoing':
                params.beneficiary_id = beneficiarySelect.value;
                break;
            case 'supply_by_supplier':
                params.supplier_id = supplierSelect.value;
                break;
            case 'supply_by_station':
                params.stations_id = stationsSelect.value;
                break;
          }
        
        if (startDateInput.value) params.start_date = startDateInput.value;
        if (endDateInput.value) params.end_date = endDateInput.value;
        
        // Get the appropriate export endpoint
        let exportEndpoint;
        switch (currentReportType) {
            case 'warehouse':
                exportEndpoint = API_ENDPOINTS.Reports.warehouseReport;
                break;
            case 'item':
                exportEndpoint = API_ENDPOINTS.Reports.itemReport;
                break;
            case 'status':
                exportEndpoint = API_ENDPOINTS.Reports.statusReport;
                break;
            case 'item_status':
                exportEndpoint = API_ENDPOINTS.Reports.itemStatus;
                break;
            case 'beneficiary_outgoing':
                exportEndpoint = API_ENDPOINTS.Reports.beneficiaryReport;
            
                break;
            case 'supply_by_supplier':
                exportEndpoint = API_ENDPOINTS.Reports.supplierReport;
                break;
            case 'supply_by_station':
                exportEndpoint = API_ENDPOINTS.Reports.stationsReport;
                break;        }
        
        // Create download link
        const queryString = new URLSearchParams(params).toString();
        const downloadUrl = `${exportEndpoint}?${queryString}`;
        
        // Trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${currentReportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export report. Please try again.');
    } finally {
        hideLoader();
    }
}

/**
 * Close report results
 */
window.closeReport = function() {
    reportResults.style.display = 'none';
    currentReportData = null;
    
    // Disable export buttons
    exportExcelBtn.disabled = true;
    exportPdfBtn.disabled = true;
}

/**
 * Utility function to format dates
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get CSS class for operation type badge
 */
function getOperationTypeClass(type) {
    switch (type.toLowerCase()) {
        case 'supply':
            return 'bg-green-100 text-green-800';
        case 'dispatch':
            return 'bg-red-100 text-red-800';
        case 'return':
            return 'bg-yellow-100 text-yellow-800';
        case 'damage':
            return 'bg-orange-100 text-orange-800';
        case 'transfer':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeReports);

