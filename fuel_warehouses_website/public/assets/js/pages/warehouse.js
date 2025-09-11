// assets/js/warehouses.js
import { postRequest, getRequest ,putRequest , deleteRequest} from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';

const token = getUserToken();

const form = document.getElementById('warehouse_form');
const warehouseBody = document.getElementById('warehouseBody');
const noWarehouseMsg = document.getElementById('no_warehouse');
const mainWarehouseSelect = document.getElementById('parent_name');

const warehouseIdInput = document.getElementById('warehouseId');
const nameInput = document.getElementById('name');
const classificationInput = document.getElementById('calssification');
const storekeeperInput = document.getElementById('storekeeper_name');
const phoneInput = document.getElementById('phone_warehouse');
const editButtonSelector = '.edit-btn';
const open = document.getElementById('open');

function handleError(err, ctx = '') {
  console.error(ctx, err);
  alert((ctx ? ctx + ': ' : '') + (err.message || err));
}

function closeModal() {
  const closeBtn = document.querySelector('#modal [aria-label="close"]');
  if (closeBtn) closeBtn.click();
}

function openMod()   { open.click("openModal"); }

async function loadWarehouses() {
  try {
    showLoader();
    const res = await getRequest(API_ENDPOINTS.Inventory.warehouses, token);
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(res.message || 'Failed to fetch warehouses');
    }
    // دعم شكل الاستجابة المختلف
    const data = Array.isArray(res.data) ? res.data
                : Array.isArray(res.data?.results) ? res.data.results
                : Array.isArray(res) ? res
                : res.data || [];
    warehouseBody.innerHTML = '';
   
    if (!data || data.length === 0) {
        noWarehouseMsg.classList.remove('hidden');
    } else {
      noWarehouseMsg.classList.add('hidden');
      data.forEach(w => {

        const tr = document.createElement('tr');
        tr.className = 'text-gray-700 dark:text-gray-400';
        tr.innerHTML = `
          <td class="px-4 py-3 text-sm">${w.id ?? ''}</td>
          <td class="px-4 py-3 text-sm">${w.name ?? ''}</td>
          <td class="px-4 py-3 text-sm">${w.calssification ?? ''}</td>
          <td class="px-4 py-3 text-sm">${w.storekeeper_name ?? w.storekeeper ?? ''}</td>
          <td class="px-4 py-3 text-sm">${(w.parent_name ?? (w.parent && w.main_warehouse.name)) ?? 'None'}</td>
          <td class="px-4 py-3 text-sm">${w.phone_warehouse ?? w.phone ?? ''}</td>
          <td class="px-4 py-3 text-xs">
              <button
                  class="status-toggle cursor-pointer px-2 py-1 font-semibold rounded-full ${
                  w.is_active
                      ? 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100'
                      : 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100'
                  }"
                  data-email="${w.id}"
                  data-active="${w.is_active}"
              >
                  ${w.is_active ? 'Active' : 'Inactive'}
              </button>
              
          </td>
          <td class="px-4 py-3">
              <div class="flex items-center space-x-4 text-sm">
                  <button class="edit-btn px-2 py-2 text-purple-600 dark:text-gray-400 focus:outline-none"
                          data-id="${w.id}"
                          data-name="${w.name}"
                          data-calssification="${w.calssification }"
                          data-storekeeper="${w.storekeeper_name ?? w.storekeeper ?? ''}"
                          data-parent="${(w.parent_name ?? (w.parent && w.main_warehouse.name)) ?? 'None'}"
                          data-phone_warehouse="${w.phone_warehouse ?? w.phone ?? ''}">
                          
                  <!-- أيقونة تعديل -->
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 
                              5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                  </button>
            <button class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                            aria-label="Delete" onclick=deleteWarehouse("${w.id}")>
                      <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" >
                                  <path fill-rule="evenodd" clip-rule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  ></path>
                            </svg>
            </button>
            </div>
          </td>`;
        warehouseBody.appendChild(tr);
        
        tr.querySelector(editButtonSelector).addEventListener('click', () => {

            document.getElementById('operation_type').textContent     = "Updata Warehouse";
            document.getElementById('operation_type_b').textContent     = "Updata Warehouse"; 
            document.getElementById('warehouseId').value   = w.id;
            document.getElementById('name').value     = w.name;
            document.getElementById('calssification').value        = w.calssification;
            document.getElementById('storekeeper_name').value     = w.storekeeper;
            document.getElementById('parent_name').value     = w.parent;
            document.getElementById('phone_warehouse').value     = w.phone_warehouse;
            openMod();
        });

        
        const deleteBtn = tr.querySelector('button[aria-label="Delete"]');
        deleteBtn.addEventListener('click', () => deleteWarehouse(w.id)); 

      });
    }

    // املأ select الخاص بالمخزن الرئيسي (Affiliated)
    populateMainWarehouseSelect(data);
  } catch (err) {
    handleError(err, 'Load warehouses failed');
  } finally {
    hideLoader();
  }
}


async function deleteWarehouse(id) {
    try {
        showLoader();
        const url = `${API_ENDPOINTS.Inventory.warehouses}${id}/`;
        const response = await deleteRequest(url,  token);
        if (response.status === 204) {
            alert("delete successfully!");
            loadBeneficiaries();
        }
    } catch (error) {
        handleError(error, 'delete Warehouse failed');
    } finally {
        hideLoader();
    }
}


function populateMainWarehouseSelect(data) {
  mainWarehouseSelect.innerHTML = '<option value="">Select main warehouse</option>';
  if (!Array.isArray(data)) return;
  data.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w.id ?? '';
    opt.textContent = w.name ? `${w.name}${w.id ? ' ('+w.id+')' : ''}` : (w.id ?? '');
    mainWarehouseSelect.appendChild(opt);
  });
}

async function createWarehouse(payload) {
  try {
    showLoader();
    const res = await postRequest(API_ENDPOINTS.Inventory.warehouses, payload, token,{},false);
    if (res.status === 201 || res.status === 200) {
      alert('Warehouse created successfully!');
      await loadWarehouses();
      closeModal();
      form.reset();
    } else {
      throw new Error(res.message || 'Create warehouse failed');
    }
  } catch (err) {
    handleError(err.message, 'Create warehouse failed');
  } finally {
    hideLoader();
  }
}

async function updateWarehouse(id, payload) {
  try {
    showLoader();
    const url = `${API_ENDPOINTS.Inventory.warehouses}${id}/`;
    const res = await putRequest(url, payload, token, );
    if (res.status === 200) {
      alert('Warehouse updated successfully!');
      await loadWarehouses();
      closeModal();
      form.reset();
    } else {
      throw new Error(res.message || 'Update warehouse failed');
    }
  } catch (err) {
    handleError(err, 'Update warehouse failed');
  } finally {
    hideLoader();
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = warehouseIdInput.value;
  const payload = {
    name: nameInput.value.trim(),
    calssification: classificationInput.value.trim(),
    storekeeper: storekeeperInput.value.trim(),
    phone_warehouse: phoneInput.value.trim()
  };


  if (!payload.name) {
    alert('Please enter warehouse name');
    return;
  }
  if (mainWarehouseSelect.value) {
    payload['parent'] = mainWarehouseSelect.value;
  }

  if (id) {
    payload['storekeeper'] = storekeeperInput.value.trim() || null;
    await updateWarehouse(id, payload);
  } else {
    await createWarehouse(payload);
  }
});


document.addEventListener('DOMContentLoaded', () => {
  loadWarehouses();
});
