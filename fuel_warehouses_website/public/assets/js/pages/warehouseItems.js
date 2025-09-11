// assets/js/warehouseItems.js
import { postRequest, getRequest, putRequest, deleteRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';

const token = getUserToken();

const form = document.getElementById('warehouse_form'); 
const tableBody = document.getElementById('warehouseBody');
const noMsg = document.getElementById('no_warehouse');
const hiddenId = document.getElementById('warehouseId'); 
const warehouseSelect = document.getElementById('warehouse');
const itemSelect = document.getElementById('item');
const unitSelect = document.getElementById('unit_of_measure');
const openingBalanceInput = document.getElementById('opening_balance');
const currentQuantityInput = document.getElementById('current_quantity');

const openBtn = document.getElementById('open');
const operationTypeTitle = document.getElementById('operation_type');
const operationTypeButton = document.getElementById('operation_type_b');

const UNIT_OPTIONS = [
  { value: 'Liters', label: 'Liters' },
  { value: 'Barrel', label: 'Barrel' },
  { value: 'Gallon', label: 'Gallon' },
  { value: 'Units', label: 'Units' },
];

function handleError(err, ctx = '') {
  console.error(ctx, err);
  alert((ctx ? ctx + ': ' : '') + (err?.message || err));
}

function closeModal() {
  const closeBtn = document.querySelector('#modal [aria-label="close"]');
  if (closeBtn) closeBtn.click();
}
function openModal() {
  if (openBtn) openBtn.click();
}

function extractListFromResponse(res) {
  if (!res) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.results)) return res.data.results;
  if (Array.isArray(res)) return res;
  return res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : [];
}


async function loadWarehouseOptions(selectedId = null) {
  try {
    const res = await getRequest(API_ENDPOINTS.Inventory.warehouses, token);
    const data = extractListFromResponse(res);
    warehouseSelect.innerHTML = '<option value="">Select Warehouse</option>';
    data.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.id ?? '';
      opt.textContent = w.name ?? (`Warehouse ${w.id ?? ''}`);
      if (String(selectedId) === String(opt.value)) opt.selected = true;
      warehouseSelect.appendChild(opt);
    });
  } catch (err) {
    console.warn('Load warehouses for select failed', err);
    warehouseSelect.innerHTML = '<option value="">Failed to load</option>';
  }
}

async function loadItemOptions(selectedId = null) {
  try {
    const res = await getRequest(API_ENDPOINTS.Inventory.items, token);
    const data = extractListFromResponse(res);
    itemSelect.innerHTML = '<option value="">Select item</option>';
    data.forEach(i => {
      const opt = document.createElement('option');
      opt.value = i.id ?? '';
      opt.textContent = i.name ?? (`Item ${i.id ?? ''}`);
      if (String(selectedId) === String(opt.value)) opt.selected = true;
      itemSelect.appendChild(opt);
    });
  } catch (err) {
    console.warn('Load items for select failed', err);
    itemSelect.innerHTML = '<option value="">Failed to load</option>';
  }
}

function populateUnitSelect(selectedValue = null) {
  unitSelect.innerHTML = '<option value="">Select Unit</option>';
  UNIT_OPTIONS.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.value;
    opt.textContent = u.label;
    if (selectedValue && String(selectedValue) === String(u.value)) opt.selected = true;
    unitSelect.appendChild(opt);
  });
}


