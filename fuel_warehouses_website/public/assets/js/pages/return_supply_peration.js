// assets/js/returnSupply.js
import { postRequest, getRequest, deleteRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';

const token = getUserToken();

const operationsBody = document.getElementById('operationsBody');
const noOperationsMsg = document.getElementById('no_operations');
const form = document.getElementById('return_supply_form');
const addItemBtn = document.getElementById('addItemBtn');
const itemsTbody = document.getElementById('itemsTbody');

const supplyOperationSelect = document.getElementById('supply_opreations_select');
const warehouseSelect = document.getElementById('warehouse_select');
const supplierSelect = document.getElementById('supplier_select');
const stationSelect = document.getElementById('station_select');
const operationReturnDateInput = document.getElementById('operation_return_date');
const operationDateInput = document.getElementById('operation_date');
const responseDateInput = document.getElementById('date_response');
const ActualresponseDateInput = document.getElementById('date_actual_response');
const paperRefInput = document.getElementById('paper_ref_number');
const supplyBonInput = document.getElementById('supply_bon_number');
const delivererNameInput = document.getElementById('delivere_job_name');
const delivererJobNumInput = document.getElementById('delivere_job_number');
const recipientJobInput = document.getElementById('recipient_job');
const statementInput = document.getElementById('operation_statement');
const descriptionInput = document.getElementById('operation_descrabtion');
const attachmentsInput = document.getElementById('attachments');

function handleError(err, ctx = '') {
    console.error(ctx, err);
    alert((ctx ? ctx + ': ' : '') + (err?.message || err));
}

/**
 * Generic select population helper
 * @param {HTMLElement} selectElement 
 * @param {string} endpoint 
 * @param {string} placeholder 
 */
async function populateSelect(selectElement, endpoint, placeholder) {
    try {
        const res = await getRequest(endpoint, token);
        if (res.status !== 200) throw new Error(`Failed to fetch data for ${placeholder}`);
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.results) ? res.data.results : [];
        list.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name ?? item.full_name ?? item.title ?? `#${item.id}`;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error(`Error populating ${placeholder}:`, error);
        selectElement.innerHTML = `<option value="">Error loading data</option>`;
    }
}

/**
 * Add new item row to itemsTbody.
 * If itemId and qty provided, the row will be filled after items list loads.
 * Returns the created row element.
 */
async function addNewItemRow(itemId = null, qty = '') {
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

    await populateSelect(newRow.querySelector('.item-select'), API_ENDPOINTS.Inventory.items, 'Select Item');

    if (itemId) {
        const sel = newRow.querySelector('.item-select');
        const opt = Array.from(sel.options).find(o => String(o.value) === String(itemId));
        if (opt) sel.value = itemId;
    }

    if (qty !== undefined && qty !== null) {
        const qInput = newRow.querySelector('.quantity-input');
        qInput.value = qty;
    }

    newRow.querySelector('.remove-item').addEventListener('click', () => {
        newRow.remove();
    });

    return newRow;
}

