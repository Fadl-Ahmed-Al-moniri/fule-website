import { postRequest, getRequest, deleteRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';

const token = getUserToken();

const operationsBody = document.getElementById('operationsBody');
const noOperationsMsg = document.getElementById('no_operations');
const form = document.getElementById('return_export_form');
const addItemBtn = document.getElementById('addItemBtn');
const itemsTbody = document.getElementById('itemsTbody');

const exportOperationSelect = document.getElementById('export_opreations_select');
const warehouseSelect = document.getElementById('warehouse_select');
const beneficiareSelect = document.getElementById('beneficiare_select');
const operationReturnDateInput = document.getElementById('operation_return_date');
const operationDateInput = document.getElementById('operation_date');
const responseDateInput = document.getElementById('date_transfer');
const ActualresponseDateInput = document.getElementById('date_actual_transfer');
const paperRefInput = document.getElementById('paper_ref_number');
const delivererNameInput = document.getElementById('delivere_user');
const recipientInput = document.getElementById('recipient_name');
const recipientJobInputNum = document.getElementById('recipient_job_number');
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
            <input type="number" class="form-input text-sm quantity-input" placeholder="0.00" min="0.00" step="0.01" required>
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
        else {
            const tmp = document.createElement('option');
            tmp.value = itemId;
            tmp.textContent = `#${itemId}`;
            sel.appendChild(tmp);
            sel.value = itemId;
        }
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

exportOperationSelect.addEventListener('change', async () => {
    const selectedId = exportOperationSelect.value;
    if (!selectedId) {
        warehouseSelect.value = '';
        beneficiareSelect.value = '';
        operationDateInput.value = '';
        itemsTbody.innerHTML = '';
        paperRefInput.value = '';
        recipientInput.value = '';
        recipientJobInputNum.value = '';
        statementInput.value = '';
        descriptionInput.value = '';
        return;
    }

    try {
        showLoader();

        await Promise.all([
            populateSelect(warehouseSelect, API_ENDPOINTS.Inventory.warehouses, 'Select Warehouse'),
            populateSelect(beneficiareSelect, API_ENDPOINTS.Accounts.beneficiaries, 'Select Beneficiare')
        ]);

        const res = await getRequest(`${API_ENDPOINTS.Operations.export}${selectedId}/`, token);
        if (res.status && res.status >= 400) throw new Error('Failed to fetch selected export operation');
        const op = res.data ?? res;

        const warehouseId = op.warehouse ?? op.warehouse_id ?? op.warehouse?.id;
        const beneficiaryId = op.beneficiary ?? op.beneficiary_id ?? op.beneficiary?.id;
        if (warehouseId) {
            const whOpt = Array.from(warehouseSelect.options).find(o => String(o.value) === String(warehouseId));
            if (whOpt) warehouseSelect.value = warehouseId;
            else {
                const tmp = document.createElement('option'); tmp.value = warehouseId; tmp.textContent = op.warehouse_name ?? `#${warehouseId}`;
                warehouseSelect.appendChild(tmp); warehouseSelect.value = warehouseId;
            }
        }

        if (beneficiaryId) {
            const beOpt = Array.from(beneficiareSelect.options).find(o => String(o.value) === String(beneficiaryId));
            if (beOpt) beneficiareSelect.value = beneficiaryId;
            else {
                const tmp = document.createElement('option'); tmp.value = beneficiaryId; tmp.textContent = op.beneficiary_name ?? `#${beneficiaryId}`;
                beneficiareSelect.appendChild(tmp); beneficiareSelect.value = beneficiaryId;
            }
        } else if (op.beneficiary_name) {
            const found = Array.from(beneficiareSelect.options).find(o => o.textContent.trim() === String(op.beneficiary_name).trim());
            if (found) beneficiareSelect.value = found.value;
        }

        if (op.operation_date) operationDateInput.value = toLocalDatetimeInput(op.operation_date);

        itemsTbody.innerHTML = '';
        const itemsList = op.items || op.items_details || [];
        for (const it of itemsList) {
            const itemId = it.item ?? it.item_id ?? it.item; 
            const qty = it.quantity ?? it.effective_quantity ?? 0;
            await addNewItemRow(itemId, qty);
        }
    } catch (err) {
        handleError(err, 'Fetch export operation details failed');
    } finally {
        hideLoader();
    }
});

async function loadReturnexportOperations() {
    try {
        showLoader();
        const res = await getRequest(API_ENDPOINTS.Operations.returnExport, token);
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

            const operationDate = op.operation_date ? new Date(op.operation_date).toLocaleDateString() : '';
            const original_operation_date = op.original_operation_date ? new Date(op.original_operation_date).toLocaleDateString() : '';

            const itemsHtml = (op.items_details || []).map(item => {
                const formattedQuantity = Number(item.returned_quantity ?? item.returned_quantity).toLocaleString('en-US');
                return `<div class="whitespace-nowrap">${item.item_name}: <span class="font-semibold">${formattedQuantity}</span></div>`;
            }).join('');

            tr.innerHTML = `
                <td class="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">#${op.id}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.original_operation ?? ''}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${operationDate}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${original_operation_date}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.warehouse_name ?? ''}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.beneficiary_name || 'N/A'}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.paper_ref_number ?? ''}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${itemsHtml}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.delivere_user_name ?? ''}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.recipient_name ?? 'N/A'}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.operation_statement || 'N/A'}</td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">${op.date_actual_transfer ?? ''}</td>

            `;
            operationsBody.appendChild(tr);

            const editBtn = tr.querySelector('.btn-edit');
            const delBtn = tr.querySelector('.btn-danger');
            editBtn.addEventListener('click', () => fillFormForEdit(op.id));
            delBtn.addEventListener('click', async () => {
                if (!confirm('Delete this return operation?')) return;
                try {
                    showLoader();
                    const delRes = await deleteRequest(`${API_ENDPOINTS.Operations.returnExport}${op.id}/`, {}, token);
                    if (delRes.status === 204 || delRes.status === 200) {
                        await loadReturnexportOperations();
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

/* ---------- format ISO datetime to value acceptable by datetime-local input ----- */
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
        const res = await getRequest(`${API_ENDPOINTS.Operations.returnExport}${id}/`, token);
        if (res.status && res.status >= 400) throw new Error('Failed to fetch return operation');
        const op = res.data ?? res;

        await Promise.all([
            populateSelect(warehouseSelect, API_ENDPOINTS.Warehouse.warehouse, 'Select Warehouse'),
            populateSelect(beneficiareSelect, API_ENDPOINTS.Accounts.beneficiaries, 'Select Beneficiaries'),
        ]);

        exportOperationSelect.value = op.original_operation ?? '';
        if (op.warehouse) warehouseSelect.value = op.warehouse;
        if (op.beneficiary_name) {
            const found = Array.from(beneficiareSelect.options).find(o => o.textContent.trim() === String(op.beneficiary_name).trim());
            if (found) beneficiareSelect.value = found.value;
        }
        operationDateInput.value = toLocalDatetimeInput(op.operation_date);
        if (op.paper_ref_number) paperRefInput.value = op.paper_ref_number;
        recipientInput.value = op.recipient_name ?? '';
        recipientJobInputNum.value = op.recipient_job_number ?? '';
        statementInput.value = op.operation_statement ?? '';
        descriptionInput.value = op.operation_descrabtion ?? '';

        itemsTbody.innerHTML = '';
        const itemsList = op.items || op.items_details || [];
        for (const it of itemsList) {
            const itemId = it.item ?? it.item_id ?? (it.item && it.item.id);
            const qty = it.returned_quantity ?? it.returnable_quantity ?? it.quantity ?? it.effective_quantity ?? 0;
            await addNewItemRow(itemId, qty);
        }

        document.querySelector('[x-data]')?.__x?.$data?.openModal?.();
    } catch (err) {
        handleError(err, 'Fill form for edit failed');
    } finally {
        hideLoader();
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    showLoader();

    const exportOperation = exportOperationSelect.value;
    const warehouseId = warehouseSelect.value;
    const beneficiareId = beneficiareSelect.value;
    const operationDate = operationReturnDateInput.value;
    const date_transfer = responseDateInput.value;
    const date_actual_transfer = ActualresponseDateInput.value;

    if (!warehouseId || !beneficiareId || !operationDate || !date_transfer || !date_actual_transfer || !exportOperation) {
        alert("Please fill in all required fields: Warehouse, Beneficiary, response dates, Operation Date and Original Operation.");
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

    payload.append("original_operation", Number(exportOperation));
    payload.append("operation_date", operationDate);
    payload.append("date_transfer", date_transfer);
    payload.append("date_actual_transfer", date_actual_transfer);

    if (paperRefInput.value) payload.append("paper_ref_number", paperRefInput.value);
    if (recipientInput.value) payload.append("recipient_name", recipientInput.value);
    if (recipientJobInputNum.value) payload.append("recipient_job_number", recipientJobInputNum.value);
    if (statementInput.value) payload.append("operation_statement", statementInput.value);
    if (descriptionInput.value) payload.append("operation_descrabtion", descriptionInput.value);

    payload.append("returned_items", JSON.stringify(items));

    for (const file of attachmentsInput.files) {
        payload.append("uploaded_attachments", file);
    }

    try {
        const res = await postRequest(API_ENDPOINTS.Operations.returnExport, payload, token, {}, true);

        if (res.status === 201) {
            alert('Return operation created successfully!');
            document.querySelector('[x-data]')?.__x?.$data?.closeModal?.();
            form.reset();
            itemsTbody.innerHTML = '';
            await loadReturnexportOperations();
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

async function populateexportOperationsSelect() {
    try {
        const res = await getRequest(API_ENDPOINTS.Operations.export, token);
        if (res.status !== 200) throw new Error('Failed to fetch export operations');

        exportOperationSelect.innerHTML = `<option value="">Select export operation</option>`;
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.results) ? res.data.results : [];
        list.forEach(op => {
            const label = `#${op.id} — ${op.warehouse_name ?? 'Warehouse'} — ${op.operation_date ? new Date(op.operation_date).toLocaleDateString() : ''}`;
            const option = document.createElement('option');
            option.value = op.id;
            option.textContent = label;
            exportOperationSelect.appendChild(option);
        });
    } catch (err) {
        console.error('populateexportOperationsSelect failed', err);
        exportOperationSelect.innerHTML = `<option value="">Error loading export operations</option>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateSelect(warehouseSelect, API_ENDPOINTS.Inventory.warehouses, 'Select Warehouse');
    populateSelect(beneficiareSelect, API_ENDPOINTS.Accounts.beneficiaries, 'Select Beneficiare');

    populateexportOperationsSelect();

    loadReturnexportOperations();

    form.addEventListener('submit', handleFormSubmit);
    addItemBtn.addEventListener('click', () => addNewItemRow());
});
