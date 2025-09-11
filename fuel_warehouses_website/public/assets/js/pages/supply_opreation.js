
import { postRequest, getRequest, deleteRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';



const token = getUserToken();

const operationsBody = document.getElementById('operationsBody');
const noOperationsMsg = document.getElementById('no_operations');
const form = document.getElementById('supply_form');
const addItemBtn = document.getElementById('addItemBtn');
const itemsTbody = document.getElementById('itemsTbody');

const warehouseSelect = document.getElementById('warehouse_select');
const supplierSelect = document.getElementById('supplier_select');
const stationSelect = document.getElementById('station_select');
const operationDateInput = document.getElementById('operation_date');
const paperRefInput = document.getElementById('paper_ref_number');
const supplyBonInput = document.getElementById('supply_bon_number');
const delivererNameInput = document.getElementById('delivere_job_name');
const delivererJobNumInput = document.getElementById('delivere_job_number');
const recipientJobInput = document.getElementById('recipient_job'); 
const statementInput = document.getElementById('operation_statement');
const descriptionInput = document.getElementById('operation_descrabtion');
const attachmentsInput = document.getElementById('attachments');


const modifyForm = document.getElementById('modify_form');
const originalItemLineIdInput = document.getElementById('original_item_line_id');
const modifyItemInfo = document.getElementById('modifyItemInfo');
const oldQuantityInput = document.getElementById('old_quantity');
const newQuantityInput = document.getElementById('new_quantity');
const modificationDateInput = document.getElementById('modification_date');
const modificationReasonInput = document.getElementById('modification_reason');


/**
 * @param {HTMLElement} selectElement 
 * @param {string} endpoint 
 * @param {string} placeholder 
 */
async function populateSelect(selectElement, endpoint, placeholder) {
    try {
        const res = await getRequest(endpoint, token);
        if (res.status !== 200) throw new Error(`Failed to fetch data for ${placeholder}`);
        
        selectElement.innerHTML = `<option value="">${placeholder}</option>`; 
        
        res.data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error(`Error populating ${placeholder}:`, error);
        selectElement.innerHTML = `<option value="">Error loading data</option>`;
    }
}

function addNewItemRow() {
    const newRow = document.createElement('tr');
    newRow.className = 'item-row hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
    newRow.innerHTML = `
        <td class="px-4 py-2">
            <select class="form-select text-sm item-select" required>
                <option value="">Loading items...</option>
            </select>
        </td>
        <td class="px-4 py-2">
            <input type="number" class="form-input text-sm quantity-input" placeholder="0.00" min="0.01" step="0.01" required>
        </td>
        <td class="px-4 py-2">
            <button type="button" class="btn-danger text-xs remove-item">Remove</button>
        </td>
    `;
    itemsTbody.appendChild(newRow);
    
    populateSelect(newRow.querySelector('.item-select'), API_ENDPOINTS.Inventory.items, 'Select Item');

    newRow.querySelector('.remove-item').addEventListener('click', () => {
        newRow.remove();
    });
}

async function loadSupplyOperations() {
    
        try {
            showLoader();
            const res = await getRequest(API_ENDPOINTS.Operations.supply, token);
            if (res.status !== 200) throw new Error('Failed to fetch operations');

            operationsBody.innerHTML = '';
            const data = res.data?.results || res.data || [];

            if (data.length === 0) {
                noOperationsMsg.classList.remove('hidden');
                return;
            }
            noOperationsMsg.classList.add('hidden');


        data.forEach(op => {
            const tr = document.createElement('tr');
            tr.className = 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150';
            
            tr.dataset.operationId = op.id;
            tr.dataset.warehouseName = op.warehouse_name;

            const operationDate = op.operation_date ? new Date(op.operation_date).toLocaleDateString('en-GB') : 'N/A';

            const itemsTableHtml = `
                <div class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Returned</th>
                                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Effective</th>
                                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                            ${(op.items_details || []).map(item => {
                                const formattedQuantity = parseFloat(item.quantity).toLocaleString('en-US');
                                const formattedReturnedQuantity = parseFloat(item.returned_quantity).toLocaleString('en-US');
                                const formattedEffectiveQuantity = parseFloat(item.effective_quantity).toLocaleString('en-US');

                                return `
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td class="px-3 py-3 whitespace-nowrap text-sm font-semibold">${item.item_name}</td>
                                        <td class="px-3 py-3 whitespace-nowrap text-sm">${formattedQuantity}</td>
                                        <td class="px-3 py-3 whitespace-nowrap text-sm">${formattedReturnedQuantity}</td>
                                        <td class="px-3 py-3 whitespace-nowrap text-sm font-bold">${formattedEffectiveQuantity}</td>
                                        <td class="px-3 py-3 whitespace-nowrap text-sm">
                                            <button 
                                                class="modify-item-btn btn-primary text-xs"
                                                @click="openModifyModal" 
                                                data-item-line-id="${item.id}"
                                                data-item-name="${item.item_name}"
                                                data-current-quantity="${item.effective_quantity}">
                                                Modify
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // بناء الصف الكامل للجدول
            tr.innerHTML = `
                <td class="px-4 py-4 text-sm align-top">#${op.id}</td>
                <td class="px-4 py-4 text-sm align-top">${op.warehouse_name}</td>
                <td class="px-4 py-4 text-sm align-top">${op.supplier_name}</td>
                <td class="px-4 py-4 text-sm align-top">${op.stations_name || 'N/A'}</td>
                <td class="px-4 py-4 text-sm align-top">${operationDate}</td>
                <td class="px-4 py-4 text-sm sm:table-cell">${itemsTableHtml}</td>
                <td class="px-4 py-4 text-sm md:table-cell align-top">${op.paper_ref_number || ''}</td>
                <td class="px-4 py-4 text-sm md:table-cell align-top">${op.supply_bon_number || ''}</td>
                <td class="px-4 py-4 text-sm lg:table-cell align-top">${op.delivere_job_name || ''}</td>
                <td class="px-4 py-4 text-sm lg:table-cell align-top">${op.recipient_user_name || 'N/A'}</td>
                <td class="px-4 py-4 text-sm lg:table-cell align-top">${op.operation_statement || 'N/A'}</td>
                <td class="px-4 py-4 text-sm align-top">
                    <!-- Actions -->
                </td>
            `;
            operationsBody.appendChild(tr);
        });

        } catch (error) {
            console.error('Load Operations Failed:', error);
            operationsBody.innerHTML = `<tr><td colspan="12" class="text-center py-8 text-red-500">Failed to load operations.</td></tr>`;
        } finally {
            hideLoader();
        }
}

/**
 * @param {Event} e 
 */

async function handleFormSubmit(e) {
    e.preventDefault();
    showLoader();

    const warehouseId = warehouseSelect.value;
    const supplierId = supplierSelect.value;
    const operationDate = operationDateInput.value;

    if (!warehouseId || !supplierId || !operationDate) {
        alert("Please fill in all required fields: Warehouse, Supplier, and Operation Date.");
        hideLoader();
        return;
    }

    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const itemSelect = row.querySelector('.item-select');
        const quantityInput = row.querySelector('.quantity-input');
        if (itemSelect.value && quantityInput.value) {
            items.push({
                "item": itemSelect.value,
                "quantity": quantityInput.value
            });
        }
    });

    if (items.length === 0) {
        alert("Please add at least one item to the operation.");
        hideLoader();
        return;
    }

    const payload = new FormData();
    
    payload.append("warehouse", warehouseId);
    payload.append("supplier", supplierId);
    payload.append("operation_date", operationDate); 
    
    if (paperRefInput.value) payload.append("paper_ref_number", paperRefInput.value);
    if (supplyBonInput.value) payload.append("supply_bon_number", supplyBonInput.value);
    if (delivererNameInput.value) payload.append("delivere_job_name", delivererNameInput.value);
    if (delivererJobNumInput.value) payload.append("delivere_job_number", delivererJobNumInput.value);
    if (statementInput.value) payload.append("operation_statement", statementInput.value);
    if (descriptionInput.value) payload.append("operation_descrabtion", descriptionInput.value);
    
    if (stationSelect.value) {
        payload.append("stations", stationSelect.value);
    }

        payload.append("items", JSON.stringify(items));

    for (const file of attachmentsInput.files) {
        payload.append("uploaded_attachments", file); 
    }

    try {
        const res = await postRequest(API_ENDPOINTS.Operations.supply, payload, token, {}, true);

        if (res.status === 201) {
            alert('Operation created successfully!');
            document.querySelector('[x-data]').__x.$data.closeModal();
            form.reset();
            itemsTbody.innerHTML = '';
            await loadSupplyOperations();
        } else {
            const errorData = res.data;
            let errorMessages = 'Failed to create operation:\n';
            for (const key in errorData) {
                if (Array.isArray(errorData[key])) {
                    errorMessages += `${key}: ${errorData[key].join(', ')}\n`;
                } else {
                    errorMessages += `${key}: ${errorData[key]}\n`;
                }
            }
            alert(errorMessages);
        }
    } catch (error) {
        console.error('Create Operation Failed:', error);
        alert('An unexpected error occurred. Please check the console for details.');
    } finally {
        hideLoader();
    }
}


