
import { showLoader, hideLoader } from '../utils/loader.js';

import { postRequest } from '../services/apiService.js';
import { API_ENDPOINTS } from '../endpoint.js'; 


const form = document.getElementById('create-account-form');
const firstNameInput = document.getElementById('first_name');
const lastNameInput = document.getElementById('last_name');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const password2Input = document.getElementById('password2');

function ensureErrorNode(input) {
  let node = input.nextElementSibling;
  if (!node || !node.classList || !node.classList.contains('input-error')) {
    node = document.createElement('p');
    node.className = 'input-error mt-1 text-xs text-red-600';
    input.parentNode.insertBefore(node, input.nextSibling);
  }
  return node;
}
function clearFieldErrors() {
  document.querySelectorAll('.input-error').forEach(n => n.remove());
}

function showFieldError(input, msg) {
  const node = ensureErrorNode(input);
  node.textContent = msg;
}

function validateForm() {
  clearFieldErrors();
  let ok = true;
  if (!firstNameInput.value.trim()) { showFieldError(firstNameInput, 'Please enter first name'); ok = false; }
  if (!lastNameInput.value.trim()) { showFieldError(lastNameInput, 'Please enter last name'); ok = false; }
  if (!usernameInput.value.trim()) { showFieldError(usernameInput, 'Please enter username'); ok = false; }
  if (!passwordInput.value) { showFieldError(passwordInput, 'Please enter password'); ok = false; }
  if (passwordInput.value && passwordInput.value.length < 6) {
    showFieldError(passwordInput, 'Password must be at least 6 characters'); ok = false;
  }
  if (passwordInput.value !== password2Input.value) { showFieldError(password2Input, 'Passwords do not match'); ok = false; }
  return ok;
}



async function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = {
    first_name: firstNameInput.value.trim(),
    last_name: lastNameInput.value.trim(),
    username: usernameInput.value.trim(),
    password: passwordInput.value,
    password2: password2Input.value
  };

  try {
    showLoader();

    let res;

    res = await postRequest(API_ENDPOINTS.Auth.register, payload, null, {}, false);


    const status = res?.status ?? (res && res.statusCode) ?? null;
    const data = res?.data ?? res?.body ?? res;

    if (status === 201 || status === 200) {
        alert('Account created successfully! You can now login.');
        form.reset();
        window.location.href = 'login.html'; 
        return;
    }

    if (data && typeof data === 'object') {
        let handled = false;
        for (const key of Object.keys(data)) {
            const value = data[key];
            const input = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (input) {
            showFieldError(input, Array.isArray(value) ? value.join(', ') : String(value));
            handled = true;
            }
        }
        if (!handled) {
            alert('Failed to create account:\n' + JSON.stringify(data, null, 2));
        }
    } else {
    alert('Failed to create account. Server returned: ' + JSON.stringify(data));
    }
  } catch (err) {
    console.error('Create account failed:', err);
    alert('An unexpected error occurred. See console for details.');
  } finally {
    hideLoader();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!form) return;
  form.addEventListener('submit', handleSubmit);
});
