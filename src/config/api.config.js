// API Base Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1',
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    UPDATE_ROLE: (id) => `/users/${id}/role`,
    UPDATE_STATUS: (id) => `/users/${id}/status`,
  },
  
  // Organizations
  ORGANIZATIONS: {
    BASE: '/organizations',
    BY_ID: (id) => `/organizations/${id}`,
    UPDATE_STATUS: (id) => `/organizations/${id}/status`,
  },
  
  // Employees
  EMPLOYEES: {
    BASE: '/employees',
    BY_ID: (id) => `/employees/${id}`,
    DOCUMENTS: (id) => `/employees/${id}/documents`,
    BANK_DETAILS: (id) => `/employees/${id}/bank-details`,
  },
  
  // Attendance
  ATTENDANCE: {
    CHECKIN: '/attendance/checkin',
    CHECKOUT: '/attendance/checkout',
    MONTHLY: '/attendance/monthly',
    SUMMARY: '/attendance/summary',
  },
  
  // Leaves
  LEAVES: {
    APPLY: '/leaves/apply',
    BALANCE: '/leaves/balance',
    PROCESS: (id) => `/leaves/${id}/process`,
  },
  
  // Payroll
  PAYROLL: {
    BASE: '/payroll',
    PAYSLIPS: '/payroll/payslips',
    PAYSLIP_BY_ID: (id) => `/payroll/payslips/${id}`,
  },
};