async function handleModifyFormSubmit(e) {

        e.preventDefault();
        showLoader();

        const payload = {
            original_item_line: originalItemLineIdInput.value,
            
            new_quantity: newQuantityInput.value,
            old_quantity: oldQuantityInput.value,
            operation_date: modificationDateInput.value,
            reason: modificationReasonInput.value,
        };


        try {
            const res = await postRequest(API_ENDPOINTS.Operations.modifySupply, payload, token);
            if (res.status === 201 || res.status === 200) {
                alert('Modification saved successfully!');
                document.querySelector('[x-data]').__x.get('closeModifyModal')();
                modifyForm.reset();
                await loadSupplyOperations();
            } else {
            const errorData = res.data;
            let errorMessages = 'Failed to create operation:\n';
            for (const key in errorData) {
                if (Array.isArray(errorData[key])) {
                    errorMessages += `${key}: ${errorData[key].join(', ')}\n`;
                } else {
                    errorMessages += `${key}: ${errorData[key]}\n`;
                }
            }
            alert(errorMessages);
        }
        } catch (error) {
            console.error('Save Modification Failed:', error);
            alert(`Failed to save modification: ${error.message}`);
        } finally {
            hideLoader();
        }
}



document.addEventListener('DOMContentLoaded', () => {
    populateSelect(warehouseSelect, API_ENDPOINTS.Inventory.warehouses, 'Select Warehouse');
    populateSelect(supplierSelect, API_ENDPOINTS.Accounts.suppliers, 'Select Supplier');
    populateSelect(stationSelect, API_ENDPOINTS.Inventory.stations, 'Select Station ');

    operationsBody.addEventListener('click', (event) => {
        const modifyButton = event.target.closest('.modify-item-btn');
        if (!modifyButton) return;

        event.preventDefault();
        const row = modifyButton.closest('tr');
        
        originalItemLineIdInput.value = modifyButton.dataset.itemLineId;

        modifyItemInfo.textContent = `Item: ${modifyButton.dataset.itemName}`;

        oldQuantityInput.value = modifyButton.dataset.currentQuantity;
        
        newQuantityInput.value = '';
        modificationReasonInput.value = '';
        modificationDateInput.value = new Date().toISOString().slice(0, 16);

        document.querySelector('[x-data]').__x.get('openModifyModal');
});
    loadSupplyOperations();

    form.addEventListener('submit', handleFormSubmit);

    addItemBtn.addEventListener('click', addNewItemRow);

    if (form) form.addEventListener('submit', handleFormSubmit);
    if (modifyForm) modifyForm.addEventListener('submit', handleModifyFormSubmit);
    if (addItemBtn) addItemBtn.addEventListener('click', addNewItemRow);
});