async function loadWarehouseItems() {
  try {
    showLoader();
    const res = await getRequest(API_ENDPOINTS.Inventory.warehouseItems, token);
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(res.message || `Failed to fetch warehouse items (status ${res.status})`);
    }

    const data = extractListFromResponse(res);
    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
      noMsg.classList.remove('hidden');
      return;
    }
    noMsg.classList.add('hidden');

    data.forEach(rec => {
      const tr = document.createElement('tr');
      tr.className = 'text-gray-700 dark:text-gray-400';

      // show warehouse_name and item_name if serializer provides them, otherwise try to fallback
      const warehouseName = rec.warehouse_name ?? (rec.warehouse && rec.warehouse.name) ?? (rec.warehouse_id ?? rec.warehouse ?? '');
      const itemName = rec.item_name ?? (rec.item && rec.item.name) ?? (rec.item_id ?? rec.item ?? '');
      const unit = rec.unit_of_measure ?? rec.unit ?? '';

      tr.innerHTML = `
        <td class="px-4 py-3 text-sm">${rec.id ?? ''}</td>
        <td class="px-4 py-3 text-sm">${warehouseName}</td>
        <td class="px-4 py-3 text-sm">${itemName}</td>
        <td class="px-4 py-3 text-sm">${rec.opening_balance ?? ''}</td>
        <td class="px-4 py-3 text-sm">${rec.current_quantity ?? ''}</td>
        <td class="px-4 py-3 text-sm">${unit}</td>
        <td class="px-4 py-3 text-sm">${rec.last_updated ? new Date(rec.last_updated).toLocaleString() : ''}</td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-4 text-sm">
            <button class="edit-btn px-2 py-2 text-purple-600 dark:text-gray-400 focus:outline-none"
                    data-id="${rec.id ?? ''}"
                    data-warehouse="${rec.warehouse ?? rec.warehouse_id ?? ''}"
                    data-item="${rec.item ?? rec.item_id ?? ''}"
                    data-opening="${rec.opening_balance ?? ''}"
                    data-current="${rec.current_quantity ?? ''}"
                    data-unit="${unit}">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 
                  5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </button>
            <button class="delete-btn px-2 py-2 text-red-600 focus:outline-none" data-id="${rec.id ?? ''}">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"/></svg>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);

      // edit handler
      const editBtn = tr.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = editBtn.dataset.id;
          const warehouseVal = editBtn.dataset.warehouse;
          const itemVal = editBtn.dataset.item;
          const opening = editBtn.dataset.opening;
          const current = editBtn.dataset.current;
          const unitVal = editBtn.dataset.unit;

          hiddenId.value = id ;
          warehouseSelect.value = warehouseVal ;
          itemSelect.value = itemVal ;
          openingBalanceInput.value = opening ;
          currentQuantityInput.value = current ;
          unitSelect.value = unitVal ;

          // ensure selects are loaded (load options if empty) then set values
          (async () => {
            await Promise.all([
              loadWarehouseOptions(warehouseVal),
              loadItemOptions(itemVal),
            ]);
            populateUnitSelect(unitVal);


            if (operationTypeTitle) operationTypeTitle.textContent = 'Update Warehouse Item';
            if (operationTypeButton) operationTypeButton.textContent = 'Update Warehouse Item';
            openModal();
          })();
        });
      }

      // delete handler
      const deleteBtn = tr.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = deleteBtn.dataset.id;
          if (!confirm('Are you sure you want to delete this warehouse item?')) return;
          await deleteWarehouseItem(id);
        });
      }
    });

  } catch (err) {
    handleError(err, 'Load warehouse items failed');
  } finally {
    hideLoader();
  }
}

async function createWarehouseItem(payload) {
  try {
    showLoader();
    const res = await postRequest(API_ENDPOINTS.Inventory.warehouseItems, payload, token);
    if (res.status === 201 || res.status === 200) {
      alert('Warehouse item created successfully!');
      await loadWarehouseItems();
      closeModal();
      form.reset();
    } else {
      throw new Error(res.message || JSON.stringify(res.data) || `Create failed (${res.status})`);
    }
  } catch (err) {
    handleError(err, 'Create warehouse item failed');
  } finally {
    hideLoader();
  }
}

async function updateWarehouseItem(id, payload) {
  try {
    showLoader();
    const url = `${API_ENDPOINTS.Inventory.warehouseItems}${id}/`;
    const res = await putRequest(url, payload, token);
    if (res.status === 200) {
      alert('Warehouse item updated successfully!');
      await loadWarehouseItems();
      closeModal();
      form.reset();
    } else {
      throw new Error(res.message || JSON.stringify(res.data) || `Update failed (${res.status})`);
    }
  } catch (err) {
    handleError(err, 'Update warehouse item failed');
  } finally {
    hideLoader();
  }
}

async function deleteWarehouseItem(id) {
  try {
    showLoader();
    const url = `${API_ENDPOINTS.Inventory.warehouseItems}${id}/`;
    const res = await deleteRequest(url, {}, token);
    if (res.status === 204 || res.status === 200) {
      alert('Deleted successfully');
      await loadWarehouseItems();
    } else {
      throw new Error(res.message || JSON.stringify(res.data) || `Delete failed (${res.status})`);
    }
  } catch (err) {
    handleError(err, 'Delete warehouse item failed');
  } finally {
    hideLoader();
  }
}


form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = hiddenId.value;
  const payload = {
    warehouse: warehouseSelect.value || null,
    item: itemSelect.value || null,
    opening_balance: openingBalanceInput.value ? Number(openingBalanceInput.value) : 0,
    current_quantity: currentQuantityInput.value ? Number(currentQuantityInput.value) : 0,
    unit_of_measure: unitSelect.value || null,
  };

  if (!payload.warehouse) {
    alert('Please select a warehouse');
    return;
  }
  if (!payload.item) {
    alert('Please select an item');
    return;
  }
  if (!payload.unit_of_measure) {
    alert('Please select a unit of measure');
    return;
  }

  if (id) {
    await updateWarehouseItem(id, payload);
  } else {
    await createWarehouseItem(payload);
  }
});

if (openBtn) {
  openBtn.addEventListener('click', async () => {
    populateUnitSelect(); 
    await Promise.all([loadWarehouseOptions(), loadItemOptions()]);
    hiddenId.value = '';
    form.reset();
    if (operationTypeTitle) operationTypeTitle.textContent = 'Create Warehouse Item';
    if (operationTypeButton) operationTypeButton.textContent = 'Create Warehouse Item';
  });
}


document.addEventListener('DOMContentLoaded', async () => {
  populateUnitSelect();
  await Promise.all([loadWarehouseOptions(), loadItemOptions(), loadWarehouseItems()]);
});
