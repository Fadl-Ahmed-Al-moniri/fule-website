import { postRequest, getRequest  , putRequest ,deleteRequest} from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';

const token = getUserToken();

const form = document.getElementById('item_form');
const openBtn = document.getElementById('open'); 
const itemBody = document.getElementById('itemBody');
const noItemMsg = document.getElementById('no_item');
const itemIdInput = document.getElementById('itemId');
const nameInput = document.getElementById('name');
const editButtonSelector = '.edit-btn';


function openModal() {
  if (openBtn) openBtn.click(); 
}
function closeModal() {
  const closeBtn = document.querySelector('#modal [aria-label="close"]');
  if (closeBtn) closeBtn.click();
}

// خطأ 
function handleError(err, ctx = '') {
  console.error(ctx, err);
  alert((ctx ? ctx + ': ' : '') + (err.message || err));
}

async function createItem(data) {
  try {
    showLoader();
    const res = await postRequest(API_ENDPOINTS.Inventory.items, data, token, {}, false);
    if (res.status === 201) {
      alert('Item created successfully!');
      await loadItems();
      closeModal();
      form.reset();
    } else {
      throw new Error(res.message || 'Failed to create item');
    }
  } catch (err) {
    handleError(err, 'Create item failed');
  } finally {
    hideLoader();
  }
}

async function updateItem(id, data) {
  try {
    showLoader();
    const url = `${API_ENDPOINTS.Inventory.items}${id}/`;
    const res = await putRequest(url, data, token, false);
    if (res.status === 200) {
      alert('Item updated successfully!');
      await loadItems();
      closeModal();
      form.reset();
    } else {
      throw new Error(res.message || 'Failed to update item');
    }
  } catch (err) {
    handleError(err, 'Update item failed');
  } finally {
    hideLoader();
  }
}

// تحميل الأصناف (GET)
async function loadItems() {
  try {
    showLoader();
    const res = await getRequest(API_ENDPOINTS.Inventory.items, token);
    if (res.status !== 200) throw new Error('Failed to fetch items');
    const data = res.data || res; 
    itemBody.innerHTML = '';

    if (!data || data.length === 0) {
      noItemMsg.classList.remove('hidden');
      return;
    }
    noItemMsg.classList.add('hidden');

    data.forEach(item => {
      const tr = document.createElement('tr');
      tr.className = 'text-gray-700 dark:text-gray-400';

      tr.innerHTML = `
        <td class="px-2 py-2 text-sm">${item.id ?? ''}</td>
        <td class="px-4 py-3 text-sm">${item.name ?? ''}</td>
        <td class="px-4 py-3 text-xs">
            <button
                class="status-toggle cursor-pointer px-2 py-1 font-semibold rounded-full ${
                item.is_active
                    ? 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100'
                    : 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100'
                }"
                data-email="${item.email}"
                data-active="${item.is_active}"
            >
                ${item.is_active ? 'Active' : 'Inactive'}
            </button>
            
          </td>

          <td class="px-4 py-3">
              <div class="flex items-center space-x-4 text-sm">
                  <button class="edit-btn px-2 py-2 text-purple-600 dark:text-gray-400 focus:outline-none"
                          data-id="${item.id}"
                          data-name="${item.name}"

                  <!-- أيقونة تعديل -->
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 
                              5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                  </button>
                  <button class="flex items-center justify-between px-2 py-2 text-sm font-medium leading-5 text-purple-600 rounded-lg dark:text-gray-400 focus:outline-none focus:shadow-outline-gray"
                            aria-label="Delete" onclick=deleteItem("${item.id}")>
                      <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" >
                                  <path fill-rule="evenodd" clip-rule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  ></path>
                            </svg>
                  </button>
              </div>
          </td>
      `;

      itemBody.appendChild(tr);
      tr.querySelector(editButtonSelector).addEventListener('click', () => {

            document.getElementById('operation_type').textContent     = "Updata Item";
            document.getElementById('operation_type_b').textContent     = "Updata Item";
            document.getElementById('itemId').value     = item.id;
            document.getElementById('name').value     = item.name;
            openModal();
        });

        const deleteBtn = tr.querySelector('button[aria-label="Delete"]');
        deleteBtn.addEventListener('click', () => deleteItem(item.id));
        // tr.querySelector('.status-toggle').addEventListener('click', (e) => {
        //     const id    = e.target.dataset.id;
        //     const active   = e.target.dataset.active === 'true';
        //     toggleEmployeeStatus(email, !active);
        // });
    });
  } catch (err) {
    handleError(err, 'Load items failed');
  } finally {
    hideLoader();
  }
}


async function deleteItem(id) {
    try {
        showLoader();
        const url = `${API_ENDPOINTS.Inventory.items}${id}/`;
        const response = await deleteRequest(url,  token,{});
        if (response.status === 204) {
            alert("delete successfully!");
            loadItems();
        }
    } catch (error) {
        handleError(error, 'delete Item failed');
    } finally {
        hideLoader();
    }
}


// معالجة النموذج (create / update)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = itemIdInput.value;
  const data = {
    name: nameInput.value.trim()
  };
  if (!data.name) {
    alert('Please fill item name');
    return;
  }

  if (id) {
    await updateItem(id, data);
  } else {
    await createItem(data);
  }
});

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadItems();
  // initLogout && initLogout(); // إذا عندك دالة خروج
});
