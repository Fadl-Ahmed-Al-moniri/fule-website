
import { postRequest, getRequest, deleteRequest } from '../services/apiService.js';
import { showLoader, hideLoader } from '../utils/loader.js';
import { getUserToken } from '../utils/user-token.js';
import { API_ENDPOINTS } from '../endpoint.js';



const token = getUserToken();

const operationsBody = document.getElementById('operationsBody');
const noOperationsMsg = document.getElementById('no_operations');

async function loadExportModifyOperations() {
    
        try {
            showLoader();
            const res = await getRequest(API_ENDPOINTS.Operations.modifyExport, token);
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
            

            const operationDate = op.operation_date ? new Date(op.operation_date).toLocaleDateString('en-GB') : 'N/A';


            tr.innerHTML = `
                <td class="px-4 py-4 text-sm align-top">#${op.id}</td>
                <td class="px-4 py-4 text-sm align-top">${op.warehouse_name}</td>
                <td class="px-4 py-4 text-sm align-top">${op.main_operations || 'N/A'}</td>
                <td class="px-4 py-4 text-sm align-top">${operationDate}</td>
                <td class="px-4 py-4 text-sm sm:table-cell">${op.item_name}</td>
                <td class="px-4 py-4 text-sm md:table-cell align-top">${op.old_quantity || ''}</td>
                <td class="px-4 py-4 text-sm md:table-cell align-top">${op.new_quantity || ''}</td>
                <td class="px-4 py-4 text-sm lg:table-cell align-top">${op.reason || ''}</td>
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




document.addEventListener('DOMContentLoaded', () => {


    loadExportModifyOperations();

});