async function loadReturnSupplyOperations() {
    try {
        showLoader();
        const res = await getRequest(API_ENDPOINTS.Operations.returnSupply, token);
        if (res.status !== 200) throw new Error('Failed to fetch operations');

        operationsBody.innerHTML = '';
        const data = Array.isArray(res.data) ? res.data
                   : Array.isArray(res.data?.results) ? res.data.results
                   : Array.isArray(res) ? res
                   : res.data || [];

        if (!data || data.length === 0) {
            noOperationsMsg.classList.remove('hidden');
            return;
        }
        noOperationsMsg.classList.add('hidden');

        data.forEach(op => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150';

            // safe date formatting
            const operationDate = op.operation_date ? new Date(op.operation_date).toLocaleDateString() : '';
            const original_operation_date = op.original_operation_date ? new Date(op.original_operation_date).toLocaleDateString() : '';

            const itemsHtml = (op.items_details || []).map(item => {
                const formattedQuantity = Number(item.returned_quantity).toLocaleString('en-US');
                return `<div class="whitespace-nowrap">${item.item_name}: <span class="font-semibold">${formattedQuantity}</span></div>`;
            }).join('');

            tr.innerHTML = `
                <td class="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">#${op.id}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.original_operation ?? ''}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${operationDate}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${original_operation_date}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.warehouse_name ?? ''}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.station_name || 'N/A'}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.paper_ref_number ?? ''}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${itemsHtml}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.delivere_job_name ?? ''}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.recipient_user_name ?? 'N/A'}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.operation_statement || 'N/A'}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.date_actual_response ?? ''}</td>

            `;
            operationsBody.appendChild(tr);

            const editBtn = tr.querySelector('.btn-edit');
            const delBtn = tr.querySelector('.btn-danger');
            editBtn.addEventListener('click', () => fillFormForEdit(op.id));
            delBtn.addEventListener('click', async () => {
                if (!confirm('Delete this return operation?')) return;
                try {
                    showLoader();
                    const delRes = await deleteRequest(`${API_ENDPOINTS.Operations.returnSupply}${op.id}/`, {}, token);
                    if (delRes.status === 204 || delRes.status === 200) {
                        await loadReturnSupplyOperations();
                    } else {
                        handleError(delRes.data || `Delete failed (${delRes.status})`);
                    }
                } catch (err) {
                    handleError(err, 'Delete failed');
                } finally {
                    hideLoader();
                }
            });
        });
    } catch (error) {
        console.error('Load Operations Failed:', error);
        noOperationsMsg.classList.remove('hidden');
    } finally {
        hideLoader();
    }
}

supplyOperationSelect.addEventListener('change', async () => {
    const selectedId = supplyOperationSelect.value;
    if (!selectedId) {
        warehouseSelect.value = '';
        supplierSelect.value = '';
        stationSelect.value = '';
        operationDateInput.value = '';
        itemsTbody.innerHTML = '';
        paperRefInput.value = '';
        supplyBonInput.value = '';
        delivererNameInput.value = '';
        delivererJobNumInput.value = '';
        statementInput.value = '';
        descriptionInput.value = '';
        return;
    }

    try {
        showLoader();
        const res = await getRequest(`${API_ENDPOINTS.Operations.supply}${selectedId}/`, token);
        if (res.status && res.status >= 400) throw new Error('Failed to fetch selected supply operation');
        const op = res.data ?? res;

        if (op.warehouse) warehouseSelect.value = op.warehouse;
        if (op.supplier) supplierSelect.value = op.supplier;
        if (op.stations) stationSelect.value = op.stations;
        if (op.operation_date) operationDateInput.value = toLocalDatetimeInput(op.operation_date);

        itemsTbody.innerHTML = '';
        const itemsList = op.items || op.items_details || [];
        for (const it of itemsList) {
            const itemId = it.item ?? it.item_id ?? it.item; 
            const qty = it.quantity ?? it.effective_quantity ?? 0;
            await addNewItemRow(itemId, qty);
        }
    } catch (err) {
        handleError(err, 'Fetch supply operation details failed');
    } finally {
        hideLoader();
    }
});

