// assets/js/suppliers.js
import { postRequest, getRequest, putRequest ,deleteRequest} from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';


const token = getUserToken();

const form = document.getElementById('supply_form');
const openBtn = document.getElementById('open');
const suppliersBody = document.getElementById('stationsBody'); // كما في الـ HTML لديك
const noSuppliersMsg = document.getElementById('no_stations'); // رسالة لا توجد موردين

const supplyIdInput = document.getElementById('supplyId');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone_number');

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

/** جلب الموردين وعرضهم */
async function loadSuppliers() {
  try {
    showLoader();
    const res = await getRequest(API_ENDPOINTS.Accounts.suppliers, token);
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(res.message || `Failed to fetch suppliers (status ${res.status})`);
    }

    const data = Array.isArray(res.data) ? res.data
               : Array.isArray(res.data?.results) ? res.data.results
               : Array.isArray(res) ? res
               : res.data || [];

    suppliersBody.innerHTML = '';

    if (!data || data.length === 0) {
      noSuppliersMsg.classList.remove('hidden');
      return;
    }
    noSuppliersMsg.classList.add('hidden');

    data.forEach(s => {
      const tr = document.createElement('tr');
      tr.className = 'text-gray-700 dark:text-gray-400';

      tr.innerHTML = `
        <td class="px-2 py-2 text-sm">${s.id ?? ''}</td>
        <td class="px-4 py-3 text-sm">${s.name ?? ''}</td>
        <td class="px-4 py-3 text-sm">${s.phone ?? s.phone_number ?? ''}</td>
        <td class="px-4 py-3 text-xs">
            <button
                class="status-toggle cursor-pointer px-2 py-1 font-semibold rounded-full ${
                s.is_active
                    ? 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100'
                    : 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100'
                }"
                data-email="${s.email}"
                data-active="${s.is_active}"
            >
                ${s.is_active ? 'Active' : 'Inactive'}
            </button>
            
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-4 text-sm">
            <button class="edit-btn px-2 py-2 text-purple-600 dark:text-gray-400 focus:outline-none"
                    data-id="${s.id ?? ''}"
                    data-name="${s.name ?? ''}"
                    data-phone="${s.phone ?? s.phone_number ?? ''}">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 
                  5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </button>
            <button class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                            aria-label="Delete" onclick=deleteSuppliers("${s.id}")>
                      <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" >
                                  <path fill-rule="evenodd" clip-rule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  ></path>
                            </svg>
            </button>
          </div>
        </td>
      `;

      suppliersBody.appendChild(tr);

      const editBtn = tr.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {

          e.stopPropagation();
          document.getElementById('operation_type').textContent     = "Updata Suppliers";
          document.getElementById('operation_type_b').textContent     = "Updata Suppliers";      
          const id = editBtn.dataset.id;
          const name = editBtn.dataset.name;
          const phone = editBtn.dataset.phone;

          supplyIdInput.value = id ?? '';
          nameInput.value = name ?? '';
          phoneInput.value = phone ?? '';

          openModal();
        });
      }
      
        const deleteBtn = tr.querySelector('button[aria-label="Delete"]');
        deleteBtn.addEventListener('click', () => deleteSuppliers(s.id));
    });

  } catch (err) {
    handleError(err, 'Load suppliers failed');
  } finally {
    hideLoader();
  }
}

/** إنشاء مورد جديد (POST) */
async function createSupplier(payload) {
  try {
    showLoader();
    const res = await postRequest(API_ENDPOINTS.Accounts.suppliers, payload, token);
    if (res.status === 201 || res.status === 200) {
      alert('Supplier created successfully!');
      await loadSuppliers();
      closeModal();
      form.reset();
    } else {
      throw new Error(res.message || JSON.stringify(res.data) || 'Create supplier failed');
    }
  } catch (err) {
    handleError(err, 'Create supplier failed');
  } finally {
    hideLoader();
  }
}

/** تحديث مورد (PUT) */
async function updateSupplier(id, payload) {
  try {
    showLoader();
    const url = `${API_ENDPOINTS.Accounts.suppliers}${id}/`;
    const res = await putRequest(url, payload, token);
    if (res.status === 200) {
      alert('Supplier updated successfully!');
      await loadSuppliers();
      closeModal();
      form.reset();
    } else {
      throw new Error(res.message || JSON.stringify(res.data) || `Update failed (${res.status})`);
    }
  } catch (err) {
    handleError(err, 'Update supplier failed');
  } finally {
    hideLoader();
  }
}

// معالجة الفورم (create / update)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = supplyIdInput.value;
  const payload = {
    name: nameInput.value.trim(),
    phone_number: phoneInput.value.trim()
  };

  if (!payload.name) {
    alert('Please enter supplier name');
    return;
  }

  if (id) {
    await updateSupplier(id, payload);
  } else {
    await createSupplier(payload);
  }
});


async function deleteSuppliers(id) {
    try {
        showLoader();
        const url = `${API_ENDPOINTS.Accounts.suppliers}${id}/`;
        const response = await deleteRequest(url, {}, token);
        if (response.status === 204) {
            alert("delete successfully!");
            loadSuppliers();
        }
    } catch (error) {
        handleError(error, 'delete suppliers failed');
    } finally {
        hideLoader();
    }
}

// عند الضغط على زر "Add Supply" نعيد تحميل القائمة قبل فتح الفورم
if (openBtn) {
  openBtn.addEventListener('click', async () => {
    await loadSuppliers();
  });
}

// تحميل الموردين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadSuppliers();
});
