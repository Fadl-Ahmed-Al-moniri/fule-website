// endpoint.js - API Endpoints Configuration
// Centralized configuration for all API endpoints used in the application

const BASE_URL = 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
    // Authentication endpoints
    Auth: {
        login: `${BASE_URL}/auth/login/`,
        register: `${BASE_URL}/auth/register/`,
        refresh: `${BASE_URL}/auth/token/refresh/`,
        logout: `${BASE_URL}/auth/logout/`,
    },

    Inventory: {
        warehouses: `${BASE_URL}/api/inventory/warehouse/`,
        items: `${BASE_URL}/api/inventory/item/`,
        stations: `${BASE_URL}/api/inventory/station/`,
        warehouseItems: `${BASE_URL}/api/inventory/warehouse-item/`,
    },

    // Operations endpoints
    Operations: {
        supply: `${BASE_URL}/api/operations/supply/`,
        export: `${BASE_URL}/api/operations/export/`,
        returnSupply: `${BASE_URL}/api/operations/return_supply/`,
        returnExport: `${BASE_URL}/api/operations/return_export/`,
        damage: `${BASE_URL}/api/operations/damage/`,
        transfer: `${BASE_URL}/api/operations/transfer/`,
        modifySupply: `${BASE_URL}/api/operations/modify-supply/`,
        modifyExport: `${BASE_URL}/api/operations/modify_export/`,
    },

    // Reports endpoints
    Reports: {
        warehouseReport: `${BASE_URL}/api/reports/general-warehouse/`,
        itemReport: `${BASE_URL}/api/reports/general-item/`,
        itemStatus: `${BASE_URL}/api/reports/item-status/`,
        statusReport: `${BASE_URL}/api/reports/warehouse-status/`,
        supplierReport: `${BASE_URL}/api/reports/supplier-operations/`,
        beneficiaryReport: `${BASE_URL}/api/reports/beneficiary-operations/`,
        stationsReport: `${BASE_URL}/api/reports/stations-operations/`,
    },

    // Accounts endpoints
    Accounts: {
        users: `${BASE_URL}/api/accounts/users/`,
        suppliers: `${BASE_URL}/api/accounts/suppliers/`,
        beneficiaries: `${BASE_URL}/api/accounts/beneficiaries/`,
    },
};