function toLocalDatetimeInput(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString; 
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

async function fillFormForEdit(id) {
    try {
        showLoader();
        const res = await getRequest(`${API_ENDPOINTS.Operations.returnSupply}${id}/`, token);
        if (res.status && res.status >= 400) throw new Error('Failed to fetch return operation');
        const op = res.data ?? res;

        await Promise.all([
            populateSelect(warehouseSelect, API_ENDPOINTS.Inventory.warehouses, 'Select Warehouse'),
            populateSelect(supplierSelect, API_ENDPOINTS.Accounts.suppliers, 'Select Supplier'),
            populateSelect(stationSelect, API_ENDPOINTS.Inventory.stations, 'Select Station'),
        ]);

        supplyOperationSelect.value = op.original_operation ?? '';
        if (op.warehouse) warehouseSelect.value = op.warehouse;
        if (op.supplier) supplierSelect.value = op.supplier;
        if (op.stations) stationSelect.value = op.stations;
        operationDateInput.value = toLocalDatetimeInput(op.operation_date);
        if (op.paper_ref_number) paperRefInput.value = op.paper_ref_number;
        if (op.supply_bon_number) supplyBonInput.value = op.supply_bon_number;
        delivererNameInput.value = op.delivere_job_name ?? '';
        delivererJobNumInput.value = op.delivere_job_number ?? '';
        statementInput.value = op.operation_statement ?? '';
        descriptionInput.value = op.operation_descrabtion ?? '';

        itemsTbody.innerHTML = '';
        const itemsList = op.items || op.items_details || [];
        for (const it of itemsList) {
            const itemId = it.item ?? it.item_id ?? it.item;
            const qty = it.quantity ?? it.effective_quantity ?? 0;
            await addNewItemRow(itemId, qty);
        }

        document.querySelector('[x-data]').__x.$data.openModal();
    } catch (err) {
        handleError(err, 'Fill form for edit failed');
    } finally {
        hideLoader();
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    showLoader();



    const supplyOperation = supplyOperationSelect.value;
    const warehouseId = warehouseSelect.value;
    const supplierId = supplierSelect.value;
    const operationDate = operationReturnDateInput.value;
    const date_response = responseDateInput.value;
    const date_actual_response = ActualresponseDateInput.value;

    if (!warehouseId || !supplierId || !operationDate || !date_response || !date_actual_response || !supplyOperation) {
        alert("Please fill in all required fields: Warehouse, Supplier,Date of the supposed reply , Date of actual response,  Operation Date and Original Operation.");
        hideLoader();
        return;
    }

    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        const itemSelect = row.querySelector('.item-select');
        const quantityInput = row.querySelector('.quantity-input');
        if (itemSelect.value && quantityInput.value) {
            items.push({
                "item": Number(itemSelect.value),
                "returned_quantity": Number(quantityInput.value)
            });
        }
    });

    if (items.length === 0) {
        alert("Please add at least one item to the operation.");
        hideLoader();
        return;
    }


    const payload = new FormData();

    payload.append("original_operation", supplyOperation);
    payload.append("operation_date", operationDate);
    payload.append("date_response", date_response);
    payload.append("date_actual_response", date_actual_response);

    if (paperRefInput.value) payload.append("paper_ref_number", paperRefInput.value);
    if (delivererNameInput.value) payload.append("delivere_job_name", delivererNameInput.value);
    if (delivererJobNumInput.value) payload.append("delivere_job_number", delivererJobNumInput.value);
    if (statementInput.value) payload.append("operation_statement", statementInput.value);
    if (descriptionInput.value) payload.append("operation_descrabtion", descriptionInput.value);

    payload.append("original_operation", Number(supplyOperation));

    payload.append("returned_items", JSON.stringify(items));

    for (const file of attachmentsInput.files) {
        payload.append("uploaded_attachments", file);
    }

    try {
        const res = await postRequest(API_ENDPOINTS.Operations.returnSupply, payload, token, {}, true);

        if (res.status === 201) {
            alert('Return operation created successfully!');
            document.querySelector('[x-data]').__x.$data.closeModal();
            form.reset();
            itemsTbody.innerHTML = '';
            await loadReturnSupplyOperations();
        } else {
            const errorData = res.data || {};
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

async function populateSupplyOperationsSelect() {
    try {
        const res = await getRequest(API_ENDPOINTS.Operations.supply, token);
        if (res.status !== 200) throw new Error('Failed to fetch supply operations');

        supplyOperationSelect.innerHTML = `<option value="">Select supply operation</option>`;
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.results) ? res.data.results : [];
        list.forEach(op => {
            const label = `#${op.id} — ${op.warehouse_name ?? 'Warehouse'} — ${op.operation_date ? new Date(op.operation_date).toLocaleDateString() : ''}`;
            const option = document.createElement('option');
            option.value = op.id;
            option.textContent = label;
            supplyOperationSelect.appendChild(option);
        });
    } catch (err) {
        console.error('populateSupplyOperationsSelect failed', err);
        supplyOperationSelect.innerHTML = `<option value="">Error loading supply operations</option>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateSelect(warehouseSelect, API_ENDPOINTS.Inventory.warehouses, 'Select Warehouse');
    populateSelect(supplierSelect, API_ENDPOINTS.Accounts.suppliers, 'Select Supplier');
    populateSelect(stationSelect, API_ENDPOINTS.Inventory.stations, 'Select Station');

    populateSupplyOperationsSelect();

    loadReturnSupplyOperations();

    form.addEventListener('submit', handleFormSubmit);
    addItemBtn.addEventListener('click', () => addNewItemRow());
});
