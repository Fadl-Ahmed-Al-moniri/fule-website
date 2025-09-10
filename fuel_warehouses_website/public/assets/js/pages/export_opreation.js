
import { postRequest, getRequest, deleteRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';

const token = getUserToken();

const operationsBody = document.getElementById('operationsBody');
const noOperationsMsg = document.getElementById('no_operations');
const form = document.getElementById('export_form');
const addItemBtn = document.getElementById('addItemBtn');
const itemsTbody = document.getElementById('itemsTbody');

const warehouseSelect = document.getElementById('warehouse_select');
const operationDateInput = document.getElementById('operation_date');
const dateTransferDateInput = document.getElementById('date_transfer');
const dateActualTransferDateInput = document.getElementById('date_actual_transfer');
const beneficiarySelect = document.getElementById('beneficiary_select');
const paperRefInput = document.getElementById('paper_ref_number');
const recipientNameInput = document.getElementById('recipient_job_name');
const recipientJobNumInput = document.getElementById('recipient_job_number');
const delivererJobInput = document.getElementById('delivere_user'); 
const statementInput = document.getElementById('operation_statement');
const descriptionInput = document.getElementById('operation_descrabtion');
const attachmentsInput = document.getElementById('attachments');


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



async function loadexportOperations() {
    try {
        showLoader();
        const res = await getRequest(API_ENDPOINTS.Operations.export, token);
        if (res.status !== 200) throw new Error('Failed to fetch operations');

        operationsBody.innerHTML = ''; 
        const data = Array.isArray(res.data) ? res.data
                : Array.isArray(res.data?.results) ? res.data.results
                : Array.isArray(res) ? res
                : res.data || [];
        if (!data || data.length === 0){
            noOperationsMsg.classList.remove('hidden');
            return;
        }
        noOperationsMsg.classList.add('hidden');

        data.forEach(op => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150';
            
            // تحويل التاريخ إلى صيغة مقروءة
            const operationDate = new Date(op.operation_date).toLocaleDateString();
            const itemsHtml = op.items_details.map(item => {
            const formattedQuantity = parseFloat(item.quantity).toLocaleString('en-US');
            
            return `<div class="whitespace-nowrap">${item.item_name}: <span class="font-semibold">${formattedQuantity}</span></div>`;
            }).join('');
            
            tr.innerHTML = `
                <td class="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">#${op.id}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.warehouse_name}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${operationDate}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100  md:table-cell">${op.paper_ref_number}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100  md:table-cell">${op.beneficiary}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100  sm:table-cell">${itemsHtml}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100  lg:table-cell">${op.delivere_user_name || 'N/A'}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100  lg:table-cell">${op.recipient_name || 'N/A'}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100  lg:table-cell">${op.operation_statement || 'N/A'}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100  lg:table-cell">${op.date_actual_transfer || 'N/A'}</td>
                <td class="px-4 py-4 text-sm">
                    <div class="flex flex-col sm:flex-row gap-2">
                        <button class="btn-edit text-xs px-3 py-1" data-id="${op.id}">Edit</button>
                        <button class="btn-danger text-xs px-3 py-1" data-id="${op.id}">Delete</button>
                    </div>
                </td>
            `;
            operationsBody.appendChild(tr);
        });

    } catch (error) {
        alert('Load Operations Failed:', error);
        alert('Failed to load export operations. Please check the console.');
        noOperationsMsg.classList.remove('hidden');
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
    const operationDate = operationDateInput.value;
    const dateTransfer = dateTransferDateInput.value;
    const dateActualTransfer = dateActualTransferDateInput.value;
    const beneficiary = beneficiarySelect.value;
    const recipient_name = recipientNameInput.value;

    if (!warehouseId || !operationDate || !beneficiary ||!dateTransfer || !dateActualTransfer || !recipient_name) {
        alert("Please fill in all required fields: Warehouse, Recipient Name, Operation Date,Operation date Transfer,Operation dateActualTransfer, and Beneficiary");
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
    payload.append("operation_date", operationDate); 
    payload.append("beneficiary", beneficiary); 
    payload.append("recipient_name", recipient_name); 
    payload.append("date_transfer", dateTransfer); 
    payload.append("date_actual_transfer", dateActualTransfer); 
    
    if (paperRefInput.value) payload.append("paper_ref_number", paperRefInput.value);
    if (recipientJobNumInput.value) payload.append("recipient_job_number", recipientJobNumInput.value);
    if (statementInput.value) payload.append("operation_statement", statementInput.value);
    if (descriptionInput.value) payload.append("operation_descrabtion", descriptionInput.value);
    
        payload.append("items", JSON.stringify(items));

    for (const file of attachmentsInput.files) {
        payload.append("uploaded_attachments", file); 
    }

    try {
        const res = await postRequest(API_ENDPOINTS.Operations.export, payload, token, {}, true);

        if (res.status === 201) {
            alert('Operation created successfully!');
            document.querySelector('[x-data]').__x.$data.closeModal();
            form.reset();
            itemsTbody.innerHTML = '';
            await loadexportOperations();
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



document.addEventListener('DOMContentLoaded', () => {
    populateSelect(warehouseSelect, API_ENDPOINTS.Inventory.warehouses, 'Select Warehouse');
    populateSelect(beneficiarySelect, API_ENDPOINTS.Accounts.beneficiaries, 'Select Beneficiary');

    loadexportOperations();
    form.addEventListener('submit', handleFormSubmit);

    addItemBtn.addEventListener('click', addNewItemRow);
});