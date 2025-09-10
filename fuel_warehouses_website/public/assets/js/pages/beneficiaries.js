// assets/js/beneficiaries.js
import { postRequest, getRequest, putRequest,deleteRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';

const token = getUserToken();

const form = document.getElementById('beneficiary_form');
const openBtn = document.getElementById('open');
const beneficiariesBody = document.getElementById('stationsBody'); 
const noBeneficiariesMsg = document.getElementById('no_stations'); 

const beneficiaryIdInput = document.getElementById('beneficiaryId');
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

/** تحميل المستفيدين وعرضهم */
async function loadBeneficiaries() {
  try {
    showLoader();
    const res = await getRequest(API_ENDPOINTS.Accounts.beneficiaries, token);
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(res.message || `Failed to fetch beneficiaries (status ${res.status})`);
    }

    const data = Array.isArray(res.data) ? res.data
               : Array.isArray(res.data?.results) ? res.data.results
               : Array.isArray(res) ? res
               : res.data || [];

    beneficiariesBody.innerHTML = '';

    if (!data || data.length === 0) {
      noBeneficiariesMsg.classList.remove('hidden');
      return;
    }
    noBeneficiariesMsg.classList.add('hidden');

    data.forEach(b => {
      const tr = document.createElement('tr');
      tr.className = 'text-gray-700 dark:text-gray-400';

      tr.innerHTML = `
        <td class="px-2 py-2 text-sm">${b.id ?? ''}</td>
        <td class="px-4 py-3 text-sm">${b.name ?? ''}</td>
        <td class="px-4 py-3 text-sm">${b.phone ?? b.phone_number ?? ''}</td>
        <td class="px-4 py-3 text-xs">
            <button
                class="status-toggle cursor-pointer px-2 py-1 font-semibold rounded-full ${
                b.is_active
                    ? 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100'
                    : 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100'
                }"
                data-id="${b.id}"
                data-active="${b.is_active}"
            >
                ${b.is_active ? 'Active' : 'Inactive'}
            </button>
            
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-4 text-sm">
            <button class="edit-btn px-2 py-2 text-purple-600 dark:text-gray-400 focus:outline-none"
                    data-id="${b.id ?? ''}"
                    data-name="${b.name ?? ''}"
                    data-phone="${b.phone ?? b.phone_number ?? ''}">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 
                  5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </button>
            <button class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                            aria-label="Delete" onclick=deleteBeneficiaries("${b.id}")>
                      <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" >
                                  <path fill-rule="evenodd" clip-rule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  ></path>
                            </svg>
            </button>
          </div>
        </td>
      `;

      beneficiariesBody.appendChild(tr);

      const editBtn = tr.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.getElementById('operation_type').textContent     = "Updata Beneficiaries";
          document.getElementById('operation_type_b').textContent     = "Updata Beneficiaries"; 

          beneficiaryIdInput.value = editBtn.dataset.id ?? '';
          nameInput.value = editBtn.dataset.name ?? '';
          phoneInput.value = editBtn.dataset.phone ?? '';
          openModal();
        });
      }

        const deleteBtn = tr.querySelector('button[aria-label="Delete"]');
        deleteBtn.addEventListener('click', () => deleteBeneficiaries(b.id));    });

  } catch (err) {
    handleError(err, 'Load beneficiaries failed');
  } finally {
    hideLoader();
  }
}

/** إنشاء مستفيد جديد (POST) */
async function createBeneficiary(payload) {
  try {
    showLoader();
    const res = await postRequest(API_ENDPOINTS.Accounts.beneficiaries, payload, token);
    if (res.status === 201 || res.status === 200) {
      alert('Beneficiary created successfully!');
      await loadBeneficiaries();
      closeModal();
      form.reset();
    } else {
      throw new Error(res.message || JSON.stringify(res.data) || 'Create beneficiary failed');
    }
  } catch (err) {
    handleError(err, 'Create beneficiary failed');
  } finally {
    hideLoader();
  }
}

/** تحديث مستفيد (PUT) */
async function updateBeneficiary(id, payload) {
  try {
    showLoader();
    const url = `${API_ENDPOINTS.Accounts.beneficiaries}${id}/`;
    const res = await putRequest(url, payload, token);
    if (res.status === 200) {
      alert('Beneficiary updated successfully!');
      await loadBeneficiaries();
      closeModal();
      form.reset();
    } else {
      throw new Error(res.message || JSON.stringify(res.data) || `Update failed (${res.status})`);
    }
  } catch (err) {
    handleError(err, 'Update beneficiary failed');
  } finally {
    hideLoader();
  }

}




async function deleteBeneficiaries(id) {
    try {
        showLoader();
        const url = `${API_ENDPOINTS.Accounts.beneficiaries}${id}/`;
        const response = await deleteRequest(url, {}, token);
        if (response.status === 204) {
            alert("delete successfully!");
            loadBeneficiaries();
        }
    } catch (error) {
        handleError(error, 'delete Beneficiaries failed');
    } finally {
        hideLoader();
    }
}


// معالجة الفورم (create / update)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = beneficiaryIdInput.value;
  const payload = {
    name: nameInput.value.trim(),
    phone_number: phoneInput.value.trim()
  };

  if (!payload.name) {
    alert('Please enter beneficiary name');
    return;
  }

  if (id) {
    await updateBeneficiary(id, payload);
  } else {
    await createBeneficiary(payload);
  }
});

// عند الضغط على زر "Add beneficiary" نعيد تحميل القائمة قبل فتح الفورم
if (openBtn) {
  openBtn.addEventListener('click', async () => {
    await loadBeneficiaries();
  });
}

// تحميل المستفيدين عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadBeneficiaries();
});
