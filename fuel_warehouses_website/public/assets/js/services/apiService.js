// apiService.js - API Service Utility Functions
// Centralized functions for making HTTP requests to the backend

/**
 * Make a GET request to the specified URL
 * @param {string} url - The URL to make the request to
 * @param {string} token - Authentication token (optional)
 * @param {Object} params - Query parameters (optional)
 * @returns {Promise<Object>} Response object with status and data
 */
export async function getRequest(url, token = null, params = {}) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers,
        });

        const result = await response.json();
        return { response: response, status: response.status, data: result };
    } catch (error) {
        console.error('GET Request failed:', error);
        throw error;
    }
}

/**
 * Make a POST request to the specified URL
 * @param {string} url - The URL to make the request to
 * @param {Object|FormData} data - Data to send in the request body
 * @param {string} token - Authentication token (optional)
 * @param {Object} params - Query parameters (optional)
 * @param {boolean} isFormData - Whether the data is FormData (optional)
 * @returns {Promise<Object>} Response object with status and data
 */
export async function postRequest(url, data = {}, token = null, params = {}, isFormData = false) {
    const headers = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers,
            body: isFormData ? data : JSON.stringify(data),
        });

        const result = await response.json();
        return { response: response, status: response.status, data: result };
    } catch (error) {
        console.error('POST Request failed:', error);
        throw error;
    }
}

/**
 * Make a PUT request to the specified URL
 * @param {string} url - The URL to make the request to
 * @param {Object|FormData} data - Data to send in the request body
 * @param {string} token - Authentication token (optional)
 * @param {Object} params - Query parameters (optional)
 * @param {boolean} isFormData - Whether the data is FormData (optional)
 * @returns {Promise<Object>} Response object with status and data
 */
export async function putRequest(url, data = {}, token = null, params = {}, isFormData = false) {
    const headers = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    try {
        const response = await fetch(fullUrl, {
            method: 'PUT',
            headers,
            body: isFormData ? data : JSON.stringify(data),
        });

        const result = await response.json();
        return { response: response, status: response.status, data: result };
    } catch (error) {
        console.error('PUT Request failed:', error);
        throw error;
    }
}

/**
 * Make a PATCH request to the specified URL
 * @param {string} url - The URL to make the request to
 * @param {Object|FormData} data - Data to send in the request body
 * @param {string} token - Authentication token (optional)
 * @param {Object} params - Query parameters (optional)
 * @param {boolean} isFormData - Whether the data is FormData (optional)
 * @returns {Promise<Object>} Response object with status and data
 */
export async function patchRequest(url, data = {}, token = null, params = {}, isFormData = false) {
    const headers = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    try {
        const response = await fetch(fullUrl, {
            method: 'PATCH',
            headers,
            body: isFormData ? data : JSON.stringify(data),
        });

        const result = await response.json();
        return { response: response, status: response.status, data: result };
    } catch (error) {
        console.error('PATCH Request failed:', error);
        throw error;
    }
}

/**
 * Make a DELETE request to the specified URL
 * @param {string} url - The URL to make the request to
 * @param {string} token - Authentication token (optional)
 * @param {Object} params - Query parameters (optional)
 * @returns {Promise<Object>} Response object with status and data
 */
export async function deleteRequest(url, token = null, params = {}) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    try {
        const response = await fetch(fullUrl, {
            method: 'DELETE',
            headers,
        });

        // Handle cases where DELETE might not return JSON
        let result = {};
        if (response.headers.get('content-type')?.includes('application/json')) {
            result = await response.json();
        }

        return { response: response, status: response.status, data: result };
    } catch (error) {
        console.error('DELETE Request failed:', error);
        throw error;
    }
}

/**
 * Download a file from the specified URL
 * @param {string} url - The URL to download from
 * @param {string} token - Authentication token (optional)
 * @param {Object} params - Query parameters (optional)
 * @param {string} filename - Suggested filename for download (optional)
 * @returns {Promise<void>}
 */
export async function downloadFile(url, token = null, params = {}, filename = null) {
    const headers = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Set filename from response header or use provided filename
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                link.download = filenameMatch[1];
            }
        } else if (filename) {
            link.download = filename;
        }
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('File download failed:', error);
        throw error;
    }
}

/**
 * Handle API errors and display appropriate messages
 * @param {Object} error - Error object from API response
 * @param {string} defaultMessage - Default error message to show
 */
export function handleApiError(error, defaultMessage = 'An error occurred') {
    if (error.data && typeof error.data === 'object') {
        // Handle validation errors
        const errorMessages = [];
        for (const [field, messages] of Object.entries(error.data)) {
            if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
                errorMessages.push(`${field}: ${messages}`);
            }
        }
        return errorMessages.join('\n');
    } else if (error.data && typeof error.data === 'string') {
        return error.data;
    } else {
        return defaultMessage;
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export function isAuthenticated() {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
        // Check if token is expired (basic check)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp > currentTime;
    } catch (error) {
        return false;
    }
}

/**
 * Get current user information from token
 * @returns {Object|null} User information or null if not authenticated
 */
export function getCurrentUser() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            user_id: payload.user_id,
            username: payload.username,
            user_type: payload.user_type,
            exp: payload.exp
        };
    } catch (error) {
        return null;
    }
}

/**
 * Clear authentication data
 */
export function clearAuth() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

